import { Hero } from "@/components/hero/Hero";
import { ServicesSummary } from "@/components/sections/ServicesSummary";
import { FeaturedWork } from "@/components/sections/FeaturedWork";
import { Testimonials } from "@/components/sections/Testimonials";
import { CtaBand } from "@/components/sections/CtaBand";
import { getFeaturedProjects } from "@/lib/projects";

export default function HomePage() {
  const featured = getFeaturedProjects();

  return (
    <>
      <Hero />
      <ServicesSummary />
      <FeaturedWork projects={featured} />
      <Testimonials />
      <CtaBand />
    </>
  );
}
