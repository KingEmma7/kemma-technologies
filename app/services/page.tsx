import type { Metadata } from "next";
import { ServicesHero } from "@/components/sections/ServicesHero";
import { ServicesCards } from "@/components/sections/ServicesCards";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { CtaBand } from "@/components/sections/CtaBand";

export const metadata: Metadata = {
  title: "Services",
  description: "Software engineering, web platforms and intelligent digital solutions — delivered by Kemma Technologies.",
};

export default function ServicesPage() {
  return (
    <>
      <ServicesHero />
      <ServicesCards />
      <ProcessSection />
      <CtaBand />
    </>
  );
}
