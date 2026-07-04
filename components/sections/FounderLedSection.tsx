"use client";

import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export function FounderLedSection() {
  return (
    <Section>
      <Reveal className="max-w-3xl mx-auto text-center">
        <p className="text-xs uppercase tracking-widest text-[var(--gold)] mb-4">How we work</p>
        <h2 className="font-heading font-bold text-3xl md:text-4xl text-white mb-8">
          Founder-led, by design
        </h2>
        <p className="text-[var(--silver)] text-lg leading-relaxed">
          Kemma Technologies is currently founder-led, which means every project benefits directly
          from senior-level engineering thinking, careful planning, and hands-on attention. As the
          company grows, we will continue to work with trusted designers, developers, content
          specialists, and technical partners where needed — but the standard will remain the same:
          clear communication, thoughtful execution, and reliable technology.
        </p>
      </Reveal>
    </Section>
  );
}
