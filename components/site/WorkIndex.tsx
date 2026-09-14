"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { WorkItem } from "@/lib/projects";
import { projectPresentation } from "./project-presentation";

const filters = [
  { id: "all", label: "All work" },
  { id: "platform", label: "Platforms" },
  { id: "website", label: "Websites" },
  { id: "commerce", label: "Commerce" },
  { id: "institutional", label: "Institutional" },
  { id: "kemma", label: "Our products" },
] as const;
type Filter = (typeof filters)[number]["id"];

export function WorkIndex({ items }: { items: WorkItem[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const visible = items.filter(
    (item) =>
      filter === "all" ||
      (filter === "kemma"
        ? item.owner === "kemma"
        : item.categories.includes(filter)),
  );
  return (
    <section className="work-index wrap" aria-label="Portfolio">
      <div className="work-filters" role="group" aria-label="Filter work">
        {filters.map((option) => (
          <button
            key={option.id}
            aria-pressed={filter === option.id}
            onClick={() => setFilter(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p className="work-result-count" role="status">
        {visible.length} {visible.length === 1 ? "project" : "projects"}
      </p>
      <div className="work-index-grid">
        {visible.map((item) => {
          const display = projectPresentation[item.id];
          const content = (
            <>
              {display?.image && (
                <div className={`index-image ${display.tone}`}>
                  <Image
                    src={display.image}
                    alt={display.alt ?? item.title}
                    width={1274}
                    height={716}
                    sizes="(max-width: 760px) 90vw, 45vw"
                  />
                </div>
              )}
              <div className="index-project-top">
                <p className="context-label">
                  {item.owner === "kemma" ? "Kemma product" : "Client project"}
                </p>
                <span className="project-status">
                  {item.status === "in-development"
                    ? "In development"
                    : item.year}
                </span>
              </div>
              <h2>{display?.name ?? item.title}</h2>
              <p className="index-summary">{item.summary}</p>
              <div className="index-project-bottom">
                <span>{item.categories.join(" / ")}</span>
                {item.href && (
                  <span className="text-link">Explore project</span>
                )}
              </div>
            </>
          );
          return item.href ? (
            <Link className="index-project" key={item.id} href={item.href}>
              {content}
            </Link>
          ) : (
            <article className="index-project" key={item.id}>
              {content}
            </article>
          );
        })}
      </div>
    </section>
  );
}
