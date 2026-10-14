# Private brief storage gateway

The Next.js website keeps its existing form and email flow. This Worker provides private R2 storage through the `BUCKET` binding; the browser never receives an R2 credential or the server storage secret.

`BRIEF_STORAGE_SECRET` authenticates the website's server requests. `BRIEF_SIGNING_SECRET` must match the website's capability-signing secret so the Worker can verify temporary upload sessions. Both are required Worker secrets, configured separately from source. Before secrets are configured, requests fail closed.

## Protocol

- Server: `GET`, `HEAD`, `PUT /v1/object?key=…`. Reads expose ETag, Content-Type and Content-Length to the server. Missing records return 404. Writes default to `If-None-Match: *`; updates require an exact `If-Match` ETag. A lost conditional write returns 412. Only the known `briefs/<UUID>/` documents and original-file paths are accepted.
- Server: `GET /v1/list?prefix=briefs/&cursor=…` returns `{objects:[{key}],truncated,cursor?}`. The private budget namespace cannot be listed through this API.
- Browser: `PUT /v1/upload` takes a signed session in `Authorization`, UUID `X-Brief-File-Id`, the canonical `Content-Type`, and raw original bytes. The browser supplies Content-Length. The session, saved allocation, file size/type/path and finalized state must agree. A FixedLengthStream rejects short and oversized streams before R2 commits them. Existing original files cannot be overwritten.
- CORS permits exact configured origins only. Responses use `private, no-store, no-transform` so the edge preserves the original bytes and strong R2 ETags needed for conditional saves. Failures contain friendly messages rather than private paths, provider errors or credentials. No request bodies, answers or credentials are logged.

## Capacity guard

Allocation writes first reserve cumulative project file bytes plus 10 MiB in private `system/budget.json`, using R2 ETag compare-and-swap. The overall reservation ceiling is **5,000,000,000 bytes**. Reservations can grow but never decrease; losing allocation writes may safely over-reserve. Each document's size limit is fixed so all current project documents together fit within the reserved overhead. No existing data is automatically deleted.

When capacity is exhausted, a new allocation returns 507 with a folder-link alternative. This guard covers this gateway's reservations; it does **not** impose a Cloudflare account spending cap or account for other buckets, operations, or paid services.

## Local checks

Install the standalone development dependencies with `npm ci` in this directory, then run:

```sh
npm run typecheck
npm test
npx --yes --package=wrangler@4.149.0 wrangler deploy --dry-run --outdir dist
```

The existing local Wrangler executable can be used in place of the final command; it does not need to become a website dependency. To regenerate binding and runtime types after configuration changes:

```sh
npx --yes --package=wrangler@4.149.0 wrangler types worker-configuration.d.ts --strict-vars=false
```

The focused tests use real Miniflare/workerd R2 bindings and conditional operations. The pinned simulator currently supports compatibility date October 13, 2026; tests document that date while production configuration remains October 14. A test-only wrapper injects malformed streams inside workerd because a normal HTTP client rejects mismatched Content-Length before dispatch. That wrapper is not deployed. The production Worker receives a separate controlled cloud upload/readback check before website activation.

Deployment, bucket provisioning and secret installation are separate actions controlled by the main task. This package's tests and dry run do not perform them.
