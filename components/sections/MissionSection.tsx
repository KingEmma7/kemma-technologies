"use client";

import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export function MissionSection() {
  return (
    <Section className="bg-[var(--dark-bg)]" narrow>
      <Reveal className="text-center">
        <p className="text-xs uppercase tracking-widest text-[var(--gold)] mb-4">Our mission</p>
        <h2 className="font-heading font-bold text-3xl md:text-5xl text-white leading-snug">
          Our mission is to help businesses and organizations build digital systems that make them
          more <span className="text-gold-gradient">visible</span>, more{" "}
          <span className="text-gold-gradient">efficient</span>, and more prepared for the future.
        </h2>
      </Reveal>
    </Section>
  );
}
