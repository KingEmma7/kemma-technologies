import type { Metadata } from "next";
import { ContactForm } from "@/components/sections/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Start a project with Kemma Technologies. We respond within 24 hours.",
};

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-40 pb-20 bg-[var(--dark-bg)] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,123,148,0.08)_0%,transparent_60%)] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
          <p className="text-xs uppercase tracking-widest text-[var(--gold)] mb-6">Get in touch</p>
          <h1 className="font-heading font-bold text-5xl md:text-7xl text-white mb-6 max-w-3xl">
            Let&apos;s build something <span className="text-gold-gradient">great</span>
          </h1>
          <p className="text-[var(--silver)] text-xl max-w-xl">
            Tell us about your project. We&apos;ll review it and get back to you within 24 hours.
          </p>
        </div>
      </section>

      <ContactForm />
    </>
  );
}
