import { getWorkItems } from "@/lib/projects";
import { pageMetadata } from "@/lib/seo";
import { PageIntro } from "@/components/site/PageIntro";
import { WorkIndex } from "@/components/site/WorkIndex";
import { ContactBand } from "@/components/site/Sections";
export const metadata = pageMetadata({
  title: "Work",
  description:
    "Digital platforms, websites and business systems. Explore Kemma’s client work and the products we’re building.",
  path: "/work",
});
export default function WorkPage() {
  return (
    <>
      <PageIntro
        label="Selected work / Our products"
        title="Different challenges."
        quiet="The same care."
        description="From an institution’s daily operations to a bakery’s next order. Thoughtful experiences, with dependable systems behind them."
      />
      <WorkIndex items={getWorkItems()} />
      <ContactBand />
    </>
  );
}
