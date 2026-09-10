import {
  Hero,
  SelectedWork,
  Capabilities,
  Studio,
  ContactBand,
} from "@/components/site/Sections";
import { absoluteUrl } from "@/lib/seo";
export const metadata = { alternates: { canonical: absoluteUrl("/") } };
export default function HomePage() {
  return (
    <>
      <Hero />
      <SelectedWork />
      <Capabilities />
      <Studio />
      <ContactBand />
    </>
  );
}
