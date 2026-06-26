"use client";

import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";

const testimonials = [
  {
    quote: "Kemma Technologies transformed our operational workflows with a platform that has saved us hours every week. The attention to detail is second to none.",
    author: "Ama Serwaa",
    role: "COO, FinancePro Ghana",
  },
  {
    quote: "Working with the Kemma team was seamless. They understood our vision immediately and delivered a product that exceeded every expectation.",
    author: "Kofi Mensah",
    role: "CEO, AgroLogic Africa",
  },
  {
    quote: "Their AI-powered recommendation engine increased our conversion rate by 34%. Exceptional technical skill paired with genuine business insight.",
    author: "Abena Asante",
    role: "Head of Digital, RetailEdge",
  },
];

export function Testimonials() {
  return (
    <Section>
      <Reveal>
        <p className="text-xs uppercase tracking-widest text-[var(--gold)] mb-4">What clients say</p>
        <h2 className="font-heading font-bold text-4xl md:text-5xl text-white mb-16">
          Trusted by <span className="text-gold-gradient">forward-thinking teams</span>
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <Reveal key={t.author} delay={i * 0.12}>
            <Card className="flex flex-col gap-6 h-full">
              {/* Quote mark */}
              <span className="text-5xl text-[var(--gold)] leading-none font-serif opacity-60">&ldquo;</span>
              <p className="text-[var(--silver)] leading-relaxed text-sm flex-1">{t.quote}</p>
              <div className="border-t border-[var(--border)] pt-4">
                <p className="text-white font-semibold text-sm">{t.author}</p>
                <p className="text-[var(--muted)] text-xs mt-1">{t.role}</p>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
