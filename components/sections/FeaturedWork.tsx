"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ProjectMeta } from "@/lib/projects";

interface FeaturedWorkProps {
  projects: ProjectMeta[];
}

export function FeaturedWork({ projects }: FeaturedWorkProps) {
  return (
    <Section light>
      <Reveal>
        <p className="mb-4 text-xs uppercase tracking-widest text-[var(--gold)]">
          Selected work
        </p>
        <h2 className="mb-4 font-heading text-4xl font-bold text-[var(--ink)] md:text-5xl">
          Projects we&apos;re proud of
        </h2>
        <p className="mb-16 max-w-xl text-[var(--ink-body)]">
          A curated selection of client and partner work across platforms, brand
          sites and institutional experiences.
        </p>
      </Reveal>

      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => (
          <Reveal key={project.slug} delay={i * 0.1}>
            <motion.a
              href={`/work/${project.slug}`}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              className="group block overflow-hidden rounded-sm bg-[#E8E8E8]"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                {project.cover ? (
                  <Image
                    src={project.cover}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#C89B3C22] to-[#007B9422]">
                    <span className="font-heading text-5xl font-bold text-[var(--gold)] opacity-30">
                      K
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[rgba(4,4,6,0.7)] to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="text-sm font-medium text-white">
                    View Project →
                  </span>
                </div>
              </div>
              <div className="bg-white p-5">
                <div className="mb-2 flex flex-wrap gap-2">
                  {project.tags?.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium uppercase tracking-widest text-[var(--gold)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="mb-1 font-heading text-lg font-semibold text-[var(--ink)]">
                  {project.title}
                </h3>
                <p className="line-clamp-2 text-sm text-[var(--ink-body)]">
                  {project.summary}
                </p>
              </div>
            </motion.a>
          </Reveal>
        ))}
      </div>

      <Reveal className="text-center">
        <ButtonLink
          href="/work"
          variant="secondary"
          size="lg"
          className="border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--ink)] hover:text-white"
        >
          View All Work
        </ButtonLink>
      </Reveal>
    </Section>
  );
}
