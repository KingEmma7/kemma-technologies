# Crochet website brief

Approved form: `/brief/crochet`. This checkout integrates the form without changing the existing detailed preview or the unrelated guided-enquiry work in the primary checkout. Release status and production checks are recorded with the deployment evidence.

## How it works

The client opens a private project link. Answers and original file bytes remain in an invitation-specific browser draft while they complete the form. Breadcrumbs return to visited questions without clearing data. The final optional question captures missing details and form feedback.

Shareable links use `/b/<code>`, with a random 128-bit code. The page renders the same form directly, keeping the address short. Server-only `BRIEF_SHORT_LINKS` maps each code's SHA-256 hash to the existing invitation ID and exact expiry. Reconstructed invitations are identical to the original long link, preserving browser drafts and submission identity. Unknown or expired codes return 404, and short-link pages are dynamic, no-store, no-referrer and noindex. The original invitation verification remains in place. Removing a registration disables its short route but does not revoke an already-issued original invitation.

On Send, Next.js on **Vercel** authorizes an exact file inventory. The browser sends original files directly to a **Cloudflare Worker** using that short-lived project capability. The Worker writes to its bound **private R2 bucket**, so large files do not pass through Vercel’s function request body. Next.js verifies uploads and saves the immutable answer/product/file record through the same Worker before sending a **Resend** notification. The server-only `BRIEF_TO_EMAIL` setting can select the owner’s working inbox. Blank or absent, it defaults to `SITE.email`; the public website contact stays unchanged. The brief’s privacy footer uses Kemma’s existing public WhatsApp link for update or removal requests and never exposes the private notification inbox.

The Worker uses an R2 binding rather than long-lived S3 credentials. Its server-management routes require a separate `BRIEF_STORAGE_SECRET`; only Vercel and the Worker know that secret. The browser gets the upload URL and signed project capability, never the shared storage secret. Uploaded files, answers, notification payloads and recipient details remain private.

The email contains every supplied answer, product details, a JSON attachment and protected original-file links. An owner review page shows the same record. Large uploads are linked, rather than attached to the email. Owner links last one year; storage is independent of link expiry. Keep the signing secret stable across deployments so existing links remain valid.

Each client link expires after 90 days and permits up to 60 files, 25 MB each, 150 MB total including files reserved on failed attempts. Upload tokens last 30 minutes and can write only the approved immutable paths. Accepted submissions cannot be edited through the client link. Use a new link for a later revision.

Email retries reuse the saved payload and Resend idempotency key. The first saved payload freezes its recipient, so later changes to `BRIEF_TO_EMAIL` affect only newly prepared notifications. An existing rejected notification is not silently redirected to a different inbox. A protected daily Vercel cron retries known rejections. Ambiguous attempts older than 23 hours require owner reconciliation because Resend's deduplication expires after 24 hours. The cron's `needsReview` count identifies those cases; confirm the provider record before manually resending. A notification failure never deletes a brief.

## Activation after preview approval

1. Use a dedicated **private R2 Standard** bucket and deploy `worker/brief-storage` with its bucket binding, approved origins and the conservative 5,000,000,000-byte brief-storage budget. Keep R2 public access disabled. Account-wide R2 usage and the Workers plan were not verified within this task’s authorized access scope; the user approved R2 with possible overage disclosed. The bucket budget still applies, and account totals can be reviewed separately in billing.
2. Retain the existing `BRIEF_SIGNING_SECRET`. Initialize missing `BRIEF_STORAGE_SECRET` and `CRON_SECRET` as separate random values of at least 32 characters; initialize a signing secret only when none exists. Mirror the signing and storage secrets in the Worker. Set server-only `BRIEF_STORAGE_URL` to the Worker’s HTTPS origin, without a path or query. Production storage defaults to `r2`; no Vercel Blob store or S3 access key is needed. Never expose either secret as `NEXT_PUBLIC_`. Keep signing values stable for existing links.
3. Set `CONTACT_FROM_EMAIL=Kemma Website <hello@kemmatechnologies.com>`; reuse the existing `RESEND_API_KEY`. Kemma's Resend account shows the domain verified on 14 October 2026. Obtain the owner’s intended working recipient and set optional server-only `BRIEF_TO_EMAIL` to that one mailbox, or resolve the default receiving-mailbox issue below. The override accepts one valid email address, not a display name or recipient list; invalid configuration prevents preparing a notification and records it as known unsent, so correction can safely retry the same saved brief even after 23 hours. Never prefix this setting with `NEXT_PUBLIC_`, pass it to browser props, or commit an actual private address. Repeat the delivery check before activation. The intake deliberately does not silently fall back to the shared Resend onboarding sender.
4. Ensure `NEXT_PUBLIC_SITE_URL=https://www.kemmatechnologies.com` in production. Do not deploy with `BRIEF_STORAGE_MODE=local` or `BRIEF_PREVIEW_INVITE`. Local storage is explicitly prohibited when `NODE_ENV=production` or `VERCEL` is set.
5. Deploy the reviewed production branch under the user’s existing approval, after gateway configuration is verified. Create a client link with `node scripts/create-brief-invite.mjs` using the same production signing secret. The script writes the short URL and its registration to ignored, private files rather than printing credentials. Merge the registration entry into server-only production `BRIEF_SHORT_LINKS` without dropping existing entries, then redeploy before sharing the short link. Never commit actual registrations or private URLs.
6. Test a synthetic submission against actual cloud storage, download its originals, and confirm inbox delivery. Provider acceptance and inbox delivery are different checks.

