"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

const HeroCanvas = dynamic(
  () => import("./HeroCanvas").then((m) => m.HeroCanvas),
  { ssr: false }
);

const tagline = "Engineering software, web platforms and intelligent digital solutions for modern businesses.";

const wordVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.4 + i * 0.05, duration: 0.6, ease: "easeOut" as const },
  }),
};

const words = tagline.split(" ");

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--dark-bg)]">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-[rgba(4,4,6,0.4)] to-[var(--dark-bg)]" />
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,rgba(200,155,60,0.06)_0%,transparent_70%)]" />

      {/* WebGL */}
      <HeroCanvas />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 md:px-10 text-center">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.4em" }}
          animate={{ opacity: 1, letterSpacing: "0.3em" }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="text-xs uppercase text-[var(--gold)] tracking-[0.3em] mb-8 font-medium"
        >
          Kemma Technologies — Ghana
        </motion.p>

        {/* Animated headline */}
        <h1 className="font-heading font-bold text-4xl md:text-6xl lg:text-7xl leading-tight mb-8">
          {words.map((word, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={wordVariants}
              initial="hidden"
              animate="visible"
              className={[
                "inline-block mr-[0.25em]",
                ["software,", "web", "platforms", "intelligent", "digital", "solutions"].includes(word)
                  ? "text-gold-gradient"
                  : "text-white",
              ].join(" ")}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-10"
        >
          <Link href="/work">
            <Button size="lg">View Our Work</Button>
          </Link>
          <Link href="/contact">
            <Button variant="secondary" size="lg">Start a Project</Button>
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs uppercase tracking-widest text-[var(--muted)]">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-px h-8 bg-gradient-to-b from-[var(--gold)] to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}
