import Link from "next/link";
import Image from "next/image";
import { Sculpture } from "./Sculpture";

export function Hero() {
  return (
    <section id="home" className="hero wrap" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow">
          <span className="small-cross" aria-hidden="true">
            ✳
          </span>{" "}
          Independent design & engineering
        </p>
        <h1 id="hero-title">
          Thoughtful design.
          <br />
          Serious
          <br />
          <span className="quiet-type">engineering.</span>
        </h1>
        <p className="hero-description">
          We turn complex ideas into clear, dependable digital products.
          Considered at every layer.
        </p>
        <Link className="primary-link" href="#work">
          Explore our work{" "}
          <span className="round-arrow" aria-hidden="true">
            ↓
          </span>
        </Link>
      </div>
      <Sculpture />
      <div className="hero-foot">
        <p>
          Based in Accra. <span>Working everywhere.</span>
        </p>
        <span className="hero-scroll">
          A little further down <span aria-hidden="true">↓</span>
        </span>
      </div>
    </section>
  );
}

export function SelectedWork() {
  return (
    <section
      id="work"
      className="work-section wrap"
      aria-labelledby="work-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow section-index">01 / Selected work</p>
          <h2 id="work-title">The work speaks.</h2>
        </div>
        <p>
          Different challenges.
          <br />
          The same care in the details.
        </p>
      </div>
      <div className="featured-projects">
        <Link
          className="project project-isgm"
          href="/work/isgm-platform"
          aria-label="Explore ISGM case study"
        >
          <div className="project-stage">
            <div className="stage-top">
              <span>ISGM</span>
              <span className="stage-discipline">Institutional platform</span>
            </div>
            <div className="browser-frame">
              <div className="browser-chrome">
                <span className="browser-dots">● ● ●</span>
                <span>pisgm.org</span>
                <span aria-hidden="true">↗</span>
              </div>
              <Image
                src="/design/isgm.png"
                alt="ISGM homepage showing a smiling woman receiving her certificate"
                width="1274"
                height="716"
                loading="lazy"
                sizes="(max-width: 760px) 90vw, 45vw"
              />
            </div>
            <span className="project-view" aria-hidden="true">
              View project ↗
            </span>
          </div>
          <div className="project-info">
            <div>
              <h3>One institution. One connected platform.</h3>
              <p>
                ISGM <span>·</span> Product design & full-stack engineering
              </p>
            </div>
            <span className="project-arrow" aria-hidden="true">
              ↗
            </span>
          </div>
        </Link>
        <Link
          className="project project-bakery"
          href="/work/estees-bakery"
          aria-label="Explore Cakes by Estee case study"
        >
          <div className="project-stage">
            <div className="stage-top">
              <span>Cakes by Estee</span>
              <span className="stage-discipline">Commerce experience</span>
            </div>
            <div className="browser-frame">
              <div className="browser-chrome">
                <span className="browser-dots">● ● ●</span>
                <span>esteesbakery.com</span>
                <span aria-hidden="true">↗</span>
              </div>
              <Image
                src="/design/bakery.png"
                alt="Cakes by Estee storefront with its cake collection and ordering journeys"
                width="1274"
                height="716"
                loading="lazy"
                sizes="(max-width: 760px) 90vw, 45vw"
              />
            </div>
            <span className="project-view" aria-hidden="true">
              View project ↗
            </span>
          </div>
          <div className="project-info">
            <div>
              <h3>A personal touch. An effortless order.</h3>
              <p>
                Cakes by Estee <span>·</span> Website & commerce
              </p>
            </div>
            <span className="project-arrow" aria-hidden="true">
              ↗
            </span>
          </div>
        </Link>
      </div>
      <details className="more-work">
        <summary className="more-work-bar">
          <span className="eyebrow">There’s more behind the work.</span>
          <span className="text-link">
            View all five projects{" "}
            <span className="details-symbol" aria-hidden="true" />
          </span>
        </summary>
        <div>
          <Link className="work-row" href="/work/constract">
            <span className="row-index">03</span>
            <h3>Constract</h3>
            <p>Marketplace & business systems</p>
            <span aria-hidden="true">↗</span>
          </Link>
          <Link className="work-row" href="/work/kofi-asiedu-mahama">
            <span className="row-index">04</span>
            <h3>Kofi Asiedu Mahama</h3>
            <p>Author platform & digital sales</p>
            <span aria-hidden="true">↗</span>
          </Link>
          <Link className="work-row" href="/work/ars-wovenu-memorial-chapel">
            <span className="row-index">05</span>
            <h3>Wovenu Memorial Chapel</h3>
            <p>Community & institutional website</p>
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <Link className="text-link work-index-link" href="/work">
          Explore all work & products <span aria-hidden="true">↗</span>
        </Link>
      </details>
    </section>
  );
}

