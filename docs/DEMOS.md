# Kemma demos integration

Status: approved for the September 2026 website release with the pricing page and interface cleanup. Lock In is not included. The gallery and each demo notice link to the relevant pricing preset; fictional demo prices remain distinct from Kemma service pricing.

## Visitor journey

`/demos` presents PACE, SILL and Afram Advisory as fictional frontend demonstrations. It is available in the desktop/mobile navigation and footer. Each entry has an approved screenshot, a short business journey, things to try, a working demo link and a separate WhatsApp enquiry to `+233203781818` carrying that demo’s name. The enquiry link opens a prepared message; the visitor decides whether to send it. The gallery also links to actual client work and Kemma’s contact page.

| Demo | Entry | Example deep link | Primary journey |
| --- | --- | --- | --- |
| PACE | `/demo-sites/pace/index.html#/` | `/demo-sites/pace/index.html#/book/strength` | Filter classes, explore a class, preview a trial reservation |
| SILL | `/demo-sites/sill/index.html#/` | `/demo-sites/sill/index.html#/property/courtyard-house` | Search homes, save a shortlist, preview a viewing enquiry |
| Afram Advisory | `/demo-sites/afram/index.html#/` | `/demo-sites/afram/index.html#/consult` | Explore expertise and prepare a consultation brief |

Each demo’s existing notice includes a “Back to demos” link returning to its gallery entry. Use fictional details only. Demo forms do not send enquiries, take payments or make bookings. Existing sample membership/property prices and planning-budget bands belong to the fictional demos; they are not Kemma pricing.

## Architecture and tradeoff

The three Vite production builds are served as separate HTML documents from Kemma’s `public/demo-sites/` directory. Full document navigation preserves each design’s own CSS, fonts, hash router and scripts. This avoids mixing demo CSS with Kemma or introducing iframe scrolling, duplicated hosting, another runtime or dependencies in Kemma’s page bundle. Kemma’s theme applies to the gallery; opening a demo preserves its approved palette. Returning restores the selected Kemma theme.

The cost is about 4 MB of additional static demo files and 163 KB of gallery WebP previews in this source snapshot. These files use the eventual host’s existing storage/transfer allowance; no separate paid service is needed. Only gallery thumbnails load on `/demos`. Full demo assets load when a visitor opens one.

An explicit import step is required after an approved demo revision. Ordinary Kemma builds use the saved static artifacts and do not require access to the three source projects. This keeps later CI/deployment portable. The repository retains the importer, artifact manifest and licence/provenance records, not copies of development source archives, node_modules or environment files.

## Rebuild the imported snapshots

Each source project must have its locked development dependencies installed by its owner. The importer never installs anything and does not modify those projects.

```sh
npm run demos:import -- \
  --pace "$PACE_PROJECT" \
  --sill "$SILL_PROJECT" \
  --afram "$AFRAM_PROJECT" \
  --staging "$TASK_OUTPUT_DIRECTORY/demo-staging"
npm run check
```

Pass the approved `pace-demo`, `sill`, and `afram-advisory` project directories. Staging is explicitly selected within the task/output directory. Each invocation creates a separate staging folder, copies only the application inputs, builds them with their existing Vite installations and replaces the three generated bundles only after all builds pass.

Adapters are deliberately small: prefix runtime image URLs with the appropriate `/demo-sites/<id>/` base, let Vite rewrite HTML/CSS font/asset paths, add return navigation to the existing demo notice, and add a noindex tag. Hash routes, form logic, local-storage keys and approved visual design are unchanged. The importer expects the existing notice markup and fails if it changes. Reassess the adapter if a demo later gains API calls or external assets.

The import manifest records every original application input and output SHA-256 plus the installed Vite version. `npm run check:demos` validates output integrity, portable paths, the three optimized screenshots and the absence of development artifacts. It is also part of `npm run check`.

## Privacy and isolation

- PACE reservations and Afram briefs stay in memory and clear on refresh. SILL viewing forms stay in memory; its saved property IDs use the existing `sill:saved:v1` local-storage key.
- Storage is scoped to the browser origin. Moving from a separate local preview port to Kemma, or later to another domain, starts a separate shortlist; it does not migrate personal data. The key does not collide with Kemma’s theme preference.
- The imported demo paths return `connect-src 'none'` and `form-action 'none'` to prevent demo background requests/native form sends. No API endpoints, analytics, credentials or secrets are shipped with them.
- The gallery remains indexable; fictional demo HTML is marked `noindex, nofollow` in both metadata and response headers. Demo entry documents are not added to the sitemap.
- Full-document CSS isolation is not a security sandbox. These are reviewed, owned static apps on Kemma’s origin. Untrusted future demos should use a separate origin.

## Asset provenance

Approved source screenshots are converted to WebP without changing their composition. The importer expects PACE’s `../pace-after-desktop.png`, SILL’s `notes/design-revision/after-desktop-home-viewport.png`, and Afram’s `evidence/refinement/after-desktop.png`.

| Demo | Typography | Photography / artwork | Original provenance |
| --- | --- | --- | --- |
| PACE | Barlow Condensed and Chivo, self-hosted SIL OFL | Two locally saved Unsplash training/gym photos; original wordmark/layout | [PACE provenance](demo-provenance/pace.md) |
| SILL | Bodoni Moda and Manrope, self-hosted SIL OFL | Six locally saved Unsplash home photos; original illustrative plans/content | [SILL provenance](demo-provenance/sill.md) |
| Afram | Syne and Manrope, self-hosted SIL OFL | Original composition; no stock photography | [Afram provenance](demo-provenance/afram.md) |

Original font licence files remain alongside the imported font assets. The copied provenance notes retain source URLs, licence context and the original owners’ limitations. Photos are illustrative and do not establish a listing, venue, staff identity or endorsement. A later real brand launch requires its own content and permissions review.

## Local validation

The integration passed lint, typechecking, all 13 existing tests, production build, generated-HTML visibility checks and the new demo import checks. All 29 static demo artifacts returned HTTP 200 through Kemma’s server with the expected response policy. Original application inputs were rehashed after import and remain unchanged.

Browser evidence covers gallery light/dark on desktop/mobile, each demo’s entry and interior routes, font/photo loading, responsive layout, return links, mobile menus and simulated completion flows. SILL’s shortlist survives a reload and its test entry was removed afterwards. No WhatsApp message was sent. Specific screenshots, browser results and the final local URL are in the task’s `outputs/kemma-demos/` handoff.

Automated accessibility results complement visual and interaction checks; they are not a claim of full WCAG conformance or physical-device testing. Production delivery is not verified because deployment is outside this task.
