"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";

export function ServicesHero() {
  return (
    <section className="relative pt-40 pb-24 overflow-hidden bg-[var(--dark-bg)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,123,148,0.08)_0%,transparent_60%)] pointer-events-none" />

      <Container>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xs uppercase tracking-widest text-[var(--gold)] mb-6"
        >
          What we build
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-heading font-bold text-5xl md:text-7xl text-white mb-8 max-w-4xl"
        >
          Services built for <span className="text-gold-gradient">impact at scale</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-[var(--silver)] text-xl max-w-2xl leading-relaxed"
        >
          Three core capabilities. One integrated team. We move from strategy to shipped product faster than any agency you&apos;ve worked with.
        </motion.p>
      </Container>
    </section>
  );
}
