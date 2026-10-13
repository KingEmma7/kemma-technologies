import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.[cm]?[jt]sx?$/.test(entry.name) ? [path] : [];
  });
}

describe("personal quotes only", () => {
  it.each(["app/pricing/page.tsx", "app/contact/page.tsx"])(
    "%s offers a personal quote rather than public rates",
    (path) => {
      const page = source(path);
      expect(page).toContain('data-quote-only="true"');
      expect(page).toContain("quoted individually by Emmanuel");
      expect(page).toContain("<ContactForm />");
      expect(page).not.toMatch(/\b(?:GHS|USD)\s*[\d,]+|(?:₵|\$)\s*\d/);
    },
  );

  it("does not import the legacy price catalogue into public pages or components", () => {
    for (const directory of ["app", "components"]) {
      for (const path of sourceFiles(join(process.cwd(), directory))) {
        expect(readFileSync(path, "utf8"), path).not.toMatch(/lib\/pricing\/|PricingPlanner/);
      }
    }
  });

  it("keeps old pricing anchor links usable", () => {
    expect(source("app/pricing/page.tsx")).toContain('id="estimate"');
  });

  it("routes requests through the existing contact API without preset budget bands", () => {
    const form = source("components/site/ContactForm.tsx");
    expect(form).toContain('fetch("/api/contact"');
    expect(form).toContain("Request a quote");
    expect(form).toContain("Emmanuel reviews each request personally");
    expect(form).not.toContain("BUDGET_RANGES");
    expect(form).not.toContain('select("budget"');
    expect(form).toContain("mailto:${SITE.email}");
    expect(form).toContain("https://wa.me/${SITE.whatsapp}");
  });
});
