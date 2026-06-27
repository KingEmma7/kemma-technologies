"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const fadeUp = (delay: number) => ({
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.68, ease: "easeOut" as const },
  },
});

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#050608] min-h-[88vh] flex items-center border-b border-white/[0.06]">

      {/* ── Full-bleed founder image ──────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        <Image
          src="/images/entrepreneur-hero-founder.png"
          alt="Founder — The Entrepreneur Ghana"
          fill
          priority
          className="object-cover object-[68%_center]"
          sizes="100vw"
        />
        {/* Left dark gradient — keeps text legible */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050608] from-[36%] via-[#050608]/62 to-[#050608]/08" />
        {/* Top + bottom fade into page */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-transparent to-[#050608]/28" />
        {/* Subtle overall darkening */}
        <div className="absolute inset-0 bg-[#050608]/20" />
      </div>

      {/* ── Hero-only animated gold glow (right side, behind founder) ────── */}
      <div
        className="hero-gold-glow absolute right-[10%] top-[16%] w-[500px] h-[500px] pointer-events-none z-[1]"
        aria-hidden="true"
      />

      {/* ── Subtle technical grid ─────────────────────────────────────────── */}
      <div
        className="hero-grid-overlay absolute inset-0 pointer-events-none z-[1]"
        aria-hidden="true"
      />

      {/* ── Diagonal gold signal line ─────────────────────────────────────── */}
      <div
        className="hero-signal-sweep absolute top-[54%] left-[28%] pointer-events-none z-[2]"
        aria-hidden="true"
      />

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full mx-auto max-w-7xl px-6 md:px-10 lg:px-12 pt-36 pb-20 lg:pt-44 lg:pb-28">
        <div className="grid lg:grid-cols-12 gap-8 items-center min-h-[540px]">

          {/* Left: text content */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-5">

            {/* Eyebrow */}
            <motion.p
              variants={fadeUp(0.1)}
              initial="hidden"
              animate="visible"
              className="text-[0.64rem] font-bold uppercase tracking-[0.3em] text-[var(--gold)]"
            >
              Ghana&apos;s Business Intelligence Platform
            </motion.p>

            {/* Editorial headline */}
            <motion.h1
              variants={fadeUp(0.22)}
              initial="hidden"
              animate="visible"
              className="font-heading font-black uppercase leading-[0.88] tracking-[-0.04em]"
              style={{ fontSize: "clamp(3.2rem, 6vw, 6.2rem)" }}
            >
              <span className="block text-[#F0E9D6]">Business IQ.</span>
              <span className="block text-[#F0E9D6]">Capital.</span>
              <span className="block text-[var(--gold)]">Mentorship.</span>
              <span className="block text-[var(--gold)]">Visibility.</span>
            </motion.h1>

            {/* Supporting paragraph */}
            <motion.p
              variants={fadeUp(0.42)}
              initial="hidden"
              animate="visible"
              className="text-[#8C8C8C] text-[0.9rem] leading-[1.72] max-w-[450px]"
            >
              A high-stakes competition and venture development platform building
              Africa&apos;s next generation of high-impact entrepreneurs.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp(0.58)}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row gap-3 pt-2"
            >
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-[0.875rem] text-[0.68rem] font-bold uppercase tracking-[0.18em] bg-[var(--gold)] text-[#050608] hover:bg-[#DDB84E] transition-colors duration-200 shadow-[0_0_30px_rgba(200,155,60,0.32)]"
              >
                Apply as an Entrepreneur
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-[0.875rem] text-[0.68rem] font-bold uppercase tracking-[0.18em] border border-[#F0E9D6]/24 text-[#F0E9D6] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all duration-200"
              >
                Partner With Us
              </a>
            </motion.div>

          </div>

          {/* Right: status card overlay (desktop only) */}
          <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 justify-end items-end pb-10 pr-2">
            <motion.div
              variants={fadeUp(0.88)}
              initial="hidden"
              animate="visible"
              className="hero-status-card"
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="block w-[6px] h-[6px] rounded-full bg-[#2A8C53]"
                  style={{ boxShadow: "0 0 7px rgba(42,140,83,0.95)" }}
                />
                <span className="text-[0.58rem] font-bold uppercase tracking-[0.24em] text-[#2A8C53]">
                  Live
                </span>
              </div>
              <p className="text-[0.59rem] font-semibold uppercase tracking-[0.22em] text-[#F0E9D6]/42">
                Ghana Pilot
              </p>
              <p className="text-[0.59rem] font-semibold uppercase tracking-[0.22em] text-[#F0E9D6]/42 mb-3">
                Season
              </p>
              <div className="w-full h-px bg-[var(--gold)]/16 mb-3" />
              <p className="text-[0.78rem] font-medium text-[#F0E9D6] leading-snug">
                Applications
              </p>
              <p className="text-[0.78rem] font-semibold text-[var(--gold)]">
                Opening Soon
              </p>
            </motion.div>
          </div>

        </div>
      </div>

      {/* ── Scroll indicator ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.9, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        aria-hidden="true"
      >
        <span className="text-[0.58rem] uppercase tracking-widest text-[var(--muted)]">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" as const }}
          className="w-px h-7 bg-gradient-to-b from-[var(--gold)] to-transparent"
        />
      </motion.div>

    </section>
  );
}
