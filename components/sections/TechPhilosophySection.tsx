"use client";

import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export function TechPhilosophySection() {
  return (
    <Section className="bg-[var(--dark-bg)]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5">
          <Reveal>
            <p className="text-xs uppercase tracking-widest text-[var(--gold)] mb-4">Our philosophy</p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-white leading-snug">
              How we think about technology
            </h2>
          </Reveal>
        </div>
        <div className="lg:col-span-7">
          <Reveal delay={0.1}>
            <p className="text-[var(--silver)] text-lg leading-relaxed">
              We don&apos;t build technology for show. A great digital product should{" "}
              <span className="text-white">look good</span>,{" "}
              <span className="text-white">load fast</span>,{" "}
              <span className="text-white">feel easy to use</span>, and{" "}
              <span className="text-white">solve a real problem</span>. Every decision we make —
              from architecture to interface — is weighed against whether it genuinely makes the
              product better for the people using it.
            </p>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
