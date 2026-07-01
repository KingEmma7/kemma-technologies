import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations/contact";

/** Escape HTML special chars so user input cannot inject markup into emails. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Honeypot tripped — respond as if successful so the bot doesn't learn
    // to look for a different signal, but skip sending the email entirely.
    if (parsed.data.website) {
      return NextResponse.json({ ok: true });
    }

    const { name, email, company, message } = parsed.data;

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      // Stub: log in dev when key is missing but return an error so misconfiguration
      // is surfaced in non-production environments rather than silently succeeding.
      console.warn("[contact] RESEND_API_KEY is not set — email not sent.", { name, email });
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json({ ok: true }); // allow dev testing
      }
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const safeName    = escapeHtml(name);
    const safeEmail   = escapeHtml(email);
    const safeCompany = escapeHtml(company ?? "N/A");
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>");

    const { error } = await resend.emails.send({
      from:    "Kemma Website <noreply@kemmatech.com>",
      to:      ["hello@kemmatech.com"],
      replyTo: email,
      subject: `New enquiry from ${name}${company ? ` (${company})` : ""}`,
      text:    `Name: ${name}\nEmail: ${email}\nCompany: ${company ?? "N/A"}\n\nMessage:\n${message}`,
      html: `
        <h2>New Contact Enquiry</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
        <p><strong>Company:</strong> ${safeCompany}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
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
