import type { Metadata } from "next";
import { SITE } from "./site";

/**
 * Absolute URL for a site-relative path. Use for canonicals, OG URLs and
 * anything else that must not be relative.
 */
export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE.url).toString();
}

interface PageMetaInput {
  title: string;
  description: string;
  /** Site-relative path, e.g. "/work". Used for the canonical + OG URL. */
  path: string;
  /** Site-relative OG image path. Defaults to the site-wide card. */
  image?: string;
  type?: "website" | "article";
}

/**
 * Builds per-page metadata with a canonical URL and matching Open Graph /
 * Twitter tags. Every route should use this rather than hand-rolling metadata,
 * so canonicals can never silently go missing.
 */
export function pageMetadata({
  title,
  description,
  path,
  image = "/opengraph-image.png",
  type = "website",
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE.name,
      type,
      locale: "en_GB",
      images: [{ url: absoluteUrl(image), alt: `${SITE.name} — ${title}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(image)],
    },
  };
}

/**
 * Serialises a JSON-LD object for use in a <script type="application/ld+json">.
 *
 * `<` is escaped to its unicode form because JSON.stringify does not sanitise
 * strings for embedding in HTML — per the Next.js JSON-LD guide.
 */
export function jsonLdScript(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * Organization schema.
 *
 * Deliberately omits employee counts, founding date, awards, ratings and
 * multiple locations — none of those are verifiable for Kemma today, and
 * fabricating them in structured data is exactly the kind of claim search
 * engines penalise.
 */
export function organizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE.url}/#organization`,
    name: SITE.name,
    url: SITE.url,
    email: SITE.email,
    description: SITE.description,
    logo: absoluteUrl("/logo.png"),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Accra",
      addressCountry: "GH",
    },
    sameAs: [SITE.social.linkedin, SITE.social.twitter],
  };
}

export function websiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    publisher: { "@id": `${SITE.url}/#organization` },
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

interface CreativeWorkInput {
  title: string;
  summary: string;
  slug: string;
  year?: number;
  client?: string;
  image?: string;
}

/** Case-study schema. `creator` is Kemma; `client` maps to the commissioning org. */
export function creativeWorkJsonLd({
  title,
  summary,
  slug,
  year,
  client,
  image,
}: CreativeWorkInput): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: title,
    description: summary,
    url: absoluteUrl(`/work/${slug}`),
    creator: { "@id": `${SITE.url}/#organization` },
    ...(year ? { dateCreated: String(year) } : {}),
    ...(client ? { sourceOrganization: { "@type": "Organization", name: client } } : {}),
    ...(image ? { image: absoluteUrl(image) } : {}),
  };
}
