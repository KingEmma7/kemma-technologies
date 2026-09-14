import { ContactForm } from "@/components/site/ContactForm";
import { PageIntro } from "@/components/site/PageIntro";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Tell us what you are trying to launch, improve or automate. Start a conversation with Kemma Technologies.",
  path: "/contact",
});
export default function ContactPage() {
  return (
    <>
      <PageIntro
        title="Tell us about your project."
        description="A new product. A better website. A complicated problem worth untangling. Let’s work out the next step together."
      />
      <ContactForm />
    </>
  );
}
