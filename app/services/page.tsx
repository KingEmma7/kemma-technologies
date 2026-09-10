import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { SERVICES } from "@/lib/services";
import { PageIntro } from "@/components/site/PageIntro";
import { ContactBand } from "@/components/site/Sections";
import { projectPresentation } from "@/components/site/project-presentation";
export const metadata = pageMetadata({
  title: "Services",
  description:
    "Digital platforms, websites and commerce, and senior product engineering. Design and development kept close, from first question to final detail.",
  path: "/services",
});
const titles = [
  "Digital platforms.",
  "Websites & commerce.",
  "Product engineering.",
];
const process = [
  [
    "Discover",
    "Understand the problem, the people and the constraints. Agree on a clear scope and a practical direction.",
  ],
  [
    "Shape",
    "Work through the experience with real content and interactive previews. Refine the details together.",
  ],
  [
    "Build",
    "Connect the interface to dependable systems. Test the journeys your customers and team will use.",
  ],
  [
    "Refine",
    "Review the finished product, prepare the handover, and agree on what support comes next.",
  ],
];
export default function ServicesPage() {
  return (
    <>
      <PageIntro
        label="What we bring"
        title="From the first question"
        quiet="to the final detail."
        description="Design and engineering, kept close. So what looks right works right, too."
      />
      <div className="services-detail wrap">
        {SERVICES.map((service, i) => (
          <section className="service-detail" key={service.id} id={service.id}>
            <div>
              <p className="eyebrow section-index">
                0{i + 1} / Our capabilities
              </p>
              <h2>{titles[i]}</h2>
              <p className="service-tagline">{service.tagline}</p>
            </div>
            <div>
              <p className="editorial-lead">{service.summary}</p>
              <ul className="service-capabilities">
                {service.capabilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <details className="service-deliverables">
                <summary>
                  What this can include
                  <span className="details-symbol" aria-hidden="true" />
                </summary>
                <ul>
                  {service.deliverables.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </details>
              <div className="service-evidence">
                <p className="eyebrow">In the work</p>
                {service.evidence.map((slug) => (
                  <Link className="text-link" href={`/work/${slug}`} key={slug}>
                    {projectPresentation[slug]?.name ?? slug}
                    <span aria-hidden="true">↗</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
      <section className="principles-section">
        <div className="wrap">
          <p className="eyebrow section-index">A clear path through the work</p>
          <div className="process-grid">
            {process.map(([title, body], i) => (
              <div key={title}>
                <span className="eyebrow">0{i + 1}</span>
                <h2>{title}.</h2>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="editorial-section wrap">
        <p className="eyebrow">Ways to work together</p>
        <div>
          <h2>
            The right shape
            <br />
            <span className="quiet-type">for your project.</span>
          </h2>
          <div className="engagement-list">
            <div>
              <h3>A defined project</h3>
              <p>
                A website, platform or system with a clear scope, timeline and
                price agreed before work begins.
              </p>
            </div>
            <div>
              <h3>An ongoing collaboration</h3>
              <p>
                Feature work, maintenance and improvements for a product we’ve
                built or taken over.
              </p>
            </div>
            <div>
              <h3>A second pair of eyes</h3>
              <p>
                A technical audit, architecture review or focused consultation
                before you commit to the next step.
              </p>
            </div>
          </div>
        </div>
      </section>
      <ContactBand />
    </>
  );
}
