"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import type { WorkItem } from "@/lib/projects";

interface WorkGridProps {
  items: WorkItem[];
}

type FilterId =
  | "all"
  | "platform"
  | "website"
  | "commerce"
  | "institutional"
  | "kemma"
  | "in-development";

interface Filter {
  id: FilterId;
  label: string;
  match: (item: WorkItem) => boolean;
}

/**
 * Filters mix three facets — category, owner and status — because that is how
 * visitors actually ask the question ("show me platforms", "what do you own?",
 * "what's still being built?"). Keeping them in one row avoids a filter UI
 * heavier than the eight things it filters.
 */
const FILTERS: Filter[] = [
  { id: "all",            label: "All",            match: () => true },
  { id: "platform",       label: "Platforms",      match: (i) => i.categories.includes("platform") },
  { id: "website",        label: "Websites",       match: (i) => i.categories.includes("website") },
  { id: "commerce",       label: "Commerce",       match: (i) => i.categories.includes("commerce") },
  { id: "institutional",  label: "Institutional",  match: (i) => i.categories.includes("institutional") },
  { id: "kemma",          label: "Kemma Products", match: (i) => i.owner === "kemma" },
  { id: "in-development", label: "In Development", match: (i) => i.status === "in-development" },
];

export function WorkGrid({ items }: WorkGridProps) {
  const [active, setActive] = useState<FilterId>("all");

  // Only offer a filter that would actually return something, so visitors can
  // never land on an empty grid.
  const available = useMemo(
    () => FILTERS.filter((f) => f.id === "all" || items.some(f.match)),
    [items]
  );

  const visible = useMemo(() => {
    const filter = FILTERS.find((f) => f.id === active) ?? FILTERS[0];
    return items.filter(filter.match);
  }, [items, active]);

  return (
    <section className="bg-[var(--dark-bg)] py-16 pb-32">
      <Container>
        <div className="mb-12 flex flex-wrap gap-2" role="group" aria-label="Filter work">
          {available.map((f) => {
            const isActive = f.id === active;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setActive(f.id)}
                aria-pressed={isActive}
                className={[
                  "min-h-11 rounded-sm border px-4 text-xs uppercase tracking-widest transition-colors duration-200",
                  isActive
                    ? "border-[var(--gold)] bg-[rgba(200,155,60,0.1)] text-[var(--gold)]"
                    : "border-[var(--border)] text-[var(--silver)] hover:border-[rgba(200,155,60,0.5)] hover:text-white",
                ].join(" ")}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Screen readers get told the count changed; sighted users see it. */}
        <p aria-live="polite" className="mb-8 text-sm text-[var(--muted)]">
          Showing {visible.length} {visible.length === 1 ? "project" : "projects"}
        </p>

        <ul className="grid list-none grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((item, i) => (
            <Reveal as="li" key={item.id} delay={Math.min(i, 5) * 0.06}>
              <WorkCard item={item} />
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function WorkCard({ item }: { item: WorkItem }) {
  const isProduct = item.owner === "kemma";
  const inDevelopment = item.status === "in-development";

  const card = (
    <article
      className={[
        "group h-full overflow-hidden rounded-sm border transition-colors duration-300",
        "border-[var(--border)]",
        item.href ? "group-hover:border-[var(--gold)]" : "",
      ].join(" ")}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[rgba(255,255,255,0.03)]">
        {item.cover ? (
          <Image
            src={item.cover}
            alt={`${item.title} — screenshot of the live product`}
            fill
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#C89B3C11] to-[#007B9411]">
            <span className="font-heading text-7xl font-bold text-[var(--gold)] opacity-20">K</span>
          </div>
        )}

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {isProduct && (
            <span className="rounded-sm bg-[rgba(4,4,6,0.85)] px-2.5 py-1 text-[10px] uppercase tracking-widest text-[var(--accent)] ring-1 ring-[rgba(0,123,148,0.5)]">
              Kemma Product
            </span>
          )}
          {inDevelopment && (
            <span className="rounded-sm bg-[rgba(4,4,6,0.85)] px-2.5 py-1 text-[10px] uppercase tracking-widest text-[var(--gold)] ring-1 ring-[rgba(200,155,60,0.5)]">
              In Development
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {item.tags?.slice(0, 2).map((tag) => (
              <span key={tag} className="text-xs uppercase tracking-widest text-[var(--gold)]">
                {tag}
              </span>
            ))}
          </div>
          {item.year && <span className="text-xs text-[var(--muted)]">{item.year}</span>}
        </div>

        <h2 className="mb-2 font-heading text-xl font-semibold text-white">{item.title}</h2>
        <p className="line-clamp-3 text-sm text-[var(--silver)]">{item.summary}</p>

        <div className="mt-5 flex flex-wrap items-center gap-4 text-xs uppercase tracking-widest">
          {item.href && <span className="text-[var(--gold)]">Case study →</span>}
          {!item.href && !item.liveUrl && (
            <span className="text-[var(--muted)]">Case study coming soon</span>
          )}
        </div>
      </div>
    </article>
  );

  return (
    <div className="group h-full">
      {item.href ? (
        <Link href={item.href} className="block h-full">
          {card}
        </Link>
      ) : (
        card
      )}

      {/* Kept outside the card link: a link inside a link is invalid markup and
          breaks keyboard navigation. */}
      {item.liveUrl && (
        <a
          href={item.liveUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-xs uppercase tracking-widest text-[var(--silver)] transition-colors hover:text-[var(--gold)]"
        >
          Visit live site
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">({item.title}, opens in a new tab)</span>
        </a>
      )}
    </div>
  );
}
