import { ButtonLink } from "@/components/ui/ButtonLink";
import { HeroCanvasMount } from "./HeroCanvasMount";

const headline = {
  lead: "We build digital platforms that",
  accent: "move organisations forward.",
};

const subhead =
  "Kemma Technologies designs and engineers high-performance websites, business systems and end-to-end digital products for ambitious organisations worldwide.";

export function Hero() {
  return (
    <section className="relative flex min-h-[88svh] items-center justify-center overflow-hidden bg-[var(--dark-bg)] py-32">
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-[rgba(4,4,6,0.4)] to-[var(--dark-bg)]" />
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,rgba(200,155,60,0.06)_0%,transparent_70%)]" />

      <HeroCanvasMount />

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center md:px-10">
        <p
          className="enter mb-8 text-xs font-medium uppercase tracking-[0.3em] text-[var(--gold)]"
          style={{ "--enter-delay": "0.05s" } as React.CSSProperties}
        >
          Kemma Technologies
        </p>

        {/*
          Plain server-rendered heading. This was previously a set of Framer
          Motion spans with `initial={{ opacity: 0 }}`, which meant the <h1> was
          invisible in the served HTML until hydration finished.
        */}
        <h1
          className="enter mb-6 font-heading text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          style={{ "--enter-delay": "0.15s" } as React.CSSProperties}
        >
          <span className="text-white">{headline.lead} </span>
          <span className="text-gold-gradient">{headline.accent}</span>
        </h1>

        <p
          className="enter mx-auto mb-10 max-w-2xl text-base text-[var(--silver)] md:text-lg"
          style={{ "--enter-delay": "0.3s" } as React.CSSProperties}
        >
          {subhead}
        </p>

        <div
          className="enter flex flex-col justify-center gap-4 sm:flex-row"
          style={{ "--enter-delay": "0.45s" } as React.CSSProperties}
        >
          <ButtonLink href="/work" size="lg">View Our Work</ButtonLink>
          <ButtonLink href="/contact" variant="secondary" size="lg">Start a Project</ButtonLink>
        </div>
      </div>
    </section>
  );
}
