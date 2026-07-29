"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";

const CAPABILITIES = [
  "Applications",
  "Payments",
  "Applicant Dashboard",
  "Admin Workflows",
  "Document Generation",
  "Certificate Verification",
] as const;

export function FlagshipPlatform() {
  return (
    <Section light>
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <Reveal>
            <p className="mb-4 text-xs uppercase tracking-widest text-[var(--gold)]">
              Flagship platform
            </p>
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-[var(--muted-on-light)]">
              Digital Platform · Admissions · Certification
            </p>
            <h2 className="mb-5 font-heading text-3xl font-bold leading-tight text-[var(--ink)] md:text-4xl lg:text-5xl">
              A complete institutional platform, built end to end.
            </h2>
            <p className="mb-8 max-w-md text-base leading-relaxed text-[var(--ink-body)]">
              ISGM brings Program discovery, applications, payments, admissions,
              certificates and administrative workflows into one coordinated
              platform for the Institute of Sustainability, Governance and
              Management.
            </p>

            <ul className="mb-10 flex flex-wrap gap-2" aria-label="Key capabilities">
              {CAPABILITIES.map((chip) => (
                <li
                  key={chip}
                  className="rounded-sm border border-[var(--border-on-light)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--ink)]"
                >
                  {chip}
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/work/isgm-platform" size="lg">
                View Case Study
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink
                href="https://pisgm.org"
                variant="secondary"
                size="lg"
                external
                className="border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--ink)] hover:text-white"
              >
                Visit Live Platform
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <Reveal delay={0.12}>
            <Link
              href="/work/isgm-platform"
              className="group relative block overflow-hidden rounded-sm border border-[var(--border-on-light)] bg-[#E8E8E8] shadow-[0_24px_60px_rgba(0,0,0,0.12)]"
            >
              <div className="relative aspect-[16/10]">
                <Image
                  src="/projects/isgm/isgm-cover.webp"
                  alt="ISGM institutional platform homepage — Program discovery and apply journey"
                  fill
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  priority
                />
              </div>
              <div className="flex items-center justify-between border-t border-[var(--border-on-light)] bg-white px-5 py-4">
                <div>
                  <p className="font-heading text-sm font-semibold text-[var(--ink)]">
                    Institute of Sustainability, Governance and Management
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--muted-on-light)]">
                    pisgm.org
                  </p>
                </div>
                <span className="text-xs font-medium uppercase tracking-widest text-[var(--gold)]">
                  Case study →
                </span>
              </div>
            </Link>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
