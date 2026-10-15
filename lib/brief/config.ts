import { createHmac, timingSafeEqual } from "node:crypto";

export type Invite = { kind: "invite"; id: string; exp: number };
export type Session = { kind: "session"; id: string; exp: number; files: FileSpec[] };
export type Upload = { kind: "upload"; id: string; exp: number; fileId: string };
export type Review = { kind: "review"; id: string; exp: number };
export type FileSpec = { id: string; name: string; type: string; size: number; scope: string; role: string; pathname: string };
export type Capability = Invite | Session | Upload | Review;
export class BriefError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export function r2StorageConfig(): { url: string; secret: string } {
  const configured = process.env.BRIEF_STORAGE_URL;
  const storageSecret = process.env.BRIEF_STORAGE_SECRET;
  const unavailable = () => new BriefError("The project form is temporarily unavailable. Please contact Kemma.", 503);
  if (!configured || !storageSecret || storageSecret.length < 32 || storageSecret === process.env.BRIEF_SIGNING_SECRET) throw unavailable();
  let url: URL;
  try { url = new URL(configured); } catch { throw unavailable(); }
  if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw unavailable();
  return { url: url.origin, secret: storageSecret };
}
export function storageMode(): "local" | "r2" {
  if (process.env.BRIEF_STORAGE_MODE === "local") {
    if (process.env.VERCEL || process.env.NODE_ENV === "production") throw new BriefError("Local preview storage is disabled on deployed builds.", 503);
    return "local";
  }
  if (process.env.BRIEF_STORAGE_MODE && process.env.BRIEF_STORAGE_MODE !== "r2") throw new BriefError("The project form is temporarily unavailable. Please contact Kemma.", 503);
  r2StorageConfig();
  return "r2";
}
function secret() {
  const value = process.env.BRIEF_SIGNING_SECRET;
  if (!value || value.length < 32) throw new BriefError("The project form is temporarily unavailable. Please contact Kemma.", 503);
  return value;
}
export function signCapability(payload: Capability): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return body + "." + createHmac("sha256", secret()).update(body).digest("base64url");
}
export function verifyCapability<T extends Capability["kind"]>(token: string, kind: T): Extract<Capability, {kind: T}> {
  const parts = token.split(".");
  if (parts.length !== 2) throw new BriefError("Use your project link from Kemma.", 401);
  const expected = createHmac("sha256", secret()).update(parts[0]).digest();
  const actual = Buffer.from(parts[1], "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new BriefError("Use your project link from Kemma.", 401);
  let value: Capability;
  try { value = JSON.parse(Buffer.from(parts[0], "base64url").toString()); } catch { throw new BriefError("Use your project link from Kemma.", 401); }
  if (value.kind !== kind || !/^[0-9a-f-]{36}$/.test(value.id) || !Number.isFinite(value.exp) || value.exp <= Date.now()) throw new BriefError("This project link has expired. Ask Kemma for a new one.", 401);
  if (value.kind === "upload" && (Object.keys(value).length !== 4 || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value.fileId))) throw new BriefError("Use your project link from Kemma.", 401);
  return value as Extract<Capability, {kind: T}>;
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
