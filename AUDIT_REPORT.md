# Kemma Technologies Website — Principal-Level Pre-Launch Audit

**Date:** 2026-07-01
**Scope:** Full codebase — `app/`, `components/`, `lib/`, `content/`, config files
**Trigger:** Hydration mismatch reported in local dev server (`terminals/2.txt`)

---

## 1. Starting Error — Root Cause

```
[browser] A tree hydrated but some attributes of the server rendered HTML
didn't match the client properties...
-  cz-shortcut-listen="true"
```

**Root cause:** `cz-shortcut-listen="true"` is injected onto `<body>` by the
**ColorZilla** browser extension before React hydrates. This is a well-known,
benign class of mismatch (see the linked React docs) — it is **not a bug in
the application**. The fix already applied elsewhere in the branch adds
`suppressHydrationWarning` to `<body>` in `app/layout.tsx`, which is the
React-recommended way to silence this exact category of extension-caused
noise without hiding real hydration bugs (the flag is non-recursive — it only
suppresses warnings on the `<body>` element itself).

**Verified:** ran `next dev`, curled `/`, `/about`, `/work`,
`/work/agrologix-platform`, `/sitemap.xml`, and a 404 route — no hydration
warnings in server logs, all routes return correct status codes.

The `GET /sw.js 404` lines in the same log are unrelated — no service worker
is registered anywhere in this codebase (confirmed via grep). That request
comes from the browser/an extension probing for a PWA service worker; it is
harmless and requires no fix.

---

## 2. Pre-Existing Uncommitted Work (validated, kept)

The working tree already contained unstaged fixes from a prior pass. I
reviewed each and confirmed they are correct and safe:

| File | Fix | Verdict |
|---|---|---|
| `app/layout.tsx` | `suppressHydrationWarning` on `<body>`, `metadataBase` added | ✅ Correct |
| `components/layout/SmoothScroll.tsx` | Named function reference for `gsap.ticker.add/remove` | ✅ Correct — previously the cleanup called `.remove()` with a **new** arrow function, which never matched the one passed to `.add()`. This was a real memory/listener leak on every route change (GSAP ticker kept accumulating Lenis `raf` callbacks) |
| `lib/site.ts` | Added `url` field from `NEXT_PUBLIC_SITE_URL` | ✅ Correct |
| `app/robots.ts`, `app/sitemap.ts` | New SEO routes | ✅ Correct, build confirms `/robots.txt` and `/sitemap.xml` now generate |
| `app/not-found.tsx` | Branded 404 page | ✅ Correct |
| `next.config.ts` | Security headers (`X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`) | ✅ Correct |
| `.gitignore` | Un-ignore `*.example` env files | ✅ Correct |

---

## 3. New Findings & Fixes (this pass)

### 🔴 High — Missing error boundaries
No `app/error.tsx` or `app/global-error.tsx` existed. Any unhandled render
error (e.g. a bad MDX file, a runtime exception in a client component) would
have shown Next.js's default unstyled error screen in production — a poor
experience for a client-facing marketing site right before launch.

**Fix:** added both, branded to match the site's dark/gold visual language,
with a "Try again" action and (for the root-level `global-error.tsx`) a
minimal inline-styled fallback since it must render its own `<html>/<body>`
outside of `globals.css`.

### 🟠 Medium — No spam protection on the contact form
The `/api/contact` route was open to any bot capable of POSTing JSON —
no rate limiting, no bot signal at all. Full server-side rate limiting
requires external infra (Vercel KV/Upstash) which I did not want to bolt on
silently, but a **honeypot field** is a zero-dependency, zero-cost
first line of defense that catches the majority of unsophisticated scripted
spam.

**Fix:** added a `website` field to `contactSchema`, hidden via `sr-only` +
`aria-hidden` + `tabIndex={-1}` in `ContactForm.tsx` so it's invisible and
unreachable for real users (sighted or screen-reader), but auto-filled by
naive bots that fill every input on a page. The API route now silently
no-ops (`{ ok: true }`) instead of sending an email when this field is
populated, so the mechanism isn't discoverable from the response.

**Recommendation (not implemented — needs infra decision):** for stronger
protection at scale, add IP-based rate limiting via Vercel's `@vercel/kv` or
Upstash Redis, or a managed service like Cloudflare Turnstile.

### 🟡 Low — `X-Powered-By: Next.js` header exposed
Minor information-disclosure hardening.

