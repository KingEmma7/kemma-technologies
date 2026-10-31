import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { MDXRemote } from "next-mdx-remote/rsc";
import { pageMetadata } from "@/lib/seo";
import styles from "./page.module.css";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "The best feedback I’ve received so far",
    description: "Emmanuel Tagbor on maintainer feedback about tests, boundaries and honest validation.",
    path: "/blog/the-best-feedback-ive-received-so-far",
    type: "article",
      image: "/editorial/open-source-week8-maintainer-feedback.png",
  }),
  authors: [{ name: "Emmanuel Tagbor" }],
};

const examples = [
  { name: "MiniSearch", blocks: [3, 4, 5, 6], quote: 3 },
  { name: "devReady", blocks: [7, 8, 9, 10, 11], quote: 7 },
  { name: "BarakoCMS", blocks: [12, 13, 14, 15, 16], quote: 12 },
  { name: "Toolism", blocks: [17, 18, 19, 20, 21, 22], quote: 17 },
  { name: "Reviewer", blocks: [23, 24, 25, 26], quote: 23 },
  { name: "Toolbelt", blocks: [27, 28, 29, 30], quote: 27 },
  { name: "csv-faker-generator", blocks: [31, 32, 33, 34], quote: 31 },
] as const;

export default async function MaintainerFeedbackArticle() {
  const source = await readFile(
    path.join(process.cwd(), "content/articles/the-best-feedback-ive-received-so-far.md"),
    "utf8",
  );
  const blocks = source.trim().split(/\n\n/);
  if (blocks.length !== 37) throw new Error("Maintainer feedback draft structure changed");

  return (
    <article className={styles.article}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/blog">Blog</Link>
        <span aria-hidden="true">/</span>
        <Link href="/blog/series/open-source-everyday">Open Source Everyday</Link>
      </nav>

      <header className={styles.header}>
        <h1>{blocks[0].replace(/^# /, "")}</h1>
        <div className={styles.lead}><MDXRemote source={blocks[1]} /></div>
        <p className={styles.author}>Emmanuel Tagbor · Open Source Everyday</p>
      </header>

      <figure className={styles.cover}>
        <Image src="/editorial/open-source-week8-maintainer-feedback.png" alt="Open Source Everyday, Week 8: The best feedback I’ve received so far. Maintainers valued tests that catch real bugs, clear boundaries around a change, and honest reporting of verification limits. As of 31 October 2026: 48 PRs merged. A MiniSearch maintainer says, “That is the part most pull requests skip, so thank you for getting it right.” The MiniSearch repository had 606 GitHub stars on 31 October 2026. A small original portrait of Emmanuel Tagbor appears at top right. AI-assisted workflow." width={1672} height={941} priority unoptimized />
        <figcaption>Contribution totals as of 31 October 2026.</figcaption>
      </figure>

      <div className={styles.body}>
        <div className={styles.intro}><MDXRemote source={blocks[2]} /></div>

        <div className={styles.examples}>
          {examples.map((example) => (
            <section className={styles.example} key={example.name} aria-labelledby={`example-${example.name.toLowerCase()}`}>
              <h2 id={`example-${example.name.toLowerCase()}`}>{example.name}</h2>
              <div className={styles.exampleBody}>
                {example.blocks.map((index) => index === example.quote
                  ? <blockquote key={index} className={styles.quote}><MDXRemote source={blocks[index]} /></blockquote>
                  : <div key={index} className={index === example.blocks.at(-1) ? styles.sourceLink : undefined}><MDXRemote source={blocks[index]} /></div>)}
              </div>
            </section>
          ))}
        </div>

        <section className={styles.closing} aria-labelledby="closing-title">
          <h2 id="closing-title">What I’m taking forward</h2>
          <div><MDXRemote source={blocks[35]} /><MDXRemote source={blocks[36]} /></div>
        </section>
        <Link className={styles.back} href="/blog/series/open-source-everyday">← Open Source Everyday</Link>
      </div>
    </article>
  );
}
