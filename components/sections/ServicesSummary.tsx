"use client";

import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SERVICES } from "@/lib/services";

export function ServicesSummary() {
  return (
    <Section>
      <Reveal>
        <p className="text-xs uppercase tracking-widest text-[var(--gold)] mb-4">What we do</p>
        <h2 className="font-heading font-bold text-4xl md:text-5xl text-white mb-4">
          Capabilities built for <span className="text-gold-gradient">modern businesses</span>
        </h2>
        <p className="text-[var(--silver)] max-w-xl mb-16">
          We combine deep technical expertise with strategic thinking to deliver digital products that move the needle.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SERVICES.map((s, i) => (
          <Reveal key={s.id} delay={i * 0.12}>
            <ButtonLink href={s.href} className="block h-full group no-underline hover:scale-100 active:scale-100 p-0">
              <Card glow className="h-full group-hover:border-[var(--gold)] transition-colors duration-300 w-full">
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300 inline-block">
                  {s.icon}
                </div>
                <h3 className="font-heading font-semibold text-xl text-white mb-3">{s.title}</h3>
                <p className="text-[var(--silver)] text-sm leading-relaxed">{s.summary}</p>
                <span className="inline-block mt-6 text-xs uppercase tracking-widest text-[var(--gold)]">
                  Learn more →
                </span>
              </Card>
            </ButtonLink>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
