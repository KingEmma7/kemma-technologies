import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllProjects, getProjectBySlug } from "@/lib/projects";
import { CaseStudyHero, CaseStudyFooter } from "@/components/sections/CaseStudyContent";
import { MdxSection } from "@/components/sections/MdxSection";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};

  return {
    title: project.meta.title,
    description: project.meta.summary,
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <article>
      <CaseStudyHero meta={project.meta} />
      <MdxSection content={project.content} />
      <CaseStudyFooter />
    </article>
  );
}
