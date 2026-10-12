import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { MDXRemote } from "next-mdx-remote/rsc";
import { pageMetadata } from "@/lib/seo";
import styles from "./page.module.css";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "How do you fix one case without breaking another?",
    description:
      "Emmanuel Tagbor on the cases, errors and side effects a good open-source fix must preserve.",
    path: "/blog/how-do-you-fix-one-case-without-breaking-another",
    image: "/editorial/open-source-week5-cover.png",
    type: "article",
  }),
  authors: [{ name: "Emmanuel Tagbor" }],
};

const slug = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim().replace(/ +/g, "-");

export default async function WeekFiveArticle() {
  const source = await readFile(
    path.join(
      process.cwd(),
      "content/articles/how-do-you-fix-one-case-without-breaking-another.md",
    ),
    "utf8",
  );
  const [titleBlock, byline, ...body] = source.trim().split(/\n\n/);
  const headings = body
    .filter((block) => block.startsWith("## "))
    .map((block) => block.slice(3));

  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <nav className={styles.series} aria-label="Breadcrumb">
          <Link href="/blog">Blog</Link> / <Link href="/blog/series/open-source-everyday">Open Source Everyday</Link> / Week 5
        </nav>
        <h1>{titleBlock.replace(/^# /, "")}</h1>
        <div className={styles.byline}><MDXRemote source={byline} /></div>
      </header>
      <figure className={styles.cover}>
        <Image
          src="/editorial/open-source-week5-cover.png"
          alt="Open Source Everyday Week 5 cover, titled How do you fix one case without breaking another?, with Emmanuel Tagbor’s original portrait and cumulative totals of 32 submitted pull requests and 25 merged as of 12 October 2026."
          width={1672}
          height={941}
          priority
          unoptimized
        />
        <figcaption>Contribution totals as of 12 October 2026.</figcaption>
      </figure>
      <div className={styles.layout}>
        <aside>
          <nav aria-label="Article contents" className={styles.contents}>
            <p>In this article</p>
            <ol>
              {headings.map((heading) => (
                <li key={heading}><a href={`#${slug(heading)}`}>{heading}</a></li>
              ))}
            </ol>
          </nav>
        </aside>
        <div className={styles.prose}>
          {body.map((block, index) =>
            block.startsWith("## ") ? (
              <h2 key={index} id={slug(block.slice(3))}>{block.slice(3)}</h2>
            ) : (
              <MDXRemote key={index} source={block} />
            ),
          )}
          <Link className={styles.back} href="/blog/series/open-source-everyday">
            ← Back to Open Source Everyday
          </Link>
        </div>
      </div>
    </article>
  );
}
