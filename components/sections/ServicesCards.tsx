"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { SERVICES } from "@/lib/services";

export function ServicesCards() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
  }, []);

  return (
    <Section>
      <Reveal>
        <p className="text-xs uppercase tracking-widest text-[var(--gold)] mb-4">Capabilities</p>
        <h2 className="font-heading font-bold text-4xl md:text-5xl text-white mb-16">
          What we do best
        </h2>
      </Reveal>

      <div className="flex flex-col gap-4">
        {SERVICES.map((service, i) => {
          const isOpen = expanded === service.id;

          return (
            <Reveal key={service.id} delay={i * 0.08}>
              <div
                id={service.id}
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                aria-controls={`${service.id}-content`}
                onClick={() => toggle(service.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(service.id); } }}
                className={[
                  "border rounded-sm overflow-hidden transition-all duration-300 cursor-pointer",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--gold)] focus-visible:outline-offset-2",
                  isOpen
                    ? "border-[var(--gold)] bg-[rgba(200,155,60,0.04)]"
                    : "border-[var(--border)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(200,155,60,0.4)]",
                ].join(" ")}
              >
                {/* Header row */}
                <div className="flex items-center justify-between p-8 gap-4">
                  <div className="flex items-center gap-5">
                    <motion.span
                      animate={{ color: isOpen ? service.iconColor : "#888" }}
                      className="text-4xl"
                      aria-hidden="true"
                    >
                      {service.icon}
                    </motion.span>
                    <div>
                      <h3 className="font-heading font-bold text-2xl text-white">{service.title}</h3>
                      <p className="text-[var(--muted)] text-sm mt-1">{service.tagline}</p>
                    </div>
                  </div>

                  <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-2xl text-[var(--gold)] shrink-0 select-none"
                    aria-hidden="true"
                  >
                    +
                  </motion.div>
                </div>

                {/* Expanded content */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`${service.id}-content`}
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-8 pb-8 grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-[var(--border)]">
                        <div className="pt-8">
                          <p className="text-[var(--silver)] leading-relaxed mb-6">{service.summary}</p>
                          <h4 className="text-xs uppercase tracking-widest text-[var(--muted)] mb-4">Capabilities</h4>
                          <ul className="flex flex-col gap-2">
                            {service.capabilities.map((cap) => (
                              <li key={cap} className="flex items-start gap-3 text-sm text-[var(--silver)]">
                                <span className="text-[var(--gold)] mt-0.5" aria-hidden="true">—</span>
                                {cap}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-8">
                          <h4 className="text-xs uppercase tracking-widest text-[var(--muted)] mb-4">Technologies</h4>
                          <div className="flex flex-wrap gap-2">
                            {service.technologies.map((tech) => (
                              <span
                                key={tech}
                                className="px-3 py-1.5 text-xs uppercase tracking-widest border border-[var(--border)] text-[var(--silver)] rounded-sm"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
