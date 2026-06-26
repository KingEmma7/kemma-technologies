"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { ProjectMeta } from "@/lib/projects";

interface WorkGridProps {
  projects: ProjectMeta[];
}

export function WorkGrid({ projects }: WorkGridProps) {
  return (
    <section className="py-16 pb-32 bg-[var(--dark-bg)]">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <Reveal key={project.slug} delay={i * 0.08}>
              <Link href={`/work/${project.slug}`} className="block group">
                <motion.article
                  layoutId={`project-${project.slug}`}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden rounded-sm border border-[var(--border)] group-hover:border-[var(--gold)] transition-colors duration-300"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[16/10] bg-[rgba(255,255,255,0.03)] overflow-hidden">
                    {project.cover ? (
                      <Image
                        src={project.cover}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#C89B3C11] to-[#007B9411]">
                        <span className="font-heading font-bold text-7xl text-[var(--gold)] opacity-20">K</span>
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(4,4,6,0.85)] via-[rgba(4,4,6,0.3)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <span className="text-white font-medium text-sm tracking-wide">View Case Study →</span>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-2 flex-wrap">
                        {project.tags?.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-xs uppercase tracking-widest text-[var(--gold)]">
                            {tag}
                          </span>
                        ))}
                      </div>
                      {project.year && (
                        <span className="text-xs text-[var(--muted)]">{project.year}</span>
                      )}
                    </div>
                    <h2 className="font-heading font-semibold text-xl text-white mb-2">{project.title}</h2>
                    <p className="text-sm text-[var(--silver)] line-clamp-2">{project.summary}</p>
                  </div>
                </motion.article>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
