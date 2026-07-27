"use client";

import { Handshake, Microscope, Sprout, Target, Zap } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const values = [
  {
    icon: Zap,
    title: "Excellence",
    desc: "We hold ourselves to the highest standards of technical craft. Clean code, robust architecture and thoughtful decisions are non-negotiable.",
  },
  {
    icon: Target,
    title: "Practicality",
    desc: "We build for real-world use, not for show. Every decision is weighed against whether it genuinely solves the problem at hand.",
  },
  {
    icon: Handshake,
    title: "Trust",
    desc: "We invest in understanding your business deeply, communicate clearly, and do what we say we'll do.",
  },
  {
    icon: Sprout,
    title: "Growth",
    desc: "We build systems designed to grow with your business, not ones you'll outgrow in a year.",
  },
  {
    icon: Microscope,
    title: "Innovation",
    desc: "Technology moves fast. We stay ahead through continuous learning, experimentation, and modern AI-assisted workflows.",
  },
];

export function ValuesSection() {
  return (
    <Section light>
      <Reveal>
        <p className="text-xs uppercase tracking-widest text-[var(--gold)] mb-4">What drives us</p>
        <h2 className="font-heading font-bold text-4xl md:text-5xl text-[#111] mb-16">
          Our values
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {values.map((v, i) => (
          <Reveal key={v.title} delay={i * 0.1}>
            <div className="flex gap-5">
              <v.icon className="mt-1 h-6 w-6 shrink-0 text-[var(--gold)]" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <h3 className="font-heading font-semibold text-xl text-[#111] mb-2">{v.title}</h3>
                <p className="text-[#555] leading-relaxed">{v.desc}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