The Worker is a separate package. Install with `npm ci --prefix worker/brief-storage`; root `npm run check:brief-worker` runs its TypeScript and real-workerd tests. Existing CI installs both lockfiles and includes those checks. Next.js and its ESLint config deliberately exclude the separate Cloudflare runtime.

For a controlled Worker deployment, keep the two matching secrets in an ignored private JSON file and use the reviewed Wrangler version/config:

```sh
npx --yes --package=wrangler@4.149.0 wrangler deploy --config worker/brief-storage/wrangler.jsonc --secrets-file qa/private/worker-secrets.json
```

The private file has only `BRIEF_STORAGE_SECRET` and `BRIEF_SIGNING_SECRET` keys. Never commit it or substitute secret values into shell command text. The production configuration binds `BUCKET` to `kemma-private-briefs`, permits only the configured website/local-preview origins, disables preview URLs and request observability, and leaves R2 public access disabled. Wrangler’s dry run verifies packaging; live upload/readback verifies the deployed gateway.

## Local preview and verification

Local mode uses an ignored `.brief-preview/` directory for genuine server-side persistence and captures the generated notification instead of sending email. It is neither cloud storage nor a delivery claim. `BRIEF_PREVIEW_INVITE` supplies a disposable local invitation.

Private review/download endpoints enforce a separate capability, no-store, no-referrer and noindex. File downloads use attachment/octet-stream/nosniff to avoid executing uploaded SVG or other active content on Kemma's origin.

The repository's unit checks cover authorization, limits, original bytes, concurrent/idempotent submissions, email failures, ambiguity handling and cron authorization. Browser QA covers form-to-server submission, breadcrumb navigation, final feedback, saved receipt and mascot click/keyboard reactions. Production compilation can be validated locally with `npm run build -- --webpack` when Turbopack's stylesheet worker cannot bind its local port.

The baseline local integration checks passed: 79 tests, lint, TypeScript and the webpack production build. After adding the private notification-recipient override, 24 focused recipient/service tests passed, including recipient validation, frozen recipients and correction of a known-unsent configuration failure; affected lint and TypeScript checks and the updated webpack production build passed. The user-approved private recipient is configured only in the ignored local environment. These checks establish the local application behavior; the local preview results are separate from the later cloud-storage and production checks.

The settled R2 release checks passed: 110 application/unit tests, 10 real-workerd/R2 tests, eight lint-tooling regressions, both TypeScript checks, lint, zero-vulnerability root/Worker dependency audits, the production-origin webpack build, and no-JavaScript/demo/editorial gates. These local gates are separate from the controlled live gateway and production-site smoke checks.

Phone QA at 390 × 844 found no page overflow; only the breadcrumb row scrolls. A reduced-motion click showed the laughing face. Temporary browser emulation was reset. A synthetic local submission saved the answers, final feedback and original logo bytes; its protected download matched all 293,657 original bytes.

The controlled live gateway check used the deployed Worker revision `a4bf3b16` and synthetic brief `KEM-8D68D2F9`. Actual R2 storage retained the answers, one product, a 293,657-byte PNG and a 6,291,456-byte text original; both downloads matched the original SHA bytes. Unauthenticated storage returned 401, an unrelated browser origin returned 403, and allowed upload preflight returned 204. R2 public access and public domains were disabled. The notification was deliberately recorded as known unsent until the website was online. Final production HTTP submission and inbox checks remain separate release evidence.

