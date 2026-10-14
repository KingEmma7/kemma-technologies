import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CrochetBrief from "@/components/brief/CrochetBrief";
import { getBriefPageConfig } from "@/lib/brief/config";
import { inviteForShortCode } from "@/lib/brief/short-links";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Crochet website brief",
  description: "Share the details and files for your crochet website with Kemma.",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function ShortBriefPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const invite = inviteForShortCode(code);
  if (!invite) notFound();
  return <CrochetBrief key={invite} invite={invite} preview={getBriefPageConfig().preview} contactHref={`https://wa.me/${SITE.whatsapp}`}/>;
}
