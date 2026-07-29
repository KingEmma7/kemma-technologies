import { getWorkItems } from "@/lib/projects";
import { WorkGrid } from "@/components/sections/WorkGrid";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Work",
  description:
    "Client platforms and Kemma products — digital platforms, web applications and business systems built end to end.",
  path: "/work",
});

export default function WorkPage() {
  const items = getWorkItems();

  return (
    <>
      {/* Page hero */}
      <section className="relative overflow-hidden bg-[var(--dark-bg)] pt-40 pb-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(200,155,60,0.06)_0%,transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
          <p className="enter mb-6 text-xs uppercase tracking-widest text-[var(--gold)]">Portfolio</p>
          <h1
            className="enter mb-6 max-w-3xl font-heading text-4xl font-bold text-white sm:text-5xl md:text-6xl"
            style={{ "--enter-delay": "0.1s" } as React.CSSProperties}
          >
            Platforms, products and <span className="text-gold-gradient">the systems behind them</span>
          </h1>
          <p
            className="enter max-w-2xl text-lg text-[var(--silver)] md:text-xl"
            style={{ "--enter-delay": "0.25s" } as React.CSSProperties}
          >
            Client platforms built end to end, alongside the products Kemma is building
            itself. Everything here is real work — in-development products are labelled
            as such.
          </p>
        </div>
      </section>

      <WorkGrid items={items} />
    </>
  );
}
