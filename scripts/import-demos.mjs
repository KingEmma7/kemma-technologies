import { cp, mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import sharp from "sharp";

// Import approved local projects without modifying them or installing packages.
const { values } = parseArgs({ options: {
  pace: { type: "string" }, sill: { type: "string" }, afram: { type: "string" },
  staging: { type: "string" },
} });
for (const key of ["pace", "sill", "afram", "staging"]) {
  if (!values[key]) throw new Error(`Missing --${key}. See docs/DEMOS.md.`);
}
const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const specs = [
  { id: "pace", files: ["index.html", "src.js", "style.css", "public"], notice: "src.js", css: "style.css", provenance: "PROVENANCE.md", preview: "../pace-after-desktop.png" },
  { id: "sill", files: ["index.html", "src", "public"], notice: "src/main.js", css: "src/style.css", provenance: "notes/PROVENANCE.md", preview: "notes/design-revision/after-desktop-home-viewport.png" },
  { id: "afram", files: ["index.html", "src.js", "style.css", "public"], notice: "index.html", css: "style.css", provenance: "docs/PROVENANCE.md", preview: "evidence/refinement/after-desktop.png" },
];
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
async function filesUnder(root) {
  const files = [];
  for (const item of await readdir(root, { withFileTypes: true })) {
    if (item.isSymbolicLink()) throw new Error(`Symlink not permitted in demo inputs: ${join(root, item.name)}`);
    if (item.isDirectory()) files.push(...(await filesUnder(join(root, item.name))).map((p) => `${item.name}/${p}`));
    else files.push(item.name);
  }
  return files.sort();
}
await mkdir(resolve(values.staging), { recursive: true });
const stage = await mkdtemp(join(resolve(values.staging), "import-"));
const manifest = { format: 1, demos: [] };
for (const spec of specs) {
  const source = resolve(values[spec.id]);
  const root = join(stage, spec.id);
  const base = `/demo-sites/${spec.id}/`;
  await mkdir(root);
  for (const file of spec.files) await cp(join(source, file), join(root, file), { recursive: true, dereference: false });
  const inputs = {};
  const files = await filesUnder(root);
  for (const file of files) inputs[file] = hash(await readFile(join(root, file)));
  inputs["package-lock.json"] = hash(await readFile(join(source, "package-lock.json")));
  // Vite handles HTML/CSS URLs. Runtime strings in these vanilla JS apps need
  // their public asset prefix changed explicitly; hash routes stay untouched.
  const publicDirs = (await readdir(join(root, "public"), { withFileTypes: true })).filter((x) => x.isDirectory()).map((x) => x.name);
  for (const file of files.filter((p) => p.endsWith(".js") && !p.startsWith("public/"))) {
    let content = await readFile(join(root, file), "utf8");
    for (const dir of publicDirs) {
      for (const quote of ['"', "'", "`"])
        content = content.replaceAll(`${quote}/${dir}/`, `${quote}${base}${dir}/`);
    }
    await writeFile(join(root, file), content);
  }
  const noticePath = join(root, spec.notice);
  const notice = await readFile(noticePath, "utf8");
  const pattern = /(<div class="demo(?:-bar)?"[^>]*>)([\s\S]*?)(<\/div>)/;
  if (!pattern.test(notice)) throw new Error(`${spec.id}: demo notice changed; review the adapter.`);
  await writeFile(noticePath, notice.replace(pattern, `$1$2 <a class="kemma-demo-return" href="/demos#${spec.id}">Back to demos</a> <a class="kemma-demo-return" href="/pricing?demo=${spec.id}#estimate">Scope &amp; pricing</a>$3`));
  const cssPath = join(root, spec.css);
  await writeFile(cssPath, (await readFile(cssPath, "utf8")) + `\n/* Gallery navigation only; keep the approved demo identity. */\n.demo-bar:has(.kemma-demo-return), .demo:has(.kemma-demo-return){flex-wrap:wrap;gap:.25rem .75rem}\n.kemma-demo-return{display:inline-flex;align-items:center;min-height:32px;padding:4px 10px;line-height:1.4;color:inherit;text-decoration:underline;text-underline-offset:3px;white-space:nowrap;font-size:12px;letter-spacing:0;text-transform:none}\n.kemma-demo-return:focus-visible{outline:2px solid currentColor;outline-offset:3px}\n`);
  const htmlPath = join(root, "index.html");
  await writeFile(htmlPath, (await readFile(htmlPath, "utf8")).replace("</head>", '<meta name="robots" content="noindex, nofollow"></head>'));
  await writeFile(join(root, "package.json"), '{"private":true,"type":"module"}\n');
  const vite = join(source, "node_modules/vite/bin/vite.js");
  execFileSync(process.execPath, [vite, "build", root, "--base", base, "--outDir", join(root, "dist"), "--emptyOutDir"], { cwd: root, stdio: "inherit" });
  const output = await filesUnder(join(root, "dist"));
  for (const file of output) {
    if (!/\.(html|js|css|jpg|jpeg|png|webp|svg|avif|woff2?|ttf|txt)$/.test(file)) throw new Error(`Unexpected public artifact: ${file}`);
    if (/\.(html|js|css)$/.test(file)) {
      const content = await readFile(join(root, "dist", file), "utf8");
      if (/localhost|127\.0\.0\.1|sourceMappingURL|axe-core|\/Users\//.test(content)) throw new Error(`Nonportable/development content in ${spec.id}/${file}`);
    }
  }
  const vitePackage = JSON.parse(await readFile(join(source, "node_modules/vite/package.json"), "utf8"));
  manifest.demos.push({ id: spec.id, base, vite: vitePackage.version, inputs, output: Object.fromEntries(await Promise.all(output.map(async (file) => [file, hash(await readFile(join(root, "dist", file)))]))) });
  await mkdir(join(stage, "provenance"), { recursive: true });
  await cp(join(source, spec.provenance), join(stage, "provenance", `${spec.id}.md`));
  const screenshot = await readFile(join(source, spec.preview));
  await mkdir(join(stage, "previews"), { recursive: true });
  const preview = await sharp(screenshot).resize({ width: 1440, withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
  await writeFile(join(stage, "previews", `${spec.id}.webp`), preview);
  manifest.demos.at(-1).preview = { source: spec.preview, inputSha256: hash(screenshot), outputSha256: hash(preview) };
}
// Do not replace the installed artifacts until all three builds have passed.
const destination = join(repo, "public/demo-sites");
await mkdir(destination, { recursive: true });
for (const spec of specs) {
  const temp = join(destination, `.${spec.id}-import`);
  await rm(temp, { recursive: true, force: true });
  await cp(join(stage, spec.id, "dist"), temp, { recursive: true });
  await rm(join(destination, spec.id), { recursive: true, force: true });
  await rename(temp, join(destination, spec.id));
}
await mkdir(join(repo, "docs/demo-provenance"), { recursive: true });
await mkdir(join(repo, "public/demo-previews"), { recursive: true });
for (const spec of specs) await cp(join(stage, "previews", `${spec.id}.webp`), join(repo, "public/demo-previews", `${spec.id}.webp`));
for (const spec of specs) await cp(join(stage, "provenance", `${spec.id}.md`), join(repo, "docs/demo-provenance", `${spec.id}.md`));
await writeFile(join(repo, "docs/demo-import-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log("Imported PACE, SILL and Afram. Original sources unchanged. Staging:", stage);
