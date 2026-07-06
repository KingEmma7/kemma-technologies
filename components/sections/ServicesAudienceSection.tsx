"use client";

import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const audience = [
  "Founders and small businesses who need a serious, professional web presence.",
  "Businesses replacing manual processes or spreadsheets with real software.",
  "Organizations that want an e-commerce, marketplace, or booking platform built properly.",
  "Teams that need a technical partner for a specific project rather than a full-time hire.",
];

const engagements = [
  {
    title: "Fixed-scope project",
    desc: "A defined website, platform, or system with a clear scope, timeline, and price — ideal for a first engagement.",
  },
  {
    title: "Ongoing collaboration",
    desc: "Ongoing feature work, maintenance, and improvements for a platform we've already built or taken over.",
  },
  {
    title: "Technical consulting",
    desc: "Architecture review, code audits, or a second opinion before you commit engineering time or budget.",
  },
];

const deliverables = [
  "Direct access to the engineer actually building your project — not a account manager relaying messages.",
  "Clear, honest timelines and scope, communicated before work begins.",
  "Clean, maintainable code and documentation, not a black box only we can touch.",
  "A working, launched product — not just a design file or a slide deck.",
];

export function ServicesAudienceSection() {
  return (
    <Section className="bg-[var(--dark-bg)]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div>
          <Reveal>
            <p className="text-xs uppercase tracking-widest text-[var(--gold)] mb-4">Who this is for</p>
            <ul className="flex flex-col gap-4">
              {audience.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[var(--silver)] text-sm leading-relaxed">
                  <span className="text-[var(--gold)] mt-0.5 shrink-0" aria-hidden="true">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div>
          <Reveal delay={0.1}>
            <p className="text-xs uppercase tracking-widest text-[var(--gold)] mb-4">Engagement types</p>
            <div className="flex flex-col gap-6">
              {engagements.map((e) => (
                <div key={e.title}>
                  <h3 className="font-heading font-semibold text-white text-lg mb-1">{e.title}</h3>
                  <p className="text-[var(--silver)] text-sm leading-relaxed">{e.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div>
          <Reveal delay={0.2}>
            <p className="text-xs uppercase tracking-widest text-[var(--gold)] mb-4">What clients get</p>
            <ul className="flex flex-col gap-4">
              {deliverables.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[var(--silver)] text-sm leading-relaxed">
                  <span className="text-[var(--gold)] mt-0.5 shrink-0" aria-hidden="true">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
