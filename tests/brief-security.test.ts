import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { BriefError, signCapability, storageMode, verifyCapability } from "../lib/brief/config";
import { assertSameOrigin, fileSchema, fileSpec, readJson, validateAnswers } from "../lib/brief/schema";

beforeEach(() => {
  vi.stubEnv("BRIEF_SIGNING_SECRET", "test-only-signing-secret-with-at-least-32-bytes");
  vi.stubEnv("BRIEF_STORAGE_MODE", "local");
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("VERCEL", "");
});
afterEach(() => { vi.unstubAllEnvs(); });

describe("local preview origin aliases",()=>{
  it("accepts loopback aliases only on the same preview port",()=>{
    expect(()=>assertSameOrigin(new Request("http://localhost:4190/api/brief/session",{headers:{origin:"http://127.0.0.1:4190"}}))).not.toThrow();
    expect(()=>assertSameOrigin(new Request("http://localhost:4190/api/brief/session",{headers:{origin:"http://127.0.0.1:4191"}}))).toThrow(BriefError);
    expect(()=>assertSameOrigin(new Request("http://localhost:4190/api/brief/session",{headers:{origin:"https://unrelated.example"}}))).toThrow(BriefError);
  });
  it("does not allow the local alias exception in a deployed environment",()=>{
    vi.stubEnv("NODE_ENV","production");vi.stubEnv("NEXT_PUBLIC_SITE_URL","https://www.kemmatechnologies.com");
    expect(()=>assertSameOrigin(new Request("http://localhost:4190/api/brief/session",{headers:{origin:"http://127.0.0.1:4190"}}))).toThrow(BriefError);
  });
});

describe("private brief capabilities", () => {
  it("accepts only the signed capability purpose and expiry", () => {
    const payload = { kind: "invite" as const, id: randomUUID(), exp: Date.now() + 60_000 };
    const token = signCapability(payload);
    expect(verifyCapability(token, "invite")).toEqual(payload);
    expect(() => verifyCapability(token, "review")).toThrow(BriefError);
    expect(() => verifyCapability(signCapability({ ...payload, exp: Date.now() - 1 }), "invite")).toThrow(BriefError);
  });

  it("rejects malformed, tampered and overlong tokens", () => {
    const token = signCapability({ kind: "invite", id: randomUUID(), exp: Date.now() + 60_000 });
    const [body, signature] = token.split(".");
    const altered = `${body[0] === "a" ? "b" : "a"}${body.slice(1)}.${signature}`;
    for (const value of ["", "not-a-token", `${token}.extra`, altered, "x".repeat(48_001)]) {
      expect(() => verifyCapability(value, "invite")).toThrow(BriefError);
    }
  });

  it.each([{ node: "production", vercel: "" }, { node: "test", vercel: "1" }])(
    "cannot use disk preview storage on a deployed build: %j", ({ node, vercel }) => {
      vi.stubEnv("NODE_ENV", node);
      vi.stubEnv("VERCEL", vercel);
      expect(() => storageMode()).toThrow("Local preview storage is disabled");
    },
  );
});

describe("upload and request boundaries", () => {
  const specification = () => ({ id: randomUUID(), name: "logo.png", size: 10, type: "image/png", scope: "brand", role: "Additional file" as const });

  it("accepts larger originals while rejecting invalid sizes, unknown types and external paths", () => {
    expect(fileSchema.safeParse({ ...specification(), size: 256 * 1024 * 1024 }).success).toBe(true);
    expect(fileSchema.safeParse({ ...specification(), size: 0 }).success).toBe(false);
    expect(fileSchema.safeParse({ ...specification(), pathname: "https://outside.example/file" }).success).toBe(false);
    expect(() => fileSpec({ ...specification(), name: "script.exe" }, randomUUID())).toThrow(BriefError);
  });

  it("derives a bounded path and declared content type from the permitted extension", () => {
    const id = randomUUID();
    const input = { ...specification(), name: "../../logo <new>.png", type: "text/html" };
    const output = fileSpec(input, id);
    expect(output.pathname.startsWith(`briefs/${id}/files/${input.id}/`)).toBe(true);
    expect(output.pathname.split("/")).not.toContain("..");
    expect(output.type).toBe("image/png");
  });

  it("requires permission and a real product association before using uploaded files", () => {
    const productId = randomUUID();
    const file = fileSpec({ ...specification(), scope: `product:${productId}` }, randomUUID());
    const answers = { businessName: "Shalom Crotchets", email: "client@example.com" };
    expect(() => validateAnswers(answers, [], [file])).toThrow("Confirm permission");
    expect(() => validateAnswers({ ...answers, permission: true }, [], [file])).toThrow("missing its product");
    expect(() => validateAnswers({ ...answers, permission: true }, [{ id: productId, name: "Crochet bag" }], [file])).not.toThrow();
  });

  it("rejects unsafe object keys and deeply nested answers", () => {
    const valid = { businessName: "Shalom Crotchets", email: "client@example.com" };
    expect(() => validateAnswers({ ...valid, unsafe: JSON.parse('{"__proto__":{"admin":true}}') }, [], [])).toThrow(BriefError);
    let nested: unknown = "answer";
    for (let index = 0; index < 10; index++) nested = { nested };
    expect(() => validateAnswers({ ...valid, detail: nested }, [], [])).toThrow(BriefError);
  });

  it("measures streamed JSON instead of trusting Content-Length", async () => {
    const request = new Request("http://localhost/api/brief/session", {
      method: "POST", headers: { "Content-Type": "application/json", "Content-Length": "2" },
      body: JSON.stringify({ value: "a".repeat(200) }),
    });
    await expect(readJson(request, 100)).rejects.toMatchObject({ status: 413 });
  });

  it("rejects cross-origin requests and non-JSON bodies", async () => {
    const foreign = new Request("https://www.kemmatechnologies.com/api/brief/session", { headers: { Origin: "https://outside.example" } });
    expect(() => assertSameOrigin(foreign)).toThrow(BriefError);
    await expect(readJson(new Request("http://localhost/api/brief/session", { method: "POST", headers: { "Content-Type": "text/plain" }, body: "{}" }))).rejects.toMatchObject({ status: 415 });
  });
});
