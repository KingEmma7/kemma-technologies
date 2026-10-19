import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { MDXRemote } from "next-mdx-remote/rsc";
import { pageMetadata } from "@/lib/seo";
import styles from "./page.module.css";

const title = "Six weeks of open-source contribution: 38 PRs, 31 merged";
const cover = "/editorial/open-source-six-weeks-cover.png";

export const metadata: Metadata = {
  ...pageMetadata({
    title,
    description:
      "Emmanuel Tagbor reviews six weeks of open-source work: 38 pull requests, 31 merged, the tests and decisions behind them, and what maintainers changed.",
    path: "/blog/six-weeks-of-open-source-contribution",
    image: cover,
    type: "article",
  }),
  authors: [{ name: "Emmanuel Tagbor" }],
};

const slug = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim().replace(/ +/g, "-");

function ArticleTable({ block, caption }: { block: string; caption: string }) {
  const rows = block.split("\n").map((row) =>
    row.split("|").slice(1, -1).map((cell) => cell.trim()),
  );

  return (
    <div className={styles.tableWrap} role="region" aria-label={`${caption}; scroll horizontally for all columns`} tabIndex={0}>
      <table>
        <caption>{caption}</caption>
        <thead><tr>{rows[0].map((cell) => <th scope="col" key={cell}>{cell}</th>)}</tr></thead>
        <tbody>
          {rows.slice(2).map((row, index) => (
            <tr key={index}>
              {row.map((cell, column) => column === 0
                ? <th scope="row" key={column}>{cell}</th>
                : <td key={column}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function SixWeeksArticle() {
  const source = await readFile(
    path.join(process.cwd(), "content/articles/six-weeks-of-open-source-contribution.md"),
    "utf8",
  );
  const [titleBlock, byline, ...body] = source.trim().split(/\n\n/);
  const headings = body.filter((block) => block.startsWith("## ")).map((block) => block.slice(3));
  let tableIndex = 0;

  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <nav className={styles.series} aria-label="Breadcrumb">
          <Link href="/blog">Blog</Link> / <Link href="/blog/series/open-source-everyday">Open Source Everyday</Link> / Six-week review
        </nav>
        <h1>{titleBlock.replace(/^# /, "")}</h1>
        <div className={styles.byline}><MDXRemote source={byline} /></div>
      </header>
      <figure className={styles.cover}>
        <Image
          src={cover}
          alt="Open Source Everyday. Six weeks in open source: 38 pull requests submitted, 31 merged, an 81.6% merge rate across 29 repositories. Original portrait of Emmanuel Tagbor."
          width={1672}
          height={941}
          priority
          unoptimized
        />
        <figcaption>Submissions 7 September–18 October; outcomes checked 19 October 2026.</figcaption>
      </figure>
      <div className={styles.layout}>
        <aside>
          <nav aria-label="Article contents" className={styles.contents}>
            <p>In this article</p>
            <ol>{headings.map((heading) => <li key={heading}><a href={`#${slug(heading)}`}>{heading}</a></li>)}</ol>
          </nav>
        </aside>
        <div className={styles.prose}>
          {body.map((block, index) => {
            if (block.startsWith("## ")) return <h2 key={index} id={slug(block.slice(3))}>{block.slice(3)}</h2>;
            if (block.startsWith("|")) {
              const caption = tableIndex++ === 0 ? "Six-week contribution record as of 19 October 2026" : "Weekly submissions, 7 September–18 October 2026";
              return <ArticleTable key={index} block={block} caption={caption} />;
            }
            return <MDXRemote key={index} source={block} />;
          })}
          <Link className={styles.back} href="/blog/series/open-source-everyday">← Back to Open Source Everyday</Link>
        </div>
      </div>
    </article>
  );
}
