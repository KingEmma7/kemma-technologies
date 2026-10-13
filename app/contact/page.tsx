import { ContactForm } from "@/components/site/ContactForm";
import { PageIntro } from "@/components/site/PageIntro";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Request a quote",
  description:
    "Every project is quoted individually by Emmanuel. Tell us what you would like to build, improve or automate and request a personalised quote.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageIntro
        title="Tell us about your project."
        description="Every project is quoted individually by Emmanuel. Share what you need, and he’ll review the scope and send you a personalised quote."
      />
      <section data-quote-only="true" aria-label="Request a personalised quote">
        <ContactForm />
      </section>
    </>
  );
}
