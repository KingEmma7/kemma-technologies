"use client";

import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const steps = [
  { n: "01", title: "Discovery", desc: "We start by listening. Deep workshops to understand your business, users and constraints before writing a line of code." },
  { n: "02", title: "Strategy & Design", desc: "We map the solution space, prototype rapidly and align on a roadmap that balances ambition with pragmatism." },
  { n: "03", title: "Engineering", desc: "Our engineers build iteratively with continuous delivery. You see progress every week, not after months of silence." },
  { n: "04", title: "Launch & Growth", desc: "We ship, then stay. Post-launch support, performance monitoring and iterative improvement are part of our standard engagement." },
];

export function ProcessSection() {
  return (
    <Section light>
      <Reveal>
        <p className="text-xs uppercase tracking-widest text-[var(--gold)] mb-4">How we work</p>
        <h2 className="font-heading font-bold text-4xl md:text-5xl text-[#111] mb-16">
          Our process
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, i) => (
          <Reveal key={step.n} delay={i * 0.1}>
            <div className="flex flex-col gap-4">
              <span className="font-heading font-bold text-6xl text-gold-gradient leading-none">{step.n}</span>
              <h3 className="font-heading font-semibold text-xl text-[#111]">{step.title}</h3>
              <p className="text-sm text-[#555] leading-relaxed">{step.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
