import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllProjects, getProjectBySlug } from "@/lib/projects";
import { CaseStudyHero, CaseStudyFooter } from "@/components/sections/CaseStudyContent";
import { CaseStudyGallery } from "@/components/sections/CaseStudyGallery";
import { MdxSection } from "@/components/sections/MdxSection";
import { breadcrumbJsonLd, creativeWorkJsonLd, jsonLdScript, pageMetadata } from "@/lib/seo";

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

  return pageMetadata({
    title: project.meta.title,
    description: project.meta.summary,
    path: `/work/${slug}`,
    image: project.meta.cover,
    type: "article",
  });
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const { meta } = project;

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            creativeWorkJsonLd({
              title: meta.title,
              summary: meta.summary,
              slug: meta.slug,
              year: meta.year,
              client: meta.client,
              image: meta.cover,
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Work", path: "/work" },
              { name: meta.title, path: `/work/${meta.slug}` },
            ])
          ),
        }}
      />
      <CaseStudyHero meta={meta} />
      <CaseStudyGallery
        title={meta.title}
        cover={meta.cover}
        screenshots={meta.screenshots}
      />
      <MdxSection content={project.content} />
      <CaseStudyFooter />
    </article>
  );
}
