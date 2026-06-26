"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ProjectMeta } from "@/lib/projects";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/ButtonLink";

interface Props {
  meta: ProjectMeta;
}

export function CaseStudyHero({ meta }: Props) {
  return (
    <section className="relative pt-40 pb-20 bg-[var(--dark-bg)] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(200,155,60,0.06)_0%,transparent_60%)] pointer-events-none" />

      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Link
            href="/work"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--muted)] hover:text-[var(--gold)] transition-colors mb-8"
          >
            ← Back to Work
          </Link>

          <div className="flex gap-2 flex-wrap mb-6">
            {meta.tags?.map((tag) => (
              <span
                key={tag}
                className="text-xs uppercase tracking-widest text-[var(--gold)] border border-[rgba(200,155,60,0.3)] px-3 py-1 rounded-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl text-white mb-6 max-w-4xl">
            {meta.title}
          </h1>
          <p className="text-[var(--silver)] text-xl max-w-2xl mb-10">{meta.summary}</p>

          <div className="flex flex-wrap gap-10 border-t border-[var(--border)] pt-8">
            {meta.client && (
              <div>
                <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-1">Client</p>
                <p className="text-white font-medium">{meta.client}</p>
              </div>
            )}
            {meta.role && (
              <div>
                <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-1">Role</p>
                <p className="text-white font-medium">{meta.role}</p>
              </div>
            )}
            {meta.year && (
              <div>
                <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-1">Year</p>
                <p className="text-white font-medium">{meta.year}</p>
              </div>
            )}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

export function CaseStudyFooter() {
  return (
    <section className="py-16 border-t border-[var(--border)] bg-[var(--dark-bg)]">
      <Container className="flex justify-between items-center">
        <ButtonLink href="/work" variant="secondary">← All Work</ButtonLink>
        <ButtonLink href="/contact">Start a Project</ButtonLink>
      </Container>
    </section>
  );
}
