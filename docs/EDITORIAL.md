# Editorial publishing

The blog at /blog links to /blog/series/open-source-everyday and the first article at /blog/two-weeks-of-open-source-everyday. Article content lives in content/articles/open-source-everyday.md, copied verbatim from the approved v3 draft. The table remains semantic text. The September 21 record is a historical snapshot, not a current total or publication date.

The approved cover is local at public/editorial/open-source-everyday.png. Author: Emmanuel Tagbor. Existing site metadata helper supplies canonical URLs and article share metadata. No fabricated publication date. Navigation/footer and sitemap expose the published pages.

Add future article metadata to lib/editorial.ts and an article route; the series count/list derives from that collection. No CMS or new dependencies. The initial long-form renderer uses existing MDX with explicit semantic table handling. Preserve approved attribution and validation caveats when editing.

Design source: personal Product Craft and UI Source Library. Adopted the approved owned purposeful micro-transition principle for process stage changes, with reduced-motion removal, native disclosures and visible keyboard focus. No third-party UI code copied.

Validation: npm run check includes editorial generated-HTML checks for indexability, canonical URLs, table rows, important article details, cover and sitemap. Browser smoke test covers the blog → series → article journey and mobile navigation.
