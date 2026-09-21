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

const pricingFile = join(APP_OUTPUT, "pricing.html");
const pricingHtml = await readFile(pricingFile, "utf8");
const requiredPricingHtml = [
  ['data-pricing-server-summary="true"', "server pricing summary"],
  ['data-price-path="enquiries"', "enquiry journey"],
  ['data-launch-price="GHS 1,500"', "enquiry launch price"],
  ['data-standard-price="GHS 2,000"', "enquiry standard price"],
  ['data-price-path="orders"', "product-order journey"],
  ['data-launch-price="GHS 2,000–2,400"', "product-order launch range"],
  ['data-standard-price="GHS 2,500–2,900"', "product-order standard range"],
  ['data-price-path="payments"', "guest-checkout journey"],
  ['data-launch-price="GHS 3,000–4,000"', "guest-checkout launch range"],
  ['data-standard-price="GHS 3,500–4,500"', "guest-checkout standard range"],
  ["Build-only receives no launch discount.", "build-only discount condition"],
  ["From year two, the exact selected renewal", "renewal condition"],
  ["Interactive controls need JavaScript.", "no-JavaScript direction"],
];
const missingPricing = requiredPricingHtml.filter(([fragment]) => !pricingHtml.includes(fragment));

if (offenders.length > 0 || missingPricing.length > 0) {
  console.error("Server-rendered pages contain opacity:0 hidden content:");
  for (const file of offenders) console.error(`- ${file}`);
  if (missingPricing.length > 0) {
    console.error("Generated pricing HTML is missing required no-JavaScript content:");
    for (const [, label] of missingPricing) console.error(`- ${label}`);
  }
  process.exitCode = 1;
} else {
  console.log(`No opacity:0 regressions found across ${files.length} generated HTML files; pricing HTML includes server-rendered journey prices and conditions.`);
}
