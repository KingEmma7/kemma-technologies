import type { Metadata } from "next";
import { getAllProjects } from "@/lib/projects";
import { WorkGrid } from "@/components/sections/WorkGrid";

export const metadata: Metadata = {
  title: "Work",
  description: "Projects and case studies from Kemma Technologies — software, web platforms and intelligent solutions.",
};

export default function WorkPage() {
  const projects = getAllProjects();

  return (
    <>
      {/* Page hero */}
      <section className="relative pt-40 pb-16 bg-[var(--dark-bg)] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(200,155,60,0.06)_0%,transparent_60%)] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
          <p className="text-xs uppercase tracking-widest text-[var(--gold)] mb-6">Portfolio</p>
          <h1 className="font-heading font-bold text-5xl md:text-7xl text-white mb-6 max-w-3xl">
            Work we&apos;re <span className="text-gold-gradient">proud to ship</span>
          </h1>
          <p className="text-[var(--silver)] text-xl max-w-xl">
            A selection of projects across software engineering, web platforms and AI — from startups to enterprises.
          </p>
        </div>
      </section>

      <WorkGrid projects={projects} />
    </>
  );
}
