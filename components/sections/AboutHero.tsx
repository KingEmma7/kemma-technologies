import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/ButtonLink";

/**
 * Server Component — see ServicesHero for why the entrance is CSS rather than
 * Framer Motion.
 */
export function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-[var(--dark-bg)] pt-40 pb-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(200,155,60,0.08)_0%,transparent_60%)]" />

      <Container>
        <p className="enter mb-6 text-xs uppercase tracking-widest text-[var(--gold)]">
          About Kemma Technologies
        </p>

        <h1
          className="enter mb-8 max-w-4xl font-heading text-4xl font-bold leading-tight text-white md:text-6xl"
          style={{ "--enter-delay": "0.1s" } as React.CSSProperties}
        >
          Technology should make <span className="text-gold-gradient">serious work simpler</span>.
        </h1>

        <p
          className="enter mb-10 max-w-2xl text-lg leading-relaxed text-[var(--silver)] md:text-xl"
          style={{ "--enter-delay": "0.25s" } as React.CSSProperties}
        >
          Kemma Technologies is a product and software engineering company building digital
          platforms, web products and business systems for organisations worldwide.
        </p>

        <div
          className="enter flex flex-col gap-4 sm:flex-row"
          style={{ "--enter-delay": "0.35s" } as React.CSSProperties}
        >
          <ButtonLink href="/contact" size="lg">Start a Project</ButtonLink>
          <ButtonLink href="/work" variant="secondary" size="lg">Explore Our Work</ButtonLink>
        </div>
      </Container>
    </section>
  );
}
