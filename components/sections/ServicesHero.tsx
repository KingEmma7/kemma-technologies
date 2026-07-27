import { Container } from "@/components/ui/Container";

/**
 * Server Component. The entrance is CSS (`.enter`), scoped to `html.js`, so the
 * heading is present and readable in the served HTML — the Framer Motion
 * version emitted `opacity: 0` inline and left the page blank until hydration.
 */
export function ServicesHero() {
  return (
    <section className="relative overflow-hidden bg-[var(--dark-bg)] pt-40 pb-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,123,148,0.08)_0%,transparent_60%)]" />

      <Container>
        <p className="enter mb-6 text-xs uppercase tracking-widest text-[var(--gold)]">
          What we build
        </p>

        <h1
          className="enter mb-8 max-w-4xl font-heading text-4xl font-bold text-white sm:text-5xl md:text-6xl"
          style={{ "--enter-delay": "0.1s" } as React.CSSProperties}
        >
          Three capabilities, <span className="text-gold-gradient">backed by shipped work</span>
        </h1>

        <p
          className="enter max-w-2xl text-lg leading-relaxed text-[var(--silver)] md:text-xl"
          style={{ "--enter-delay": "0.25s" } as React.CSSProperties}
        >
          Digital platforms, web products and product engineering. Every capability below is
          tied to work we have delivered and can point you to.
        </p>
      </Container>
    </section>
  );
}
