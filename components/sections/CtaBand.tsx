"use client";

import { motion } from "framer-motion";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

export function CtaBand() {
  return (
    <section className="relative py-32 overflow-hidden bg-[var(--dark-bg)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,155,60,0.1)_0%,transparent_60%)] pointer-events-none" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent"
            style={{ top: `${30 + i * 20}%`, width: "100%" }}
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "linear", delay: i * 1.5 }}
          />
        ))}
      </div>

      <Container>
        <Reveal className="text-center max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-[var(--gold)] mb-4">Ready to build?</p>
          <h2 className="font-heading font-bold text-4xl md:text-6xl text-white mb-6">
            Let&apos;s create something <span className="text-gold-gradient">exceptional</span> together
          </h2>
          <p className="text-[var(--silver)] mb-10 text-lg">
            Tell us about your project and we&apos;ll get back to you within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ButtonLink href="/contact" size="lg">Start a Conversation</ButtonLink>
            <ButtonLink href="/work" variant="secondary" size="lg">See Our Work</ButtonLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
