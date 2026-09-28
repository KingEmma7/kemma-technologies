import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { MDXRemote } from "next-mdx-remote/rsc";
import { pageMetadata } from "@/lib/seo";
import styles from "../two-weeks-of-open-source-everyday/page.module.css";

export const metadata: Metadata = {
  ...pageMetadata({ title: "Open Source Everyday: testing the behaviour behind the fix", description: "Emmanuel Tagbor on testing real user behaviour behind open-source fixes and learning from maintainer review, 21–27 September 2026.", path: "/blog/testing-the-behaviour-behind-the-fix", image: "/editorial/open-source-weekly-2026-09-21-27-v6.png", type: "article" }),
  authors: [{ name: "Emmanuel Tagbor" }],
};

const headingId = (text: string) => text.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim().replace(/ +/g, "-");

export default async function WeeklyArticle() {
  const source = await readFile(path.join(process.cwd(), "content/articles/testing-the-behaviour-behind-the-fix.md"), "utf8");
  const [titleBlock, byline, ...body] = source.trim().split(/\n\n/);
  const title = titleBlock.replace(/^# /, "");
  const headings = body.filter((block) => block.startsWith("## ")).map((block) => block.slice(3));

  return <article className={styles.article}>
    <header className={styles.header}>
      <nav className={styles.series} aria-label="Breadcrumb"><Link href="/blog">Blog</Link> / <Link href="/blog/series/open-source-everyday">Open Source Everyday</Link> / Article 02</nav>
      <h1>{title}</h1>
      <p className={styles.byline}>{byline}</p>
    </header>
    <figure className={styles.cover}>
      <Image src="/editorial/open-source-weekly-2026-09-21-27-v6.png" alt="Open Source Everyday, Week 3: Building, learning and contributing with AI. Codex and Cursor (Grok Bot). Total through 27 September 2026: 18 PRs submitted and 14 merged." width={1672} height={941} priority unoptimized />
      <figcaption>Weekly record checked 28 September 2026.</figcaption>
    </figure>
    <div className={styles.layout}>
      <aside><nav aria-label="Article contents" className={styles.contents}><p>In this article</p><ol>{headings.map((heading) => <li key={heading}><a href={`#${headingId(heading)}`}>{heading}</a></li>)}</ol></nav></aside>
      <div className={styles.prose}>
        {body.map((block, index) => {
          if (block.startsWith("|")) {
            const rows = block.split("\n").map((row) => row.split("|").slice(1, -1).map((cell) => cell.trim()));
            return <div key={index} className={styles.tableWrap} role="region" aria-label="Weekly contribution record, scroll horizontally for all columns" tabIndex={0}><table><caption>Weekly contribution record · status and stars checked 28 September 2026</caption><thead><tr>{rows[0].map((cell) => <th scope="col" key={cell}>{cell}</th>)}</tr></thead><tbody>{rows.slice(2).map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => cellIndex === 0 ? <th scope="row" key={cellIndex}><MDXRemote source={cell} /></th> : <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>;
          }
          if (block.startsWith("## ")) return <h2 key={index} id={headingId(block.slice(3))}>{block.slice(3)}</h2>;
          if (block.startsWith("### ")) return <h3 key={index} id={headingId(block.slice(4))}>{block.slice(4)}</h3>;
          return <MDXRemote key={index} source={block} />;
        })}
        <Link className={styles.back} href="/blog/series/open-source-everyday">← Back to Open Source Everyday</Link><br/><a className={styles.back} href="#main">Back to the top ↑</a>
      </div>
    </div>
  </article>;
}
