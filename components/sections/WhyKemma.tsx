"use client";

import {
  Layers,
  PencilRuler,
  RefreshCw,
  ShieldCheck,
  Waypoints,
} from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { SITE } from "@/lib/site";

const pillars = [
  {
    icon: Waypoints,
    title: "Product thinking",
    desc: "We begin with the user journey, operational problem and business objective — not only the interface.",
  },
  {
    icon: Layers,
    title: "Engineering depth",
    desc: "We build the underlying workflows, integrations, dashboards and systems required to make the product useful.",
  },
  {
    icon: PencilRuler,
    title: "Design quality",
    desc: "We treat clarity, accessibility, responsiveness and visual quality as part of the product — not decoration added at the end.",
  },
  {
    icon: ShieldCheck,
    title: "Responsible delivery",
    desc: "We communicate honestly, protect sensitive data, test important workflows and avoid publishing unsupported claims.",
  },
  {
    icon: RefreshCw,
    title: "Built for evolution",
    desc: "We design systems that can expand as programs, teams, users and organisational requirements grow.",
  },
] as const;

export function WhyKemma() {
  return (
    <Section light>
      <Reveal>
        <p className="mb-4 text-xs uppercase tracking-widest text-[var(--gold)]">
          Why Kemma
        </p>
        <h2 className="mb-4 font-heading text-4xl font-bold text-[var(--ink)] md:text-5xl">
          How we work with organisations
        </h2>
        <p className="mb-16 max-w-xl text-[var(--ink-body)]">
          Founder-led and based in {SITE.location}. Building digital platforms and
          products for organisations anywhere.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {pillars.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.08}>
            <div className="flex gap-4">
              <p.icon
                className="mt-1 h-6 w-6 shrink-0 text-[var(--gold)]"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <div>
                <h3 className="mb-2 font-heading text-xl font-semibold text-[var(--ink)]">
                  {p.title}
                </h3>
                <p className="leading-relaxed text-[var(--ink-body)]">{p.desc}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
