import { pageMetadata } from "@/lib/seo";
import { AboutHero } from "@/components/sections/AboutHero";
import { FounderSection } from "@/components/sections/FounderSection";
import { MissionSection } from "@/components/sections/MissionSection";
import { WhatWeBuildSection } from "@/components/sections/WhatWeBuildSection";
import { TechPhilosophySection } from "@/components/sections/TechPhilosophySection";
import { ValuesSection } from "@/components/sections/ValuesSection";
import { GlobalDeliverySection } from "@/components/sections/GlobalDeliverySection";
import { CtaBand } from "@/components/sections/CtaBand";

export const metadata = pageMetadata({
  title: "About",
  description:
    "Kemma Technologies is a product and software engineering company building digital platforms, web products and business systems for organisations worldwide.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      {/* Company first, leadership last. The founder block used to sit second,
          before the company had said anything about itself. */}
      <AboutHero />
      <MissionSection />
      <WhatWeBuildSection />
      <ValuesSection />
      <TechPhilosophySection />
      <GlobalDeliverySection />
      <FounderSection />
      <CtaBand
        heading={
          <>Have a serious digital product to <span className="text-gold-gradient">build</span>?</>
        }
        body="Tell us what you are trying to launch, improve or automate. We will help turn the problem into a practical product direction."
        primaryLabel="Start a Project"
        secondaryLabel="Explore Our Work"
        secondaryHref="/work"
      />
    </>
  );
}
