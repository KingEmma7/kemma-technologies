import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const APP_OUTPUT = join(process.cwd(), ".next", "server", "app");

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return htmlFiles(path);
      return entry.isFile() && entry.name.endsWith(".html") ? [path] : [];
    }),
  );
  return files.flat();
}

const files = await htmlFiles(APP_OUTPUT);
const offenders = [];

for (const file of files) {
  const html = await readFile(file, "utf8");
  if (html.includes("opacity:0")) offenders.push(file);
}

if (offenders.length > 0) {
  console.error("Server-rendered pages contain opacity:0 hidden content:");
  for (const file of offenders) console.error(`- ${file}`);
  process.exitCode = 1;
} else {
  console.log(`No opacity:0 regressions found across ${files.length} generated HTML files.`);
}
