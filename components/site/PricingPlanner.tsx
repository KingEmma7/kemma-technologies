"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Check, CircleCheck, Coffee, CreditCard, Inbox, MessageCircle, Minus, Plus, ShoppingBag } from "lucide-react";
import { addons, assistantIds, presentationIds, catalogue, charge, estimate, initialSelection, extraAvailability, packageLabel, standardPackageLabel, launchTerms, enquiryUrl, money, selectJourney, selectOrderVariant, type JourneyGoal, type Selection } from "@/lib/pricing/estimate";
import styles from "@/app/pricing/page.module.css";

const mainIds = ["catalogue", "payment_links", "store", ...assistantIds, ...presentationIds];

export function PricingPlanner() {
  const params = useSearchParams();
  const path = params.get("path") ?? "starter", demo = params.get("demo") ?? "";
  return <Planner key={`${path}:${demo}`} initial={initialSelection(path, demo)} />;
}

function Planner({ initial }: { initial: Selection }) {
  const [raw, setRaw] = useState(initial);
  const [extra, setExtra] = useState("");
  const result = estimate(raw), s = result.selection;
  const demo = catalogue.demoPaths.find((d) => d.id === s.demo);
  const hosted = catalogue.suppliers.find((x) => x.id === "chatbase_hobby")!;
  const staticCare = catalogue.care.find((x) => x.id === "static_managed")!;
  const activeCare = catalogue.care.find((x) => x.id === "active_care")!;
  const update = (change: Partial<Selection>) => setRaw({ ...s, ...change });
  const add = () => {
    if (!extra || extraAvailability(extra, s)) return;
    const next = { ...s.extras, [extra]: 1 };
    if (extra === "booking_embed") delete next.booking_custom;
    if (extra === "booking_custom") delete next.booking_embed;
    update({ extras: next }); setExtra("");
  };
  const remove = (id: string) => { const next = { ...s.extras }; delete next[id]; update({ extras: next }); };
  const three = ["three_viewer", "three_scroll", "configurator"].includes(s.presentation);
  return (
    <div className={styles.plannerGrid}>
      <div className={styles.choices}>
        {demo && <div className={styles.demoNote}>
          <h3>Inspired by {demo.name}</h3>
          <p>{demo.summary}</p><p>{demo.boundary}</p>
          <Link className="text-link" href={`/demos#${demo.id}`}>Revisit the demo</Link>
        </div>}
        <JourneyPreview selection={s} update={update} />
        {result.notes.length > 0 && <div className={styles.changeNote} role="status">{result.notes.map((note) => <p key={note}>{note}</p>)}</div>}
        <details className={styles.customise}>
          <summary>Customise scope and running costs</summary>
          <div className={styles.customiseBody}>
        <fieldset>
          <legend>Choose your starting offer</legend>
          <div className={styles.routeChoices}>
            <label className={styles.routeChoice}><input type="radio" name="website-offer" checked={s.offer === "package"} onChange={() => update({ offer: "package", domain: "standard" })} /><span><strong>Website + first-year domain & hosting</strong><small>{catalogue.launch.enabled ? `Launch from ${money(catalogue.baseFee + catalogue.packageFee - catalogue.launch.discount)} · standard from ${money(catalogue.baseFee + catalogue.packageFee)}` : `From ${money(catalogue.baseFee + catalogue.packageFee)}`}. Eligible standard domain and suitable basic hosting included.</small></span></label>
            <label className={styles.routeChoice}><input type="radio" name="website-offer" checked={s.offer === "build_only"} onChange={() => update({ offer: "build_only" })} /><span><strong>Build only · I have suitable services</strong><small>From {money(catalogue.baseFee)}. Use your existing domain and hosting, subject to compatibility. The launch discount does not apply.</small></span></label>
          </div>
          {catalogue.launch.enabled && <p className={styles.hint}>{launchTerms} One discount per bundled project.</p>}
        </fieldset>
        <fieldset>
          <legend>What should your website do?</legend>
          <div className={styles.routeChoices}>
            {catalogue.paths.map((path) => <label key={path.id} className={styles.routeChoice}>
              <input type="radio" name="website-path" value={path.id} checked={s.path === path.id} onChange={() => update({ path: path.id })} />
              <span><strong>{path.name}</strong><small>{path.summary}</small></span>
            </label>)}
          </div>
        </fieldset>
        <div className={styles.selectPair}>
          <label>Automated help
            <select value={s.assistant} onChange={(e) => update({ assistant: e.target.value })}>
              <option value="none">No assistant</option>
              {assistantIds.map((id) => { const a = addons.find((x) => x.id === id)!; return <option value={id} key={id}>{a.name} · {charge(a)}</option>; })}
            </select>
          </label>
          <label>Visual presentation
            <select value={s.presentation} onChange={(e) => update({ presentation: e.target.value })}>
              <option value="none">Included hover, focus & simple transitions</option>
              {presentationIds.map((id) => { const a = addons.find((x) => x.id === id)!; return <option value={id} key={id}>{a.name} · {charge(a)}</option>; })}
            </select>
          </label>
        </div>
        <p className={styles.hint}>Choose one assistant and one presentation option. A combined 3D/scroll sequence includes the viewer and scroll work.</p>
        {three && <label className={styles.check}><input type="checkbox" checked={s.modelReady} onChange={(e) => update({ modelReady: e.target.checked })} />I can supply a usable 3D model with permission to use it.</label>}
        <fieldset>
          <legend>Anything else your business needs?</legend>
          <div className={styles.addFeature}>
            <label>Add a feature
              <select value={extra} onChange={(e) => setExtra(e.target.value)}>
                <option value="">Choose an addition</option>
                {catalogue.groups.map((group) => <optgroup key={group.id} label={group.name}>
                  {addons.filter((a) => group.matches.includes(a.group) && !mainIds.includes(a.id) && !s.extras[a.id]).map((a) => <option key={a.id} value={a.id}>{a.name} · {charge(a)}</option>)}
                </optgroup>)}
              </select>
            </label>
            <button type="button" onClick={add} disabled={!extra || Boolean(extraAvailability(extra, s))}>Add feature</button>
          </div>
          {extra && <p className={styles.hint}>{extraAvailability(extra, s) ?? addons.find((a) => a.id === extra)?.scope}</p>}
          {Object.entries(s.extras).length > 0 && <ul className={styles.selectedFeatures} aria-label="Selected additions">
            {Object.entries(s.extras).map(([id, quantity]) => {
              const a = addons.find((x) => x.id === id)!;
              return <li key={id}><div><strong>{a.name}</strong><small>{charge(a)}</small></div>
                {a.unit && <label className={styles.quantity}>Number of {quantityUnit(a.unit)}
                  <input aria-label={`${a.name} quantity`} type="number" min="1" max="1000" step="1" value={quantity} onChange={(e) => update({ extras: { ...s.extras, [id]: Math.max(1, Math.floor(Number(e.target.value) || 1)) } })} />
                </label>}
                <button type="button" aria-label={`Remove ${a.name}`} onClick={() => remove(id)}>Remove</button>
              </li>;
            })}
          </ul>}
          <a className="text-link" href="#additions">Read all {addons.length} additions and their scope</a>
        </fieldset>
        <details className={styles.assumptions}>
          <summary>Already have a store or customer logins?</summary>
          <p>Use these only for an existing system we can work with. We’ll verify compatibility in your quote.</p>
          <label className={styles.check}><input type="checkbox" checked={s.existingStore} onChange={(e) => update({ existingStore: e.target.checked })} />I have an existing compatible store with central order records.</label>
          <label className={styles.check}><input type="checkbox" checked={s.existingAccounts} onChange={(e) => update({ existingAccounts: e.target.checked })} />Customer logins already exist.</label>
        </details>
        {(s.path === "store" || s.existingStore) && ["accounts", "order_history", "cms"].some((id) => s.extras[id]) && <fieldset>
          <legend>Credit work your platform already includes</legend>
          <p className={styles.hint}>Only select a credit when the chosen setup already covers this configuration. Kemma will confirm it before quoting.</p>
          {["accounts", "order_history", "cms"].filter((id) => s.extras[id]).map((id) => <label className={styles.check} key={id}><input type="checkbox" checked={s.credits.includes(id)} onChange={(e) => update({ credits: e.target.checked ? [...s.credits, id] : s.credits.filter((x) => x !== id) })} />{addons.find((a) => a.id === id)?.name} already included in the platform setup</label>)}
        </fieldset>}
        <fieldset>
          <legend>Running costs and care</legend>
          <p>{s.offer === "package" ? "An eligible standard domain and suitable basic hosting are included for year one. Premium names, specialist infrastructure and subscriptions need a quote with credit for overlapping bundled work." : "Build-only uses your suitable existing domain and hosting. We confirm compatibility, renewals and any upgrades before quoting."} Care is optional and separate from hosting.</p>
          {s.offer === "package" && <label>Domain name
            <select value={s.domain} onChange={(e) => update({ domain: e.target.value as Selection["domain"] })}>
              <option value="standard">Eligible standard domain · first year included</option>
              <option value="premium">Premium name or extension · extra cost to quote</option>
              <option value="existing">Use my existing domain · check credit in the quote</option>
            </select>
          </label>}
          {s.offer === "package" && s.domain === "existing" && <p className={styles.hint}>No second registration charge is added. We confirm credit for reusable services in the written quote; the package provision is not a supplier invoice.</p>}
          <p className={styles.hint}>{result.renewalNote}</p>
          {s.assistant === "ai" && <label>Hosted AI service
            <select value={s.aiService} onChange={(e) => update({ aiService: e.target.value as Selection["aiService"] })}>
              <option value="quote">Quote a suitable provider and usage allowance</option>
              <option value="chatbase_example">Chatbase example · {money(hosted.monthly!, "USD")}/month, {hosted.message_credits_month} message credits</option>
            </select>
          </label>}
          <label>Optional Kemma care
            <select value={s.care} onChange={(e) => update({ care: e.target.value as Selection["care"] })}>
              <option value="client_managed">Handover · no ongoing Kemma care fee</option>
              <option value="static_managed" disabled={!result.staticEligible}>Static care · {money(staticCare.annual_service_fee!)}/year</option>
              <option value="active_care">Active care · from {money(activeCare.monthly_service_fee_from!)}/month, quote needed</option>
            </select>
          </label>
          <p className={styles.hint}>{catalogue.care.find((c) => c.id === s.care)?.scope}</p>
        </fieldset>
        <button className={styles.reset} type="button" onClick={() => { setRaw(initialSelection()); setExtra(""); }}>Start again</button>
          </div>
        </details>
      </div>
      <aside className={styles.estimate} aria-label="Your website estimate">
        <p className={styles.estimateLabel}>{s.offer === "build_only" ? "Build-only estimate" : result.launchApplied ? "Launch website package estimate" : "Website package estimate"}</p>
        <div className={styles.priceComparison} key={`${packageLabel(result)}:${standardPackageLabel(result)}:${result.discount}`}>
          {result.launchApplied && <div className={styles.standardPriceBlock}><span>Standard price</span><s>{standardPackageLabel(result)}</s></div>}
          <div className={styles.launchPriceBlock}><span>{result.launchApplied ? "Launch price" : s.offer === "build_only" ? "Build price" : "Package price"}</span><div className={styles.priceLine}><p className={styles.estimatePrice} aria-live="polite" aria-atomic="true">{packageLabel(result)}</p>{result.launchApplied && <strong className={styles.savingsBadge}>Save {money(result.discount)}</strong>}</div></div>
        </div>
        {result.launchApplied && <p className={styles.hint}>{launchTerms}</p>}
        <p className={styles.selectedScope}><strong>{catalogue.paths.find((path) => path.id === s.path)?.name}</strong><span>{catalogue.paths.find((path) => path.id === s.path)?.summary}</span><small>No fixed page or product cap · agreed supplied content · {catalogue.starter.revision_rounds} revision</small></p>
        <a className={`solid-button ${styles.quoteButton}`} href={enquiryUrl(raw)}>Request this scope on WhatsApp</a>
        <p className={styles.quoteNote}>Your selections are added to a message for you to review before sending.</p>
        <div className={styles.renewalSummary}>
          <div><Check aria-hidden="true" size={18} /><p><strong>Year one</strong><span>{s.offer === "package" ? "Eligible standard domain + basic hosting included" : "Uses your suitable existing services"}</span></p></div>
          <div><CreditCard aria-hidden="true" size={18} /><p><strong>From year two</strong><span>Exact renewal agreed before deposit</span></p></div>
        </div>
        {(result.firstYearGhsMin !== result.packageMin || result.careAnnual > 0 || result.activeCareFrom !== null || result.usdMonthly > 0) && <dl className={styles.compactCosts}>
          {result.firstYearGhsMin !== result.packageMin && <div><dt>Known first-year GHS subtotal</dt><dd>{money(result.firstYearGhsMin)}{result.firstYearGhsMax !== null && result.firstYearGhsMax !== result.firstYearGhsMin ? `–${result.firstYearGhsMax.toLocaleString("en-GH")}` : ""}</dd></div>}
          {result.careAnnual > 0 && <div><dt>Optional fixed care</dt><dd>{money(result.careAnnual)}/year</dd></div>}
          {result.activeCareFrom !== null && <div><dt>Optional active care</dt><dd>From {money(result.activeCareFrom)}/month · final quote needed</dd></div>}
          {result.usdMonthly > 0 && <div><dt>AI subscription</dt><dd>{money(result.usdMonthly, "USD")}/month · separate</dd></div>}
        </dl>}
        {result.incomplete && <p className={styles.requiredNotice}>Some required build or service costs still need a written quote.</p>}
        {result.usage.length > 0 && <p className={styles.requiredNotice}>Transaction or usage fees apply when selected services are used.</p>}
        <details className={styles.estimateDetails}>
          <summary>Full cost breakdown and conditions</summary>
          <div>
        <details className={styles.calculation}>
          <summary>How this is calculated</summary>
          <ul><li><span>Website build · agreed layout and supplied content scope</span><span>{money(catalogue.baseFee)}</span></li>
            {result.packageFee > 0 && <li><span>First-year domain & basic hosting package</span><span>{money(result.packageFee)}</span></li>}
            {result.discount > 0 && <li><span>Launch discount · once per project</span><span>−{money(result.discount)}</span></li>}
            {result.lines.map((a) => <li key={a.id}><span>{a.name}{a.qty > 1 ? ` × ${a.qty}` : ""}</span><span>{a.credited ? "Included · credited" : charge({ ...a, unit: undefined, min: a.min === null ? null : a.min * a.qty, max: a.max === null ? null : a.max * a.qty })}</span></li>)}
          </ul>
          {result.included.length > 0 && <p>Included within your selection: {result.included.map((id) => addons.find((a) => a.id === id)?.name).join(", ")}.</p>}
        </details>
        <dl className={styles.costs}>
          <div><dt>{result.incomplete ? "Known first-year subtotal" : "First-year package + fixed care"}</dt><dd>{money(result.firstYearGhsMin)}{result.firstYearGhsMax !== null && result.firstYearGhsMax !== result.firstYearGhsMin ? `–${result.firstYearGhsMax.toLocaleString("en-GH")}` : ""}{result.incomplete && <small>+ quote-needed costs below</small>}</dd></div>
          <div><dt>Domain & hosting from year two</dt><dd>Renewal quote needed<small>Exact plan and renewal disclosed before deposit. The build fee does not repeat.</small></dd></div>
          {result.careAnnual > 0 && <div><dt>Optional fixed care each year</dt><dd>{money(result.careAnnual)}<small>Included in the first-year subtotal above. Domain, hosting and service renewals are additional from year two.</small></dd></div>}
          {result.usdMonthly > 0 && <div><dt>AI subscription, shown separately</dt><dd>{money(result.usdMonthly, "USD")}/month<small>{money(result.usdAnnual, "USD")}/year. No currency conversion applied.</small></dd></div>}
          {result.activeCareFrom !== null && <div><dt>Optional active care</dt><dd>From {money(result.activeCareFrom)}/month<small>From {money(result.activeCareFrom * 12)} over 12 months. Final scope quoted; excluded from the subtotal.</small></dd></div>}
        </dl>
        {(result.buildQuote.length > 0 || result.recurringQuotes.length > 0) && <div className={styles.pending}><h3>Still to quote</h3><ul>{[...result.buildQuote, ...result.recurringQuotes].map((text) => <li key={text}>{text}</li>)}</ul><p>Unquoted costs are not zero and are not included in the subtotal.</p></div>}
        {result.usage.length > 0 && <div className={styles.usage}><h3>Fees when you use a service</h3><ul>{result.usage.map((text) => <li key={text}>{text}</li>)}</ul><p>Usage and transaction fees sit outside these fixed-cost illustrations.</p></div>}
        <p className={styles.hint}>Supplier examples dated 10 September 2026. Any applicable taxes, paid assets and unselected work will be identified in the written quote. This is an estimate, not an order.</p>
          </div>
        </details>
      </aside>
    </div>
  );
}

