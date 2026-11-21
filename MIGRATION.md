# Cloudflare Workers migration (Kemma Technologies marketing site)

This repo is now prepared to run the **marketing site** on **Cloudflare Workers** using **vinext** (Cloudflare’s recommended path for Next.js on Workers at the time of this change).

This change **does not deploy** anything and **does not change DNS**. It only adds the in-repo Workers build + deploy configuration and replaces the former Vercel cron with a Workers Cron Trigger.

## What changed

- **Workers build + deploy config**
  - `vite.config.ts` (vinext + Cloudflare integration)
  - `cloudflare.config.ts` (Worker definition, bindings, compatibility flags, cron trigger)
- **Workers Cron Trigger replaces Vercel cron**
  - The Vercel cron config file `vercel.json` was removed.
  - A **scheduled trigger** is configured in `cloudflare.config.ts` for `15 3 * * *`.
  - The scheduled event calls `GET /api/brief/retry-notifications` internally, authenticated by `CRON_SECRET`.
- **Workers entrypoint wrapper**
  - `worker/website/entry.ts` wraps vinext’s handler and adds a `scheduled()` handler for cron.
- **Dependency alignment**
  - React / RSC / `@react-three/fiber` versions were aligned so `vinext` can install and build.

## Local commands

- **Workers dev**

```bash
npm run dev:vinext
```

- **Workers build**

```bash
npm run build:vinext
```

- **Deploy validation (dry run, no deploy)**

```bash
npx vinext-cloudflare deploy --dry-run
```

- **Actual deploy (DO NOT run until ready)**

```bash
npm run deploy:vinext
```

## Required secrets / environment variables (Workers)

Use `.env.local.example` as the source of truth for required variables.

In Cloudflare Workers, set these as **secrets/vars** for the `kemma-website` Worker:

- `RESEND_API_KEY` (required): Resend API key for the contact form + brief notifications.
- `NEXT_PUBLIC_SITE_URL` (required): should be `https://www.kemmatechnologies.com` after cutover.
- `CRON_SECRET` (required): random 32+ chars; used by the Cron Trigger to authenticate the retry endpoint.
- `BRIEF_STORAGE_URL` (required for brief flows): origin of the existing sidecar Worker (e.g. `https://<worker>.<account>.workers.dev`).
- `BRIEF_STORAGE_SECRET` (required for brief flows): must match the sidecar worker’s secret.
- `BRIEF_SIGNING_SECRET` (required for brief flows): capability signing secret (server-only).

Optional (but supported):

- `CONTACT_FROM_EMAIL` (recommended): e.g. `"Kemma Website <noreply@kemmatechnologies.com>"` (requires Resend domain verification).
- `BRIEF_TO_EMAIL`: overrides the brief notification recipient.
- `BRIEF_SHORT_LINKS`: JSON short-link map used by `/b/<code>`.
- `BRIEF_EMAIL_MODE`: set only for preview/testing (see `.env.local.example`).

Notes:

- `cloudflare.config.ts` enables `nodejs_compat` to preserve runtime compatibility for Node-leaning code paths.
- `BRIEF_STORAGE_MODE=local` is **not** intended for Workers deployments (local preview only).

### Setting secrets (example)

This repo uses the `cf` CLI under the hood for deploys. A typical flow is:

```bash
npx cf login
```

Then set secrets for the Worker (command shape may vary by `cf` version/account policy):

```bash
# examples
npx cf secret put RESEND_API_KEY
npx cf secret put CRON_SECRET
npx cf secret put BRIEF_STORAGE_SECRET
npx cf secret put BRIEF_SIGNING_SECRET
```

## DNS cutover plan (manual)

High-level plan to move off Vercel (exact steps depend on how the domain is currently hosted/managed):

- **Create/confirm a Worker route**
  - Deploy `kemma-website` to Cloudflare Workers.
  - Attach the custom domain route(s) for:
    - `www.kemmatechnologies.com/*`
    - (optional) `kemmatechnologies.com/*` (or keep apex redirect handled elsewhere)
- **DNS**
  - Point `www` (and apex if desired) at Cloudflare according to the chosen setup.
  - Ensure HTTPS is active and the redirect behavior (apex → www) matches current behavior.
- **Verify**
  - Smoke test key pages and flows:
    - Homepage + key marketing pages
    - MDX pages (if any)
    - Contact form (Resend)
    - Brief flows and the `/b/<code>` short-link behavior (if used)
    - `/sitemap.xml` and `/robots.txt`

## Cron / scheduled job behavior

The former Vercel cron that hit `/api/brief/retry-notifications` is now a **Workers Cron Trigger**:

- Schedule: `15 3 * * *` (UTC by Cloudflare scheduler)
- Implementation: `worker/website/entry.ts` runs the same route internally with
  `Authorization: Bearer ${CRON_SECRET}`.

If `CRON_SECRET` is missing or shorter than 32 chars, the scheduled job is a no-op.

## Rollback plan (manual)

If production issues appear after cutover:

- Remove/disable the Worker route(s) for `kemmatechnologies.com` / `www.kemmatechnologies.com`.
- Restore DNS back to Vercel’s targets (as previously configured).
- Re-enable the old Vercel cron (restore `vercel.json` and the Vercel project cron settings) if needed.

## Unverified items (must confirm during real deploy)

- Whether the Cloudflare account has **Images** enabled/available for the `IMAGES` binding used by the image optimizer plugin.
- End-to-end runtime behavior of the brief flows on Workers (build passes, but production execution hasn’t been exercised here).
- Any third-party allowlists/callbacks that may assume a Vercel preview/host (unlikely for Resend unless webhooks are configured).

