# Kemma Technologies Website

Marketing and portfolio site for [Kemma Technologies](https://www.kemmatechnologies.com) — a product and software engineering company building digital platforms, web products and business systems. Based in Accra, working with organisations anywhere.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS v4 with custom design tokens |
| Animation | Framer Motion + Lenis |
| 3D / WebGL | Three.js + react-three-fiber |
| Smooth scroll | Lenis |
| Content | Local MDX files with validated YAML frontmatter (`content/projects/`) |
| Forms | react-hook-form + Zod |
| Email | Resend |
| Testing | Vitest + production build regression checks |
| Deployment | Vercel |

## Design tokens

| Token | Value | Usage |
|---|---|---|
| Gold | `#C89B3C` | Primary brand accent, CTAs, highlights |
| Silver | `#C8C8C8` | Secondary text, borders |
| Dark bg | `#040406` | Default background |
| Light bg | `#F5F5F5` | Alternating panels |
| Accent | `#007B94` | Tech/interactive accent |
| Accent text | `#35A7BC` | Accessible accent on dark surfaces |
| Error | `#D96868` | Form validation on dark surfaces |

## Getting started

```bash
# 1. Install dependencies from the lockfile
npm ci

# 2. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local and add your RESEND_API_KEY

# 3. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/
  page.tsx              Home
  about/page.tsx        About
  services/page.tsx     Services
  work/page.tsx         Portfolio grid
  work/[slug]/page.tsx  Case study
  contact/page.tsx      Contact
  api/contact/route.ts  Resend email API

components/
  hero/       WebGL hero (react-three-fiber particle field)
  layout/     Navigation, Footer, SmoothScroll, PageTransition
  sections/   Page-level sections
  ui/         Primitives: Button, Card, Input, Section, Reveal, Container

content/
  projects/   MDX case studies with frontmatter

lib/
  projects.ts       MDX loader utilities
  contact-email.ts  Safe email-template helpers

tests/              Contact and content regression tests
scripts/            Build-output checks
```

## Adding a project / case study

Create a new file at `content/projects/your-slug.mdx`:

```mdx
---
title: "Project Title"
summary: "One-line description shown in the grid."
cover: "/images/your-cover.jpg"
tags: ["Web Platform", "AI"]
role: "Full-Stack Development"
client: "Client Name"
year: 2025
featured: true
liveUrl: "https://example.com"       # optional — only if the product is really live
screenshots: ["/images/shot-1.jpg"]  # optional — real screenshots only
---

## Overview

Your narrative here using Markdown...
```

Then add your cover image to `public/images/`.

**Important:** `liveUrl`, `screenshots`, and any outcome/results claims in the body
(sales numbers, usage stats, "in active use", etc.) must be real and verified —
ideally approved by the client — before publishing. Never fabricate metrics or
screenshots to make a project look more impressive.

## Logo assets

The official Kemma Technologies logo lives at `public/logo.png` and is used as the full lockup (mark + wordmark) in `Navigation.tsx` and `Footer.tsx`.

- `app/icon.png` — browser tab favicon
- `app/apple-icon.png` — iOS home screen icon
- `app/opengraph-image.tsx` — generated 1200×630 social share preview

To update the logo, replace the public logo and icon assets, then re-run `npm run build`.

## Contact form

The `/api/contact` route sends emails via [Resend](https://resend.com). Add your `RESEND_API_KEY` to `.env.local`.

- **Development:** if the key is missing, the server records only a configuration warning and returns success, so the form can be tested locally without logging personal enquiry data.
- **Production:** if the key is missing, the API returns a `500` error instead of silently succeeding — a misconfigured deployment will surface the error rather than losing enquiries.

The recipient is `SITE.email` (`hello@kemmatechnologies.com`). Set
`CONTACT_FROM_EMAIL` to a sender on a domain verified in Resend. The
`onboarding@resend.dev` fallback is for onboarding only and must not be treated
as proof that production delivery works.

The API accepts JSON only, limits the body to 16 KiB, validates maximum field
lengths, rejects unknown fields and keeps a honeypot as a low-cost first signal.
Production rate limiting belongs at the Vercel Firewall layer; follow
`docs/vercel-firewall.md` and roll the rule out in log mode before enforcement.

## Verification

```bash
npm run check
npm audit --audit-level=high
```

`npm run check` runs lint, TypeScript, Vitest, the production build and the
no-JavaScript visibility regression check. The same gate runs in GitHub Actions.

## Performance notes

- WebGL hero is dynamically imported (`next/dynamic`, `ssr: false`) — zero JS impact for bots and crawlers.
- `@react-three/fiber` canvas uses `dpr={[1, 1.5]}` cap to protect lower-powered devices.
- All scroll-triggered animations respect `prefers-reduced-motion`.
- Images use `next/image` with avif + webp format priority.

## Disabling heavy animations

To force the static gradient fallback for the WebGL hero (e.g. for testing), disable JavaScript or set the `prefers-reduced-motion` browser flag.

## Deployment

```bash
# Preview deploy
vercel

# Production deploy
vercel --prod
```

Environment variables to configure in Vercel dashboard:
- `RESEND_API_KEY` — required in production; the contact form returns an error without it.
- `NEXT_PUBLIC_SITE_URL` — the canonical deployed URL, used for metadata,
  sitemap.xml, robots.txt and social preview links. Production currently uses
  `https://www.kemmatechnologies.com`; the apex redirects there.
- `CONTACT_FROM_EMAIL` — branded sender on a Resend-verified domain.
