import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.kemmatechnologies.com';
const routes = ['blog', 'blog/series/open-source-everyday', 'blog/two-weeks-of-open-source-everyday', 'blog/testing-the-behaviour-behind-the-fix'];
for (const route of routes) {
  const html = await readFile(`.next/server/app/${route}.html`, 'utf8');
  assert.ok(html.includes(new URL(`/${route}`, siteUrl).toString()), `${route}: canonical missing`);
  assert.ok(!/<meta[^>]*name="robots"[^>]*noindex/.test(html), `${route}: still noindex`);
  assert.ok(!html.includes('Local preview') && !html.includes('Cover portrait awaiting review'), `${route}: preview label`);
}
const html = await readFile('.next/server/app/blog/two-weeks-of-open-source-everyday.html', 'utf8');
const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
assert.equal((visible.match(/<tr>/g) || []).length, 13, 'expected header and 12 contribution rows');
for (const text of ['94.73%', 'one to two hours', '11 merged', 'Emmanuel Tagbor', 'MySQL coverage came from hosted CI', 'maintainer']) assert.ok(visible.includes(text), `missing article detail: ${text}`);
assert.ok(visible.includes('/editorial/open-source-everyday.png'), 'cover missing');
const weekly = await readFile('.next/server/app/blog/testing-the-behaviour-behind-the-fix.html', 'utf8');
const weeklyVisible = weekly.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
assert.equal((weeklyVisible.match(/<tr>/g) || []).length, 8, 'expected header and 7 weekly contribution rows');
for (const text of ['18 PRs submitted and 14 merged', 'Six new pull requests', 'Four of the six new PRs remain open', '106 ms', 'maintainer']) assert.ok(weeklyVisible.includes(text), `missing weekly article detail: ${text}`);
assert.ok(weeklyVisible.includes('/editorial/open-source-weekly-2026-09-21-27-v6.png'), 'weekly cover missing');
assert.ok(!weeklyVisible.includes('Unpublished preview'), 'weekly preview label remains');
const sitemap = await readFile('.next/server/app/sitemap.xml.body','utf8');
for (const route of routes) assert.ok(sitemap.includes(`/${route}`), `sitemap missing ${route}`);
assert.ok(!sitemap.includes('/drafts/'), 'draft URL in sitemap');
console.log('Editorial release checks passed: four indexable routes, canonical URLs, contribution records, essential detail, covers and sitemap.');
