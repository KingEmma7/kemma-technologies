"use client";

import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const expertise = [
  "React",
  "TypeScript",
  "Next.js",
  "Gatsby",
  "GraphQL",
  "Contentful",
  "Accessibility",
  "Performance Optimization",
  "Localization",
  "Authentication Systems",
  "AI Evaluation",
  "Developer Mentorship",
];

export function FounderSection() {
  return (
    <Section light>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="text-xs uppercase tracking-widest text-[var(--gold)] mb-4">The founder</p>
            <h2 className="font-heading font-bold text-4xl md:text-5xl text-[#111] mb-8">
              Built from real engineering experience.
            </h2>
            <p className="text-[#555] text-lg leading-relaxed mb-4">
              Kemma Technologies was founded by Emmanuel Mawulolo Tagbor, a Senior Software Engineer
              based in Accra, Ghana, with over a decade of experience building modern web applications
              and digital products.
            </p>
            <p className="text-[#555] text-lg leading-relaxed">
              His background spans React, TypeScript, Next.js, Gatsby, GraphQL, and Contentful, with
              hands-on experience in accessibility, performance optimization, localization,
              authentication systems, AI evaluation, and developer mentorship — experience that now
              shapes how every Kemma project is planned, built, and delivered.
            </p>
          </Reveal>

          <Reveal delay={0.15} className="flex flex-wrap gap-2 mt-8">
            {expertise.map((skill) => (
              <span
                key={skill}
                className="text-xs uppercase tracking-wide text-[#555] border border-[#00000014] bg-[#00000006] rounded-sm px-3 py-1.5"
              >
                {skill}
              </span>
            ))}
          </Reveal>
        </div>

        <div className="lg:col-span-5">
          <Reveal delay={0.1} direction="left">
            <div className="rounded-sm border border-[#00000014] bg-white overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
              <div className="relative aspect-[4/5] w-full bg-[#f4f4f4]">
                <Image
                  src="/images/emmanuel-tagbor.png"
                  alt="Emmanuel Mawulolo Tagbor, founder of Kemma Technologies"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 420px"
                />
              </div>
              <div className="p-8">
              <h3 className="font-heading font-semibold text-xl text-[#111]">
                Emmanuel Mawulolo Tagbor
              </h3>
              <p className="text-xs uppercase tracking-widest text-[var(--gold)] mt-1 mb-1">
                Founder, Kemma Technologies
              </p>
              <p className="text-sm text-[#888] mb-4">
                Senior Software Engineer · AI Data Trainer · Builder
              </p>
              <p className="text-[#555] text-sm leading-relaxed">
                Emmanuel brings a blend of software engineering, product thinking, teaching
                experience, and AI workflow knowledge. His work focuses on helping businesses move
                from unclear ideas and manual processes to well-structured digital platforms that
                support growth.
              </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
