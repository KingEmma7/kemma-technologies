import { Hero } from "@/components/hero/Hero";
import { ServicesSummary } from "@/components/sections/ServicesSummary";
import { FeaturedWork } from "@/components/sections/FeaturedWork";
import { Testimonials } from "@/components/sections/Testimonials";
import { CtaBand } from "@/components/sections/CtaBand";
import { getHomepageProjects } from "@/lib/projects";

export default function HomePage() {
  const projects = getHomepageProjects(3);

  return (
    <>
      <Hero />
      <ServicesSummary />
      <FeaturedWork projects={projects} />
      <Testimonials />
      <CtaBand />
    </>
  );
}
