"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

gsap.registerPlugin(ScrollTrigger);

const milestones = [
  {
    year: "2019",
    title: "Founded in Accra",
    desc: "Kemma Technologies is born from a shared vision to deliver world-class software solutions from the African continent.",
  },
  {
    year: "2020",
    title: "First Major Platform",
    desc: "We deliver our first enterprise-grade web platform for a leading Ghanaian financial institution, serving 50,000+ users at launch.",
  },
  {
    year: "2021",
    title: "AI Practice Launched",
    desc: "We establish a dedicated intelligent solutions practice, embedding machine learning and data science across our service portfolio.",
  },
  {
    year: "2022",
    title: "Pan-African Expansion",
    desc: "Clients in Nigeria, Kenya and Senegal join our portfolio. We grow our team to 25 engineers and designers.",
  },
  {
    year: "2023",
    title: "Innovation Award",
    desc: "RetailEdge AI Recommender wins the Ghana Innovation & Tech Summit Award for Best AI Product.",
  },
  {
    year: "2024",
    title: "50+ Projects Delivered",
    desc: "We cross 50 delivered projects across fintech, agritech, health and retail — impacting over 100,000 end users.",
  },
];

export function MilestoneTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !lineRef.current || !containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0, transformOrigin: "top center" },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
            end: "bottom 30%",
            scrub: true,
          },
        }
      );

      gsap.utils.toArray<HTMLElement>(".timeline-item").forEach((item, i) => {
        gsap.fromTo(
          item,
          { opacity: 0, x: i % 2 === 0 ? -40 : 40 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: item,
              start: "top 80%",
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="py-24 md:py-32 bg-[var(--dark-bg)]">
      <Container>
        <Reveal>
          <p className="text-xs uppercase tracking-widest text-[var(--gold)] mb-4">Our journey</p>
          <h2 className="font-heading font-bold text-4xl md:text-5xl text-white mb-16">
            Milestones that shaped us
          </h2>
        </Reveal>

        <div ref={containerRef} className="relative max-w-3xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-[var(--border)]">
            <div
              ref={lineRef}
              className="absolute inset-0 bg-gradient-to-b from-[var(--gold)] to-transparent"
            />
          </div>

          <div className="flex flex-col gap-16">
            {milestones.map((m, i) => (
              <div
                key={m.year}
                className={[
                  "timeline-item relative pl-16 md:pl-0",
                  "md:grid md:grid-cols-2 md:gap-12",
                  i % 2 === 0 ? "md:text-right" : "",
                ].join(" ")}
              >
                {/* Dot */}
                <div
                  className={[
                    "absolute top-1 left-4 md:left-1/2 -translate-x-1/2",
                    "w-4 h-4 rounded-full border-2 border-[var(--gold)] bg-[var(--dark-bg)]",
                    "shadow-[0_0_12px_rgba(200,155,60,0.6)]",
                  ].join(" ")}
                />

                {/* Content */}
                {i % 2 === 0 ? (
                  <>
                    <div className="md:order-first">
                      <span className="text-2xl font-heading font-bold text-gold-gradient">{m.year}</span>
                      <h3 className="font-heading font-semibold text-xl text-white mt-1 mb-2">{m.title}</h3>
                      <p className="text-[var(--silver)] text-sm leading-relaxed">{m.desc}</p>
                    </div>
                    <div />
                  </>
                ) : (
                  <>
                    <div />
                    <div>
                      <span className="text-2xl font-heading font-bold text-gold-gradient">{m.year}</span>
                      <h3 className="font-heading font-semibold text-xl text-white mt-1 mb-2">{m.title}</h3>
                      <p className="text-[var(--silver)] text-sm leading-relaxed">{m.desc}</p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
