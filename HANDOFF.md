# Kemma Technologies — Repositioning Handoff

Continuation notes for the strategic repositioning and professional upgrade of
this site. Written at the end of **Phase 4**. Read this before changing code.

> `AUDIT_REPORT.md` in this repo is **stale** (dated 2026-07-01). It still
> describes the testimonials as fictional, which was fixed two commits later,
> and references a project (`agrologix-platform`) that no longer exists. Treat
> this file as current, not that one.

---

## Ground rules

1. **This is not the Next.js you know.** Per `AGENTS.md`, read the relevant
   guide under `node_modules/next/dist/docs/` before writing code. Version is
   Next 16.2.9 (Turbopack default, async request APIs, `ssr: false` banned in
   Server Components, `next lint` removed).
2. **Content integrity is mandatory.** Never fabricate projects, metrics,
   clients, team members, partnerships, awards or traction. Where evidence is
   missing, use factual implementation outcomes instead of invented business
   numbers. Existing testimonials are verified and approved — do not reword them.
3. **Positioning:** Kemma is based in Accra and builds for organisations
   *anywhere*. Geography is context, never a limit. Do not re-frame the company
   as Africa-focused, as a founder's personal brand, or as a website agency.
4. Repo layout is flat: `app/`, `components/`, `lib/`. **There is no `src/`.**

---

## Repo facts

- Repo: `KingEmma7/kemma-technologies`, branch `master`
- Stack: Next 16.2.9 App Router, React 19.2.4, TS strict, Tailwind v4,
  Framer Motion, Lenis, react-three-fiber, next-mdx-remote, Zod, Resend
- Verify with: `npm run lint`, `npx tsc --noEmit`, `npm run build`
  (all three pass as of end of Phase 2)

---

## Phase 1 — Audit findings (complete)

Ordered by damage. Items marked ✅ were fixed in Phase 2.

1. ✅ **Site rendered blank without JavaScript.** `PageTransition` wrapped
   `<main>` in `opacity: 0`, and `Reveal` + the hero did the same per-element.
   The served HTML was effectively empty until hydration.
2. **No project imagery exists.** `public/` has only `logo.png`, three unused
   Next starter SVGs and `emmanuel-tagbor.png`. No project sets `cover`, so
   every card renders a placeholder "K". `screenshots` exists in the Zod schema
   but is **never rendered anywhere** — a dead field. Still outstanding.
3. ✅ **Unsupported capability claims.** `lib/services.ts` advertised
   Kubernetes, Docker, AWS, Go, Redis, microservices, PyTorch, TensorFlow,
   LangChain, computer vision, MLOps — zero portfolio evidence for any of it.
4. **Generic, founder-anchored positioning.** Hero was "We Engineer Digital
   Excellence"; the same sentence was duplicated across tagline, metadata, OG
   and footer. About page has *two* founder sections. Partially fixed (hero +
   metadata done); About still to do in Phase 6.
5. ✅ **Dead dependencies.** `@react-three/drei` imported nowhere; GSAP +
   ScrollTrigger loaded on every route purely to call `lenis.raf()`.
6. ✅ **No SEO foundations.** Zero JSON-LD, zero canonicals, no per-page OG,
   no breadcrumbs, no sitemap `lastModified`.
7. ✅ **Personal/temporary identity.** `etagbor@gmail.com` hardcoded in the
   contact route; `metadataBase` pointing at the Vercel subdomain.
8. ✅ **Emoji used as icons** (13 of them) — banned by the brief.
9. **Content-integrity gap:** `constract.mdx` claims "live, in-production
   marketplace processing real customer orders" but has **no `liveUrl`**.
   Outstanding — needs the URL or the claim softened.
10. Other a11y gaps: duplicate desktop nav (inline links *and* hamburger),
    40×40 hamburger touch target (<44), `#888` on light panels failing AA at
    3.25:1 (tokens added, call sites in `FounderSection` still to update),
    "24-hour response" SLA promised in three places.

**Worth preserving:** nav focus-trap/Escape handling, `ButtonLink` vs `Button`
separation, Zod-validated MDX with graceful skip, contact API's HTML escaping +
honeypot + Resend error checking, security headers, error boundaries, the
`Section`/`Container`/`Card` primitives, and the gold-on-near-black look.

---

## Phase 2 — Foundation (complete)

### Conventions established — follow these

**The no-JS contract.** Nothing may ship `opacity: 0` in server-rendered HTML.
Entrances are CSS, scoped to `html.js`, which a blocking inline script in
`app/layout.tsx` sets before first paint.

- Scroll reveals: `<Reveal>` sets `data-reveal`; CSS in `globals.css` hides it
  only under `.js`. It toggles a DOM attribute, **not React state** (avoids a
  re-render per reveal and satisfies `react-hooks/set-state-in-effect`).
- Above-the-fold: add `className="enter"` and optionally
  `style={{ "--enter-delay": "0.15s" }}`.
- Route change: `.page-enter` in `PageTransition`.
- Reduced motion cancels these outright in CSS (a `both`-filled animation would
  otherwise stay hidden through its delay).

**Verify after any UI change:**
```bash
npm run build && grep -o 'opacity:0' .next/server/app/*.html | wc -l   # must be 0
```

**Other conventions**
- All metadata via `pageMetadata()` in `lib/seo.ts` — never hand-roll, or
  canonicals silently go missing. JSON-LD via the builders there, serialised
  with `jsonLdScript()` (escapes `<`, per the Next JSON-LD guide).
