"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/ButtonLink";

export function AboutHero() {
  return (
    <section className="relative pt-40 pb-24 overflow-hidden bg-[var(--dark-bg)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(200,155,60,0.08)_0%,transparent_60%)] pointer-events-none" />

      <Container>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xs uppercase tracking-widest text-[var(--gold)] mb-6"
        >
          About Kemma Technologies
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-heading font-bold text-4xl md:text-6xl text-white mb-8 max-w-4xl leading-tight"
        >
          Engineering reliable software, web platforms, and{" "}
          <span className="text-gold-gradient">intelligent digital systems</span> for modern businesses.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-[var(--silver)] text-lg md:text-xl max-w-2xl leading-relaxed mb-10"
        >
          Kemma Technologies helps businesses, founders, and organizations turn ideas into clean,
          scalable, and practical digital products. We combine software engineering, thoughtful
          user experience, and modern AI-assisted workflows to build websites, platforms, internal
          systems, automations, and digital tools that are visually polished, reliable,
          maintainable, and built for real-world use.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <ButtonLink href="/contact" size="lg">Start a Project</ButtonLink>
          <ButtonLink href="/services" variant="secondary" size="lg">Explore Our Services</ButtonLink>
        </motion.div>
      </Container>
    </section>
  );
}
