import { createHash, randomBytes, randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { signCapability, verifyCapability } from "../lib/brief/config";
import { inviteForShortCode } from "../lib/brief/short-links";

const code = randomBytes(16).toString("base64url");
const hash = createHash("sha256").update(code).digest("hex");
const id = randomUUID();
const exp = Date.now() + 60_000;
beforeEach(() => {
  vi.stubEnv("BRIEF_SIGNING_SECRET", "test-only-signing-secret-at-least-32-characters");
  vi.stubEnv("BRIEF_SHORT_LINKS", JSON.stringify({ [hash]: { id, exp } }));
});
afterEach(() => vi.unstubAllEnvs());

describe("private short project links", () => {
  it("reconstructs the identical original invitation and draft key", () => {
    const original = signCapability({ kind: "invite", id, exp });
    expect(inviteForShortCode(code)).toBe(original);
    expect(verifyCapability(inviteForShortCode(code)!, "invite")).toEqual({ kind: "invite", id, exp });
  });
  it("does not turn an unknown code into a project invitation", () => {
    expect(inviteForShortCode(randomBytes(16).toString("base64url"))).toBeNull();
  });
  it("rejects expired links", () => {
    vi.stubEnv("BRIEF_SHORT_LINKS", JSON.stringify({ [hash]: { id, exp: Date.now() - 1 } }));
    expect(inviteForShortCode(code)).toBeNull();
  });
  it.each(["", "crochet", "../" + code, code + "extra", "x".repeat(10_000)])("rejects malformed codes", invalid => {
    expect(inviteForShortCode(invalid)).toBeNull();
  });
  it.each(["", "{broken", "[]", JSON.stringify({ [hash]: { id: "bad-id", exp } }), JSON.stringify({ [hash]: { id, exp, kind: "review" } }), " ".repeat(32_001)])("fails closed on missing or malformed registration", configured => {
    vi.stubEnv("BRIEF_SHORT_LINKS", configured);
    expect(inviteForShortCode(code)).toBeNull();
  });
  it("requires the existing signing secret", () => {
    vi.stubEnv("BRIEF_SIGNING_SECRET", "");
    expect(inviteForShortCode(code)).toBeNull();
  });
});
