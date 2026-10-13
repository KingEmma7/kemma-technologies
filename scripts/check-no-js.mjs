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

const requiredQuoteHtml = [
  ['data-quote-only="true"', "quote-only page"],
  ["quoted individually by Emmanuel", "personal quote policy"],
  ["Request a quote", "quote request action"],
  ['href="mailto:', "direct email contact without JavaScript"],
  ['href="https://wa.me/', "direct WhatsApp contact without JavaScript"],
];
const quoteErrors = [];

for (const route of ["pricing", "contact"]) {
  const html = await readFile(join(APP_OUTPUT, `${route}.html`), "utf8");
  // React's embedded Flight data contains references such as "$1", which
  // are not prices. Check visible markup and metadata, not script payloads.
  const publicHtml = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  for (const [fragment, label] of requiredQuoteHtml) {
    if (!publicHtml.includes(fragment)) quoteErrors.push(`${route}: missing ${label}`);
  }
  if (/\b(?:GHS|USD|GH₵)\s*[\d,]+|(?:₵|\$)\s*\d|data-(?:launch-price|standard-price|pricing-server-summary)|\b(?:launch price|launch discount|starting (?:price|estimate))\b/i.test(publicHtml)) {
    quoteErrors.push(`${route}: public pricing or an automated estimate has returned`);
  }
}

if (offenders.length > 0 || quoteErrors.length > 0) {
  if (offenders.length > 0) {
    console.error("Server-rendered pages contain opacity:0 hidden content:");
    for (const file of offenders) console.error(`- ${file}`);
  }
  if (quoteErrors.length > 0) {
    console.error("Generated quote pages failed their no-JavaScript checks:");
    for (const error of quoteErrors) console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(`No opacity:0 regressions found across ${files.length} generated HTML files; quote pages contain personal-quote information and direct contact links without public prices.`);
}
