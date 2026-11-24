import { createHash, createHmac, randomBytes, randomUUID } from "node:crypto";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { authenticateCapability, issueCapability, type Invite } from "../lib/brief/config";
import { beginSession } from "../lib/brief/service";
import { inviteForShortCode } from "../lib/brief/short-links";
import * as workerBinding from "../lib/brief/worker-binding";

const storageOrigin = "https://brief-storage.example";
const signingKey = "test-only-old-signing-key-that-stays-in-the-storage-worker";
const hmac = (body: string) => createHmac("sha256", signingKey).update(body).digest("base64url");
const sign = vi.fn(async (body: string) => hmac(body));
const verify = vi.fn(async (body: string, signature: string) => hmac(body) === signature);
const gatewayFetch = vi.fn(async (request: Request) => {
  if (request.method === "PUT") return new Response(null, { status: 201, headers: { ETag: '"created"' } });
  return new Response(null, { status: 404 });
});
const publicFetch = vi.fn();
const invite: Invite = { kind: "invite", id: randomUUID(), exp: Date.now() + 60_000 };
const inviteBody = Buffer.from(JSON.stringify(invite)).toString("base64url");
const existingToken = `${inviteBody}.${hmac(inviteBody)}`;

beforeEach(() => {
  vi.stubEnv("BRIEF_STORAGE_MODE", "r2");
  vi.stubEnv("BRIEF_STORAGE_URL", storageOrigin);
  vi.stubEnv("BRIEF_STORAGE_SECRET", "");
  vi.stubEnv("BRIEF_SIGNING_SECRET", "");
  vi.stubGlobal("fetch", publicFetch);
  vi.spyOn(workerBinding, "getBriefWorker").mockReturnValue({ sign, verify, fetch: gatewayFetch });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

it("preserves the original invitation and browser draft identity via the signing binding", async () => {
  const code = randomBytes(16).toString("base64url");
  const hash = createHash("sha256").update(code).digest("hex");
  vi.stubEnv("BRIEF_SHORT_LINKS", JSON.stringify({ [hash]: { id: invite.id, exp: invite.exp } }));

  expect(await inviteForShortCode(code)).toBe(existingToken);
  expect(await authenticateCapability(existingToken, "invite")).toEqual(invite);
  expect(sign).toHaveBeenCalledWith(inviteBody);
  expect(verify).toHaveBeenCalledWith(inviteBody, hmac(inviteBody));
  await expect(authenticateCapability(existingToken, "review")).rejects.toMatchObject({ status: 401 });
});

it("prepares an existing project through private storage and keeps direct browser uploads", async () => {
  const fileId = randomUUID();
  const session = await beginSession({
    invite: existingToken,
    files: [{ id: fileId, name: "logo.png", type: "image/png", size: 17, scope: "brand", role: "Additional file" }],
  });

  expect(session).toMatchObject({ submissionId: invite.id, uploadMode: "r2", uploadUrl: `${storageOrigin}/v1/upload` });
  expect(await authenticateCapability(session.files[0].uploadToken, "upload")).toMatchObject({ id: invite.id, fileId });
  expect(await authenticateCapability(session.sessionToken, "session")).toMatchObject({ id: invite.id });
  const requests = gatewayFetch.mock.calls.map(([request]) => request);
  expect(requests.some(request => request.method === "PUT")).toBe(true);
  for (const request of requests) {
    expect(new URL(request.url).pathname).toBe("/v1/object");
    expect(request.headers.has("authorization")).toBe(false);
  }
  expect(publicFetch).not.toHaveBeenCalled();
});

it("rejects a bad signature and fails closed if the signing service is unavailable", async () => {
  const fakeSignature = Buffer.alloc(32, 1).toString("base64url");
  await expect(authenticateCapability(`${inviteBody}.${fakeSignature}`, "invite")).rejects.toMatchObject({ status: 401 });
  verify.mockRejectedValueOnce(new Error("internal details"));
  await expect(authenticateCapability(existingToken, "invite")).rejects.toMatchObject({ status: 503, message: expect.not.stringContaining("internal details") });
  sign.mockRejectedValueOnce(new Error("internal details"));
  await expect(issueCapability(invite)).rejects.toMatchObject({ status: 503, message: expect.not.stringContaining("internal details") });
  expect(publicFetch).not.toHaveBeenCalled();
});
