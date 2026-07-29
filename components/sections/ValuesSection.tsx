import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

/**
 * What Kemma believes.
 *
 * Server Component. These replaced a generic set of one-word corporate values
 * (Excellence, Trust, Growth, Innovation) that could have belonged to any
 * company. Each of these is a stated trade-off, which is both more useful to a
 * prospective client and harder to fake.
 */
const beliefs = [
  {
    title: "Useful before impressive",
    desc: "A product that solves the actual problem beats one that demos well. Visual ambition should never outrun usefulness.",
  },
  {
    title: "Clear before complicated",
    desc: "Complexity is a cost paid by everyone who touches the system afterwards. We add it only where it earns its place.",
  },
  {
    title: "Evidence before claims",
    desc: "We would rather show a platform in production than describe a capability we cannot demonstrate.",
  },
  {
    title: "Quality across design and engineering",
    desc: "A well-built product with a poor interface is unfinished, and so is a beautiful one that falls over under real use.",
  },
  {
    title: "Accessibility and performance are requirements",
    desc: "They are part of whether the product works, not a polish pass to schedule if time allows.",
  },
  {
    title: "Systems that support real operations",
    desc: "Software has to fit how a team actually works — the approvals, the exceptions, the records they answer for.",
  },
  {
    title: "Long-term thinking over disposable builds",
    desc: "We build so the next change is cheap, and so your team can own the code after we hand it over.",
  },
];

export function ValuesSection() {
  return (
    <Section light>
      <Reveal>
        <p className="mb-4 text-xs uppercase tracking-widest text-[var(--gold)]">What we believe</p>
        <h2 className="mb-16 max-w-3xl font-heading text-3xl font-bold text-[var(--ink)] md:text-5xl">
          The principles behind how we build
        </h2>
      </Reveal>

      <ul className="grid list-none grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {beliefs.map((belief, i) => (
          <Reveal as="li" key={belief.title} delay={Math.min(i, 5) * 0.08}>
            <h3 className="mb-2 font-heading text-lg font-semibold text-[var(--ink)]">
              {belief.title}
            </h3>
            <p className="leading-relaxed text-[var(--ink-body)]">{belief.desc}</p>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
