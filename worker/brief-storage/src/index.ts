type FileSpec = { id: string; name: string; type: string; size: number; scope: string; role: string; pathname: string };
type Session = { kind: "session"; id: string; exp: number; files: FileSpec[] };
type Upload = { kind: "upload"; id: string; exp: number; fileId: string };
type Allocation = { createdAt: string; files: FileSpec[] };
type Budget = { version: 1; totalBytes: number; projects: Record<string, number> };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const DOCUMENTS = new Set(["allocation.json", "submission.json", "notification.json", "email-payload.json", "email-sender.json", "email-preview.json"]);
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_TOTAL_BYTES = 150 * 1024 * 1024;
const MAX_DOCUMENT_BYTES = 8 * 1024 * 1024;
// Their sum remains below the 10 MiB project overhead reservation, even if all exist.
const DOCUMENT_LIMITS: Record<string, number> = {
  "allocation.json": 128 * 1024, "submission.json": 1024 * 1024, "notification.json": 16 * 1024,
  "email-payload.json": MAX_DOCUMENT_BYTES, "email-sender.json": 4 * 1024, "email-preview.json": 512 * 1024,
};
const PROJECT_OVERHEAD_BYTES = 10 * 1024 * 1024;
const BUDGET_KEY = "system/budget.json";
// Keep the stored bytes and strong R2 ETag intact across Cloudflare's edge.
const PRIVATE_CACHE_CONTROL = "private, no-store, no-transform";
const QUOTA_MESSAGE = "This form has reached its storage allowance. Contact Kemma to share a folder link.";
const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", heic: "image/heic", svg: "image/svg+xml",
  pdf: "application/pdf", mp4: "video/mp4", mov: "video/quicktime", doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", csv: "text/csv", txt: "text/plain",
  zip: "application/zip", ai: "application/postscript", eps: "application/postscript",
};

