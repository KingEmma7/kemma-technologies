/** Single source of truth for site-wide contact info, social links, and nav. */
export const SITE = {
  name: "Kemma Technologies",
  tagline: "Engineering software, web platforms, and intelligent digital solutions for modern businesses.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://kemma-technologies.vercel.app",
  email: "etagbor@gmail.com",
  location: "Accra, Ghana",
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
