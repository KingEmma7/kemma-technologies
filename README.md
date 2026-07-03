# Kemma Technologies Website

Modern, animated marketing site for [Kemma Technologies](https://kemmatech.com) — a Ghana-based technology firm specialising in software engineering, web platforms and intelligent digital solutions.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS v4 with custom design tokens |
| Animation | Framer Motion + GSAP (ScrollTrigger) |
| 3D / WebGL | Three.js + react-three-fiber + drei |
| Smooth scroll | Lenis |
| Content | Local MDX files (`content/projects/`) |
| Forms | react-hook-form + Zod |
| Email | Resend |
| Deployment | Vercel |

## Design tokens

| Token | Value | Usage |
|---|---|---|
| Gold | `#C89B3C` | Primary brand accent, CTAs, highlights |
| Silver | `#C8C8C8` | Secondary text, borders |
| Dark bg | `#040406` | Default background |
| Light bg | `#F5F5F5` | Alternating panels |
| Accent | `#007B94` | Tech/interactive accent |

## Getting started

```bash
# 1. Install dependencies
npm install

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
  projects.ts  MDX loader utilities
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
---

## Overview

Your narrative here using Markdown...
```

Then add your cover image to `public/images/`.

## Logo assets

The official Kemma Technologies logo lives at `public/logo.png` and is used as the full lockup (mark + wordmark) in `Navigation.tsx` and `Footer.tsx`. It's also copied into the App Router metadata slots for favicons and social previews:

- `app/icon.png` — browser tab favicon
- `app/apple-icon.png` — iOS home screen icon
- `app/opengraph-image.png` / `app/twitter-image.png` — social share previews

To update the logo, replace all five files with the new asset (same filenames) and re-run `npm run build`.

## Contact form

The `/api/contact` route sends emails via [Resend](https://resend.com). Add your `RESEND_API_KEY` to `.env.local`. Without the key, submissions are safely logged to the server console — no errors thrown.

Update the `to` address and `from` address in `app/api/contact/route.ts` to match your verified Resend domain.

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
- `RESEND_API_KEY`
