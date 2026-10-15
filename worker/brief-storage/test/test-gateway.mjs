import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createHmac, randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";

const ORIGIN = "https://www.kemmatechnologies.com";
const STORAGE_SECRET = "test-storage-secret-".repeat(3);
const SIGNING_SECRET = "test-signing-secret-".repeat(3);
const OVERHEAD = 10 * 1024 * 1024;
const instances = [];
let bundled;
before(async () => {
  // HTTP clients correctly refuse malformed Content-Length before dispatch. A
  // test-only Worker wrapper injects those streams inside workerd to exercise
  // the real gateway's FixedLengthStream and the real R2 commit behavior.
  const contents = `import gateway from "./src/index.ts";
    export default { async fetch(request, env) {
      const fixtureLength = request.headers.get("x-test-body-bytes");
      if (fixtureLength !== null) {
        const headers = new Headers(request.headers); headers.delete("x-test-body-bytes");
        const body = new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(Number(fixtureLength))); controller.close(); } });
        request = new Request(request.url, { method: request.method, headers, body });
      }
      return gateway.fetch(request, env);
    } };`;
  const output = await build({ stdin: { contents, resolveDir: fileURLToPath(new URL("../", import.meta.url)), loader: "js" }, bundle: true, write: false, format: "esm", platform: "browser", target: "es2022" });
  bundled = output.outputFiles[0].text;
});
after(async () => { await Promise.all(instances.map(instance => instance.dispose())); });
function gateway(cap = "5000000000") {
  // The installed simulator supports October 13; production stays on October 14.
  // The gateway uses no October 14-specific API. Deployment gets a separate live smoke test.
  const instance = new Miniflare(convertV4MiniflareOptions({ modules: true, script: bundled, compatibilityDate: "2026-10-13", compatibilityFlags: ["nodejs_compat"], r2Buckets: ["BUCKET"], bindings: { ALLOWED_ORIGINS: ORIGIN + ",http://127.0.0.1:4190", MAX_RESERVED_BYTES: cap, BRIEF_STORAGE_SECRET: STORAGE_SECRET, BRIEF_SIGNING_SECRET: SIGNING_SECRET } }));
  instances.push(instance);
  return instance;
}
const key = (id, name) => `briefs/${id}/${name}`;
function file(id, size = 4) {
  const fileId = randomUUID();
  return { id: fileId, name: "logo.png", type: "image/png", size, scope: "logo", role: "Additional file", pathname: key(id, `files/${fileId}/logo.png`) };
}
function signed(id, files, overrides = {}) {
  const body = Buffer.from(JSON.stringify({ kind: "session", id, exp: Date.now() + 60000, files, ...overrides })).toString("base64url");
  return body + "." + createHmac("sha256", SIGNING_SECRET).update(body).digest("base64url");
}
function signedUpload(id, fileId, overrides = {}) {
  const body = Buffer.from(JSON.stringify({ kind: "upload", id, exp: Date.now() + 60000, fileId, ...overrides })).toString("base64url");
  return body + "." + createHmac("sha256", SIGNING_SECRET).update(body).digest("base64url");
}
function objectRequest(instance, pathname, method = "GET", value, extra = {}) {
  return instance.dispatchFetch(`https://storage.test/v1/object?key=${encodeURIComponent(pathname)}`, { method, headers: { Authorization: `Bearer ${STORAGE_SECRET}`, ...(value === undefined ? {} : { "Content-Type": "application/json" }), ...extra }, ...(value === undefined ? {} : { body: JSON.stringify(value) }) });
}
function allocate(instance, id, files, extra = {}) {
  return objectRequest(instance, key(id, "allocation.json"), "PUT", { createdAt: "2026-10-14T00:00:00.000Z", files }, extra);
}
function upload(instance, id, spec, body = Uint8Array.from([0, 1, 254, 255]), headers = {}, token = signed(id, [spec])) {
  return instance.dispatchFetch("https://storage.test/v1/upload", { method: "PUT", headers: { Origin: ORIGIN, Authorization: `Bearer ${token}`, "X-Brief-File-Id": spec.id, "Content-Type": spec.type, "Content-Length": String(spec.size), ...headers }, body });
}