export function Capabilities() {
  return (
    <section
      id="capabilities"
      className="capabilities-section wrap"
      aria-labelledby="capabilities-title"
    >
      <div className="capabilities-intro">
        <p className="eyebrow section-index">02 / What we bring</p>
        <h2 id="capabilities-title">
          From the first
          <br />
          question to the
          <br />
          <span className="quiet-type">final detail.</span>
        </h2>
        <p>
          Design and engineering, kept close.
          <br />
          So what looks right works right, too.
        </p>
      </div>
      <div className="capabilities-list">
        <details name="capabilities" open>
          <summary>
            <span className="row-index">01</span>
            <h3>Digital platforms</h3>
            <span className="details-symbol" aria-hidden="true"></span>
          </summary>
          <div className="details-content">
            <p>
              Connected systems for the way your organisation works. We bring
              complex workflows into a coherent experience for customers and the
              people behind the scenes.
            </p>
            <ul>
              <li>Customer & applicant portals</li>
              <li>Payments & integrations</li>
              <li>Operations & administration</li>
            </ul>
          </div>
        </details>
        <details name="capabilities">
          <summary>
            <span className="row-index">02</span>
            <h3>Websites & commerce</h3>
            <span className="details-symbol" aria-hidden="true"></span>
          </summary>
          <div className="details-content">
            <p>
              Distinctive websites that make it easy to understand your business
              and take the next step. Designed for real content, real customers,
              and everyday use.
            </p>
            <ul>
              <li>Company & product websites</li>
              <li>Storefronts & ordering flows</li>
              <li>Content & publishing systems</li>
            </ul>
          </div>
        </details>
        <details name="capabilities">
          <summary>
            <span className="row-index">03</span>
            <h3>Product engineering</h3>
            <span className="details-symbol" aria-hidden="true"></span>
          </summary>
          <div className="details-content">
            <p>
              A thoughtful technical partner for the product you’re building or
              improving. From architecture and implementation to making an
              existing system easier to maintain.
            </p>
            <ul>
              <li>Frontend & full-stack development</li>
              <li>System design & modernisation</li>
              <li>Performance & accessibility</li>
            </ul>
          </div>
        </details>
        <Link href="/services" className="text-link capability-link">
          Explore our capabilities <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  );
}

export function Studio() {
  return (
    <section
      id="studio"
      className="studio-section"
      aria-labelledby="studio-title"
    >
      <div className="wrap studio-inner">
        <div className="studio-aside">
          <p className="eyebrow section-index">03 / The studio</p>
          <div className="studio-mark" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p className="eyebrow">
            Independent by choice.
            <br />
            Considered by nature.
          </p>
        </div>
        <div className="studio-copy">
          <h2 id="studio-title">
            Small by design.
            <br />
            <span className="quiet-type">Deeply invested.</span>
          </h2>
          <p className="studio-lead">
            Kemma is a founder-led design and engineering studio based in Accra,
            building for organisations anywhere.
          </p>
          <p>
            You work directly with the person thinking through the problem,
            shaping the experience, and writing the software. Fewer layers
            between the idea and the people making it happen.
          </p>
          <div className="studio-principles">
            <div>
              <span className="eyebrow">01</span>
              <h3>Understand first.</h3>
              <p>
                Start with your people, your work, and the problem worth
                solving.
              </p>
            </div>
            <div>
              <span className="eyebrow">02</span>
              <h3>Make it clear.</h3>
              <p>Work through the experience together before building it.</p>
            </div>
            <div>
              <span className="eyebrow">03</span>
              <h3>Care for the details.</h3>
              <p>Build, test, and refine the things people depend on.</p>
            </div>
          </div>
          <Link href="/about" className="text-link studio-link">
            Meet the studio <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ContactBand() {
  return (
    <section
      id="contact"
      className="contact-section wrap"
      aria-labelledby="contact-title"
    >
      <p className="eyebrow section-index">04 / Your next chapter</p>
      <div className="contact-heading">
        <h2 id="contact-title">
          Something in mind?
          <br />
          <span className="quiet-type">Let’s give it shape.</span>
        </h2>
        <Link
          className="contact-orb"
          aria-label="Start a conversation"
          href="/contact"
        >
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <div className="contact-bottom">
        <p>
          A new product. A better website.
          <br />A complicated problem worth untangling.
        </p>
        <Link className="text-link" href="/contact">
          Start a conversation <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  );
}
