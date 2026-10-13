import { ContactForm } from "@/components/site/ContactForm";
import { PageIntro } from "@/components/site/PageIntro";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Request a quote",
  description:
    "Every project is quoted individually by Emmanuel. Share your website, mobile app, AI or software requirements to receive a personalised quote.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <>
      <PageIntro
        label="Project quotes"
        title="A quote for your project."
        description="Websites, mobile apps, AI tools and ongoing support. Every project is quoted individually by Emmanuel."
      />
      <section id="estimate" data-quote-only="true" aria-label="Request a personalised quote">
        <ContactForm />
      </section>
    </>
  );
}
