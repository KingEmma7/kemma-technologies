import { describe, expect, it } from "vitest";
import { addons, catalogue, estimate, initialSelection, normalise, extraAvailability, enquiryUrl, selectJourney, selectOrderVariant } from "../lib/pricing/estimate";

describe("website pricing contract", () => {
  it.each([["starter", 1500, 2000], ["catalogue", 2000, 2500], ["links", 2300, 2800], ["faq", 2800, 3300], ["store", 3500, 4000], ["three", 3250, 3750], ["ai", 2250, 2750]] as const)("matches launch and standard %s floors", (path, launch, standard) => {
    const s = initialSelection(path);
    expect(estimate(s, true).packageMin).toBe(launch);
    expect(estimate(s, false).packageMin).toBe(standard);
    expect(estimate(s, false).discount).toBe(0);
    expect(estimate(s, true).standardPackageMin).toBe(standard);
    const launchEstimate = estimate(s, true);
    expect(launchEstimate.standardPackageMin - launchEstimate.packageMin).toBe(catalogue.launch.discount);
    if (launchEstimate.packageMax !== null && launchEstimate.standardPackageMax !== null) expect(launchEstimate.standardPackageMax - launchEstimate.packageMax).toBe(catalogue.launch.discount);
    const example = catalogue.examples.find((e) => e.id === path)!;
    expect(example.launch_package_from).toBe(launch);
    expect(example.standard_package_from).toBe(standard);
  });
  it("has no fixed page, product, word or image cap while preserving agreed-scope labour", () => {
    expect(catalogue.starter).toMatchObject({ form_fields_max: 5, revision_rounds: 1, defect_correction_days: 30 });
    expect(catalogue.starter).not.toHaveProperty("pages_max");
    expect(catalogue.starter).not.toHaveProperty("supplied_words_max");
    expect(catalogue.starter).not.toHaveProperty("supplied_images_max");
    expect(addons.find((a) => a.id === "page")?.scope).toContain("page count itself is not capped");
    expect(addons.find((a) => a.id === "product_entry")?.scope).toContain("capacity is not capped");
    expect(catalogue.launch.booking_limit).toBe(5);
  });
  it("includes first-year standard services without adding a second domain charge or inventing renewals", () => {
    const e = estimate(initialSelection(), true);
    expect(e.buildMin).toBe(1500); expect(e.packageFee).toBe(500); expect(e.discount).toBe(500);
    expect(e.firstYearGhsMin).toBe(1500); expect(e.firstYearGhsMax).toBe(1500);
    expect(e.domainFirst).toBe(0); expect(e.domainRenewal).toBeNull(); expect(e.renewalsGhs).toBe(0);
    expect(e.incomplete).toBe(false); expect(e.renewalNote).toContain("before your deposit");
  });
  it("does not stack the launch discount with build-only or charge package provision", () => {
    const s = initialSelection("catalogue"); s.offer = "build_only";
    for (const enabled of [true, false]) {
      const e = estimate(s, enabled);
      expect(e.packageMin).toBe(2000); expect(e.discount).toBe(0); expect(e.packageFee).toBe(0);
      expect(e.selection.domain).toBe("existing"); expect(e.recurringQuotes.join()).toContain("existing domain");
    }
  });
  it("applies the discount once despite multiple additions and optional care", () => {
    const s = initialSelection("faq"); s.extras.page = 2; s.care = "static_managed";
    const launch = estimate(s, true), standard = estimate(s, false);
    expect(standard.firstYearGhsMin - launch.firstYearGhsMin).toBe(500);
    expect(launch.careAnnual).toBe(300); expect(launch.firstYearGhsMin).toBe(3500);
  });
  it("quotes premium domains and credits the included provision without pretending they are included", () => {
    const s = initialSelection(); s.domain = "premium";
    const e = estimate(s);
    expect(e.domainFirst).toBeNull(); expect(e.incomplete).toBe(true);
    expect(e.recurringQuotes.join()).toContain("crediting the included standard domain");
  });
  it("does not add another registration fee for an existing domain in a package", () => {
    const s = initialSelection(); s.domain = "existing";
    const e = estimate(s, true);
    expect(e.firstYearGhsMin).toBe(1500); expect(e.domainFirst).toBe(0); expect(e.domainRenewal).toBeNull();
  });
  it("keeps every addition in exactly one category and preserves its identity", () => {
    expect(addons).toHaveLength(38); expect(new Set(addons.map((a) => a.id)).size).toBe(38);
    for (const a of addons) expect(catalogue.groups.filter((g) => g.matches.includes(a.group))).toHaveLength(1);
  });
  it("does not charge a store for its catalogue or gateway again, but requires infrastructure credit", () => {
    const s = initialSelection("store");
    s.extras = { ...s.extras, catalogue: 1, gateway: 1, payment_links: 1, store: 1 };
    const e = estimate(s);
    expect(e.buildMin).toBe(3500); expect(e.included.sort()).toEqual(["catalogue", "gateway"]);
    expect(e.lines.map((a) => a.id).sort()).toEqual(["accounts", "store"]);
    expect(e.incomplete).toBe(true); expect(e.recurringQuotes.join()).toContain("credit bundled hosting work");
    s.extras = {}; expect(estimate(s, false).packageMin).toBe(3500);
  });
  it("credits platform-provided accounts and history without inventing free specialist hosting", () => {
    const s = initialSelection("store"); s.extras.order_history = 1;
    expect(estimate(s).buildMin).toBe(3800);
    s.credits = ["accounts", "order_history"];
    const e = estimate(s);
    expect(e.buildMin).toBe(3000); expect(e.lines.filter((a) => a.credited)).toHaveLength(2); expect(e.incomplete).toBe(true);
  });
  it("only credits configuration on a selected compatible platform", () => {
    const s = initialSelection(); s.extras.accounts = 1; s.credits = ["accounts"];
    expect(estimate(s).buildMin).toBe(2000);
  });
  it("replaces overlapping viewer/scroll and fixed FAQ charges", () => {
    const s = initialSelection(); s.presentation = "three_scroll"; s.modelReady = true; s.assistant = "ai";
    s.extras = { three_viewer: 1, scroll: 1, three_scroll: 1, faq: 1, ai: 1 };
    const e = estimate(s);
    expect(e.buildMin).toBe(4000); expect(e.lines.map((a) => a.id).sort()).toEqual(["ai", "three_scroll"]);
    expect(e.included.sort()).toEqual(["scroll", "three_viewer"]);
  });
  it("requires a model quote if a viewer has no usable supplied model", () => {
    const s = initialSelection(); s.presentation = "three_viewer";
    const e = estimate(s);
    expect(e.buildMin).toBe(2700); expect(e.buildMax).toBeNull(); expect(e.buildQuote.join()).toContain("3D model");
    s.modelReady = true; expect(estimate(s).buildMax).toBe(4000);
  });
  it("preserves content-preparation and provider quantity arithmetic", () => {
    const s = initialSelection("catalogue"); s.extras = { page: 2, product_entry: 5, accounts: 1, social_login: 2 };
    const e = estimate(s);
    expect(e.buildMin).toBe(3400); expect(e.buildMax).toBe(4900); expect(e.lines.find((a) => a.id === "social_login")?.qty).toBe(2);
  });
  it("does not multiply non-quantity additions", () => {
    const s = initialSelection(); s.extras.analytics = 50; expect(estimate(s).buildMin).toBe(1750);
  });
  it("rejects invalid quantities and requires a quote for unsupported bulk quantities", () => {
    const s = initialSelection(); s.extras = { page: Infinity, copy: -4, revision: NaN };
    expect(estimate(s).buildMin).toBe(1500); s.extras.page = 1001; expect(estimate(s).buildMax).toBeNull();
  });
  it("requires accounts and central order records for customer history", () => {
    const s = initialSelection(); s.extras = { social_login: 1, order_history: 1 };
    expect(normalise(s).selection.extras).toEqual({});
    s.existingAccounts = true; s.existingStore = true; expect(estimate(s).buildMin).toBe(2000);
  });
  it("requires a collection for filters and a catalogue/store for product entries", () => {
    const s = initialSelection(); expect(extraAvailability("filters", s)).not.toBeNull(); expect(extraAvailability("product_entry", s)).not.toBeNull();
    s.extras.cms = 1; expect(extraAvailability("filters", s)).toBeNull();
  });
  it("only offers gateway work for a compatible existing store", () => {
    const s = initialSelection(); s.extras.gateway = 1; expect(estimate(s).buildMin).toBe(1500);
    s.existingStore = true; expect(estimate(s).buildMin).toBe(2200);
    s.path = "links"; expect(normalise(s).selection.extras.gateway).toBeUndefined();
  });
  it("keeps custom work and mandatory services unknown", () => {
    const s = initialSelection(); s.extras.portal = 1;
    const e = estimate(s); expect(e.buildMax).toBeNull(); expect(e.incomplete).toBe(true);
    expect(e.lines.find((a) => a.id === "portal")?.min).toBeNull(); expect(e.recurringQuotes.join()).toContain("Specialist hosting");
  });
  it("does not double-charge embedded and custom booking setup", () => {
    const s = initialSelection(); s.extras = { booking_embed: 1, booking_custom: 1 };
    expect(estimate(s).buildMin).toBe(3000); expect(estimate(s).buildMax).toBeNull();
  });
  it("shows fixed care in first-year costs and keeps renewal unknown", () => {
    const s = initialSelection("faq"); s.care = "static_managed";
    const e = estimate(s, true); expect(e.firstYearGhsMin).toBe(3100); expect(e.renewalsGhs).toBe(300);
    expect(e.domainRenewal).toBeNull(); expect(e.usage).toHaveLength(1);
  });
  it("keeps USD recurring fees separate from GHS", () => {
    const s = initialSelection("ai"); s.aiService = "chatbase_example";
    const e = estimate(s, true);
    expect(e.firstYearGhsMin).toBe(2250); expect(e.usdMonthly).toBe(40); expect(e.usdAnnual).toBe(480);
    expect(e.domainRenewal).toBeNull(); expect(e.usage).toHaveLength(1);
  });
  it("does not carry annual static care into a store", () => {
    const s = initialSelection("store"); s.care = "static_managed";
    const e = estimate(s); expect(e.staticEligible).toBe(false); expect(e.careAnnual).toBe(0); expect(e.notes).toHaveLength(1);
  });
  it("shows active care as a separate unquoted monthly scope", () => {
    const s = initialSelection(); s.care = "active_care";
    const e = estimate(s, true);
    expect(e.activeCareFrom).toBe(200); expect(e.careAnnual).toBe(0); expect(e.incomplete).toBe(true); expect(e.firstYearGhsMin).toBe(1500);
    const message = new URL(enquiryUrl(s)).searchParams.get("text")!;
    expect(message).toContain("GHS 2,400 over 12 months"); expect(message).not.toContain("active_care");
  });
  it("falls back safely for unknown presets and domains", () => {
    expect(initialSelection("unknown", "unknown")).toMatchObject({ path: "starter", demo: "", offer: "package", domain: "standard" });
  });
  it("uses guest checkout for the top-level payment journey without changing existing additions", () => {
    const current = initialSelection(); current.extras.analytics = 1;
    const payment = selectJourney(current, "payments");
    expect(payment.path).toBe("store"); expect(payment.extras).toEqual({ analytics: 1 }); expect(payment.extras.accounts).toBeUndefined();
    expect(estimate(selectJourney(initialSelection(), "payments")).packageMin).toBe(3000);
    expect(estimate(initialSelection("store")).packageMin).toBe(3500);
  });
  it("keeps all product-order variants reachable without dropping unrelated choices", () => {
    const current = initialSelection(); current.presentation = "scroll";
    const order = selectJourney(current, "orders");
    const links = selectOrderVariant(order, "links");
    const faq = selectOrderVariant(links, "faq");
    expect(order.path).toBe("catalogue"); expect(links.path).toBe("links");
    expect(faq).toMatchObject({ path: "links", assistant: "faq", presentation: "scroll" });
    expect(selectOrderVariant(faq, "catalogue")).toMatchObject({ path: "catalogue", assistant: "none", presentation: "scroll" });
  });
  it.each(["pace", "sill", "afram"])("carries %s and the actual offer into a visitor-controlled enquiry", (demo) => {
    const s = initialSelection("starter", demo), url = new URL(enquiryUrl(s)), text = url.searchParams.get("text")!;
    expect(url.origin + url.pathname).toBe("https://wa.me/233203781818");
    expect(text).toContain("not an order"); expect(text).toContain("Demo reference"); expect(text).toContain("No fixed page or product cap");
    expect(text).toContain("renewal"); expect(text).toContain("before your deposit");
    if (catalogue.launch.enabled) { expect(text).toContain("Launch discount: GHS 500 once"); expect(text).toContain("confirmed by deposit"); }
    s.offer = "build_only";
    const buildOnly = new URL(enquiryUrl(s)).searchParams.get("text")!;
    expect(buildOnly).toContain("Build-only"); expect(buildOnly).not.toContain("Launch discount");
  });
});