function quantityUnit(unit: string) {
  if (unit === "hour") return "hours";
  if (unit === "provider") return "providers";
  if (unit === "content section") return "content sections";
  if (unit === "product record") return "product records";
  return `${unit}s`;
}

function JourneyPreview({ selection, update }: { selection: Selection; update: (change: Partial<Selection>) => void }) {
  const active: JourneyGoal = selection.path === "store" ? "payments" : ["catalogue", "links"].includes(selection.path) ? "orders" : "enquiries";
  const [name, setName] = useState("Ama");
  const [message, setMessage] = useState("Can you help with my event next month?");
  const [enquiry, setEnquiry] = useState("");
  const [tote, setTote] = useState(1);
  const [mug, setMug] = useState(0);
  const [orderReady, setOrderReady] = useState(false);
  const [checkoutEmail, setCheckoutEmail] = useState("ama@example.com");
  const [paymentReady, setPaymentReady] = useState(false);

  const chooseGoal = (goal: JourneyGoal) => update(selectJourney(selection, goal));
  const chooseOrder = (variant: "catalogue" | "links" | "faq") => {
    update(selectOrderVariant(selection, variant));
  };
  const submitEnquiry = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim() && message.trim()) setEnquiry(`${name.trim()} asks:\n“${message.trim()}”`);
  };
  const orderLines = [["Linen tote", tote], ["Studio mug", mug]] as const;
  const orderCount = tote + mug;

  return <div className={styles.journey}>
    <p className={styles.eyebrow}>Try a customer journey</p>
    <h2>What should your website do?</h2>
    <div className={styles.goalTabs} role="group" aria-label="Choose a website goal">
      <button type="button" aria-pressed={active === "enquiries"} onClick={() => chooseGoal("enquiries")}><ArrowUpRight aria-hidden="true" /><strong>Receive enquiries</strong><small>Someone asks for help.</small></button>
      <button type="button" aria-pressed={active === "orders"} onClick={() => chooseGoal("orders")}><ShoppingBag aria-hidden="true" /><strong>Build product orders</strong><small>Someone chooses items.</small></button>
      <button type="button" aria-pressed={active === "payments"} onClick={() => chooseGoal("payments")}><CreditCard aria-hidden="true" /><strong>Take payments online</strong><small>Someone checks out.</small></button>
    </div>

    <div className={styles.demoStage}>
      <div className={styles.demoTop}><span>Your business</span><span>Interactive example · nothing is sent</span></div>
      {active === "enquiries" && <section className={styles.enquiryDemo} aria-labelledby="enquiry-demo-title">
        <p className={styles.flow}>Enquiry → your inbox → your reply</p>
        <h3 id="enquiry-demo-title">Start a conversation.</h3>
        <form className={styles.demoForm} onSubmit={submitEnquiry}>
          <label>Your name<input value={name} onChange={(event) => setName(event.target.value)} maxLength={60} required /></label>
          <label>What do you need?<textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={500} required /></label>
          <button type="submit">Preview enquiry</button>
        </form>
        {enquiry && <div className={styles.receipt} role="status"><strong><Inbox aria-hidden="true" size={17} /> Enquiry received · example</strong><p>{enquiry}</p><small>You reply to discuss the job and give a quote.</small></div>}
      </section>}

      {active === "orders" && <section className={styles.orderDemo} aria-labelledby="order-demo-title">
        <p className={styles.flow}>Products + quantities → WhatsApp → you confirm</p>
        <h3 id="order-demo-title">Pick products. Build an order.</h3>
        <div className={styles.orderVariants} aria-label="Order website options">
          <button type="button" aria-pressed={selection.path === "catalogue"} onClick={() => chooseOrder("catalogue")}>WhatsApp order</button>
          <button type="button" aria-pressed={selection.path === "links" && selection.assistant !== "faq"} onClick={() => chooseOrder("links")}>+ payment links</button>
          <button type="button" aria-pressed={selection.path === "links" && selection.assistant === "faq"} onClick={() => chooseOrder("faq")}>+ fixed FAQs</button>
        </div>
        <div className={styles.productList}>
          <ProductQuantity name="Linen tote" symbol={<ShoppingBag />} quantity={tote} setQuantity={setTote} />
          <ProductQuantity name="Studio mug" symbol={<Coffee />} quantity={mug} setQuantity={setMug} />
        </div>
        <p className={styles.orderCount} aria-live="polite">{orderCount ? `${orderCount} ${orderCount === 1 ? "item" : "items"} in your order` : "Choose an item to start"}</p>
        <button className={styles.demoAction} type="button" disabled={!orderCount} onClick={() => setOrderReady(true)}>Preview WhatsApp order</button>
        {orderReady && orderCount > 0 && <div className={styles.messageReceipt} role="status"><strong><MessageCircle aria-hidden="true" size={17} /> Your ready-to-send order</strong><p>Hello! I’d like to order:{"\n"}{orderLines.filter(([, quantity]) => quantity).map(([product, quantity]) => `${quantity} × ${product}`).join("\n")}{"\n"}Please confirm availability and how to pay.</p></div>}
        <p className={styles.demoNoteText}>{selection.path === "links" ? "Hosted payment links are included; you check and match each payment to its order manually. This preview sends nothing and takes no payment." : "You confirm stock, delivery and payment in the chat. This preview sends nothing and takes no payment."}</p>
      </section>}

      {active === "payments" && <section className={styles.checkoutDemo} aria-labelledby="checkout-demo-title">
        <p className={styles.flow}>Products → guest checkout → payment confirmation</p>
        <h3 id="checkout-demo-title">Complete the purchase.</h3>
        <form className={styles.checkoutCard} onSubmit={(event) => { event.preventDefault(); if (checkoutEmail.trim()) setPaymentReady(true); }}>
          <div><span className={styles.checkoutMark} aria-hidden="true"><ShoppingBag /></span><span>Linen tote × 1<small>Guest checkout · no account required</small></span><strong>Example</strong></div>
          <label>Email for receipt<input type="email" value={checkoutEmail} onChange={(event) => setCheckoutEmail(event.target.value)} required /></label>
          <button type="submit">Preview confirmation</button>
        </form>
        {paymentReady && <div className={styles.paymentReceipt} role="status"><strong><CircleCheck aria-hidden="true" size={17} /> Payment confirmed · example</strong><p>A customer confirmation and paid order are ready.</p><small>Demo only. No payment is taken.</small></div>}
        <p className={styles.demoNoteText}>Payment methods depend on the chosen provider. Merchant approval, transaction fees and specialist infrastructure are quoted separately.</p>
      </section>}
    </div>
  </div>;
}

function ProductQuantity({ name, symbol, quantity, setQuantity }: { name: string; symbol: ReactNode; quantity: number; setQuantity: (quantity: number) => void }) {
  return <div className={styles.product}>
    <span className={styles.productArt} aria-hidden="true">{symbol}</span>
    <span>{name}</span>
    <div role="group" aria-label={`${name} quantity`}>
      <button type="button" aria-label={`Remove one ${name}`} disabled={quantity === 0} onClick={() => setQuantity(Math.max(0, quantity - 1))}><Minus aria-hidden="true" size={16} /></button>
      <output aria-label={`${name} quantity`}>{quantity}</output>
      <button type="button" aria-label={`Add one ${name}`} disabled={quantity === 9} onClick={() => setQuantity(Math.min(9, quantity + 1))}><Plus aria-hidden="true" size={16} /></button>
    </div>
  </div>;
}
