import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const routes = ['blog', 'blog/series/open-source-everyday', 'blog/two-weeks-of-open-source-everyday'];
for (const route of routes) {
  const html = await readFile(`.next/server/app/${route}.html`, 'utf8');
  assert.ok(html.includes(`https://www.kemmatechnologies.com/${route}`), `${route}: canonical missing`);
  assert.ok(!/<meta[^>]*name="robots"[^>]*noindex/.test(html), `${route}: still noindex`);
  assert.ok(!html.includes('Local preview') && !html.includes('Cover portrait awaiting review'), `${route}: preview label`);
}
const html = await readFile('.next/server/app/blog/two-weeks-of-open-source-everyday.html', 'utf8');
const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
assert.equal((visible.match(/<tr>/g) || []).length, 13, 'expected header and 12 contribution rows');
for (const text of ['94.73%', 'one to two hours', '11 merged', 'Emmanuel Tagbor', 'MySQL coverage came from hosted CI', 'maintainer']) assert.ok(visible.includes(text), `missing article detail: ${text}`);
assert.ok(visible.includes('/editorial/open-source-everyday.png'), 'cover missing');
const sitemap = await readFile('.next/server/app/sitemap.xml.body','utf8');
for (const route of routes) assert.ok(sitemap.includes(`/${route}`), `sitemap missing ${route}`);
assert.ok(!sitemap.includes('/drafts/'), 'draft URL in sitemap');
console.log('Editorial release checks passed: three indexable routes, canonical URLs, 12 contribution rows, essential detail, cover and sitemap.');
