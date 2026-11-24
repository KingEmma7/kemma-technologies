import { createHmac, timingSafeEqual } from "node:crypto";
import { getBriefWorker } from "@/lib/brief/worker-binding";

export type Invite = { kind: "invite"; id: string; exp: number };
export type Session = { kind: "session"; id: string; exp: number; files: FileSpec[] };
export type Upload = { kind: "upload"; id: string; exp: number; fileId: string };
export type Review = { kind: "review"; id: string; exp: number };
export type FileSpec = { id: string; name: string; type: string; size: number; scope: string; role: string; pathname: string };
export type Capability = Invite | Session | Upload | Review;
export class BriefError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
const unavailable = () => new BriefError("The project form is temporarily unavailable. Please contact Kemma.", 503);
const invalidLink = () => new BriefError("Use your project link from Kemma.", 401);

export function r2StorageOrigin(): string {
  const configured = process.env.BRIEF_STORAGE_URL;
  if (!configured) throw unavailable();
  let url: URL;
  try { url = new URL(configured); } catch { throw unavailable(); }
  if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw unavailable();
  return url.origin;
}
export function r2StorageConfig(): { url: string; secret: string } {
  const storageSecret = process.env.BRIEF_STORAGE_SECRET;
  if (!storageSecret || storageSecret.length < 32 || storageSecret === process.env.BRIEF_SIGNING_SECRET) throw unavailable();
  return { url: r2StorageOrigin(), secret: storageSecret };
}
export function storageMode(): "local" | "r2" {
  if (process.env.BRIEF_STORAGE_MODE === "local") {
    if (process.env.VERCEL || process.env.NODE_ENV === "production") throw new BriefError("Local preview storage is disabled on deployed builds.", 503);
    return "local";
  }
  if (process.env.BRIEF_STORAGE_MODE && process.env.BRIEF_STORAGE_MODE !== "r2") throw new BriefError("The project form is temporarily unavailable. Please contact Kemma.", 503);
  if (getBriefWorker()) r2StorageOrigin();
  else r2StorageConfig();
  return "r2";
}
function secret() {
  const value = process.env.BRIEF_SIGNING_SECRET;
  if (!value || value.length < 32) throw unavailable();
  return value;
}
const encodeCapability = (payload: Capability) => Buffer.from(JSON.stringify(payload)).toString("base64url");
export function signCapability(payload: Capability): string {
  const body = encodeCapability(payload);
  return body + "." + createHmac("sha256", secret()).update(body).digest("base64url");
}
export async function issueCapability(payload: Capability): Promise<string> {
  const worker = getBriefWorker();
  if (!worker) return signCapability(payload);

  const body = encodeCapability(payload);
  let signature: string;
  try { signature = await worker.sign(body); } catch { throw unavailable(); }
  if (!/^[A-Za-z0-9_-]{43}$/.test(signature)) throw unavailable();
  return `${body}.${signature}`;
}
function signedParts(token: string): [body: string, signature: Buffer] {
  const [body, signature, extra] = token.split(".", 3);
  if (signature === undefined || extra !== undefined) throw invalidLink();
  const bytes = Buffer.from(signature, "base64url");
  if (bytes.length !== 32) throw invalidLink();
  return [body, bytes];
}
function parseCapability<T extends Capability["kind"]>(body: string, kind: T): Extract<Capability, {kind: T}> {
  let value: Capability;
  try { value = JSON.parse(Buffer.from(body, "base64url").toString()); } catch { throw invalidLink(); }
  if (!value || value.kind !== kind || !/^[0-9a-f-]{36}$/.test(value.id) || !Number.isFinite(value.exp) || value.exp <= Date.now()) throw new BriefError("This project link has expired. Ask Kemma for a new one.", 401);
  if (value.kind === "upload" && (Object.keys(value).length !== 4 || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value.fileId))) throw invalidLink();
  return value as Extract<Capability, {kind: T}>;
}
export function verifyCapability<T extends Capability["kind"]>(token: string, kind: T): Extract<Capability, {kind: T}> {
  const [body, signature] = signedParts(token);
  const expected = createHmac("sha256", secret()).update(body).digest();
  if (!timingSafeEqual(signature, expected)) throw invalidLink();
  return parseCapability(body, kind);
}
export async function authenticateCapability<T extends Capability["kind"]>(token: string, kind: T): Promise<Extract<Capability, {kind: T}>> {
  const worker = getBriefWorker();
  if (!worker) return verifyCapability(token, kind);

  const [body, signature] = signedParts(token);
  let verified: boolean;
  try { verified = await worker.verify(body, signature.toString("base64url")); } catch { throw unavailable(); }
  if (verified !== true) throw invalidLink();
  return parseCapability(body, kind);
}
export function getBriefPageConfig() {
  const preview = process.env.BRIEF_STORAGE_MODE === "local" && !process.env.VERCEL && process.env.NODE_ENV !== "production";
  return { preview, previewInvite: preview ? process.env.BRIEF_PREVIEW_INVITE || null : null };
}
export function publicBase(request?: Request) {
  if (storageMode() === "local" && request) return new URL(request.url).origin;
  // Stable origin makes idempotent email bodies identical across retries.
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://www.kemmatechnologies.com").replace(/\/$/, "");
}
