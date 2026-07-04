"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ButtonLink } from "@/components/ui/ButtonLink";

const HeroCanvas = dynamic(
  () => import("./HeroCanvas").then((m) => m.HeroCanvas),
  { ssr: false }
);

// Short, punchy headline — kept to a handful of words so it reads in a glance.
// The fuller description of what we do lives in the smaller subhead below.
// Flattened + precomputed at module scope (pure — no mutation during render).
interface HeadlineWord {
  word: string;
  gold: boolean;
  newLine: boolean;
}

const headlineWords: HeadlineWord[] = [
  { word: "We", gold: false, newLine: false },
  { word: "Engineer", gold: false, newLine: false },
  { word: "Digital", gold: true, newLine: true },
  { word: "Excellence.", gold: true, newLine: false },
];

const subhead = "Software, web platforms, and intelligent digital solutions for modern businesses.";

const wordVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.4 + i * 0.08, duration: 0.6, ease: "easeOut" as const },
  }),
};

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--dark-bg)]">
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-[rgba(4,4,6,0.4)] to-[var(--dark-bg)]" />
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,rgba(200,155,60,0.06)_0%,transparent_70%)]" />

      <HeroCanvas />

      <div className="relative z-10 mx-auto max-w-5xl px-6 md:px-10 text-center">
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.4em" }}
          animate={{ opacity: 1, letterSpacing: "0.3em" }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="text-xs uppercase text-[var(--gold)] tracking-[0.3em] mb-8 font-medium"
        >
          Kemma Technologies
        </motion.p>

        <h1 className="font-heading font-bold text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight mb-6">
          {headlineWords.map(({ word, gold, newLine }, i) => (
            <motion.span
              key={word}
              custom={i}
              variants={wordVariants}
              initial="hidden"
              animate="visible"
              className={[
                newLine ? "block" : "inline-block",
                "mr-[0.25em]",
                gold ? "text-gold-gradient" : "text-white",
              ].join(" ")}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-base md:text-lg text-[var(--silver)] max-w-lg mx-auto mb-10"
        >
          {subhead}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <ButtonLink href="/work" size="lg">View Our Work</ButtonLink>
          <ButtonLink href="/contact" variant="secondary" size="lg">Start a Project</ButtonLink>
        </motion.div>
      </div>
    </section>
  );
}
