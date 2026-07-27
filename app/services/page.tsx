import { pageMetadata } from "@/lib/seo";
import { ServicesHero } from "@/components/sections/ServicesHero";
import { ServicesCards } from "@/components/sections/ServicesCards";
import { ServicesAudienceSection } from "@/components/sections/ServicesAudienceSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { CtaBand } from "@/components/sections/CtaBand";

export const metadata = pageMetadata({
  title: "Services",
  description:
    "Digital platforms, web products and product engineering — what Kemma Technologies builds, and the work that demonstrates it.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <ServicesHero />
      <ServicesCards />
      <ServicesAudienceSection />
      <ProcessSection />
      <CtaBand />
    </>
  );
}
