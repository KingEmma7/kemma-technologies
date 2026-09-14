# Website pricing

The owner approved this five-page launch package for production on 14 September 2026. The catalogue at `lib/pricing/catalogue.json` is the maintained website source; provenance is in `docs/pricing-source-provenance.json`. No supplier signup, payment or message is performed by this page.

## Offer and calculation

- Standard bundled package: GHS 2,000 = GHS 1,500 build work + GHS 500 first-year provisioning/package price. The GHS 500 is Kemma package pricing, not a supplier invoice or a fixed hosting-only allowance.
- Launch: GHS 1,500, with the same scope and first-year eligible standard domain/basic hosting. One GHS 500 discount per eligible new bundled project, for the first five projects confirmed by deposit. No expiry, countdown, past-price claim or remaining-place count is advertised. Availability and eligibility are confirmed in the written quote before deposit.
- Build-only: GHS 1,500 with suitable client-owned domain/hosting services. No package provision and no launch discount. Compatibility and any upgrade work require confirmation.
- Both builds include up to five short pages, up to 2,000 supplied words and 15 supplied images across them, one consolidated revision, basic SEO, one five-field enquiry form, WhatsApp links, handover and 30 days of agreed defect correction. Additional-page charges begin beyond five.
- All 38 addon increments and overlap rules are retained. The store includes catalogue and gateway work; platform-provided configuration can receive explicit credits. Combined 3D/scroll includes its viewer and scroll work but still needs a usable model or a model quote. Unit quantities, prerequisites and custom-scope quote flags remain enforced.

| Example | Launch package from | Standard package from |
| --- | ---: | ---: |
| Business website | GHS 1,500 | GHS 2,000 |
| Catalogue | GHS 2,000 | GHS 2,500 |
| Catalogue + hosted payment links | GHS 2,300 | GHS 2,800 |
| Catalogue + payment links + fixed FAQs | GHS 2,800 | GHS 3,300 |
| Standard store module | GHS 3,000 | GHS 3,500 |
| Store + accounts | GHS 3,500 | GHS 4,000 |
| 3D-scroll with usable supplied model | GHS 3,250 | GHS 3,750 |

These are starting fees, not complete specialist-service quotes. Premium domains/extensions, store/backend infrastructure and additional subscriptions are separately quoted as extra or replacement services, with credit for overlapping bundled work. No second domain or hosting fee is automatically added. An existing domain in a bundled package adds no second registration charge; the written quote confirms the applicable credit, rather than inventing a supplier-cost allocation.

Domain and hosting renewals are payable from year two. The exact selected plan, renewal price and billing owner must be disclosed before deposit. The estimator does not invent a fixed renewal fee. Optional care is separate from hosting: GHS 300 annual static care or quoted active care from GHS 200/month, not both. Static care is unavailable for a store/backend. Known GHS totals exclude unquoted costs; USD subscriptions remain separately denominated. Processor, usage, taxes and paid assets are explicit quote items.

## Promotion operations

`catalogue.launch.enabled` controls the public offer, metadata, examples, FAQs and estimator. Set it to `false`, run the affected tests/build, and release when five eligible deposits are confirmed. This restores the standard GHS 2,000 package everywhere, while build-only stays GHS 1,500. The switch requires a deployment; it is not an automatic booking counter.

Kemma keeps a private five-slot reservation record in its business files: quote reference, eligible project, confirmation of deposit, confirmed date and status. Do not put client names, contact details, payment evidence or fabricated bookings in this repository. Confirm availability before taking the deposit and record each confirmed slot promptly. Enquiries and estimator clicks never reserve a place. No admin/payment system or automatic booking claim is introduced.

## Journeys and checks

The server-rendered page retains the starter scope, examples, all addon details, running-cost explanation and FAQs without JavaScript. The query-dependent estimator is inside Suspense. Known presets select coherent features; unknown query values fall back to starter. `/pricing?demo=pace`, `sill` and `afram` select smaller demo-inspired scopes, with full-showcase exclusions explained.

The WhatsApp link prepares a human-readable quote request with offer, discount, selected features, demo, credits, known subtotal, renewal and infrastructure assumptions. The visitor reviews and sends it. It is not a booking or order; the existing contact API is unchanged.

Run `npm run check` before release. Pricing contract tests cover launch and disabled-promotion prices, five-page scope, single-discount/non-stacking rules, unchanged addon relationships, quotes, mixed currencies, care and enquiry content. Browser verification focuses on desktop/mobile themes, package/build-only switching, demo presets, calculation details and required-cost visibility. Existing approved demo journey evidence remains applicable; imported artifact integrity is checked in the build workflow. Release evidence belongs in the task’s release handoff and PR, not in an invented supplier or transaction record.
