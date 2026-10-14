import type { Metadata } from "next";
import Image from "next/image";
import CrochetBrief from "@/components/brief/CrochetBrief";
import { getBriefPageConfig } from "@/lib/brief/config";
import { SITE } from "@/lib/site";
import styles from "@/components/brief/brief.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Crochet website brief",
  description: "Share the details and files for your crochet website with Kemma.",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function CrochetBriefPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string | string[] }>;
}) {
  const params = await searchParams;
  const config = getBriefPageConfig();
  const invite = typeof params.invite === "string" ? params.invite : config.previewInvite;
  if (!invite) {
    return <div className={styles.shell}><div className="project-link"><Image src="/brief/brand/kemma-logo.png" alt={SITE.name} width={118} height={88}/><h1>Open the project link from Kemma.</h1><p>This brief uses your project’s private link. If you need it again, <a href={`https://wa.me/${SITE.whatsapp}`}>contact Kemma</a>.</p></div></div>;
  }
  return <CrochetBrief key={invite} invite={invite} preview={config.preview} contactHref={`https://wa.me/${SITE.whatsapp}`}/>;
}