test("private object routes require a server credential and reject paths outside the project tree", async () => {
  const instance = gateway();
  const id = randomUUID();
  const denied = await instance.dispatchFetch(`https://storage.test/v1/object?key=${encodeURIComponent(key(id, "submission.json"))}`);
  assert.equal(denied.status, 401);
  assert.deepEqual(await denied.json(), { error: "Use your project link from Kemma." });
  for (const bad of ["system/budget.json", `briefs/${id}/../submission.json`, `briefs/${id}/unrecognized.json`, `briefs/${id}/files/${randomUUID()}/../logo.png`, `briefs/${id}/files/${randomUUID()}/%2e%2e`]) assert.equal((await objectRequest(instance, bad)).status, 400);
  assert.equal((await objectRequest(instance, key(id, "submission.json"))).status, 404);
});

test("JSON records use immutable creation and atomic ETag conditional updates", async () => {
  const instance = gateway();
  const path = key(randomUUID(), "notification.json");
  const created = await objectRequest(instance, path, "PUT", { state: "pending" });
  assert.equal(created.status, 200);
  const etag = created.headers.get("etag");
  assert.match(etag, /^"[a-zA-Z0-9-]+"$/);
  assert.equal((await objectRequest(instance, path, "PUT", { state: "sent" })).status, 412);
  assert.equal((await objectRequest(instance, path, "PUT", { state: "sent" }, { "If-Match": '"wrong"' })).status, 412);
  assert.equal((await objectRequest(instance, path, "PUT", { state: "sent" }, { "If-Match": etag })).status, 200);
  const read = await objectRequest(instance, path);
  assert.deepEqual(await read.json(), { state: "sent" });
  assert.equal(read.headers.get("cache-control"), "private, no-store, no-transform");
  const head = await objectRequest(instance, path, "HEAD");
  assert.equal(head.headers.get("content-length"), String(Buffer.byteLength('{"state":"sent"}')));
  assert.equal(head.headers.get("content-type"), "application/json");
  assert.equal(await head.text(), "");
});

test("private object responses forbid transformations and retain strong R2 ETags", async () => {
  const instance = gateway();
  const path = key(randomUUID(), "notification.json");
  const value = { state: "pending", detail: "compressible-content-".repeat(100) };
  const written = await objectRequest(instance, path, "PUT", value);
  const read = await objectRequest(instance, path, "GET", undefined, { "Accept-Encoding": "br, gzip" });
  const readText = await read.text();
  const head = await objectRequest(instance, path, "HEAD", undefined, { "Accept-Encoding": "br, gzip" });
  const stored = await (await instance.getR2Bucket("BUCKET")).head(path);
  for (const response of [written, read, head]) {
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "private, no-store, no-transform");
    assert.equal(response.headers.get("etag"), stored.httpEtag);
    assert.match(response.headers.get("etag"), /^"[a-zA-Z0-9-]+"$/);
    assert.equal(response.headers.get("content-encoding"), null);
  }
  assert.equal(stored.httpMetadata.cacheControl, "private, no-store, no-transform");
  assert.equal(readText, JSON.stringify(value));
});

test("allocation reserves a global budget idempotently and cannot remove or mutate files", async () => {
  const instance = gateway();
  const id = randomUUID(), spec = file(id);
  const created = await allocate(instance, id, [spec]);
  assert.equal(created.status, 200);
  const bucket = await instance.getR2Bucket("BUCKET");
  const first = await bucket.get("system/budget.json");
  assert.deepEqual(await first.json(), { version: 1, totalBytes: OVERHEAD + 4, projects: { [id]: OVERHEAD + 4 } });
  assert.equal((await allocate(instance, id, [spec], { "If-Match": created.headers.get("etag") })).status, 200);
  assert.equal((await bucket.head("system/budget.json")).etag, first.etag);
  assert.equal((await allocate(instance, id, [], { "If-Match": created.headers.get("etag") })).status, 409);
  assert.equal((await allocate(instance, id, [{ ...spec, role: "Main product photo" }], { "If-Match": created.headers.get("etag") })).status, 409);
});

test("global reservation cap rejects extra projects without removing existing data", async () => {
  const instance = gateway(String(OVERHEAD + 4));
  const id = randomUUID(), spec = file(id);
  assert.equal((await allocate(instance, id, [spec])).status, 200);
  const secondId = randomUUID();
  const exhausted = await allocate(instance, secondId, []);
  assert.equal(exhausted.status, 507);
  assert.match((await exhausted.json()).error, /storage allowance/);
  assert.equal((await objectRequest(instance, key(secondId, "allocation.json"))).status, 404);
  assert.equal((await objectRequest(instance, key(id, "allocation.json"))).status, 200);
});

