import { describe, expect, it } from "vitest";
import { escapeHtml } from "../lib/contact-email";
import { contactSchema } from "../lib/validations/contact";

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
} as const;

describe("contactSchema", () => {
  it("accepts and trims a valid enquiry", () => {
    const parsed = contactSchema.parse({
      ...validContact,
      name: "  Emmanuel Tagbor  ",
      email: "  emmanuel@example.com  ",
    });

    expect(parsed.name).toBe("Emmanuel Tagbor");
    expect(parsed.email).toBe("emmanuel@example.com");
  });

  it("rejects oversized free-text values", () => {
    const parsed = contactSchema.safeParse({
      ...validContact,
      description: "a".repeat(4_001),
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects unknown fields", () => {
    const parsed = contactSchema.safeParse({
      ...validContact,
      unexpected: "not part of the public contract",
    });

    expect(parsed.success).toBe(false);
  });
});

describe("escapeHtml", () => {
  it("escapes every HTML-significant character used by the email template", () => {
    expect(escapeHtml(`<a href="x">Tom & Jerry's</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#039;s&lt;/a&gt;",
    );
  });
});
