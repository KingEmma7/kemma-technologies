"use client";

import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { SERVICES } from "@/lib/services";

export function ServicesSummary() {
  return (
    <Section>
      <Reveal>
        <p className="mb-4 text-xs uppercase tracking-widest text-[var(--gold)]">
          What we do
        </p>
        <h2 className="mb-4 font-heading text-4xl font-bold text-white md:text-5xl">
          Three capabilities.{" "}
          <span className="text-gold-gradient">Evidence behind each.</span>
        </h2>
        <p className="mb-16 max-w-xl text-[var(--silver)]">
          Platforms that run operations, web products that convert, and
          engineering support for products that already matter.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {SERVICES.map((s, i) => (
          <Reveal key={s.id} delay={i * 0.12}>
            <Link href={s.href} className="group block h-full">
              <Card
                glow
                className="h-full transition-colors duration-300 group-hover:border-[var(--gold)]"
              >
                <s.icon
                  className="mb-6 h-8 w-8 transition-transform duration-300 group-hover:scale-110"
                  style={{ color: s.iconColor }}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <h3 className="mb-2 font-heading text-xl font-semibold text-white">
                  {s.title}
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-[var(--silver)]">
                  {s.summary}
                </p>
                <ul className="mb-6 space-y-2">
                  {s.capabilities.slice(0, 4).map((cap) => (
                    <li
                      key={cap}
                      className="text-xs leading-snug text-[var(--muted)] before:mr-2 before:text-[var(--gold)] before:content-['·']"
                    >
                      {cap}
                    </li>
                  ))}
                </ul>
                <span className="inline-block text-xs uppercase tracking-widest text-[var(--gold)]">
                  Learn more →
                </span>
              </Card>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
