"use client";

import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";

const services = [
  {
    icon: "⚙️",
    title: "Software Engineering",
    desc: "Robust, scalable software built with modern architectures. From system design to deployment, we engineer solutions that stand the test of time.",
    href: "/services#software",
  },
  {
    icon: "🌐",
    title: "Web Platforms",
    desc: "High-performance web platforms that convert. We craft experiences visitors remember — from landing pages to complex SaaS dashboards.",
    href: "/services#web",
  },
  {
    icon: "🤖",
    title: "Intelligent Digital Solutions",
    desc: "AI-powered products and data-driven tools that automate, predict and personalise — transforming how your business operates.",
    href: "/services#ai",
  },
];

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
        {services.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.12}>
            <Link href={s.href} className="block h-full group">
              <Card glow className="h-full group-hover:border-[var(--gold)] transition-colors duration-300">
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300 inline-block">
                  {s.icon}
                </div>
                <h3 className="font-heading font-semibold text-xl text-white mb-3">{s.title}</h3>
                <p className="text-[var(--silver)] text-sm leading-relaxed">{s.desc}</p>
                <span className="inline-block mt-6 text-xs uppercase tracking-widest text-[var(--gold)] group-hover:gap-2 transition-all">
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
