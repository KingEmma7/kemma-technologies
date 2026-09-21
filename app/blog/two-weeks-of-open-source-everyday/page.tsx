import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { MDXRemote } from "next-mdx-remote/rsc";
import styles from "./page.module.css";

export const metadata: Metadata = {
  ...pageMetadata({ title: "Two weeks of Open Source Everyday", description: "Emmanuel Tagbor on AI-assisted open-source contributions, regression tests and lessons from maintainer review.", path: "/blog/two-weeks-of-open-source-everyday", image: "/editorial/open-source-everyday.png", type: "article" }),
  authors: [{ name: "Emmanuel Tagbor" }],
};
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim().replace(/ +/g, "-");

export default async function ArticlePreview() {
  const source = await readFile(path.join(process.cwd(), "content/articles/open-source-everyday.md"), "utf8");
  const [titleBlock, byline, ...body] = source.trim().split(/\n\n/);
  const title = titleBlock.replace(/^# /, "");
  const headings = body.filter((block) => block.startsWith("## ")).map((block) => block.slice(3));
  return <article className={styles.article}>
    <header className={styles.header}>
      <nav className={styles.series} aria-label="Breadcrumb"><Link href="/blog">Blog</Link> / <Link href="/blog/series/open-source-everyday">Open Source Everyday</Link> / Article 01</nav>
      <h1>{title}</h1>
      <p className={styles.byline}>{byline}</p>
    </header>
    <figure className={styles.cover}>
      <Image src="/editorial/open-source-everyday.png" alt="Open Source Everyday by Emmanuel Tagbor. Investigate, implement, verify and follow through. Twelve pull requests submitted and eleven merged as of 21 September 2026, with Emmanuel’s portrait." width={1672} height={941} priority unoptimized />
      <figcaption>Contribution counts reflect the 21 September 2026 record.</figcaption>
    </figure>
    <div className={styles.layout}>
      <aside><nav aria-label="Article contents" className={styles.contents}><p>In this article</p><ol>{headings.map((heading) => <li key={heading}><a href={`#${slug(heading)}`}>{heading}</a></li>)}</ol></nav></aside>
      <div className={styles.prose}>
        {body.map((block, index) => {
          if (block.startsWith("|")) {
            const rows = block.split("\n").map((row) => row.split("|").slice(1,-1).map((cell) => cell.trim()));
            return <div key={index} className={styles.tableWrap} role="region" aria-label="Contribution record, scroll horizontally for all columns" tabIndex={0}><table><caption>Contribution record · status and stars checked 21 September 2026</caption><thead><tr>{rows[0].map((cell) => <th scope="col" key={cell}>{cell}</th>)}</tr></thead><tbody>{rows.slice(2).map((row, i) => <tr key={i}>{row.map((cell, j) => j === 0 ? <th scope="row" key={j}><MDXRemote source={cell} /></th> : <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>;
          }
          if (block.startsWith("## ")) return <h2 key={index} id={slug(block.slice(3))}>{block.slice(3)}</h2>;
          if (block.startsWith("### ")) return <h3 key={index} id={slug(block.slice(4))}>{block.slice(4)}</h3>;
          return <MDXRemote key={index} source={block} />;
        })}
        <Link className={styles.back} href="/blog/series/open-source-everyday">← Back to Open Source Everyday</Link><br/><a className={styles.back} href="#main">Back to the top ↑</a>
      </div>
    </div>
  </article>;
}
