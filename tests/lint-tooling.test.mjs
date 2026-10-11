import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { ESLint } from "eslint";

const require = createRequire(import.meta.url);
const adapter = require("../tooling/next-root-glob/index.cjs");
const fixture = mkdtempSync(path.join(tmpdir(), "kemma-lint-roots-"));
for (const root of ["one", "two", "nested/three", ".hidden"]) {
  mkdirSync(path.join(fixture, root, "pages"), { recursive: true });
  writeFileSync(path.join(fixture, root, "pages/news.tsx"), "export default function Page() { return null; }\n");
}
writeFileSync(path.join(fixture, "not-a-directory"), "fixture");
after(() => rmSync(fixture, { recursive: true, force: true }));

const dirs = (pattern) => adapter.globSync(pattern, { onlyDirectories: true }).sort();
const expected = (...roots) => roots.map((root) => path.join(fixture, root)).sort();

test("Next's actual dependency resolves to the local adapter, without the vulnerable chain", () => {
  const nextRequire = createRequire(require.resolve("@next/eslint-plugin-next"));
  assert.equal(nextRequire("fast-glob").globSync, adapter.globSync);
  const lock = JSON.parse(readFileSync(new URL("../package-lock.json", import.meta.url)));
  assert.equal(Object.keys(lock.packages).some((key) => /node_modules\/(braces|micromatch)$/.test(key)), false);
});

test("literal, absolute and missing directories retain root matching", () => {
  assert.deepEqual(dirs(`${fixture}/one`), expected("one"));
  assert.deepEqual(dirs(`${fixture}/one/`), expected("one"));
  assert.deepEqual(dirs("app"), ["app"]);
  assert.deepEqual(dirs("./app"), ["app"]);
  assert.deepEqual(dirs("/"), ["/"]);
  assert.deepEqual(dirs(`${fixture}/missing`), []);
  assert.deepEqual(dirs(`${fixture}/not-a-directory`), []);
});

test("wildcards, braces, extglobs and nested matches preserve directory coverage", () => {
  assert.deepEqual(dirs(`${fixture}/*`), expected("nested", "one", "two"));
  assert.deepEqual(dirs(`${fixture}/{one,two}`), expected("one", "two"));
  assert.deepEqual(dirs(`${fixture}/@(one|two)`), expected("one", "two"));
  assert.deepEqual(dirs(`${fixture}/**/three`), expected("nested/three"));
  assert.deepEqual(dirs(`${fixture}/.hidden`), expected(".hidden"));
});

test("terminal globstar deliberately also includes the base directory", () => {
  assert.deepEqual(dirs(`${fixture}/nested/**`), expected("nested", "nested/three", "nested/three/pages"));
});

test("unsupported future Next glob calls fail visibly", () => {
  assert.throws(() => adapter.globSync("app"), TypeError);
  assert.throws(() => adapter.globSync("app", { onlyDirectories: false }), TypeError);
  assert.throws(() => adapter.globSync(["app"], { onlyDirectories: true }), TypeError);
  assert.throws(() => adapter.globSync("app", { onlyDirectories: true, dot: true }), TypeError);
});

test("all pre-change TSX, TypeScript and JavaScript lint rules remain identical", async () => {
  const fingerprints = {
    "app/ars-pocket/privacy/page.tsx": [113, "e809ea1c5cccec205e74738d64d3f93ea3e7577838c1f5664d6a4305cf1500b5"],
    "lib/utils.ts": [113, "e809ea1c5cccec205e74738d64d3f93ea3e7577838c1f5664d6a4305cf1500b5"],
    "scripts/check-editorial.mjs": [90, "0246ef4e5f4b0d1ee137b77289eef49c6e468f9b9f230866e1d48663e838a55a"],
  };
  const eslint = new ESLint();
  for (const [file, [count, hash]] of Object.entries(fingerprints)) {
    const { rules } = await eslint.calculateConfigForFile(file);
    assert.equal(Object.keys(rules).length, count, file);
    const sorted = Object.fromEntries(Object.entries(rules).sort(([a], [b]) => a.localeCompare(b)));
    assert.equal(createHash("sha256").update(JSON.stringify(sorted)).digest("hex"), hash, file);
  }
});

async function linkMessages(href, rootDir, component = "a") {
  const eslint = new ESLint(rootDir === undefined ? {} : {
    overrideConfig: { settings: { next: { rootDir } } },
  });
  const [result] = await eslint.lintText(
    `export default function Example() { return <${component} href="${href}">Read</${component}>; }`,
    { filePath: "app/lint-tooling-fixture.tsx" },
  );
  return result.messages.filter((message) => message.ruleId === "@next/next/no-html-link-for-pages");
}

test("default App Router root still rejects internal anchors and allows Link/external links", async () => {
  assert.equal((await linkMessages("/")).length, 1);
  assert.equal((await linkMessages("/", undefined, "Link")).length, 0);
  assert.equal((await linkMessages("https://example.com")).length, 0);
});

test("Next's string, wildcard, brace, array and separator-normalized root settings still lint links", async () => {
  for (const rootDir of [
    `${fixture}/one`, `${fixture}/*`, `${fixture}/{one,two}`,
    [`${fixture}/missing`, `${fixture}/two`],
    `${fixture}/one`.replace(/\//g, "\\"),
  ]) {
    assert.equal((await linkMessages("/news", rootDir)).length, 1, JSON.stringify(rootDir));
    assert.equal((await linkMessages("/news", rootDir, "Link")).length, 0, JSON.stringify(rootDir));
  }
});
