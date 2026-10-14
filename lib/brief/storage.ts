import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, open, unlink, rename, stat, readdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { BriefError, r2StorageConfig, storageMode } from "./config";

export class Conflict extends Error {}
export const digest = (data: Uint8Array | string) => createHash("sha256").update(data).digest("hex");
export const MAX_DOCUMENT_BYTES = 8 * 1024 * 1024;
const localRoot = () => resolve(process.env.BRIEF_LOCAL_DIR || ".brief-preview");
const unavailable = () => new BriefError("The project form is temporarily unavailable. Please contact Kemma.", 503);
function checkKey(key: string) {
  if (!/^briefs\/[0-9a-f-]{36}\/[a-zA-Z0-9/._-]+$/.test(key) || key.split("/").some(part => !part || part === "." || part === "..")) throw new Error("Invalid storage path");
  return key;
}
function localPath(key: string) { return resolve(localRoot(), checkKey(key)); }
function etag(response: Response): string {
  const value = response.headers.get("etag")?.trim();
  if (value && /^"[\x21\x23-\x7e]+"$/.test(value)) return value;
  if (value && /^[a-zA-Z0-9._:-]+$/.test(value)) return '"' + value + '"';
  throw unavailable();
}
async function gateway(path: string, query: Record<string, string>, init: RequestInit = {}): Promise<Response> {
  const config = r2StorageConfig(), url = new URL(path, config.url);
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
  const headers = new Headers(init.headers);
  headers.set("Authorization", "Bearer " + config.secret);
  let response: Response;
  try { response = await fetch(url, { ...init, headers, cache: "no-store", redirect: "error" }); }
  catch { throw unavailable(); }
  if (response.status === 507) throw new BriefError("This form has reached its storage allowance. Contact Kemma to share a folder link.", 507);
  if (response.status === 413) throw new BriefError("This file or brief is larger than the storage limit. Use a folder link or contact Kemma.", 413);
  if (!response.ok && response.status !== 404 && response.status !== 412) throw unavailable();
  return response;
}
async function documentText(response: Response): Promise<string> {
  const length = response.headers.get("content-length");
  if (length !== null && (!Number.isSafeInteger(Number(length)) || Number(length) < 0 || Number(length) > MAX_DOCUMENT_BYTES)) {
    await response.body?.cancel(); throw new BriefError("The saved brief exceeds the document limit. Please contact Kemma.", 503);
  }
  const reader = response.body?.getReader(); if (!reader) throw unavailable();
  let total = 0; const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      total += value.byteLength;
      if (total > MAX_DOCUMENT_BYTES) { await reader.cancel(); throw new BriefError("The saved brief exceeds the document limit. Please contact Kemma.", 503); }
      chunks.push(value);
    }
    return Buffer.concat(chunks).toString("utf8");
  } catch (error) {
    if (error instanceof BriefError) throw error;
    throw unavailable();
  } finally { reader.releaseLock(); }
}
export async function readDocument<T>(key: string): Promise<{ value: T; etag: string } | null> {
  checkKey(key);
  if (storageMode() === "local") {
    try { const bytes = await readFile(localPath(key)); if (bytes.byteLength > MAX_DOCUMENT_BYTES) throw unavailable(); return { value: JSON.parse(bytes.toString()), etag: digest(bytes) }; }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return null; throw error; }
  }
  const response = await gateway("/v1/object", { key });
  if (response.status === 404) return null;
  if (!response.ok) throw unavailable();
  const version = etag(response), text = await documentText(response);
  try { return { value: JSON.parse(text), etag: version }; } catch { throw unavailable(); }
}
export async function writeDocument(key: string, value: unknown, expected?: string | null) {
  const bytes = Buffer.from(JSON.stringify(value));
  if (bytes.byteLength > MAX_DOCUMENT_BYTES) throw new BriefError("The brief exceeds the document limit. Use a folder link or contact Kemma.", 413);
  return writeBytes(key, bytes, "application/json", expected);
}
export async function writeBytes(key: string, bytes: Uint8Array, type: string, expected?: string | null): Promise<string> {
  checkKey(key);
  if (storageMode() === "r2") {
    const headers = new Headers({ "Content-Type": type });
    if (typeof expected === "string") headers.set("If-Match", expected);
    else headers.set("If-None-Match", "*");
    const response = await gateway("/v1/object", { key }, { method: "PUT", headers, body: Uint8Array.from(bytes).buffer });
    if (response.status === 412) throw new Conflict();
    if (!response.ok) throw unavailable();
    return etag(response);
  }
  const path = localPath(key); await mkdir(dirname(path), { recursive: true });
  // This lock is shared between route bundles in the local preview only.
  const lock = path + ".lock"; let handle;
  for (let index = 0; index < 100; index++) {
    try { handle = await open(lock, "wx"); break; }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error; await new Promise(done => setTimeout(done, 20)); }
  }
  if (!handle) throw new Conflict();
  try {
    let old: Buffer | null = null;
    try { old = await readFile(path); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    if ((expected === undefined || expected === null) && old) throw new Conflict();
    if (typeof expected === "string" && (!old || digest(old) !== expected)) throw new Conflict();
    const temporary = path + ".tmp"; await writeFile(temporary, bytes, { mode: 0o600 }); await rename(temporary, path); return digest(bytes);
  } finally { await handle.close(); await unlink(lock); }
}
export async function fileHead(key: string): Promise<{ size: number; type: string; etag?: string } | null> {
  checkKey(key);
  if (storageMode() === "local") {
    try { return { size: (await stat(localPath(key))).size, type: "application/octet-stream" }; }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return null; throw error; }
  }
  const response = await gateway("/v1/object", { key }, { method: "HEAD" });
  if (response.status === 404) return null;
  const length = response.headers.get("content-length"), type = response.headers.get("content-type");
  if (!response.ok || length === null || !Number.isSafeInteger(Number(length)) || Number(length) < 0 || !type) throw unavailable();
  return { size: Number(length), type, etag: etag(response) };
}
export async function fileStream(key: string): Promise<ReadableStream<Uint8Array> | null> {
  checkKey(key);
  if (storageMode() === "local") {
    try { return new Blob([await readFile(localPath(key))]).stream(); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return null; throw error; }
  }
  const response = await gateway("/v1/object", { key });
  if (response.status === 404) return null;
  if (!response.ok || !response.body) throw unavailable();
  return response.body;
}
export async function submissionKeys(): Promise<string[]> {
  if (storageMode() === "local") {
    try { return (await readdir(resolve(localRoot(), "briefs"))).filter(id => /^[0-9a-f-]{36}$/.test(id)).map(id => "briefs/" + id + "/submission.json"); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return []; throw error; }
  }
  const keys = new Set<string>(), seen = new Set<string>(); let cursor: string | undefined;
  while (true) {
    const response = await gateway("/v1/list", { prefix: "briefs/", ...(cursor ? { cursor } : {}) });
    if (!response.ok) throw unavailable();
    let page: { objects: { key: string }[]; truncated: boolean; cursor?: string };
    try { page = JSON.parse(await documentText(response)); } catch { throw unavailable(); }
    if (!page || !Array.isArray(page.objects) || typeof page.truncated !== "boolean" || page.objects.some(item => !item || typeof item.key !== "string")) throw unavailable();
    for (const item of page.objects) if (/^briefs\/[0-9a-f-]{36}\/submission\.json$/.test(item.key)) keys.add(item.key);
    if (!page.truncated) return [...keys];
    if (typeof page.cursor !== "string" || !page.cursor || seen.has(page.cursor)) throw unavailable();
    seen.add(page.cursor); cursor = page.cursor;
  }
}
