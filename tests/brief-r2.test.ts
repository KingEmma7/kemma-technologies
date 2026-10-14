import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { BriefError, r2StorageConfig, signCapability, storageMode } from "../lib/brief/config";
import { Conflict, digest, fileHead, fileStream, MAX_DOCUMENT_BYTES, readDocument, submissionKeys, writeBytes, writeDocument } from "../lib/brief/storage";
import { beginSession } from "../lib/brief/service";

const storageOrigin = "https://brief-storage.example";
const storageSecret = "test-only-storage-secret-not-a-live-credential";
const signingSecret = "test-only-invite-signing-secret-distinct-from-storage";
const fetchMock = vi.fn<typeof fetch>();
const projectId = randomUUID();
const key = `briefs/${projectId}/submission.json`;
const jsonResponse = (value: unknown, version = '"version-1"') => new Response(JSON.stringify(value), { headers: { "Content-Type": "application/json", ETag: version } });

beforeEach(() => {
  vi.stubEnv("BRIEF_STORAGE_MODE", "r2");
  vi.stubEnv("BRIEF_STORAGE_URL", storageOrigin);
  vi.stubEnv("BRIEF_STORAGE_SECRET", storageSecret);
  vi.stubEnv("BRIEF_SIGNING_SECRET", signingSecret);
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("VERCEL", "");
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

function installObjectGateway() {
  const objects = new Map<string, { bytes: Buffer; type: string; etag: string }>();
  fetchMock.mockImplementation(async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    const headers = new Headers(init?.headers), pathname = url.searchParams.get("key") || "";
    if (headers.get("authorization") !== `Bearer ${storageSecret}`) return new Response(null, { status: 401 });
    if (url.pathname !== "/v1/object") return new Response(null, { status: 404 });
    if (init?.method === "PUT") {
      const bytes = Buffer.from(await new Response(init.body).arrayBuffer());
      const old = objects.get(pathname);
      if (headers.get("if-none-match") === "*" && old || headers.has("if-match") && headers.get("if-match") !== old?.etag) return new Response(null, { status: 412 });
      const etag = '"' + digest(bytes) + '"';
      objects.set(pathname, { bytes, type: headers.get("content-type") || "application/octet-stream", etag });
      return new Response(null, { status: 201, headers: { ETag: etag } });
    }
    const saved = objects.get(pathname);
    if (!saved) return new Response(null, { status: 404 });
    return new Response(init?.method === "HEAD" ? null : Uint8Array.from(saved.bytes).buffer, { headers: { "Content-Type": saved.type, "Content-Length": String(saved.bytes.length), ETag: saved.etag } });
  });
  return objects;
}

describe("R2 gateway configuration", () => {
  it("requires an HTTPS origin and an independent server-only secret", () => {
    expect(storageMode()).toBe("r2");
    expect(r2StorageConfig()).toEqual({ url: storageOrigin, secret: storageSecret });
    for (const url of ["http://brief-storage.example", "https://brief-storage.example/path", "https://user:password@brief-storage.example", "https://brief-storage.example?key=secret", "https://brief-storage.example#fragment"]) {
      vi.stubEnv("BRIEF_STORAGE_URL", url);
      expect(() => storageMode()).toThrow(BriefError);
    }
    vi.stubEnv("BRIEF_STORAGE_URL", storageOrigin);
    vi.stubEnv("BRIEF_STORAGE_SECRET", signingSecret);
    expect(() => storageMode()).toThrow(BriefError);
    vi.stubEnv("BRIEF_STORAGE_SECRET", "too-short");
    expect(() => storageMode()).toThrow(BriefError);
  });

  it("defaults to R2, rejects a legacy mode and still forbids deployed local storage", () => {
    vi.stubEnv("BRIEF_STORAGE_MODE", ""); expect(storageMode()).toBe("r2");
    vi.stubEnv("BRIEF_STORAGE_MODE", "blob"); expect(() => storageMode()).toThrow(BriefError);
    vi.stubEnv("BRIEF_STORAGE_MODE", "local"); vi.stubEnv("VERCEL", "1");
    expect(() => storageMode()).toThrow("Local preview storage is disabled");
  });
});

describe("trusted object gateway", () => {
  it("authenticates without putting credentials in URLs and reads uncached JSON with a quoted ETag", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ saved: true }, "unquoted-etag"));
    expect(await readDocument(key)).toEqual({ value: { saved: true }, etag: '"unquoted-etag"' });
    const [input, init] = fetchMock.mock.calls[0], url = new URL(String(input));
    expect(url.origin).toBe(storageOrigin); expect(url.pathname).toBe("/v1/object"); expect(url.searchParams.get("key")).toBe(key);
    expect(String(input)).not.toContain(storageSecret);
    expect(new Headers(init?.headers).get("authorization")).toBe(`Bearer ${storageSecret}`);
    expect(init).toMatchObject({ cache: "no-store", redirect: "error" });
  });

  it("uses immutable create and conditional replacement so concurrent writes cannot lose an update", async () => {
    installObjectGateway();
    const initial = await writeDocument(key, { state: "saved" }, null);
    const firstHeaders = new Headers(fetchMock.mock.calls[0][1]?.headers);
    expect(firstHeaders.get("if-none-match")).toBe("*"); expect(firstHeaders.has("if-match")).toBe(false);
    await expect(writeDocument(key, { state: "overwritten" }, null)).rejects.toBeInstanceOf(Conflict);
    const results = await Promise.allSettled([
      writeDocument(key, { state: "first" }, initial),
      writeDocument(key, { state: "second" }, initial),
    ]);
    expect(results.filter(value => value.status === "fulfilled")).toHaveLength(1);
    expect(results.find(value => value.status === "rejected")).toMatchObject({ reason: expect.any(Conflict) });
    const writes = fetchMock.mock.calls.filter(([, init]) => new Headers(init?.headers).has("if-match"));
    expect(writes).toHaveLength(2);
    for (const [, init] of writes) expect(new Headers(init?.headers).get("if-match")).toBe(initial);
    const stored = await readDocument<{ state: string }>(key);
    expect(["first", "second"]).toContain(stored?.value.state);
  });

  it("treats missing objects as absent for JSON, metadata and streams", async () => {
    fetchMock.mockImplementation(async () => new Response(null, { status: 404 }));
    expect(await readDocument(key)).toBeNull(); expect(await fileHead(key)).toBeNull(); expect(await fileStream(key)).toBeNull();
  });

  it("returns metadata and original bytes as a private stream without buffering the download", async () => {
    const bytes = new Uint8Array([0, 255, 11, 32, 128]), version = '"file-etag"';
    fetchMock.mockResolvedValueOnce(new Response(null, { headers: { "Content-Length": String(bytes.length), "Content-Type": "image/png", ETag: version } }));
    expect(await fileHead(key)).toEqual({ size: bytes.length, type: "image/png", etag: version });
    const response = new Response(bytes), stream = response.body;
    fetchMock.mockResolvedValueOnce(response);
    const result = await fileStream(key);
    expect(result).toBe(stream);
    expect(new Uint8Array(await new Response(result).arrayBuffer())).toEqual(bytes);
    expect(fetchMock.mock.calls.every(([input]) => !String(input).includes(storageSecret))).toBe(true);
  });

  it("sends original write bytes unchanged and preserves the returned version", async () => {
    const objects = installObjectGateway(), original = new Uint8Array([0, 255, 128, 10]);
    const version = await writeBytes(key, original, "application/octet-stream", null);
    expect(objects.get(key)?.bytes).toEqual(Buffer.from(original));
    expect(objects.get(key)?.etag).toBe(version);
  });

  it("maps storage allowance and payload errors to useful messages without exposing credentials", async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ error: "private details withheld" }), { status: 507 }));
    await expect(writeDocument(key, {}, null)).rejects.toMatchObject({ status: 507, message: "This form has reached its storage allowance. Contact Kemma to share a folder link." });
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 413 }));
    await expect(writeDocument(key, {}, null)).rejects.toMatchObject({ status: 413 });
    fetchMock.mockRejectedValueOnce(new Error(storageSecret));
    try { await readDocument(key); throw new Error("Expected failure"); }
    catch (error) { expect(error).toBeInstanceOf(BriefError); expect((error as Error).message).not.toContain(storageSecret); }
    fetchMock.mockResolvedValueOnce(new Response(new ReadableStream({ start(controller) { controller.error(new Error(storageSecret)); } }), { headers: { ETag: '"broken-stream"' } }));
    try { await readDocument(key); throw new Error("Expected stream failure"); }
    catch (error) { expect(error).toBeInstanceOf(BriefError); expect((error as Error).message).not.toContain(storageSecret); }
  });

  it("bounds declared and streamed JSON sizes even without a trustworthy Content-Length", async () => {
    const cancelled = vi.fn();
    fetchMock.mockResolvedValueOnce(new Response(new ReadableStream({ cancel: cancelled }), { headers: { ETag: '"large"', "Content-Length": String(MAX_DOCUMENT_BYTES + 1) } }));
    await expect(readDocument(key)).rejects.toMatchObject({ status: 503 }); expect(cancelled).toHaveBeenCalledOnce();
    const chunks = [new Uint8Array(MAX_DOCUMENT_BYTES), new Uint8Array([32])];
    fetchMock.mockResolvedValueOnce(new Response(new ReadableStream({ pull(controller) { const chunk = chunks.shift(); if (chunk) controller.enqueue(chunk); else controller.close(); } }), { headers: { ETag: '"large-stream"' } }));
    await expect(readDocument(key)).rejects.toMatchObject({ status: 503 });
    await expect(writeDocument(key, "x".repeat(MAX_DOCUMENT_BYTES))).rejects.toMatchObject({ status: 413 });
  });

  it("rejects malformed metadata and paths before treating them as saved objects", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { headers: { "Content-Type": "image/png", ETag: '"file"' } }));
    await expect(fileHead(key)).rejects.toMatchObject({ status: 503 });
    fetchMock.mockResolvedValueOnce(new Response("not-json", { headers: { ETag: '"json"' } }));
    await expect(readDocument(key)).rejects.toMatchObject({ status: 503 });
    await expect(writeDocument(`briefs/${projectId}/../../outside.json`, {}, null)).rejects.toThrow("Invalid storage path");
  });
});

