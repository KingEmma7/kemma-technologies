import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Company leadership — deliberately compact.
 *
 * The About page previously opened with a full founder profile (photo, bio,
 * twelve skill chips) and closed with a second founder section, which made a
 * company read as a personal brand. This is now one short block near the end,
 * and the company's capability is argued by the work instead.
 *
 * Text colours use the on-light tokens: the old `#888` on the light panel was
 * 3.25:1 and failed WCAG AA for body text.
 */
const focus = ["React", "TypeScript", "Next.js", "Platform delivery", "Accessibility", "Performance"];

export function FounderSection() {
  return (
    <Section light>
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <Reveal direction="left">
            <div className="relative aspect-[4/5] w-full max-w-xs overflow-hidden rounded-sm border border-[var(--border-on-light)] bg-[#f4f4f4]">
              <Image
                src="/images/emmanuel-tagbor.png"
                alt="Emmanuel Mawulolo Tagbor, founder of Kemma Technologies"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 60vw, 320px"
              />
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-8">
          <Reveal>
            <p className="mb-4 text-xs uppercase tracking-widest text-[var(--gold)]">
              Company leadership
            </p>
            <h2 className="mb-2 font-heading text-3xl font-bold text-[var(--ink)] md:text-4xl">
              Emmanuel Mawulolo Tagbor
            </h2>
            <p className="mb-6 text-sm uppercase tracking-widest text-[var(--muted-on-light)]">
              Founder, Kemma Technologies
            </p>

            <p className="mb-4 max-w-2xl text-lg leading-relaxed text-[var(--ink-body)]">
              Kemma Technologies is led by Emmanuel Mawulolo Tagbor, a senior software engineer
              with over a decade of experience building modern web applications and digital
              products, including work on large international products.
            </p>
            <p className="max-w-2xl leading-relaxed text-[var(--ink-body)]">
              That background — accessibility, localisation, CMS and authentication work,
              and platform delivery — shapes how every Kemma project is planned and built.
            </p>

            <ul className="mt-8 flex list-none flex-wrap gap-2">
              {focus.map((item) => (
                <li
                  key={item}
                  className="rounded-sm border border-[var(--border-on-light)] bg-[rgba(0,0,0,0.03)] px-3 py-1.5 text-xs uppercase tracking-wide text-[var(--ink-body)]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
