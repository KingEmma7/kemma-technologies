import type { Metadata } from "next";
import { AboutHero } from "@/components/sections/AboutHero";
import { MilestoneTimeline } from "@/components/sections/MilestoneTimeline";
import { ValuesSection } from "@/components/sections/ValuesSection";
import { TeamSection } from "@/components/sections/TeamSection";
import { CtaBand } from "@/components/sections/CtaBand";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Kemma Technologies — our story, mission and the people behind the work.",
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <ValuesSection />
      <MilestoneTimeline />
      <TeamSection />
      <CtaBand />
    </>
  );
}
