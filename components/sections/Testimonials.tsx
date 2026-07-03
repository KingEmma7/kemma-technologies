"use client";

import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";

const testimonials = [
  {
    quote: "Kemma built my author site and helped bring Constract to life. Readers can find and buy my books in a few clicks — it's been a genuinely smooth partnership.",
    author: "Kofi Asiedu Mahama",
    role: "Author · Founder, Constract",
  },
  {
    quote: "Our site finally feels like our brand. Customers browse the menu and place custom cake orders without ever calling us — it's made a real difference to how we run things.",
    author: "Esther Adem",
    role: "Owner, Estee's Bakery",
  },
  {
    quote: "Our congregation and visitors now have a proper digital home. It's simple to navigate for people of every age, and that matters more than we expected.",
    author: "Bishop Veliane",
    role: "Apostles Revelation Society — Wovenu Memorial Chapel",
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