Live transport exposed Cloudflare compression weakening JSON ETags. The Worker now returns `Cache-Control: private, no-store, no-transform`, preserving strong conditional-write tokens. The Worker’s focused real-runtime suite increased to 11 passing tests, with TypeScript and controlled redeployment/readback verified; unchanged Next.js checks were not repeated.

## Sending domain and recipient delivery

The authorized Resend setup is complete for `kemmatechnologies.com` in region Ireland (`eu-west-1`). Resend shows **Verified**, with all three generated DNS records verified: TXT `resend._domainkey`, CNAME `rsend` → `rsend-euw1.forge.rmta.net`, and CNAME `send` → `send.forge.rmta.net`. Only those three records were added. All twelve existing records, including Hostinger's root MX, SPF, DKIM and DMARC, compare unchanged. Resend Receiving remains disabled.

The verified sender accepted a clearly labelled synthetic notification on 14 October 2026, ID `01a13b71-e528-7724-9084-8dd2bd810057`. The receiving server then bounced it with `554 5.7.1 <hello@kemmatechnologies.com>: Relay access denied`. Sender verification and API acceptance are proven; successful recipient delivery is not. The currently inspected Hostinger account owns the Kemma domain but shows no Kemma email plan; this does not rule out service under another account. Obtain the owner’s intended working recipient before setting `BRIEF_TO_EMAIL`, or establish the mailbox service through a separately approved action. Do not keep resending to the rejected address or alter root mail DNS speculatively.

The owner subsequently chose an existing Gmail inbox. A fresh synthetic brief, `KEM-0191DFB1`, ran through the actual local persistence and notification service. The original 293,657-byte upload matched byte for byte, answers and one product were saved, and Resend accepted email ID `01a13b87-5a41-727f-8162-c1e155b19575`. Gmail readback confirmed **INBOX**, without SPAM, at 17:48:09 UTC on 14 October 2026. The message contained the answers, final feedback, original-file link and `KEM-0191DFB1-brief.json` attachment. Recipient identity, message metadata and owner capabilities remain in ignored `qa/private/` artifacts. Browser preview submissions still capture email locally; the live test used only a process-specific override. At that historical preview checkpoint, the test used local storage and had not activated the production site or cloud persistence.

Hostinger Reach is a separate marketing-campaign service and does not provide a receiving mailbox. It is unnecessary for the brief notification. [Official Reach setup FAQ](https://www.hostinger.com/support/hostinger-reach-choosing-the-right-plan-and-setup-faqs-explained/).

The integration is reconciled onto GitHub master `be1a2c1`, preserving its exact Next/eslint-config-next 16.3.8 pins, sharp/source-map patches and tested local lint-root workspace adapter. The R2 gateway uses standard browser/server requests, so the Vercel Blob SDK has been removed. The integration preserves that adapter and the upstream cross-platform optional lock entries. The reconciled dependency audit reports zero vulnerabilities.

## Costs and usage guard

The user selected Cloudflare R2 after disclosure of its free allowance and possible account-wide overage. R2 Standard includes 10 GB-month of storage, 1 million Class A operations and 10 million Class B operations each month; direct R2 egress has no fee. Usage above the allowance is billable. The allowance is shared with the account’s other R2 usage. [R2 pricing](https://developers.cloudflare.com/r2/pricing/).

The dedicated bucket uses a conservative **5,000,000,000-byte application budget** for cumulative client upload reservations, with **10 MiB of record/notification overhead per project**. This aims to stay below the storage allowance for this brief system and returns a friendly quota error before accepting new reservations above its budget. It does not guarantee a zero bill: other buckets, operations, retention, Worker requests and the account plan can affect charges. Do not treat billing alerts as a hard spending stop.

The existing Vercel project still runs Next.js, submission checks, protected downloads and the daily notification retry. The Worker runs the R2 gateway, and its requests/CPU count toward the Cloudflare Workers plan. Resend uses the existing email quota and the approved private recipient. There is no new client account feature or extra service added to the form. [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/) · [Vercel cron usage](https://vercel.com/docs/cron-jobs/usage-and-pricing).

Primary implementation references: [R2 Worker bindings, private objects and conditional writes](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/) · [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys).