describe("record pagination and client session boundary", () => {
  it("follows pagination and returns only unique project submission records", async () => {
    const other = `briefs/${randomUUID()}/submission.json`, cursor = "page+2/encoded";
    fetchMock.mockResolvedValueOnce(jsonResponse({ objects: [{ key }, { key: `briefs/${projectId}/files/image.png` }], truncated: true, cursor }));
    fetchMock.mockResolvedValueOnce(jsonResponse({ objects: [{ key }, { key: other }, { key: "outside/submission.json" }], truncated: false }));
    expect(await submissionKeys()).toEqual([key, other]);
    expect(new URL(String(fetchMock.mock.calls[0][0])).searchParams.get("prefix")).toBe("briefs/");
    expect(new URL(String(fetchMock.mock.calls[1][0])).searchParams.get("cursor")).toBe(cursor);
  });

  it("rejects repeated cursors instead of looping indefinitely", async () => {
    fetchMock.mockImplementation(async () => jsonResponse({ objects: [], truncated: true, cursor: "repeated" }));
    await expect(submissionKeys()).rejects.toMatchObject({ status: 503 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("returns only the public upload endpoint and signed per-project manifest to the client", async () => {
    installObjectGateway();
    const id = randomUUID(), invite = signCapability({ kind: "invite", id, exp: Date.now() + 60_000 });
    const session = await beginSession({ invite, files: [{ id: randomUUID(), name: "logo.png", type: "image/png", size: 17, scope: "brand", role: "Additional file" }] });
    expect(session).toMatchObject({ uploadMode: "r2", uploadUrl: storageOrigin + "/v1/upload", preview: false });
    expect(JSON.stringify(session)).not.toContain(storageSecret);
    expect(JSON.stringify(session)).not.toContain(signingSecret);
    expect(session.files[0].uploaded).toBe(false);
  });
});
