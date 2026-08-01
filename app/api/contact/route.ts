import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations/contact";
import { SITE } from "@/lib/site";
import { escapeHtml } from "@/lib/contact-email";

const MAX_CONTACT_BODY_BYTES = 16 * 1024;

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
  }

  const declaredLength = Number(req.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_CONTACT_BODY_BYTES) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  let body: unknown;
  try {
    const rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_CONTACT_BODY_BYTES) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  // Honeypot tripped — respond as if successful so the bot doesn't learn
  // to look for a different signal, but skip sending the email entirely.
  if (parsed.data.nickname) {
    return NextResponse.json({ ok: true });
  }

  try {
    const {
      name,
      email,
      organisation,
      website,
      projectType,
      description,
      stage,
      timeline,
      budget,
      preferredContact,
    } = parsed.data;

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      // Do not log enquiry fields: contact submissions contain personal data.
      // Development can still exercise the UI without claiming delivery.
      console.warn("[contact] RESEND_API_KEY is not set — email not sent.");
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json({ ok: true }); // allow dev testing
      }
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    // Every interpolated value is escaped — user input must never be able to
    // inject markup into the notification email.
    const blank = "—";
    const rows: [string, string][] = [
      ["Name", escapeHtml(name)],
      ["Email", `<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>`],
      ["Organisation", escapeHtml(organisation || blank)],
      ["Website", escapeHtml(website || blank)],
      ["Project type", escapeHtml(projectType)],
      ["Current stage", escapeHtml(stage || blank)],
      ["Timeline", escapeHtml(timeline || blank)],
      ["Budget", escapeHtml(budget || blank)],
      ["Preferred contact", escapeHtml(preferredContact)],
    ];

    const safeDescription = escapeHtml(description).replace(/\n/g, "<br/>");

    // Plain-text alternative uses the raw values: it is never rendered as
    // markup, and escaping there would show &amp; to the reader.
    const textBody = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Organisation: ${organisation || blank}`,
      `Website: ${website || blank}`,
      `Project type: ${projectType}`,
      `Current stage: ${stage || blank}`,
      `Timeline: ${timeline || blank}`,
      `Budget: ${budget || blank}`,
      `Preferred contact: ${preferredContact}`,
      "",
      "What they want to build:",
      description,
    ].join("\n");

    // Sender falls back to Resend's shared sandbox address so the form keeps
    // working before kemmatechnologies.com is verified in Resend. Once it is,
    // set CONTACT_FROM_EMAIL (e.g. "Kemma Website
    // <noreply@kemmatechnologies.com>") — sends from an unverified domain are
    // rejected.
    const from = process.env.CONTACT_FROM_EMAIL ?? "Kemma Website <onboarding@resend.dev>";

    const { error } = await resend.emails.send({
      from,
      to:      [SITE.email],
      replyTo: email,
      subject: `${projectType} enquiry from ${name}${organisation ? ` (${organisation})` : ""}`,
      text:    textBody,
      html: `
        <h2>New enquiry</h2>
        <table cellpadding="6" style="border-collapse:collapse">
          ${rows
            .map(
              ([label, value]) =>
                `<tr><td style="vertical-align:top"><strong>${label}</strong></td><td>${value}</td></tr>`
            )
            .join("")}
        </table>
        <hr />
        <p><strong>What they want to build:</strong></p>
        <p>${safeDescription}</p>
      `,
    });

    if (error) {
      console.error("[contact] Resend returned an error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
