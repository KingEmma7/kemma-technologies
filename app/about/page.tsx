import { pageMetadata } from "@/lib/seo";
import { AboutHero } from "@/components/sections/AboutHero";
import { FounderSection } from "@/components/sections/FounderSection";
import { MissionSection } from "@/components/sections/MissionSection";
import { WhatWeBuildSection } from "@/components/sections/WhatWeBuildSection";
import { TechPhilosophySection } from "@/components/sections/TechPhilosophySection";
import { ValuesSection } from "@/components/sections/ValuesSection";
import { FounderLedSection } from "@/components/sections/FounderLedSection";
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
      <AboutHero />
      <FounderSection />
      <MissionSection />
      <WhatWeBuildSection />
      <TechPhilosophySection />
      <ValuesSection />
      <FounderLedSection />
      <CtaBand
        heading={
          <>Let&apos;s build something useful, beautiful, and <span className="text-gold-gradient">built to last</span>.</>
        }
        body="Kemma Technologies is ready to partner with businesses, founders, and organizations that want to take their digital presence and operations seriously."
        primaryLabel="Start a Conversation"
        secondaryLabel={undefined}
        secondaryHref={undefined}
      />
    </>
  );
}
