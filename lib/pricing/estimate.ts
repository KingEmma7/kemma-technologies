import catalogue from "./catalogue.json";

export { catalogue };
export type Addon = {
  id: string; group: string; name: string; min: number | null; max: number | null;
  unit?: string; scope: string; quote_required?: boolean; running_cost?: string;
  includes?: string[]; exclusive_with?: string[]; requires?: string; overlap_rule?: string;
};
export const addons: Addon[] = catalogue.addons;
export type Selection = {
  path: string; assistant: string; presentation: string; extras: Record<string, number>;
  credits: string[]; existingStore: boolean; existingAccounts: boolean; modelReady: boolean;
  offer: "package" | "build_only";
  domain: "standard" | "premium" | "existing";
  aiService: "quote" | "chatbase_example";
  care: "client_managed" | "static_managed" | "active_care";
  demo: string;
};
export const assistantIds = ["faq", "ai", "ai_api", "ai_actions"];
export const presentationIds = ["scroll", "three_viewer", "three_scroll", "configurator"];
const commerceIds = ["catalogue", "payment_links", "store"];
const backendIds = ["cms", "accounts", "booking_custom", "dashboard", "subscriptions", "portal", "ai_api", "ai_actions", "messaging_api", "gateway", "order_history"];
export const money = (value: number, currency = "GHS") => `${currency} ${value.toLocaleString("en-GH", { maximumFractionDigits: 2 })}`;
export function charge(addon: Pick<Addon, "min" | "max" | "unit" | "quote_required">) {
  if (addon.min === null) return "Quote needed";
  const amount = addon.max === null ? `From ${money(addon.min)}` : addon.min === addon.max ? money(addon.min) : `${money(addon.min)}–${addon.max.toLocaleString("en-GH")}`;
  return `${amount}${addon.unit ? ` / ${addon.unit}` : ""}${addon.quote_required ? " · quote needed" : ""}`;
}
export function initialSelection(path = "starter", demo = ""): Selection {
  const example = catalogue.examples.find((x) => x.id === path);
  const demoPath = catalogue.demoPaths.find((x) => x.id === demo);
  const initial = new Set([...(example?.addons ?? []), ...(demoPath?.features ?? [])]);
  const commerce = initial.has("store") ? "store" : initial.has("payment_links") ? "links" : initial.has("catalogue") ? "catalogue" : "starter";
  return {
    path: commerce,
    assistant: assistantIds.find((id) => initial.has(id)) ?? "none",
    presentation: presentationIds.find((id) => initial.has(id)) ?? "none",
    extras: Object.fromEntries([...initial].filter((id) => ![...commerceIds, ...assistantIds, ...presentationIds].includes(id)).map((id) => [id, 1])),
    credits: [], existingStore: false, existingAccounts: false, modelReady: false,
    offer: "package", domain: "standard", aiService: "quote", care: "client_managed", demo: demoPath?.id ?? "",
  };
}
export type JourneyGoal = "enquiries" | "orders" | "payments";
export function selectJourney(raw: Selection, goal: JourneyGoal): Selection {
  const path = goal === "enquiries" ? "starter" : goal === "payments" ? "store" : ["catalogue", "links"].includes(raw.path) ? raw.path : "catalogue";
  return { ...raw, path, extras: { ...raw.extras }, credits: [...raw.credits] };
}
export function selectOrderVariant(raw: Selection, variant: "catalogue" | "links" | "faq"): Selection {
  return {
    ...raw,
    path: variant === "catalogue" ? "catalogue" : "links",
    assistant: variant === "faq" ? "faq" : raw.assistant === "faq" ? "none" : raw.assistant,
    extras: { ...raw.extras },
    credits: [...raw.credits],
  };
}
export function extraAvailability(id: string, s: Selection): string | null {
  const store = s.path === "store" || s.existingStore;
  const accounts = Boolean(s.extras.accounts) || s.existingAccounts;
  if (id === "gateway" && s.path === "store") return "One gateway is already included in the store.";
  if (id === "gateway" && s.path === "links") return "Choose a store gateway or hosted payment links, not both.";
  if (id === "gateway" && !s.existingStore) return "Requires an existing compatible store. You can confirm it below.";
  if (id === "social_login" && !accounts) return "Add standard accounts or confirm existing customer logins first.";
  if (id === "order_history" && (!accounts || !store)) return "Requires customer accounts and a store with central order records.";
  if (id === "subscriptions" && !store) return "Requires a compatible store or service; a written scope is also needed.";
  if (id === "product_entry" && s.path === "starter" && !s.existingStore) return "Choose a catalogue/store, or confirm an existing store first.";
  if (id === "filters" && s.path === "starter" && !s.extras.cms && !s.existingStore) return "Requires a catalogue, editable collection or existing store.";
  return null;
}
export function normalise(raw: Selection) {
  const s: Selection = { ...raw, extras: {}, credits: [...raw.credits] };
  const notes: string[] = [];
  if (s.offer !== "build_only") s.offer = "package";
  if (!["standard", "premium", "existing"].includes(s.domain)) s.domain = "standard";
  if (s.offer === "build_only") s.domain = "existing";
  if (!catalogue.paths.some((p) => p.id === s.path)) s.path = "starter";
  if (!assistantIds.includes(s.assistant)) s.assistant = "none";
  if (!presentationIds.includes(s.presentation)) s.presentation = "none";
  for (const [id, qty] of Object.entries(raw.extras)) {
    const item = addons.find((a) => a.id === id);
    if (!item || !Number.isFinite(qty) || qty <= 0) continue;
    if ([...commerceIds, ...assistantIds, ...presentationIds].includes(id)) continue;
    s.extras[id] = item.unit ? Math.min(1000, Math.max(1, Math.floor(qty))) : 1;
    if (qty > 1000) notes.push(`${item.name}: quantities above 1,000 require a separate quote.`);
  }
  if (s.extras.booking_custom && s.extras.booking_embed) {
    delete s.extras.booking_embed;
    notes.push("Custom booking replaces the overlapping calendar embed setup.");
  }
  for (const id of Object.keys(s.extras)) {
    const reason = extraAvailability(id, s);
    if (reason) { delete s.extras[id]; notes.push(reason); }
  }
  s.credits = s.credits.filter((id) => ["accounts", "order_history", "cms"].includes(id) && s.extras[id] && (s.path === "store" || s.existingStore));
  const ids = [...(catalogue.paths.find((p) => p.id === s.path)?.features ?? []), ...Object.keys(s.extras), s.assistant, s.presentation];
  const staticEligible = !ids.some((id) => backendIds.includes(id)) && s.path !== "store" && !s.existingStore && !s.existingAccounts;
  if (!staticEligible && s.care === "static_managed") {
    s.care = "client_managed";
    notes.push("Annual static care does not cover this setup. Care has been cleared; choose active care if wanted.");
  }
  if (s.assistant !== "ai") s.aiService = "quote";
  return { selection: s, notes, staticEligible };
}
export function estimate(raw: Selection, launchEnabled = catalogue.launch.enabled) {
  const { selection: s, notes, staticEligible } = normalise(raw);
  const features = new Map<string, number>();
  for (const id of catalogue.paths.find((p) => p.id === s.path)?.features ?? []) features.set(id, 1);
  for (const id of [s.assistant, s.presentation]) if (id !== "none") features.set(id, 1);
  for (const [id, qty] of Object.entries(s.extras)) features.set(id, qty);
  const included = new Set([...features.keys()].flatMap((id) => addons.find((a) => a.id === id)?.includes ?? []));
  for (const id of included) features.delete(id);
  const lines = [...features].map(([id, qty]) => ({ ...addons.find((a) => a.id === id)!, qty, credited: s.credits.includes(id) }));
  const buildMin = catalogue.baseFee + lines.reduce((sum, a) => sum + (a.credited ? 0 : (a.min ?? 0) * a.qty), 0);
  const buildQuote = lines.filter((a) => !a.credited && (a.quote_required || a.min === null || a.max === null)).map((a) => `${a.name}: final scope and fee`);
  if (raw.extras && Object.values(raw.extras).some((q) => q > 1000)) buildQuote.push("Large-quantity work");
  const three = ["three_viewer", "three_scroll", "configurator"].includes(s.presentation);
  if (three && !s.modelReady && !s.extras.three_model) buildQuote.push("A usable supplied 3D model, or a model creation/repair quote");
  const buildMax = buildQuote.length ? null : catalogue.baseFee + lines.reduce((sum, a) => sum + (a.credited ? 0 : (a.max ?? 0) * a.qty), 0);
  const packageFee = s.offer === "package" ? catalogue.packageFee : 0;
  const launchApplied = s.offer === "package" && launchEnabled;
  const discount = launchApplied ? catalogue.launch.discount : 0;
  const standardPackageMin = buildMin + packageFee;
  const standardPackageMax = buildMax === null ? null : buildMax + packageFee;
  const packageMin = standardPackageMin - discount;
  const packageMax = standardPackageMax === null ? null : standardPackageMax - discount;
  const aiExample = catalogue.suppliers.find((x) => x.id === "chatbase_hobby")!;
  const annualCare = catalogue.care.find((x) => x.id === "static_managed")!.annual_service_fee!;
  const monthlyCareFloor = catalogue.care.find((x) => x.id === "active_care")!.monthly_service_fee_from!;
  const recurringQuotes: string[] = [];
  const domainFirst = s.domain === "premium" ? null : 0;
  const domainRenewal = null;
  const renewalNote = "Domain and hosting renew from year two. The exact selected plan, renewal price and billing owner are disclosed before your deposit; no fixed renewal price is assumed.";
  if (s.domain === "premium") recurringQuotes.push("Premium name or extension: quote the extra cost after crediting the included standard domain allowance");
  if (s.offer === "build_only") recurringQuotes.push("Verify your existing domain, suitable hosting and enquiry delivery; any upgrades or transfer work are quoted separately");
  if (!staticEligible) recurringQuotes.push(s.offer === "package"
    ? "Specialist hosting, backend and enquiry services: quote the additional or replacement infrastructure and credit bundled hosting work before agreement; do not charge twice"
    : "Specialist hosting, backend and enquiry services: confirm compatibility and quote any required upgrades");
  if (s.care === "active_care") recurringQuotes.push("Active care: agree the monthly scope and fee");
  for (const a of lines) {
    if (!a.running_cost || a.id === "payment_links" || a.id === "gateway") continue;
    if (a.id === "ai" && s.aiService === "chatbase_example") continue;
    if (["social_login", "order_history"].includes(a.id) && lines.some((x) => x.id === "accounts")) continue;
    recurringQuotes.push(`${a.name}: ${a.running_cost}`);
  }
  const careAnnual = s.care === "static_managed" ? annualCare : 0;
  const usdMonthly = s.assistant === "ai" && s.aiService === "chatbase_example" ? aiExample.monthly! : 0;
  const renewalsGhs = careAnnual;
  const usage = [];
  if (features.has("payment_links") || features.has("store") || features.has("gateway") || features.has("subscriptions")) usage.push("Payment processor charges on transactions; the selected provider’s rate must be confirmed.");
  if (["ai", "ai_api", "ai_actions"].includes(s.assistant)) usage.push("AI message/model usage and overages; agree an allowance and spending limit.");
  if (features.has("messaging_api") || features.has("booking_custom")) usage.push("Any SMS, WhatsApp or reminder fees, based on usage.");
  const incomplete = buildQuote.length > 0 || recurringQuotes.length > 0;
  return {
    selection: s, notes, staticEligible, lines, included: [...included], buildMin, buildMax, buildQuote,
    recurringQuotes: [...new Set(recurringQuotes)], incomplete, domainFirst, domainRenewal, careAnnual,
    activeCareFrom: s.care === "active_care" ? monthlyCareFloor : null,
    usdMonthly, usdAnnual: usdMonthly * 12,
    packageFee, discount, launchApplied, standardPackageMin, standardPackageMax, packageMin, packageMax, renewalNote,
    firstYearGhsMin: packageMin + careAnnual,
    firstYearGhsMax: packageMax === null ? null : packageMax + careAnnual,
    renewalsGhs, usage,
  };
}
export function buildLabel(result: ReturnType<typeof estimate>) {
  if (result.buildMax === null) return `${money(result.buildMin)} + quote needed`;
  return result.buildMin === result.buildMax ? money(result.buildMin) : `${money(result.buildMin)}–${result.buildMax.toLocaleString("en-GH")}`;
}
export function packageLabel(result: ReturnType<typeof estimate>) {
  if (result.packageMax === null) return `${money(result.packageMin)} + quote needed`;
  return result.packageMin === result.packageMax ? money(result.packageMin) : `${money(result.packageMin)}–${result.packageMax.toLocaleString("en-GH")}`;
}
export function standardPackageLabel(result: ReturnType<typeof estimate>) {
  if (result.standardPackageMax === null) return `${money(result.standardPackageMin)} + quote needed`;
  return result.standardPackageMin === result.standardPackageMax ? money(result.standardPackageMin) : `${money(result.standardPackageMin)}–${result.standardPackageMax.toLocaleString("en-GH")}`;
}
export const launchTerms = `First ${catalogue.launch.booking_limit} eligible new website projects confirmed by deposit. Availability confirmed in your written quote.`;
export function enquiryUrl(raw: Selection) {
  const e = estimate(raw), s = e.selection;
  const demo = catalogue.demoPaths.find((d) => d.id === s.demo);
  const parts = [
    "Hi Kemma, I’d like a written website quote. This is an estimate, not an order.",
    demo ? `Demo reference: ${demo.name}. The full showcase is separately scoped.` : "",
    `Website path: ${catalogue.paths.find((p) => p.id === s.path)?.name}.`,
    `Selected work: ${e.lines.map((a) => `${a.name}${a.qty > 1 ? ` × ${a.qty}` : ""}${a.credited ? " (platform credit assumed)" : ""}`).join(", ") || "Starter scope only"}.`,
    `Offer: ${s.offer === "package" ? "Website with first-year eligible standard domain and basic hosting" : "Build-only with suitable existing services"}. No fixed page or product cap; agreed structure and supplied content preparation, with one revision.`,
    `Build work: ${buildLabel(e)}. First-year package provision: ${money(e.packageFee)}.`,
    e.launchApplied ? `Launch discount: ${money(e.discount)} once per bundled project. ${launchTerms} No build-only stacking.` : "",
    `Website ${e.launchApplied ? "launch " : ""}estimate: ${packageLabel(e)}${e.launchApplied ? `; standard price ${standardPackageLabel(e)}; save ${money(e.discount)}` : ""}.`,
    `Known first-year GHS subtotal from ${money(e.firstYearGhsMin)}${e.usdAnnual ? `; separately ${money(e.usdAnnual, "USD")}/year` : ""}.`,
    `Domain: ${{standard: "eligible standard name included for year one", premium: "premium name or extension, extra cost to quote with credit", existing: "existing domain, ownership and renewal to confirm"}[s.domain]}. Hosting: ${s.offer === "package" ? "suitable basic hosting included for year one; specialist infrastructure quoted with bundled-work credit" : "use my suitable existing services; compatibility and upgrades to confirm"}. Care: ${{client_managed: "handover, no ongoing Kemma care", static_managed: "annual static care", active_care: "active care, final monthly fee to quote"}[s.care]}.`,
    e.renewalNote,
    e.activeCareFrom ? `Active care from ${money(e.activeCareFrom)}/month (${money(e.activeCareFrom * 12)} over 12 months), final quote needed and excluded from the subtotal.` : "",
    e.incomplete ? `Quote needed: ${[...e.buildQuote, ...e.recurringQuotes].join("; ")}.` : "Included first-year services and scope will be confirmed before deposit.",
    "Please confirm scope, credits, provider costs, renewals, usage fees and any applicable taxes before we agree.",
  ];
  return `https://wa.me/${catalogue.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(parts.filter(Boolean).join("\n"))}`;
}
