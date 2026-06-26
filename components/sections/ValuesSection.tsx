"use client";

import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const values = [
  {
    icon: "⚡",
    title: "Engineering Excellence",
    desc: "We hold ourselves to the highest standards of technical craft. Clean code, robust architecture and thoughtful decisions are non-negotiable.",
  },
  {
    icon: "🤝",
    title: "Client Partnership",
    desc: "We don't just deliver software; we invest in understanding your business deeply and becoming a trusted extension of your team.",
  },
  {
    icon: "🌍",
    title: "African Innovation",
    desc: "We are proud to be building from Ghana. Our solutions are designed with African realities in mind — and African ambitions at heart.",
  },
  {
    icon: "🔬",
    title: "Continuous Learning",
    desc: "Technology moves fast. We stay ahead through continuous research, experimentation and a culture of intellectual curiosity.",
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
        {values.map((v, i) => (
          <Reveal key={v.title} delay={i * 0.1}>
            <div className="flex gap-5">
              <span className="text-3xl shrink-0 mt-1">{v.icon}</span>
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
