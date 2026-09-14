import Image from "next/image";
import Link from "next/link";
import { PageIntro } from "@/components/site/PageIntro";
import { demos, demoEnquiry } from "@/lib/demos";
import { pageMetadata } from "@/lib/seo";
import styles from "./page.module.css";

export const metadata = pageMetadata({
  title: "Website demos",
  description: "Try three fictional website demonstrations: a training club, a property collection and a business consultancy. Explore what a website could do for your business.",
  path: "/demos",
});

export default function DemosPage() {
  return (
    <>
      <PageIntro
        label="Website demos"
        title="See what your website could do."
        description="Three different businesses. Three ways to help someone take their next step. Open a demo and try the journey for yourself."
      />
      <div className={`wrap ${styles.introduction}`}>
        <p>These are fictional businesses, created to show what’s possible. Forms are simulated: nothing is sent, paid for or booked. Use sample details only.</p>
        <Link className="text-link" href="/work">See our client work</Link>
      </div>
      <section className={`wrap ${styles.gallery}`} aria-label="Explore website demos">
        {demos.map((demo) => (
          <article className={styles.demo} id={demo.id} key={demo.id} aria-labelledby={`${demo.id}-title`}>
            <a className={styles.preview} href={`/demo-sites/${demo.id}/index.html#/`} aria-label={`Open ${demo.name} demo`}>
              <Image
                src={demo.image}
                alt={demo.imageAlt}
                sizes="(max-width: 760px) 90vw, 57vw"
              />
            </a>
            <div className={styles.details}>
              <p className={styles.category}>{demo.category} · Fictional demo</p>
              <h2 id={`${demo.id}-title`}>{demo.name}</h2>
              <h3>{demo.title}</h3>
              <p>{demo.description}</p>
              <ul aria-label={`Things to try in ${demo.name}`}>
                {demo.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
              <div className={styles.actions}>
                <a className="solid-button" href={`/demo-sites/${demo.id}/index.html#/`}>Try {demo.name}</a>
                <Link className="text-link" href={`/pricing?demo=${demo.id}#estimate`}>Explore scope & pricing</Link>
                <a className="text-link" href={demoEnquiry(demo.name)}>Discuss a similar site</a>
              </div>
            </div>
          </article>
        ))}
      </section>
      <section className={`wrap ${styles.enquiry}`}>
        <h2>Make it yours.</h2>
        <p>Your business will have its own needs. Tell us what you’d like people to do on your website, and we’ll work through the right approach together.</p>
        <Link className="text-link" href="/contact">Start a conversation</Link>
      </section>
    </>
  );
}
