import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name:    z.string().min(2),
  email:   z.string().email(),
  company: z.string().optional(),
  message: z.string().min(20),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const { name, email, company, message } = parsed.data;

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      // Stub-safe: log to console in dev when key is missing
      console.log("[Contact form submission — no RESEND_API_KEY set]", { name, email, company, message });
      return NextResponse.json({ ok: true });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    await resend.emails.send({
      from:    "Kemma Website <noreply@kemmatech.com>",
      to:      ["hello@kemmatech.com"],
      replyTo: email,
      subject: `New enquiry from ${name}${company ? ` (${company})` : ""}`,
      text:    `Name: ${name}\nEmail: ${email}\nCompany: ${company ?? "N/A"}\n\nMessage:\n${message}`,
      html: `
        <h2>New Contact Enquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Company:</strong> ${company ?? "N/A"}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br/>")}</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
