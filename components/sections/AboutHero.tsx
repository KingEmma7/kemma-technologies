"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";

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
          Our story
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-heading font-bold text-5xl md:text-7xl text-white mb-8 max-w-4xl"
        >
          Building Africa&apos;s digital <span className="text-gold-gradient">future</span>, one solution at a time.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-[var(--silver)] text-xl max-w-2xl leading-relaxed"
        >
          Kemma Technologies was founded in Accra with a single conviction: that world-class engineering talent exists in Africa and can produce world-class digital products. We build software, platforms and intelligent systems that help modern businesses compete, grow and lead.
        </motion.p>
      </Container>
    </section>
  );
}
