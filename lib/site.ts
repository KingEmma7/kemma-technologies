/**
 * Single source of truth for brand, domain, contact info, social links and nav.
 *
 * Anything that needs the production URL or a contact address must read it from
 * here — never hard-code `kemmatechnologies.com` or an email address in a
 * component, a route handler or a metadata block.
 */
export const SITE = {
  name: "Kemma Technologies",

  /** Bare domain, for display and for building canonical hosts. */
  domain: "kemmatechnologies.com",

  /**
   * Canonical production origin. Drives metadataBase, canonical URLs, sitemap,
   * robots and social-preview URLs.
   *
   * Pick one host and stay on it. Production currently serves `www` and
   * permanently redirects the apex, so metadata and discovery URLs use `www`
   * as well.
   *
   * Override per-environment with NEXT_PUBLIC_SITE_URL — preview deploys should
   * set it to their own URL so crawlers never see a preview emitting canonicals
   * that point at production.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.kemmatechnologies.com",

  /** Enquiries inbox. Requires the domain to be verified in Resend. */
  email: "hello@kemmatechnologies.com",

  /** Privacy and support contact published for ARS Pocket. */
  arsPocketPrivacyEmail: "emmanuel@kemmatechnologies.com",

  location: "Accra, Ghana",

  /**
   * Positioning statement. Geography is context, not a limit — Kemma is based
   * in Accra and works with organisations anywhere.
   */
  description:
    "Kemma Technologies designs and engineers digital platforms, web products and business systems for ambitious organisations worldwide.",

  /** Short form for the footer and compact surfaces. */
  tagline: "Digital platforms, web products and business systems. Based in Accra. Building for organisations anywhere.",

  // E.164 digits only (no "+", no spaces) — used to build wa.me links.
  whatsapp: "233545559070",

  social: {
    linkedin: "https://www.linkedin.com/company/kemma-technologies",
    twitter: "https://x.com/kemmatechnology",
  },
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/work", label: "Work" },
  { href: "/contact", label: "Contact" },
] as const;
