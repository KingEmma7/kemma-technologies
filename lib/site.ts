/** Single source of truth for site-wide contact info, social links, and nav. */
export const SITE = {
  name: "Kemma Technologies",
  tagline: "Engineering software, web platforms, and intelligent digital solutions for modern businesses.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://kemmatech.com",
  email: "hello@kemmatech.com",
  location: "Accra, Ghana",
  social: {
    linkedin: "https://linkedin.com/company/kemma-technologies",
    twitter: "https://twitter.com/kemmatech",
  },
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/work", label: "Work" },
  { href: "/contact", label: "Contact" },
] as const;
