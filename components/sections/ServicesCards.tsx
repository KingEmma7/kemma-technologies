"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const services = [
  {
    id: "software",
    icon: "⚙️",
    iconColor: "#C89B3C",
    title: "Software Engineering",
    tagline: "Robust, scalable systems built to last.",
    summary: "From microservices architectures to monolithic modernisation, we engineer software that performs under pressure and grows with your business.",
    capabilities: [
      "Backend API design & development",
      "Microservices & distributed systems",
      "Database design & optimisation",
      "DevOps, CI/CD & cloud infrastructure",
      "Legacy system modernisation",
      "Performance engineering & load testing",
    ],
    technologies: ["Node.js", "Python", "Go", "PostgreSQL", "Redis", "AWS", "Docker", "Kubernetes"],
  },
  {
    id: "web",
    icon: "🌐",
    iconColor: "#007B94",
    title: "Web Platforms",
    tagline: "Experiences that convert, retain and delight.",
    summary: "We design and build high-performance web platforms — from marketing sites to complex SaaS dashboards — with a relentless focus on user experience and business outcomes.",
    capabilities: [
      "Product design & prototyping",
      "Next.js / React / Vue applications",
      "E-commerce & marketplace platforms",
      "CMS-powered content platforms",
      "Progressive web apps (PWA)",
      "Accessibility & internationalisation",
    ],
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion", "Sanity", "Vercel"],
  },
  {
    id: "ai",
    icon: "🤖",
    iconColor: "#C89B3C",
    title: "Intelligent Digital Solutions",
    tagline: "AI that works in the real world.",
    summary: "We build AI-powered products grounded in practical business value — not hype. From recommendation engines to natural-language interfaces, we deploy models that move metrics.",
    capabilities: [
      "Machine learning model development",
      "Natural language processing (NLP)",
      "Computer vision applications",
      "Predictive analytics & forecasting",
      "AI product strategy & roadmapping",
      "MLOps & model monitoring",
    ],
    technologies: ["Python", "PyTorch", "TensorFlow", "LangChain", "OpenAI", "Hugging Face", "FastAPI"],
  },
];

export function ServicesCards() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <Section>
      <Reveal>
        <p className="text-xs uppercase tracking-widest text-[var(--gold)] mb-4">Capabilities</p>
        <h2 className="font-heading font-bold text-4xl md:text-5xl text-white mb-16">
          What we do best
        </h2>
      </Reveal>

      <div className="flex flex-col gap-4">
        {services.map((service, i) => {
          const isOpen = expanded === service.id;

          return (
            <Reveal key={service.id} delay={i * 0.08}>
              <div
                id={service.id}
                className={[
                  "border rounded-sm overflow-hidden transition-all duration-300 cursor-pointer",
                  isOpen
                    ? "border-[var(--gold)] bg-[rgba(200,155,60,0.04)]"
                    : "border-[var(--border)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(200,155,60,0.4)]",
                ].join(" ")}
                onClick={() => setExpanded(isOpen ? null : service.id)}
              >
                {/* Header row */}
                <div className="flex items-center justify-between p-8 gap-4">
                  <div className="flex items-center gap-5">
                    <motion.span
                      animate={{ color: isOpen ? service.iconColor : "#888" }}
                      className="text-4xl"
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
                    className="text-2xl text-[var(--gold)] shrink-0"
                  >
                    +
                  </motion.div>
                </div>

                {/* Expanded content */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-8 pb-8 grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-[var(--border)]">
                        {/* Summary */}
                        <div className="pt-8">
                          <p className="text-[var(--silver)] leading-relaxed mb-6">{service.summary}</p>

                          <h4 className="text-xs uppercase tracking-widest text-[var(--muted)] mb-4">Capabilities</h4>
                          <ul className="flex flex-col gap-2">
                            {service.capabilities.map((cap) => (
                              <li key={cap} className="flex items-start gap-3 text-sm text-[var(--silver)]">
                                <span className="text-[var(--gold)] mt-0.5">—</span>
                                {cap}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Technologies */}
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
