import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(await readFile(join(repo, "docs/demo-import-manifest.json"), "utf8"));
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
let checked = 0;
for (const demo of manifest.demos) {
  const root = join(repo, "public/demo-sites", demo.id);
  for (const [file, digest] of Object.entries(demo.output)) {
    const bytes = await readFile(join(root, file));
    assert.equal(hash(bytes), digest, `${demo.id}/${file} differs from the imported build`);
    if (/\.(html|js|css)$/.test(file)) {
      const content = bytes.toString();
      assert.doesNotMatch(content, /(?:["'`(])\/(?:images|fonts|assets)\//, `Unscoped public path in ${demo.id}/${file}`);
      assert.doesNotMatch(content, /localhost|127\.0\.0\.1|sourceMappingURL|axe-core|\/Users\//, `Development content in ${demo.id}/${file}`);
    }
    checked++;
  }
  const html = await readFile(join(root, "index.html"), "utf8");
  assert.match(html, /noindex, nofollow/);
  for (const [, url] of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    if (url.startsWith(demo.base)) await readFile(join(repo, "public", url));
  }
  const preview = await readFile(join(repo, "public/demo-previews", `${demo.id}.webp`));
  assert.equal(hash(preview), demo.preview.outputSha256);
  const names = await readdir(root);
  assert(!names.some((name) => /^(node_modules|src|\.env|package|qa|evidence)/.test(name)));
}
console.log(`Demo import checks passed: ${manifest.demos.length} demos, ${checked} build artifacts and 3 gallery previews.`);
