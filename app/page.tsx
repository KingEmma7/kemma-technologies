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
import { absoluteUrl } from "@/lib/seo";

// Title and description come from the root layout; only the canonical needs
// setting here. Without it the homepage was the one route shipping no
// canonical at all, since `alternates` isn't inherited from the layout.
export const metadata = {
  alternates: { canonical: absoluteUrl("/") },
};

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
