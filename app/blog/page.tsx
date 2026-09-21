import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { articles, openSourceSeries } from "@/lib/editorial";
import styles from "./editorial.module.css";
export const metadata=pageMetadata({title:"Blog",description:"Engineering decisions, practical lessons and evidence from the people building Kemma.",path:"/blog"});
export default function BlogPage(){
  return <div className={styles.page}><div className={styles.crumb}><span>Blog</span></div><header className={styles.hero}><div><p className={styles.eyebrow}>From the people building Kemma</p><h1>Notes from<span>the work.</span></h1></div><p className={styles.intro}>Engineering decisions, practical lessons and the evidence behind the work. Starting with Open Source Everyday, by Emmanuel Tagbor.</p></header><Link className={styles.seriesCard} href={openSourceSeries.href}><div><p className={styles.eyebrow}>Explore the series / {articles.length} {articles.length === 1 ? "article" : "articles"}</p><h2>{openSourceSeries.title}</h2></div><div><p>{openSourceSeries.description}</p><span className={styles.read}>Explore Open Source Everyday <ArrowUpRight aria-hidden="true" size={18}/></span></div></Link></div>;
}
