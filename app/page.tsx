import { Hero } from "@/components/hero/Hero";
import { FlagshipPlatform } from "@/components/sections/FlagshipPlatform";
import { ServicesSummary } from "@/components/sections/ServicesSummary";
import { FeaturedWork } from "@/components/sections/FeaturedWork";
import { ProductsSection } from "@/components/sections/ProductsSection";
import { WhyKemma } from "@/components/sections/WhyKemma";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { Testimonials } from "@/components/sections/Testimonials";
import { CtaBand } from "@/components/sections/CtaBand";
import { getHomepageProjects } from "@/lib/projects";

export default function HomePage() {
  // ISGM has its own flagship section above — keep the grid for other work.
  const projects = getHomepageProjects(3, { exclude: ["isgm-platform"] });

  return (
    <>
      <Hero />
      <FlagshipPlatform />
      <ServicesSummary />
      <FeaturedWork projects={projects} />
      <ProductsSection />
      <WhyKemma />
      <ProcessSection />
      <Testimonials />
      <CtaBand />
    </>
  );
}
