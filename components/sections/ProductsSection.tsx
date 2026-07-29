"use client";

import { Construction } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Card } from "@/components/ui/Card";
import { PRODUCTS } from "@/lib/products";

export function ProductsSection() {
  return (
    <Section>
      <Reveal>
        <p className="mb-4 text-xs uppercase tracking-widest text-[var(--gold)]">
          Kemma products
        </p>
        <h2 className="mb-4 font-heading text-4xl font-bold text-white md:text-5xl">
          Products we are <span className="text-gold-gradient">building</span>
        </h2>
        <p className="mb-16 max-w-xl text-[var(--silver)]">
          Alongside client and partner work, Kemma Technologies develops original
          products that explore practical opportunities in software, commerce and
          digital participation.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {PRODUCTS.map((product, i) => (
          <Reveal key={product.id} delay={i * 0.1}>
            <Card className="h-full">
              <div className="mb-6 flex items-start justify-between gap-4">
                <Construction
                  className="h-7 w-7 text-[var(--gold)]"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span className="rounded-sm border border-[var(--gold)]/40 bg-[rgba(200,155,60,0.12)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--gold)]">
                  {product.statusLabel}
                </span>
              </div>
              <h3 className="mb-3 font-heading text-2xl font-semibold text-white">
                {product.name}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--silver)]">
                {product.summary}
              </p>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
