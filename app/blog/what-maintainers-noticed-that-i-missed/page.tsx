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
    title: "What maintainers noticed that I missed",
    description: "Emmanuel Tagbor on what maintainer feedback taught him about tests, scope and focused open-source contributions.",
    path: "/blog/what-maintainers-noticed-that-i-missed",
    image: "/editorial/open-source-week4-cover.png",
    type: "article",
  }),
  authors: [{ name: "Emmanuel Tagbor" }],
};

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim().replace(/ +/g, "-");

export default async function WeekFourDraft() {
  const source = await readFile(path.join(process.cwd(), "content/articles/what-maintainers-noticed-that-i-missed.md"), "utf8");
  const [titleBlock, byline, ...body] = source.trim().split(/\n\n/);
  const headings = body.filter((block) => block.startsWith("## ")).map((block) => block.slice(3));

  return <article className={styles.article}>
    <header className={styles.header}>
      <nav className={styles.series} aria-label="Breadcrumb"><Link href="/blog">Blog</Link> / <Link href="/blog/series/open-source-everyday">Open Source Everyday</Link> / Week 4</nav>
      <h1>{titleBlock.replace(/^# /, "")}</h1>
      <div className={styles.byline}><MDXRemote source={byline} /></div>
    </header>
    <figure className={styles.cover}>
      <Image src="/editorial/open-source-week4-cover.png" alt="Open Source Everyday Week 4: What maintainers noticed that I missed. Maintainer feedback helped me question my tests, check the full scope and keep changes focused. Totals as of 4 October 2026: 25 PRs submitted, 20 merged. Emmanuel Tagbor's original portrait in the top right." width={1672} height={941} priority unoptimized />
      <figcaption>Contribution totals as of 4 October 2026.</figcaption>
    </figure>
    <div className={styles.layout}>
      <aside><nav aria-label="Article contents" className={styles.contents}><p>In this article</p><ol>{headings.map((heading) => <li key={heading}><a href={`#${slug(heading)}`}>{heading}</a></li>)}</ol></nav></aside>
      <div className={styles.prose}>
        {body.map((block, index) => block.startsWith("## ")
          ? <h2 key={index} id={slug(block.slice(3))}>{block.slice(3)}</h2>
          : <MDXRemote key={index} source={block} />)}
        <Link className={styles.back} href="/blog/series/open-source-everyday">← Back to Open Source Everyday</Link>
      </div>
    </div>
  </article>;
}