class GatewayError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function exactKeys(value: Record<string, unknown>, keys: string[]) {
  return Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
}
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (object(value)) return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, entry]) => `${JSON.stringify(key)}:${canonical(entry)}`).join(",")}}`;
  return JSON.stringify(value);
}
function secret(value: string | undefined) {
  if (!value || value.length < 32) throw new GatewayError(503, "The form is temporarily unavailable. Please contact Kemma.");
  return value;
}
function bearer(request: Request, maxLength: number) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ") || authorization.length > maxLength + 7) throw new GatewayError(401, "Use your project link from Kemma.");
  return authorization.slice(7);
}
async function authorizeServer(request: Request, env: Env) {
  const supplied = new TextEncoder().encode(bearer(request, 1024));
  const configured = new TextEncoder().encode(secret(env.BRIEF_STORAGE_SECRET));
  // Hash both inputs to the same fixed length before the runtime's constant-time comparison.
  const [left, right] = await Promise.all([crypto.subtle.digest("SHA-256", supplied), crypto.subtle.digest("SHA-256", configured)]);
  if (!crypto.subtle.timingSafeEqual(left, right)) throw new GatewayError(401, "Request not authorized.");
}
function validateFile(value: unknown, projectId: string): FileSpec {
  if (!object(value) || !exactKeys(value, ["id", "name", "type", "size", "scope", "role", "pathname"])) throw new GatewayError(400, "Check the selected files and try again.");
  const { id, name, type, size, scope, role, pathname } = value;
  if (typeof id !== "string" || !UUID.test(id) || typeof name !== "string" || !name.trim() || name.length > 180 || typeof type !== "string" || typeof size !== "number" || !Number.isSafeInteger(size) || size < 1 || size > MAX_FILE_BYTES || typeof scope !== "string" || typeof role !== "string" || typeof pathname !== "string") throw new GatewayError(400, "Check the selected files and try again.");
  const extension = name.toLowerCase().split(".").pop() || "";
  const safeName = name.normalize("NFKC").replace(/[^a-zA-Z0-9._-]/g, "-").replace(/^\.+/, "").slice(0, 180) || `file.${extension}`;
  if (!MIME_TYPES[extension] || type !== MIME_TYPES[extension] || pathname !== `briefs/${projectId}/files/${id}/${safeName}` || !/^(logo|brand|catalogue|policies|product:[0-9a-f-]{36}|paid:[0-9a-f-]{36})$/.test(scope) || !["Additional file", "Main product photo", "Private paid download"].includes(role)) throw new GatewayError(400, "Check the selected files and try again.");
  if (scope.includes(":") && !UUID.test(scope.split(":")[1])) throw new GatewayError(400, "Check the selected files and try again.");
  return { id, name, type, size, scope, role, pathname };
}
function validateFiles(value: unknown, projectId: string): FileSpec[] {
  if (!Array.isArray(value) || value.length > 60) throw new GatewayError(413, "This project has reached its file allowance.");
  const files = value.map(file => validateFile(file, projectId));
  if (new Set(files.map(file => file.id)).size !== files.length || files.reduce((sum, file) => sum + file.size, 0) > MAX_TOTAL_BYTES) throw new GatewayError(413, "This project has reached its file allowance.");
  return files;
}
function decodeBase64Url(value: string) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new GatewayError(401, "Use your project link from Kemma.");
  try { return Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/")), char => char.charCodeAt(0)); }
  catch { throw new GatewayError(401, "Use your project link from Kemma."); }
}
async function authorizeUpload(request: Request, env: Env): Promise<Session | Upload> {
  const token = bearer(request, 48_000);
  const parts = token.split(".");
  if (parts.length !== 2) throw new GatewayError(401, "Use your project link from Kemma.");
  const signature = decodeBase64Url(parts[1]);
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret(env.BRIEF_SIGNING_SECRET)), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  if (signature.byteLength !== 32 || !await crypto.subtle.verify("HMAC", key, signature, new TextEncoder().encode(parts[0]))) throw new GatewayError(401, "Use your project link from Kemma.");
  let payload: unknown;
  try { payload = JSON.parse(new TextDecoder("utf-8", { fatal: true, ignoreBOM: false }).decode(decodeBase64Url(parts[0]))); }
  catch { throw new GatewayError(401, "Use your project link from Kemma."); }
  if (!object(payload) || typeof payload.id !== "string" || !UUID.test(payload.id) || typeof payload.exp !== "number" || !Number.isFinite(payload.exp) || payload.exp <= Date.now()) throw new GatewayError(401, "This project link has expired. Ask Kemma for a new one.");
  if (payload.kind === "upload" && exactKeys(payload, ["kind", "id", "exp", "fileId"]) && typeof payload.fileId === "string" && UUID.test(payload.fileId)) return { kind: "upload", id: payload.id, exp: payload.exp, fileId: payload.fileId };
  // Existing open pages can finish with their previously issued session token.
  if (payload.kind !== "session" || !exactKeys(payload, ["kind", "id", "exp", "files"])) throw new GatewayError(401, "Use your project link from Kemma.");
  return { kind: "session", id: payload.id, exp: payload.exp, files: validateFiles(payload.files, payload.id) };
}
function storageKey(url: URL) {
  const key = url.searchParams.get("key") || "";
  if (key.length > 600 || key.includes("\\") || key.includes("%") || key.split("/").some(part => !part || part === "." || part === "..")) throw new GatewayError(400, "Invalid request.");
  const parts = key.split("/");
  if (parts[0] !== "briefs" || !UUID.test(parts[1] || "")) throw new GatewayError(400, "Invalid request.");
  if (parts.length === 3 && DOCUMENTS.has(parts[2])) return { key, projectId: parts[1], document: parts[2], fileId: null };
  if (parts.length === 5 && parts[2] === "files" && UUID.test(parts[3]) && /^[a-zA-Z0-9_-][a-zA-Z0-9._-]{0,179}$/.test(parts[4])) return { key, projectId: parts[1], document: null, fileId: parts[3] };
  throw new GatewayError(400, "Invalid request.");
}
async function boundedBytes(body: ReadableStream<Uint8Array> | null, limit: number) {
  if (!body) throw new GatewayError(400, "Empty request.");
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > limit) { await reader.cancel(); throw new GatewayError(413, "Request too large."); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}
function parseJson(bytes: Uint8Array): unknown {
  try { return JSON.parse(new TextDecoder("utf-8", { fatal: true, ignoreBOM: false }).decode(bytes)); }
  catch { throw new GatewayError(400, "Invalid request."); }
}
async function readAllocation(env: Env, projectId: string): Promise<Allocation | null> {
  const stored = await env.BUCKET.get(`briefs/${projectId}/allocation.json`);
  if (!stored) return null;
  if (stored.size > MAX_DOCUMENT_BYTES) throw new GatewayError(503, "The form is temporarily unavailable. Please contact Kemma.");
  return validateAllocation(parseJson(await boundedBytes(stored.body, MAX_DOCUMENT_BYTES)), projectId);
}
function validateAllocation(value: unknown, projectId: string): Allocation {
  if (!object(value) || !exactKeys(value, ["createdAt", "files"]) || typeof value.createdAt !== "string" || value.createdAt.length > 100 || !Number.isFinite(Date.parse(value.createdAt))) throw new GatewayError(400, "Invalid file allocation.");
  return { createdAt: value.createdAt, files: validateFiles(value.files, projectId) };
}
function validateBudget(value: unknown): Budget {
  if (!object(value) || value.version !== 1 || !Number.isSafeInteger(value.totalBytes) || typeof value.totalBytes !== "number" || value.totalBytes < 0 || !object(value.projects)) throw new GatewayError(503, "The form is temporarily unavailable. Please contact Kemma.");
  const projects: Record<string, number> = {};
  for (const [id, reserved] of Object.entries(value.projects)) {
    if (!UUID.test(id) || typeof reserved !== "number" || !Number.isSafeInteger(reserved) || reserved < PROJECT_OVERHEAD_BYTES || reserved > MAX_TOTAL_BYTES + PROJECT_OVERHEAD_BYTES) throw new GatewayError(503, "The form is temporarily unavailable. Please contact Kemma.");
    projects[id] = reserved;
  }
  if (Object.values(projects).reduce((sum, bytes) => sum + bytes, 0) !== value.totalBytes) throw new GatewayError(503, "The form is temporarily unavailable. Please contact Kemma.");
  return { version: 1, totalBytes: value.totalBytes, projects };
}
async function reserveBudget(env: Env, projectId: string, fileBytes: number) {
  const cap = Number(env.MAX_RESERVED_BYTES);
  if (!Number.isSafeInteger(cap) || cap <= 0 || cap > 5_000_000_000) throw new GatewayError(503, "The form is temporarily unavailable. Please contact Kemma.");
  const requested = fileBytes + PROJECT_OVERHEAD_BYTES;
  for (let attempt = 0; attempt < 8; attempt++) {
    const old = await env.BUCKET.get(BUDGET_KEY);
    if (old && old.size > 1024 * 1024) throw new GatewayError(503, "The form is temporarily unavailable. Please contact Kemma.");
    const budget = old ? validateBudget(parseJson(await boundedBytes(old.body, 1024 * 1024))) : { version: 1 as const, totalBytes: 0, projects: {} as Record<string, number> };
    const previous = budget.projects[projectId] || 0;
    if (previous >= requested) return;
    const total = budget.totalBytes + requested - previous;
    if (total > cap) throw new GatewayError(507, QUOTA_MESSAGE);
    budget.projects[projectId] = requested;
    budget.totalBytes = total;
    const written = await env.BUCKET.put(BUDGET_KEY, JSON.stringify(budget), {
      onlyIf: new Headers(old ? { "If-Match": old.httpEtag } : { "If-None-Match": "*" }),
      httpMetadata: { contentType: "application/json", cacheControl: PRIVATE_CACHE_CONTROL }, storageClass: "Standard",
    });
    if (written) return;
  }
  throw new GatewayError(409, "Another save is in progress. Please try again.");
}
function conditions(request: Request) {
  const match = request.headers.get("if-match");
  const absent = request.headers.get("if-none-match");
  if (match && absent || absent && absent !== "*" || match && (match.length > 200 || !/^(?:"[a-zA-Z0-9-]+"|[a-zA-Z0-9-]+)$/.test(match))) throw new GatewayError(400, "Invalid save condition.");
  return new Headers(match ? { "If-Match": match } : { "If-None-Match": "*" });
}
function objectHeaders(stored: R2Object) {
  return new Headers({ "ETag": stored.httpEtag, "Content-Length": String(stored.size), "Content-Type": stored.httpMetadata?.contentType || "application/octet-stream", "Cache-Control": PRIVATE_CACHE_CONTROL, "X-Content-Type-Options": "nosniff" });
}
async function saveFile(request: Request, env: Env, projectId: string, file: FileSpec) {
  if (request.headers.get("if-match")) throw new GatewayError(400, "Original uploads cannot be replaced.");
  if (request.headers.has("content-encoding")) throw new GatewayError(415, "Upload the original file without compression.");
  if (request.headers.get("content-type") !== file.type) throw new GatewayError(415, "The file type has changed. Add it again and retry.");
  const declared = request.headers.get("content-length");
  if (!declared || !/^\d+$/.test(declared)) throw new GatewayError(411, "The file size is missing. Select the original file and retry.");
  if (Number(declared) !== file.size) throw new GatewayError(413, "The file size has changed. Add it again and retry.");
  if (!request.body) throw new GatewayError(400, "The upload is incomplete. Please retry.");
  if (await env.BUCKET.head(`briefs/${projectId}/submission.json`)) throw new GatewayError(409, "This brief has already been sent. Contact Kemma to add anything else.");
  const allocation = await readAllocation(env, projectId);
  if (!allocation || !allocation.files.some(candidate => canonical(candidate) === canonical(file))) throw new GatewayError(403, "Reopen your project link and try uploading again.");
  // A fixed-length stream makes R2 reject both short and oversized bodies before committing.
  const fixed = new FixedLengthStream(file.size);
  const abort = new AbortController();
  const pumped = request.body.pipeTo(fixed.writable, { signal: abort.signal }).then(() => null, error => error);
  let stored: R2Object | null;
  try {
    stored = await env.BUCKET.put(file.pathname, fixed.readable, {
      onlyIf: new Headers({ "If-None-Match": "*" }),
      httpMetadata: { contentType: file.type, cacheControl: PRIVATE_CACHE_CONTROL },
      customMetadata: { projectId, fileId: file.id }, storageClass: "Standard",
    });
    if (!stored) { abort.abort(); await pumped; throw new GatewayError(412, "This file is already uploaded. Refresh the form and try sending again."); }
    if (await pumped || stored.size !== file.size) throw new GatewayError(400, "The upload is incomplete. Please retry.");
  } catch (error) {
    abort.abort();
    const streamError = await pumped;
    if (error instanceof GatewayError) throw error;
    if (streamError) throw new GatewayError(400, "The upload is incomplete. Please retry.");
    throw error;
  }
  return Response.json({ ok: true }, { headers: { "ETag": stored.httpEtag } });
}
async function handleObject(request: Request, env: Env, url: URL) {
  const path = storageKey(url);
  if (request.method === "HEAD") {
    const stored = await env.BUCKET.head(path.key);
    return stored ? new Response(null, { headers: objectHeaders(stored) }) : new Response(null, { status: 404 });
  }
  if (request.method === "GET") {
    const stored = await env.BUCKET.get(path.key);
    return stored ? new Response(stored.body, { headers: objectHeaders(stored) }) : new Response(null, { status: 404 });
  }
  if (request.method !== "PUT") throw new GatewayError(405, "Method not allowed.");
  if (path.fileId) {
    const allocation = await readAllocation(env, path.projectId);
    const file = allocation?.files.find(candidate => candidate.pathname === path.key);
    if (!file) throw new GatewayError(403, "The file is not part of this project.");
    return saveFile(request, env, path.projectId, file);
  }
  if (request.headers.get("content-type") !== "application/json" || request.headers.has("content-encoding")) throw new GatewayError(415, "Use JSON content.");
  const conditional = conditions(request);
  const declared = request.headers.get("content-length");
  const documentLimit = DOCUMENT_LIMITS[path.document || ""];
  if (declared !== null && (!/^\d+$/.test(declared) || Number(declared) > documentLimit)) throw new GatewayError(413, "Request too large.");
  const bytes = await boundedBytes(request.body, documentLimit);
  if (declared !== null && Number(declared) !== bytes.byteLength) throw new GatewayError(400, "The save is incomplete. Please retry.");
  const value = parseJson(bytes);
  if (path.document === "allocation.json") {
    if (await env.BUCKET.head(`briefs/${path.projectId}/submission.json`)) throw new GatewayError(409, "This brief has already been sent.");
    const allocation = validateAllocation(value, path.projectId);
    const prior = await readAllocation(env, path.projectId);
    if (prior && (prior.createdAt !== allocation.createdAt || prior.files.some(file => !allocation.files.some(candidate => canonical(candidate) === canonical(file))))) throw new GatewayError(409, "A saved file allocation cannot be removed or changed.");
    // Reserve first. A losing allocation CAS may over-reserve, which safely reduces capacity.
    await reserveBudget(env, path.projectId, allocation.files.reduce((sum, file) => sum + file.size, 0));
  }
  const stored = await env.BUCKET.put(path.key, bytes, { onlyIf: conditional, httpMetadata: { contentType: "application/json", cacheControl: PRIVATE_CACHE_CONTROL }, storageClass: "Standard" });
  if (!stored) throw new GatewayError(412, "Another save is in progress. Please try again.");
  return Response.json({ ok: true }, { headers: { "ETag": stored.httpEtag } });
}
async function handleList(env: Env, url: URL) {
  const prefix = url.searchParams.get("prefix") || "briefs/";
  if (prefix !== "briefs/" && !/^briefs\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/$/.test(prefix)) throw new GatewayError(400, "Invalid request.");
  const cursor = url.searchParams.get("cursor") || undefined;
  if (cursor && cursor.length > 2048) throw new GatewayError(400, "Invalid request.");
  const page = await env.BUCKET.list({ prefix, cursor, limit: 1000 });
  return Response.json({ objects: page.objects.map(entry => ({ key: entry.key })), truncated: page.truncated, ...(page.truncated ? { cursor: page.cursor } : {}) });
}
function allowedOrigins(env: Env) {
  return new Set(env.ALLOWED_ORIGINS.split(",").map(origin => origin.trim()).filter(Boolean));
}
function secureResponse(response: Response, origin: string | null, cors: boolean) {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", PRIVATE_CACHE_CONTROL);
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("X-Content-Type-Options", "nosniff");
  if (cors && origin) { headers.set("Access-Control-Allow-Origin", origin); headers.set("Access-Control-Expose-Headers", "ETag"); headers.set("Vary", "Origin"); }
  return new Response(response.body, { status: response.status, headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("origin");
    let cors = false;
    try {
      if (origin && !allowedOrigins(env).has(origin)) throw new GatewayError(403, "Open the form on Kemma’s website.");
      if (url.pathname === "/v1/upload") {
        if (!origin) throw new GatewayError(403, "Open the form on Kemma’s website.");
        cors = true;
        if (request.method === "OPTIONS") {
          const headers = (request.headers.get("access-control-request-headers") || "").split(",").map(header => header.trim().toLowerCase()).filter(Boolean);
          if (request.headers.get("access-control-request-method") !== "PUT" || headers.some(header => !["authorization", "content-type", "x-brief-file-id"].includes(header))) throw new GatewayError(403, "Upload request not allowed.");
          return secureResponse(new Response(null, { status: 204, headers: { "Access-Control-Allow-Methods": "PUT", "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Brief-File-Id", "Access-Control-Max-Age": "600" } }), origin, true);
        }
        if (request.method !== "PUT") throw new GatewayError(405, "Method not allowed.");
        const session = await authorizeUpload(request, env);
        const fileId = request.headers.get("x-brief-file-id") || "";
        const file = session.kind === "upload"
          ? session.fileId === fileId ? (await readAllocation(env, session.id))?.files.find(candidate => candidate.id === fileId) : undefined
          : session.files.find(candidate => candidate.id === fileId);
        if (!UUID.test(fileId) || !file) throw new GatewayError(403, "This upload is not part of your project.");
        return secureResponse(await saveFile(request, env, session.id, file), origin, true);
      }
      await authorizeServer(request, env);
      let response: Response;
      if (url.pathname === "/v1/object") response = await handleObject(request, env, url);
      else if (url.pathname === "/v1/list" && request.method === "GET") response = await handleList(env, url);
      else throw new GatewayError(404, "Not found.");
      return secureResponse(response, origin, false);
    } catch (error) {
      const failure = error instanceof GatewayError ? error : new GatewayError(503, "The form is temporarily unavailable. Please try again or contact Kemma.");
      return secureResponse(Response.json({ error: failure.message }, { status: failure.status }), origin, cors);
    }
  },
} satisfies ExportedHandler<Env>;