test("concurrent allocations retain both project reservations", async () => {
  const instance = gateway();
  const ids = [randomUUID(), randomUUID()];
  const responses = await Promise.all(ids.map(id => allocate(instance, id, [])));
  assert.deepEqual(responses.map(response => response.status), [200, 200]);
  const bucket = await instance.getR2Bucket("BUCKET");
  const budget = await (await bucket.get("system/budget.json")).json();
  assert.equal(budget.totalBytes, OVERHEAD * 2);
  assert.deepEqual(Object.keys(budget.projects).sort(), ids.sort());
});

test("direct upload preserves original binary bytes and exposes metadata only to the server", async () => {
  const instance = gateway();
  const id = randomUUID(), spec = file(id), bytes = Uint8Array.from([0, 1, 254, 255]);
  assert.equal((await allocate(instance, id, [spec])).status, 200);
  const saved = await upload(instance, id, spec, bytes);
  assert.equal(saved.status, 200);
  assert.deepEqual(await saved.json(), { ok: true });
  assert.equal(saved.headers.get("access-control-allow-origin"), ORIGIN);
  assert.equal(saved.headers.get("access-control-expose-headers"), "ETag");
  const read = await objectRequest(instance, spec.pathname);
  assert.equal(read.headers.get("cache-control"), "private, no-store, no-transform");
  assert.deepEqual(new Uint8Array(await read.arrayBuffer()), bytes);
  const head = await objectRequest(instance, spec.pathname, "HEAD");
  assert.equal(head.headers.get("content-length"), "4");
  assert.equal(head.headers.get("content-type"), "image/png");
  assert.equal((await upload(instance, id, spec, Uint8Array.from([4, 3, 2, 1]))).status, 412);
  assert.deepEqual(new Uint8Array(await (await objectRequest(instance, spec.pathname)).arrayBuffer()), bytes);
});

test("signed upload rejects bad signatures, purposes, expiration and mismatched manifest fields", async () => {
  const instance = gateway();
  const id = randomUUID(), spec = file(id);
  assert.equal((await allocate(instance, id, [spec])).status, 200);
  const token = signed(id, [spec]);
  assert.equal((await upload(instance, id, spec, undefined, {}, token.slice(0, -2) + "XX")).status, 401);
  assert.equal((await upload(instance, id, spec, undefined, {}, signed(id, [spec], { kind: "invite" }))).status, 401);
  assert.equal((await upload(instance, id, spec, undefined, {}, signed(id, [spec], { exp: Date.now() - 1 }))).status, 401);
  assert.equal((await upload(instance, id, spec, undefined, {}, "x".repeat(48001))).status, 401);
  assert.equal((await upload(instance, id, spec, undefined, {}, signed(id, [{ ...spec, role: "Main product photo" }]))).status, 403);
  assert.equal((await upload(instance, id, spec, undefined, { "X-Brief-File-Id": randomUUID() })).status, 403);
  assert.equal((await objectRequest(instance, spec.pathname)).status, 404);
});

test("compact upload capabilities bind one allocated project and file without exposing the manifest", async () => {
  const instance = gateway();
  const id = randomUUID(), first = file(id), second = file(id);
  assert.equal((await allocate(instance, id, [first, second])).status, 200);
  const token = signedUpload(id, first.id);
  assert.ok(token.length < 512);
  const [body, signature] = token.split(".");
  const tampered = `${body[0] === "a" ? "b" : "a"}${body.slice(1)}.${signature}`;
  assert.equal((await upload(instance, id, first, undefined, {}, tampered)).status, 401);
  assert.equal((await upload(instance, id, first, undefined, {}, signedUpload(id, first.id, { exp: Date.now() - 1 }))).status, 401);
  assert.equal((await upload(instance, id, first, undefined, {}, signedUpload(id, first.id, { kind: "invite" }))).status, 401);
  assert.equal((await upload(instance, id, second, undefined, {}, token)).status, 403);
  assert.equal((await upload(instance, id, first, undefined, {}, signedUpload(randomUUID(), first.id))).status, 403);
  assert.equal((await upload(instance, id, first, undefined, {}, signedUpload(id, randomUUID()))).status, 403);
  assert.equal((await objectRequest(instance, first.pathname)).status, 404);
  assert.equal((await upload(instance, id, first, undefined, {}, token)).status, 200);
  assert.equal((await objectRequest(instance, first.pathname)).status, 200);
  assert.equal((await objectRequest(instance, second.pathname)).status, 404);
  assert.equal((await upload(instance, id, first, undefined, {}, token)).status, 412);
});

