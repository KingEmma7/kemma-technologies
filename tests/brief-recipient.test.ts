import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildEmail, notificationRecipient, sendNotification } from "../lib/brief/email";
import { readDocument } from "../lib/brief/storage";
import type { Submission } from "../lib/brief/service";
import { SITE } from "../lib/site";

const { sendEmail } = vi.hoisted(() => ({ sendEmail: vi.fn() }));
vi.mock("resend", () => ({ Resend: class { emails = { send: sendEmail }; } }));

let directory: string;
beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "kemma-brief-recipient-"));
  vi.stubEnv("BRIEF_LOCAL_DIR", directory);
  vi.stubEnv("BRIEF_STORAGE_MODE", "local");
  vi.stubEnv("BRIEF_EMAIL_MODE", "preview");
  vi.stubEnv("BRIEF_TO_EMAIL", "");
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("VERCEL", "");
  sendEmail.mockReset();
});
afterEach(async () => {
  vi.unstubAllEnvs();
  await rm(directory, { recursive: true, force: true });
});

function submission(): Submission {
  const id = randomUUID();
  return {
    id, reference: `KEM-${id.slice(0, 8)}`, schemaVersion: 2,
    savedAt: new Date().toISOString(),
    answers: { businessName: "Example Crochet", email: "client@example.com" },
    products: [], files: [], hash: "synthetic-test-record",
    reviewToken: "synthetic-test-capability", baseUrl: "http://localhost:4190",
  };
}

describe("private brief notification recipient", () => {
  it("keeps the public contact as the default when the override is absent or blank", () => {
    vi.stubEnv("BRIEF_TO_EMAIL", undefined);
    expect(notificationRecipient()).toBe(SITE.email);
    vi.stubEnv("BRIEF_TO_EMAIL", "   ");
    expect(buildEmail(submission()).to).toEqual([SITE.email]);
  });

  it("uses a private working inbox without changing public site contact", () => {
    const publicContact = SITE.email;
    vi.stubEnv("BRIEF_TO_EMAIL", " owner-inbox@example.com ");
    expect(buildEmail(submission()).to).toEqual(["owner-inbox@example.com"]);
    expect(SITE.email).toBe(publicContact);
  });

  it.each(["not-an-email", "one@example.com,two@example.com", "one@example.com\r\nBcc: other@example.com"])(
    "rejects invalid or multiple recipients before an email is built: %s", (value) => {
      vi.stubEnv("BRIEF_TO_EMAIL", value);
      expect(() => buildEmail(submission())).toThrow("Configure a valid BRIEF_TO_EMAIL");
      expect(sendEmail).not.toHaveBeenCalled();
    },
  );

  it.each(["second-owner@example.com", "invalid-current-setting"])("keeps the original frozen recipient when a retry sees %s", async (nextSetting) => {
    vi.stubEnv("BRIEF_TO_EMAIL", "first-owner@example.com");
    vi.stubEnv("BRIEF_EMAIL_MODE", "live");
    vi.stubEnv("RESEND_API_KEY", "synthetic-test-key");
    vi.stubEnv("CONTACT_FROM_EMAIL", "Kemma Test <sender@example.com>");
    const record = submission();
    sendEmail.mockResolvedValueOnce({ data: null, error: { statusCode: 422, message: "Synthetic rejection" } });
    expect(await sendNotification(record)).toBe("pending");
    const firstPayload = (await readDocument<{ to: string[] }>(`briefs/${record.id}/email-payload.json`))!;
    expect(firstPayload.value.to).toEqual(["first-owner@example.com"]);

    vi.stubEnv("BRIEF_TO_EMAIL", nextSetting);
    sendEmail.mockResolvedValueOnce({ data: { id: "synthetic-email-id" }, error: null });
    expect(await sendNotification(record)).toBe("sent");
    expect(sendEmail).toHaveBeenNthCalledWith(2,
      expect.objectContaining({ to: ["first-owner@example.com"] }),
      { idempotencyKey: `brief/${record.id}` },
    );
    expect((await readDocument(`briefs/${record.id}/email-payload.json`))?.etag).toBe(firstPayload.etag);
  });
});
