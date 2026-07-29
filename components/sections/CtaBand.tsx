"use client";

import { motion } from "framer-motion";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

interface CtaBandProps {
  eyebrow?: string;
  heading?: React.ReactNode;
  body?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function CtaBand({
  eyebrow = "Start a project",
  heading = (
    <>Have a serious digital product to <span className="text-gold-gradient">build</span>?</>
  ),
  body = "Tell us what you are trying to launch, improve or automate. We will help turn the problem into a practical product direction.",
  primaryLabel = "Start a Project",
  primaryHref = "/contact",
  secondaryLabel = "Explore Our Work",
  secondaryHref = "/work",
}: CtaBandProps) {
  return (
    <section className="relative py-32 overflow-hidden bg-[var(--dark-bg)]">
      {/* Decorative background — kept behind content */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,155,60,0.1)_0%,transparent_60%)]" />
        {[12, 88].map((top, i) => (
          <motion.div
            key={top}
            className="absolute h-px w-full bg-gradient-to-r from-transparent via-[var(--gold)]/25 to-transparent"
            style={{ top: `${top}%` }}
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear", delay: i * 2 }}
          />
        ))}
      </div>

      <Container className="relative z-10">
        <Reveal className="text-center max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-[var(--gold)] mb-4">{eyebrow}</p>
          <h2 className="font-heading font-bold text-4xl md:text-6xl text-white mb-6">
            {heading}
          </h2>
          <p className="text-[var(--silver)] mb-10 text-lg">
            {body}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ButtonLink href={primaryHref} size="lg">{primaryLabel}</ButtonLink>
            {secondaryLabel && secondaryHref && (
              <ButtonLink href={secondaryHref} variant="secondary" size="lg">{secondaryLabel}</ButtonLink>
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