test("45-file uploads use small credentials even when the full session exceeds ordinary header limits", async () => {
  const instance = gateway(), id = randomUUID();
  const files = Array.from({ length: 45 }, (_, index) => {
    const spec = file(id), name = `diagnostic-image-${index}-with-a-long-name.png`;
    return { ...spec, name, pathname: key(id, `files/${spec.id}/${name}`) };
  });
  assert.equal((await allocate(instance, id, files)).status, 200);
  assert.ok(signed(id, files).length > 16 * 1024);
  for (const spec of files) {
    const token = signedUpload(id, spec.id);
    assert.ok(token.length < 512);
    const response = await upload(instance, id, spec, undefined, {}, token);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
  }
});

test("CORS allows exact configured origins and the expected upload headers only", async () => {
  const instance = gateway();
  const id = randomUUID(), spec = file(id);
  assert.equal((await upload(instance, id, spec, undefined, { Origin: "https://www.kemmatechnologies.com.attacker.test" })).status, 403);
  const preflight = await instance.dispatchFetch("https://storage.test/v1/upload", { method: "OPTIONS", headers: { Origin: ORIGIN, "Access-Control-Request-Method": "PUT", "Access-Control-Request-Headers": "authorization,content-type,x-brief-file-id" } });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("access-control-allow-origin"), ORIGIN);
  assert.equal(preflight.headers.get("access-control-allow-credentials"), null);
  assert.equal((await instance.dispatchFetch("https://storage.test/v1/upload", { method: "OPTIONS", headers: { Origin: ORIGIN, "Access-Control-Request-Method": "PUT", "Access-Control-Request-Headers": "x-unrecognized" } })).status, 403);
});

test("upload rejects incorrect MIME/length, short or oversized bodies, and finalized projects", async () => {
  const instance = gateway();
  const id = randomUUID(), spec = file(id);
  assert.equal((await allocate(instance, id, [spec])).status, 200);
  assert.equal((await upload(instance, id, spec, undefined, { "Content-Type": "text/plain" })).status, 415);
  assert.equal((await upload(instance, id, spec, Uint8Array.from([1, 2, 3]), { "Content-Length": "3" })).status, 413);
  // Native R2 may surface a short stream as a storage exception (503). The
  // important contract is rejection with a generic response and no committed file.
  assert.ok([400, 503].includes((await upload(instance, id, spec, undefined, { "x-test-body-bytes": "3" })).status));
  assert.equal((await objectRequest(instance, spec.pathname)).status, 404);
  assert.ok([400, 503].includes((await upload(instance, id, spec, undefined, { "x-test-body-bytes": "5" })).status));
  assert.equal((await objectRequest(instance, spec.pathname)).status, 404);
  assert.equal((await objectRequest(instance, key(id, "submission.json"), "PUT", { accepted: true })).status, 200);
  assert.equal((await upload(instance, id, spec)).status, 409);
  assert.equal((await allocate(instance, id, [spec])).status, 409);
});

test("trusted list exposes project keys without the internal budget namespace", async () => {
  const instance = gateway();
  const id = randomUUID();
  assert.equal((await allocate(instance, id, [])).status, 200);
  const listing = await instance.dispatchFetch("https://storage.test/v1/list?prefix=briefs%2F", { headers: { Authorization: `Bearer ${STORAGE_SECRET}` } });
  assert.equal(listing.status, 200);
  assert.deepEqual(await listing.json(), { objects: [{ key: key(id, "allocation.json") }], truncated: false });
  assert.equal((await instance.dispatchFetch("https://storage.test/v1/list?prefix=system%2F", { headers: { Authorization: `Bearer ${STORAGE_SECRET}` } })).status, 400);
});


test("answer checkpoints and diagnostics are private, conditional and bounded",async()=>{
  const instance=gateway(),id=randomUUID();
  for(const name of ["answers-checkpoint.json","upload-status.json"]){
    const path=key(id,name);
    assert.equal((await instance.dispatchFetch(`https://storage.test/v1/object?key=${encodeURIComponent(path)}`)).status,401);
    assert.equal((await objectRequest(instance,path,"PUT",{ok:true})).status,200);
    assert.equal((await objectRequest(instance,path,"PUT",{ok:false})).status,412);
  }
  assert.equal((await objectRequest(instance,key(id,"answers-checkpoint.json"),"PUT",{value:"x".repeat(256*1024)})).status,413);
  assert.equal((await objectRequest(instance,key(id,"upload-status.json"),"PUT",{value:"x".repeat(32*1024)})).status,413);
});
