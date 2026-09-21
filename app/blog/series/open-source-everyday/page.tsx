import { pageMetadata } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { ProcessExplorer } from "@/components/editorial/ProcessExplorer";
import { articles, openSourceSeries } from "@/lib/editorial";
import styles from "../../editorial.module.css";
export const metadata=pageMetadata({title:"Open Source Everyday",description:"A series by Emmanuel Tagbor about AI-assisted contributions, testing and maintainer feedback.",path:"/blog/series/open-source-everyday"});
export default function SeriesPage(){
  return <div className={styles.page}>
    <nav className={styles.crumb} aria-label="Breadcrumb"><Link href="/blog">Blog</Link><span aria-hidden="true">/</span><span>Open Source Everyday</span></nav>
    <header className={styles.hero}><div><p className={styles.eyebrow}>A series by Emmanuel Tagbor</p><h1>Open Source<span>Everyday.</span></h1></div><div><p className={styles.intro}>{openSourceSeries.description}</p><a className={styles.heroLink} href="#articles">Start with the first two weeks <ArrowDown aria-hidden="true" size={16}/></a></div></header>
    <section aria-labelledby="process-title"><div className={styles.sectionHeading}><h2 id="process-title">From a useful problem<br/>to a contribution.</h2><p>Explore the four stages. Each one has a question worth answering.</p></div><ProcessExplorer/></section>
    <section id="articles" aria-labelledby="articles-title"><div className={styles.sectionHeading}><h2 id="articles-title">The series, from the beginning.</h2><p>{articles.length} {articles.length === 1 ? "article" : "articles"} · Start here</p></div>{articles.map((article,index)=><Link key={article.href} href={article.href} className={styles.feature}><Image src={article.image} alt="Open Source Everyday cover: investigate, implement, verify and follow through." width={1672} height={941} unoptimized/><div><p className={styles.eyebrow}>Article {article.number} / {index === 0 ? "The starting point" : "A closer look"}</p><h3>{article.title}</h3><p>{article.description}</p><p className={styles.record}>{article.recordDate}</p><span className={styles.read}>Read the article <ArrowUpRight aria-hidden="true" size={18}/></span></div></Link>)}</section>
    <section className={styles.outlook} aria-label="About the series"><details><summary>Who does what <span aria-hidden="true">+</span></summary><p>I choose the work, make scope decisions and review results. Codex assists with investigation, implementation and validation. Maintainers decide what belongs in their projects.</p></details><details><summary>Where the series goes next <span aria-hidden="true">+</span></summary><p>Future articles will follow individual contributions: the problem, the decisions, the evidence and what maintainers changed. This page will collect them as the series grows.</p></details></section>
  </div>;
}
