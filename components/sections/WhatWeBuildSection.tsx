"use client";

import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const capabilities = [
  {
    icon: "🌐",
    title: "Custom Websites",
    desc: "Fast, polished marketing and brand sites built to convert and built to last.",
  },
  {
    icon: "🧩",
    title: "Web Platforms",
    desc: "Multi-user products and portals with the architecture to grow with your business.",
  },
  {
    icon: "🏢",
    title: "Internal Business Systems",
    desc: "Tools that replace spreadsheets and manual processes with reliable software.",
  },
  {
    icon: "🤖",
    title: "AI-Assisted Solutions",
    desc: "Practical automations and AI-assisted workflows that save real time.",
  },
  {
    icon: "🎨",
    title: "Frontend Engineering",
    desc: "Accessible, performant interfaces with careful attention to detail and craft.",
  },
  {
    icon: "🔄",
    title: "Digital Transformation Support",
    desc: "Helping teams move from manual, disconnected processes to modern digital operations.",
  },
];

export function WhatWeBuildSection() {
  return (
    <Section light>
      <Reveal>
        <p className="text-xs uppercase tracking-widest text-[var(--gold)] mb-4">What we build</p>
        <h2 className="font-heading font-bold text-4xl md:text-5xl text-[#111] mb-16">
          Practical digital products, built to a high standard
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {capabilities.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.08}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full rounded-sm border border-[#00000014] bg-[#00000004] p-8 hover:border-[var(--gold)] transition-colors duration-300"
            >
              <div className="text-3xl mb-5">{c.icon}</div>
              <h3 className="font-heading font-semibold text-lg text-[#111] mb-2">{c.title}</h3>
              <p className="text-[#555] text-sm leading-relaxed">{c.desc}</p>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
