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
        <p className="text-xs uppercase tracking-widest text-[var(--gold)] mb-4">Selected work</p>
        <h2 className="font-heading font-bold text-4xl md:text-5xl text-[#111] mb-4">
          Projects we&apos;re proud of
        </h2>
        <p className="text-[#555] max-w-xl mb-16">
          A curated selection of projects demonstrating our range across industries and disciplines.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {projects.map((project, i) => (
          <Reveal key={project.slug} delay={i * 0.1}>
            <motion.a
              href={`/work/${project.slug}`}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              className="block group overflow-hidden rounded-sm bg-[#E8E8E8]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {project.cover ? (
                  <Image
                    src={project.cover}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#C89B3C22] to-[#007B9422] flex items-center justify-center">
                    <span className="font-heading font-bold text-5xl text-[var(--gold)] opacity-30">K</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(4,4,6,0.7)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <span className="text-white text-sm font-medium">View Project →</span>
                </div>
              </div>
              <div className="p-5 bg-white">
                <div className="flex gap-2 flex-wrap mb-2">
                  {project.tags?.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-xs uppercase tracking-widest text-[var(--gold)] font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="font-heading font-semibold text-lg text-[#111] mb-1">{project.title}</h3>
                <p className="text-sm text-[#666] line-clamp-2">{project.summary}</p>
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
          className="border-[#111] text-[#111] hover:bg-[#111] hover:text-white"
        >
          View All Work
        </ButtonLink>
      </Reveal>
    </Section>
  );
}
