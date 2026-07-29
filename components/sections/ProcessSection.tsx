"use client";

import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const steps = [
  {
    n: "01",
    title: "Discover",
    desc: "Understand the organisation, users, workflows, constraints and desired outcomes.",
  },
  {
    n: "02",
    title: "Define",
    desc: "Translate the problem into a clear product scope, information architecture and delivery plan.",
  },
  {
    n: "03",
    title: "Design",
    desc: "Create the user journey, interface system and interaction direction.",
  },
  {
    n: "04",
    title: "Engineer",
    desc: "Build the product, integrations, dashboards, data flows and administrative capabilities.",
  },
  {
    n: "05",
    title: "Validate",
    desc: "Test important workflows, accessibility, responsiveness, performance and production readiness.",
  },
  {
    n: "06",
    title: "Launch and improve",
    desc: "Deploy, monitor, maintain and evolve the product based on real use.",
  },
] as const;

export function ProcessSection() {
  return (
    <Section>
      <Reveal>
        <p className="mb-4 text-xs uppercase tracking-widest text-[var(--gold)]">
          How we deliver
        </p>
        <h2 className="mb-16 font-heading text-4xl font-bold text-white md:text-5xl">
          A clear path from problem to product
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, i) => (
          <Reveal key={step.n} delay={i * 0.08}>
            <div className="flex flex-col gap-4">
              <span className="font-heading text-5xl font-bold leading-none text-gold-gradient md:text-6xl">
                {step.n}
              </span>
              <h3 className="font-heading text-xl font-semibold text-white">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--silver)]">
                {step.desc}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
