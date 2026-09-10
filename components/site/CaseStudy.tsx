import Image from "next/image";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { ProjectMeta } from "@/lib/projects";
import { projectPresentation } from "./project-presentation";

export function CaseStudyHero({ meta }: { meta: ProjectMeta }) {
  const display = projectPresentation[meta.slug];
  return (
    <div className="case-page wrap">
      <Link className="case-back" href="/work">
        ← Back to work
      </Link>
      <div className="case-top">
        <div>
          <p className="eyebrow">
            Selected work / {display?.name ?? meta.title}
          </p>
          <h1>{display?.headline ?? meta.title}</h1>
        </div>
        <p>{meta.summary}</p>
      </div>
      <dl className="case-meta">
        <div>
          <dt>Client</dt>
          <dd>{meta.client ?? meta.title}</dd>
        </div>
        <div>
          <dt>Our role</dt>
          <dd>{meta.role}</dd>
        </div>
        <div>
          <dt>Year</dt>
          <dd>{meta.year}</dd>
        </div>
      </dl>
      {meta.cover && (
        <figure className={`case-visual ${display?.tone ?? ""}`}>
          <Image
            src={meta.cover}
            alt={display?.alt ?? `${meta.title} website`}
            width={1274}
            height={716}
            sizes="(max-width: 760px) 90vw, 85vw"
          />
        </figure>
      )}
    </div>
  );
}

export async function CaseStudyBody({
  meta,
  content,
}: {
  meta: ProjectMeta;
  content: string;
}) {
  return (
    <div className="wrap">
      <div className="case-body">
        <aside>
          <p className="eyebrow section-index">Behind the work</p>
          {meta.liveUrl && (
            <a
              href={meta.liveUrl}
              className="text-link"
              target="_blank"
              rel="noreferrer"
            >
              Visit the website <span aria-hidden="true">↗</span>
            </a>
          )}
          <p className="case-status">
            {meta.status === "in-development"
              ? "In development"
              : "Client project"}
          </p>
        </aside>
        <div className="case-prose">
          <MDXRemote source={content} />
        </div>
      </div>
      {meta.screenshots && meta.screenshots.length > 0 && (
        <section className="case-gallery" aria-labelledby="gallery-title">
          <h2 id="gallery-title">A closer look.</h2>
          <div>
            {meta.screenshots.map((src, i) => (
              <figure key={src}>
                <Image
                  src={src}
                  alt={
                    meta.slug === "isgm-platform"
                      ? ([
                          "ISGM professional Programs catalogue",
                          "ISGM online application journey",
                        ][i] ?? `${meta.title} interface`)
                      : `${meta.title}, interface ${i + 1}`
                  }
                  width={1440}
                  height={900}
                  sizes="(max-width: 760px) 90vw, 45vw"
                />
                <figcaption>
                  {meta.slug === "isgm-platform"
                    ? ["Program discovery", "The application journey"][i]
                    : `Interface ${i + 1}`}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
      <div className="case-next">
        <h2>Another perspective.</h2>
        <Link href="/work" className="text-link">
          Explore all work <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </div>
  );
}
