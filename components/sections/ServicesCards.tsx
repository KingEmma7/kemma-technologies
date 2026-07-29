import Link from "next/link";
import { Check } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SERVICES } from "@/lib/services";
import { getAllProjects } from "@/lib/projects";

/**
 * Server Component.
 *
 * This replaced an accordion whose panels were collapsed by default, which hid
 * every concrete detail — problems, deliverables, technologies — behind a click
 * and left the page reading as three vague headlines. Everything is now visible
 * and crawlable, and the evidence links let a reader check the claims.
 */
export function ServicesCards() {
  const projects = getAllProjects();

  return (
    <Section>
      <div className="flex flex-col gap-24">
        {SERVICES.map((service, index) => {
          const evidence = service.evidence
            .map((slug) => projects.find((p) => p.slug === slug))
            .filter((p): p is NonNullable<typeof p> => Boolean(p));

          return (
            <Reveal as="article" key={service.id} delay={0.05}>
              <div id={service.id} className="scroll-mt-32">
                <div className="mb-10 flex items-start gap-5">
                  <service.icon
                    className="mt-1 h-9 w-9 shrink-0"
                    style={{ color: service.iconColor }}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-widest text-[var(--muted)]">
                      {String(index + 1).padStart(2, "0")} — {service.tagline}
                    </p>
                    <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">
                      {service.title}
                    </h2>
                    <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--silver)]">
                      {service.summary}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-10 border-t border-[var(--border)] pt-10 lg:grid-cols-3">
                  <div>
                    <h3 className="mb-4 text-xs uppercase tracking-widest text-[var(--gold)]">
                      Problems it solves
                    </h3>
                    <ul className="flex list-none flex-col gap-3">
                      {service.problems.map((problem) => (
                        <li key={problem} className="flex gap-3 text-sm leading-relaxed text-[var(--silver)]">
                          <span className="mt-0.5 shrink-0 text-[var(--muted)]" aria-hidden="true">—</span>
                          {problem}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-4 text-xs uppercase tracking-widest text-[var(--gold)]">
                      What we do
                    </h3>
                    <ul className="flex list-none flex-col gap-2">
                      {service.capabilities.map((capability) => (
                        <li key={capability} className="text-sm leading-relaxed text-[var(--silver)]">
                          {capability}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-4 text-xs uppercase tracking-widest text-[var(--gold)]">
                      What you get
                    </h3>
                    <ul className="flex list-none flex-col gap-3">
                      {service.deliverables.map((deliverable) => (
                        <li key={deliverable} className="flex gap-3 text-sm leading-relaxed text-[var(--silver)]">
                          <Check
                            className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]"
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                          {deliverable}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-10 flex flex-col gap-6 border-t border-[var(--border)] pt-8">
                  <div>
                    <h3 className="mb-3 text-xs uppercase tracking-widest text-[var(--muted)]">
                      Technologies
                    </h3>
                    <ul className="flex list-none flex-wrap gap-2">
                      {service.technologies.map((tech) => (
                        <li
                          key={tech}
                          className="rounded-sm border border-[var(--border)] px-3 py-1.5 text-xs uppercase tracking-widest text-[var(--silver)]"
                        >
                          {tech}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {evidence.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-xs uppercase tracking-widest text-[var(--muted)]">
                        Evidence
                      </h3>
                      <ul className="flex list-none flex-wrap gap-x-6 gap-y-2">
                        {evidence.map((project) => (
                          <li key={project.slug}>
                            <Link
                              href={`/work/${project.slug}`}
                              className="text-sm text-[var(--gold)] underline underline-offset-4 transition hover:brightness-125"
                            >
                              {project.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-2">
                    <ButtonLink href="/contact" variant="secondary">
                      Discuss a {service.title.toLowerCase()} project
                    </ButtonLink>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