- Icons: `lucide-react` only. No emoji.
- Light panels use `--ink`, `--ink-body`, `--muted-on-light`,
  `--border-on-light`. Never use `--muted` (#888) on a light background.
- Anything needing the production URL or an email address reads `SITE` from
  `lib/site.ts`.
- WebGL mounts only via `HeroCanvasMount` (gated on ≥768px + no reduced
  motion). `ssr: false` requires a Client Component wrapper in Next 16.

### Changed in Phase 2

`lib/site.ts` (canonical domain, contact address, `domain`, `description`),
`lib/services.ts` (rewritten to three evidence-based groups with
`problems`/`deliverables`/`evidence`), `lib/seo.ts` *(new)*, `app/layout.tsx`,
`app/globals.css`, `app/sitemap.ts`, `app/api/contact/route.ts`, all five page
routes, `components/ui/Reveal.tsx`,
`components/layout/{SmoothScroll,PageTransition}.tsx`,
`components/hero/{Hero,HeroCanvasMount}.tsx` *(one new)*,
`components/sections/{ServicesHero,AboutHero,CaseStudyContent,ServicesSummary,ServicesCards,WhatWeBuildSection,ValuesSection,ContactForm}.tsx`,
`next.config.ts`, `.env.local.example`.

Dependencies: **removed** `gsap`, `@react-three/drei`; **added** `lucide-react`.

The new hero copy ("We build digital platforms that move organisations
forward.") landed here rather than Phase 3, because `Hero` had to be rewritten
for the no-JS fix anyway.

---

## Remaining phases

**Phase 3 — Homepage.** ✅ Complete. Order is now: hero → ISGM flagship →
three capability groups → selected work (ISGM excluded; has its own section) →
Kemma products (Giveaways.live, In Development) → why Kemma → process (6 steps)
→ testimonials (quotes unchanged) → final CTA.

New/updated: `components/sections/{FlagshipPlatform,ProductsSection,WhyKemma}.tsx`,
`lib/products.ts`, homepage wiring in `app/page.tsx`, ProcessSection expanded
to 6 steps, ServicesSummary / FeaturedWork / CtaBand copy refreshed.

**Phase 4 — ISGM case study.** ✅ Complete. Expanded `isgm-platform.mdx` with
full factual structure (challenge, solution, applicant/staff experience,
engineering, outcomes — no fabricated metrics). Added
`CaseStudyGallery` which renders `cover` + `meta.screenshots` on every case
study that has them. Public screens captured: home, Programs, admissions
(`/projects/isgm/{isgm-cover,isgm-home,isgm-programs,isgm-application}.webp`).
Authenticated dashboards remain out of scope.

**Phase 5 — Work architecture.** Add `category` + `status` to the schema in
`lib/projects.ts`, filters, client-work vs Kemma-products split, and
Giveaways.live as **In Development** (never as live/complete). Reuse
`lib/products.ts`.

**Phase 6 — Services / About / Contact.** Services page around the three
groups. About must become company-first: cut one of the two founder sections,
keep the founder block compact. Contact form expands to the 10 fields in the
brief; fix `#888` call sites in `FounderSection`.

**Phase 7 — QA.** Lint, build, responsive sweep 320→1920, Lighthouse, and the
12-item final report the brief asks for.

---

## Outstanding — needs the user

1. **Screenshots.** Captured live and verified: ISGM (`pisgm.org`, has a cookie
   banner needing ~90px trimmed) and Kofi Asiedu Mahama. The user supplied
   Estee's Bakery, Constract and ARS Wovenu **as chat images**, which cannot be
   written to disk — they must be saved into
   `public/projects/incoming/` as `estees.png`, `constract.png`, `ars.png`,
   then cropped/converted to WebP in `public/projects/`.
   Headless Chrome works for public pages:
   `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --user-data-dir="$(mktemp -d)" --window-size=1440,900 --virtual-time-budget=8000 --screenshot=out.png URL`
   (macOS has no `timeout`; animation-heavy sites can hang — use a watchdog.)
   `sharp` and `cwebp` are available for conversion.
2. **Constract's URL** — needed for `liveUrl` and to back its "in production"
   claim.
3. **ISGM authenticated screens** (applicant dashboard, admin workflows,
   certificate issuance) — behind login; do not log into a client's production
   system. Only the public journey is capturable.

## Verified facts — do not re-derive

- ISGM's exact name: **Institute of Sustainability, Governance and Management**,
  `https://pisgm.org`. Tagline: "Advance your career in Sustainability,
  Governance and Management." Nav: Home, About, Programs, Admissions, Partners,
  Faculty, News, Contact, Apply now, Sign in.
- ISGM uses **"Programs"** (US spelling), not "Programmes". Match their spelling.
- **Production domain is `kemmatechnologies.com`** — purchased, with Vercel DNS
  configured at Hostinger. `kemma.tech` was considered and *not* bought; treat
  any remaining reference to it as stale. Contact address is
  `hello@kemmatechnologies.com`.

## Deployment blockers

- `NEXT_PUBLIC_SITE_URL` in Vercel still points at the Vercel subdomain, so
  canonicals will not say `kemmatechnologies.com` until it is updated. The local
  `.env.local` overrides it too — expect the Vercel URL in local builds.
- Pick one canonical host: the code assumes the **apex**, so `www` must
  redirect to it in Vercel, not serve the site in parallel.
- `CONTACT_FROM_EMAIL` is unset, so enquiry mail sends from Resend's sandbox
  sender. Requires the domain verified in Resend.
- OG/Twitter images are the 1024×768 logo — wrong ratio for social cards
  (want 1200×630).