**Fix:** `poweredByHeader: false` in `next.config.ts`.

### 🟡 Low — `.env.local.example` incomplete
`NEXT_PUBLIC_SITE_URL` is consumed by `lib/site.ts` (which powers
`metadataBase`, `robots.ts`, `sitemap.ts`) but wasn't documented.

**Fix:** added with inline comment noting it must be set in Vercel env vars.

---

## 4. Reviewed and Confirmed Clean (no action needed)

- **Accessibility:** form labels correctly paired via `htmlFor`/`id` +
  `useId()`, `aria-invalid`/`aria-describedby` on error states, keyboard
  support (`role="button"`, `onKeyDown`) on the services accordion, focus-
  visible outlines globally, `prefers-reduced-motion` respected in both
  global CSS and individual animation hooks (`SmoothScroll`,
  `MilestoneTimeline`).
- **Security:** contact API validates with Zod, escapes all user input
  before HTML-email interpolation (XSS-safe), checks Resend's error
  response instead of assuming success, distinguishes dev vs. prod behavior
  when `RESEND_API_KEY` is missing.
- **Data integrity:** MDX frontmatter validated with Zod
  (`projectSchema.safeParse`), invalid files are skipped with a console
  warning rather than crashing the build.
- **Component architecture:** `ButtonLink` vs `Button` correctly separates
  link-styled-as-button from real `<button>` elements — no invalid
  `<a><button>` nesting anywhere in the codebase (verified across all
  section components).
- **Type safety:** `tsconfig.json` has `strict: true`; `npm run build`
  type-checks with zero errors.
- **Lint:** `npm run lint` (ESLint 9 flat config, `eslint-config-next`
  core-web-vitals + typescript rulesets) — zero warnings/errors.
- **Performance:** `next.config.ts` already opts into `avif`/`webp` image
  formats and `optimizePackageImports` for the heaviest dependencies
  (Framer Motion, GSAP, react-three-fiber/drei). `ParticleField.tsx`
  generates its WebGL geometry once at module scope (not per-render).
  `HeroCanvas` is dynamically imported with `ssr: false` to keep Three.js
  out of the server bundle and initial HTML.

---

## 5. Known Content Gaps (not code bugs — flagging for you)

These are launch blockers but are **content/asset decisions**, not
engineering fixes, so I did not fabricate placeholder data for them:

1. **No Open Graph / Twitter card image.** `metadata.openGraph` and
   `metadata.twitter` currently have no `images` field — social shares will
   show no preview image. Needs a real 1200×630 brand image.
2. **Team section (`TeamSection.tsx`) uses fictional names/bios/initials**
   (Emmanuel Asante, Akosua Boateng, etc.) as placeholder content — replace
   with real team info before launch.
3. **Testimonials (`Testimonials.tsx`) are fictional** (Ama Serwaa, Kofi
   Mensah, Abena Asante) — replace with real client quotes or remove the
   section until you have them.
4. **Resend sender domain** (`noreply@kemmatech.com` in
   `app/api/contact/route.ts`) must be a domain verified in your Resend
   account, or sends will fail in production.
5. **`RESEND_API_KEY`** must be set as a Vercel environment variable.
6. **`NEXT_PUBLIC_SITE_URL`** must be set as a Vercel environment variable
   to your real production domain (used for sitemap/robots/OG URLs).

---

## 6. Verification

```
npm run lint   →  0 errors, 0 warnings
npm run build  →  compiled successfully, 0 TypeScript errors
```

Routes confirmed responding correctly against `next dev`:
`/` `200`, `/about` `200`, `/work` `200`, `/work/agrologix-platform` `200`,
`/sitemap.xml` `200`, unknown route `404` (via new `app/not-found.tsx`).

No hydration warnings observed in server logs during smoke test.

---

## 7. Files Changed This Pass

- `app/error.tsx` *(new)*
- `app/global-error.tsx` *(new)*
- `lib/validations/contact.ts` — honeypot field
- `components/sections/ContactForm.tsx` — hidden honeypot input
- `app/api/contact/route.ts` — honeypot short-circuit
- `next.config.ts` — `poweredByHeader: false`
- `.env.local.example` — documented `NEXT_PUBLIC_SITE_URL`

Plus the pre-existing uncommitted fixes from section 2, all committed
together in this pass.
