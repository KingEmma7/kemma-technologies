import { Globe, MapPin, Users } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Geography as context, not as a limit.
 *
 * This replaced `FounderLedSection`, which was the About page's *second*
 * founder block and made the company read as one person's brand.
 */
const points = [
  {
    icon: MapPin,
    title: "Based in Accra",
    desc: "Ghana is where the company is registered and where the work is done. It is our address, not our market.",
  },
  {
    icon: Globe,
    title: "Working anywhere",
    desc: "We collaborate remotely with organisations, founders and product teams across different markets and time zones.",
  },
  {
    icon: Users,
    title: "Structured for collaboration",
    desc: "Written scope, visible progress and direct access to the people building your product — not status filtered through an account manager.",
  },
];

export function GlobalDeliverySection() {
  return (
    <Section>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal>
            <p className="mb-4 text-xs uppercase tracking-widest text-[var(--gold)]">Global delivery</p>
            <h2 className="font-heading text-3xl font-bold leading-snug text-white md:text-4xl">
              Based in Accra. Building for organisations{" "}
              <span className="text-gold-gradient">anywhere</span>.
            </h2>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <ul className="flex list-none flex-col gap-8">
            {points.map((point, i) => (
              <Reveal as="li" key={point.title} delay={i * 0.1}>
                <div className="flex gap-5">
                  <point.icon
                    className="mt-1 h-6 w-6 shrink-0 text-[var(--accent)]"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="mb-1 font-heading text-lg font-semibold text-white">
                      {point.title}
                    </h3>
                    <p className="leading-relaxed text-[var(--silver)]">{point.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
