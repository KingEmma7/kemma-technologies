# Personal quotes only

Owner instruction, 13 October 2026: remove all fixed pricing from the Kemma Technologies website. Emmanuel must personally quote every project and service.

## Public website policy

- Do not publish base prices, price ranges, package fees, launch discounts, add-on rates, maintenance prices or automated estimates.
- Websites, mobile apps, AI work, software development, consultancy and ongoing support all require a personalised quote.
- State that Emmanuel reviews the requirements and agrees scope, cost and payment terms before work begins.
- Use the existing contact form, email, phone and WhatsApp destinations. Do not collect a deposit or promise a price automatically.

The existing `/pricing` URL remains a quote-request page so bookmarks and demo links continue to work. The `#estimate` anchor is retained only for compatibility; no estimator is rendered. `/contact` uses the same form. The preset budget-band field is no longer shown.

The old interactive pricing component and its stylesheet have been removed. Files under `lib/pricing/` and their existing arithmetic tests are historical implementation material, not an active rate card. They must not be imported into public pages or components. Earlier pricing approval records are superseded by this instruction.

Fictional product, membership or property prices inside the clearly labelled demo businesses are demo content, not Kemma service fees. Their imported artifacts are unchanged.

## Verification

Run `npm run check`. `tests/quote-only.test.ts` prevents public entry points from importing the old estimator. `scripts/check-no-js.mjs` checks the generated pricing and contact HTML for personal-quote copy, direct contact links and absence of public rates, while preserving the existing hidden-content checks.
