import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../app/api/contact/route";

const validContact = {
  name: "Emmanuel Tagbor",
  email: "emmanuel@example.com",
  organisation: "Kemma Technologies",
  website: "kemmatechnologies.com",
  projectType: "Website or web application",
  description: "We need a production-ready web platform for our organisation.",
  stage: "Ready to build",
  timeline: "1–3 months",
  budget: "Prefer to discuss",
  preferredContact: "Email",
  nickname: "",
};

function request(body: string, headers: Record<string, string> = {}) {
  return new NextRequest("https://www.kemmatechnologies.com/api/contact", {
    method: "POST",
    body,
    headers,
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("POST /api/contact", () => {
  it("requires JSON content", async () => {
    const response = await POST(request("name=Emmanuel", { "content-type": "text/plain" }));

    expect(response.status).toBe(415);
  });

  it("returns a client error for malformed JSON", async () => {
    const response = await POST(request("{", { "content-type": "application/json" }));

    expect(response.status).toBe(400);
  });

  it("rejects a body declared above the request limit", async () => {
    const response = await POST(
      request("{}", {
        "content-type": "application/json",
        "content-length": String(16 * 1024 + 1),
      }),
    );

    expect(response.status).toBe(413);
  });

  it("measures the body when content length is absent or unreliable", async () => {
    const response = await POST(
      request(JSON.stringify({ description: "a".repeat(16 * 1024) }), {
        "content-type": "application/json",
      }),
    );

    expect(response.status).toBe(413);
  });

  it("silently accepts a honeypot submission without sending", async () => {
    const response = await POST(
      request(JSON.stringify({ ...validContact, nickname: "spam-bot" }), {
        "content-type": "application/json",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("surfaces missing production email configuration", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("RESEND_API_KEY", "");

    const response = await POST(
      request(JSON.stringify(validContact), { "content-type": "application/json" }),
    );

    expect(response.status).toBe(500);
  });
});
