import Image from "next/image";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { PageIntro } from "@/components/site/PageIntro";
import { ContactBand } from "@/components/site/Sections";
export const metadata = pageMetadata({
  title: "About",
  description:
    "Kemma is a founder-led design and engineering studio based in Accra, building digital platforms and products for organisations anywhere.",
  path: "/about",
});
const principles = [
  [
    "Understand first.",
    "We start with the people using your product, the work they need to do, and the problem worth solving. A clear question makes for a better answer.",
  ],
  [
    "Make it clear.",
    "Design and engineering stay close. We work through the experience together, make decisions visible, and agree on what we’re building before committing to it.",
  ],
  [
    "Care for the details.",
    "The loading state, the error message, the permission check. A dependable product takes care of everyday use as carefully as the first impression.",
  ],
];
export default function AboutPage() {
  return (
    <>
      <PageIntro
        label="The studio"
        title="Small by design."
        quiet="Deeply invested."
        description="Kemma is a founder-led design and engineering studio based in Accra, building for organisations anywhere."
      />
      <section className="editorial-section wrap">
        <p className="eyebrow">Independent by choice.</p>
        <div>
          <h2>
            Good thinking.
            <br />
            <span className="quiet-type">Careful making.</span>
          </h2>
          <p className="editorial-lead">
            You work directly with the person thinking through the problem,
            shaping the experience, and writing the software.
          </p>
          <p>
            We bring design and engineering together to create digital
            platforms, websites and business systems that make complex work feel
            clear. Every decision has to serve the people using the product.
          </p>
          <p>
            Written scope, visible progress and direct conversations keep the
            work grounded. Based in Ghana, we collaborate remotely across
            markets and time zones.
          </p>
        </div>
      </section>
      <section className="principles-section">
        <div className="wrap">
          <p className="eyebrow section-index">How we work</p>
          <div className="principle-grid">
            {principles.map(([title, body], i) => (
              <div key={title}>
                <span className="eyebrow">0{i + 1}</span>
                <h2>{title}</h2>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="founder-section wrap">
        <div className="founder-image">
          <Image
            src="/images/emmanuel-tagbor.png"
            alt="Emmanuel Mawulolo Tagbor, founder of Kemma Technologies"
            width={640}
            height={800}
            sizes="(max-width: 760px) 70vw, 320px"
          />
        </div>
        <div>
          <p className="eyebrow section-index">The person behind the work</p>
          <h2>
            Emmanuel
            <br />
            <span className="quiet-type">Mawulolo Tagbor.</span>
          </h2>
          <p className="founder-role">Founder / Senior software engineer</p>
          <p>
            Over a decade of experience building modern web applications and
            digital products, including work on large international products.
          </p>
          <p>
            That background in accessibility, localisation, content systems,
            authentication and platform delivery shapes how every Kemma project
            is planned and built.
          </p>
          <Link className="text-link" href="/work">
            See the work <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
      <ContactBand />
    </>
  );
}
