# Kemma Technologies — Remediation Report

**Date:** 2026-08-01

**Scope:** dependency security, contact handling, content integrity,
accessibility, metadata, regression coverage and delivery readiness

## Outcome

The evidence-backed local fixes are implemented and verified. The repository
now builds cleanly, has automated regression coverage, and reports zero known
npm vulnerabilities. Deployment-account checks remain explicitly separated
from locally provable results.

## Fixed

### Dependency and CI hygiene

- Updated Next.js and `eslint-config-next` to 16.2.12.
- Removed vulnerable `gray-matter`; project frontmatter now uses `yaml` plus
  the existing Zod schema.
- Updated/overrode vulnerable transitive packages, including PostCSS and Sharp.
- Added Vitest coverage and a GitHub Actions gate on Node.js 24.
- Added `lint`, `typecheck`, `test`, `check:no-js` and complete `check` scripts.

### Contact-route safety and reliability

- Enforced `application/json` requests (`415` otherwise).
- Enforced a 16 KiB request limit using both declared and measured size.
- Added strict, trimmed, bounded validation and rejected unknown fields.
- Centralised HTML escaping used by the outgoing email template.
- Avoided writing personal enquiry data to development logs.
- Preserved the honeypot without revealing it in the response.
- Missing production email configuration returns an error rather than a false
  success.
- Replaced an unverified response-time promise with accurate expectation copy.

Application-level IP throttling was not improvised. The production-safe
rollout is documented in `docs/vercel-firewall.md`: observe in log mode,
review legitimate traffic, and require an authorised owner to publish.

### Content integrity

- Softened unverified Constract production/customer-order claims while
  preserving factual implementation scope.
- Documented the rule that outcomes, live URLs and screenshots must be real
  and verified before publication.

### Accessibility and presentation

- Added accessible dark-surface accent and error tokens.
- Replaced low-contrast usages in work cards, navigation and form feedback.
- Generated a dedicated 1200×630 branded Open Graph/Twitter image instead of
  reusing a mismatched logo asset.

### Canonical metadata

- Aligned the code fallback and example environment with the observed
  production behavior: the apex redirects to
  `https://www.kemmatechnologies.com`.
- Removed artificial build-time `lastModified` values from the sitemap.
- Confirmed generated HTML includes matching canonical, Open Graph and Twitter
  image URLs.

## Regression coverage

The test suite covers:

- contact schema trimming, boundaries and strictness
- HTML escaping
- contact-route media type, malformed JSON and size rejection
- honeypot behavior and missing production email configuration
- valid and invalid project frontmatter

## Verification results

```text
ESLint                         pass
TypeScript (strict)            pass
Vitest                         12 tests passed
Next.js production build      pass (19 generated routes/pages)
No-JavaScript HTML check       pass (12 HTML files)
npm security audit             0 vulnerabilities
Social-card response           200 image/png, 1200×630
Canonical/social metadata      www.kemmatechnologies.com
```

## Still requires external verification

- Vercel production environment values, especially `NEXT_PUBLIC_SITE_URL`.
- Resend sender-domain verification and one controlled end-to-end delivery.
- Vercel Firewall contact-route rule observation and owner-approved publish.
- Preview-deployment responsive and Lighthouse checks.
- Verified Constract live URL and any additional approved project evidence.

These are not represented as complete until checked in the relevant external
system. See `HANDOFF.md` for the release checklist and operating guardrails.
