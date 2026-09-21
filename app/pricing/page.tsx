import { Suspense } from "react";
import { PageIntro } from "@/components/site/PageIntro";
import { PricingPlanner } from "@/components/site/PricingPlanner";
import { addons, catalogue, charge, estimate, initialSelection, launchTerms, money, packageLabel, selectJourney, standardPackageLabel, type Selection } from "@/lib/pricing/estimate";
import { pageMetadata } from "@/lib/seo";
import styles from "./page.module.css";

const starterEstimate = estimate(initialSelection());
export const metadata = pageMetadata({ title: "Website pricing", description: `${starterEstimate.launchApplied ? "Launch" : "Standard"} website package from ${money(starterEstimate.packageMin)} with no fixed page or product cap, an agreed supplied-content scope, and eligible domain and basic hosting for one year.${starterEstimate.launchApplied ? ` ${launchTerms}` : " Renewals disclosed before deposit."}`, path: "/pricing" });
const questions = [
  ...(catalogue.launch.enabled ? [["How does the launch price work?", `${launchTerms} The launch price is ${money(catalogue.baseFee + catalogue.packageFee - catalogue.launch.discount)} against a standard package price of ${money(catalogue.baseFee + catalogue.packageFee)}. Both include the same agreed website scope and first-year eligible standard domain and basic hosting. The ${money(catalogue.launch.discount)} discount applies once to the bundled project, not to each addition, supplier charge or care plan. It does not stack with build-only. Enquiring does not reserve a place; Kemma confirms availability and the full quote before your deposit.`]] : []),
  ["Are domain and hosting included?", "Yes. The bundled website package includes an eligible standard domain and suitable basic hosting for the first year, with a working basic enquiry form. Premium names/extensions, paid mailboxes, subscriptions and specialist store/backend infrastructure are extra or replacement costs. We credit bundled domain and hosting work before quoting a replacement so it is not charged twice. The GHS 500 first-year provision is Kemma package pricing, not a claimed supplier invoice."],
  ["What renews next year?", "Domain and hosting renewals are payable from year two. We disclose the exact selected plan, renewal price and billing owner before your deposit, rather than promise an invented fixed annual fee. Optional care and other subscriptions are separate. The build fee does not repeat, and a first-year inclusion does not mean free lifetime registration."],
  ["Can I use my current domain and accounts?", "Yes. Build-only starts at GHS 1,500 for clients with suitable existing domain and hosting services. It includes the same agreed build scope and no launch discount. We check access, compatibility, renewals and any transfer work first. If you only have part of the setup, the written quote credits reusable work so the same service is not charged twice."],
  ["Can I update the website myself?", "The starter uses supplied content maintained in the site. A self-editable section is an optional addition, with editor access and training. If your chosen platform already includes the required editing setup, we credit that overlap."],
  ["Does the starter include everything in a demo?", "No. The demos show possible journeys and distinct visual directions. The starter adapts a prepared layout to the agreed supplied content. There is no fixed page or product cap, but bespoke composition, content preparation, live inventory, accounts, payment operations and booking capacity are scoped separately. Demo forms are simulations."],
  ["Who receives customer payments?", "Payments go through your merchant account with the selected provider. Hosted links need manual checking and order matching. A production store includes verified order status, success/failure handling and an agreed refund procedure; a success screen alone is not proof of payment."],
  ["What does an AI assistant cost after setup?", "Setup and operation are separate. A hosted assistant may have a subscription and message limits. A custom assistant also needs hosting, model usage controls and care. We show the chosen service and a spending limit before agreement. Fixed FAQs use approved answers and do not require a generative model."],
  ["Can I add scroll effects or 3D later?", "Yes. Useful hover, focus and simple transitions are already part of good delivery. Bespoke sequences, interactive models and configurators are separate work. We scope model rights, performance, mobile use and a reduced-motion or static alternative, and credit reusable paid work."],
  ["Who owns the site, and what if I stop care?", "You receive the agreed source and handover, and your domain and supplier accounts remain yours. The quote records any third-party asset licences. Optional care is not a condition of ownership. If care ends, you retain a usable handover and take responsibility for ongoing updates and renewals."],
  ["What content do you need?", "Your logo, contact details, service information, approved text and images you can use. We agree the page list and content responsibilities first. Writing, photography, new logos and paid assets are separate if needed."],
  ["Is the deposit the full cost?", "No. The full written quote comes first. For a small agreed build, payment is normally 50% to reserve the work and 50% after acceptance, before launch. Included first-year domain/basic hosting is already in the bundled package. Any extra services are identified before deposit and paid as agreed. Larger projects use agreed milestones. Applicable taxes and any changed scope are identified before commitment."],
];

export default function PricingPage() {
  const base = catalogue.starter;
  const managed = catalogue.care.find((c) => c.id === "static_managed")!;
  const active = catalogue.care.find((c) => c.id === "active_care")!;
  return <>
    <PageIntro label="Website pricing" title="Try what your website could do." description="Choose a customer journey. See the experience and starting estimate together." />
    <section className={`wrap ${styles.section}`} id="estimate" aria-labelledby="estimate-title">
      <h2 id="estimate-title" className="sr-only">Interactive website estimate</h2>
      <Suspense fallback={<p className={styles.loading}>Interactive controls need JavaScript. Open “Full scope, costs and practical details” below for starting and standard prices.</p>}><PricingPlanner /></Suspense>
    </section>
    <details className={`wrap ${styles.reference}`}>
      <summary>Full scope, costs and practical details</summary>
      <div className={styles.referenceBody}>
    <ServerPriceSummary />
    <section className={styles.section} aria-labelledby="starter-title">
      <div className={styles.sectionHeading}><h2 id="starter-title">What the starting website includes.</h2><p>No fixed page or product cap · first-year eligible standard domain and basic hosting included with the bundled package.</p></div>
      <div className={styles.starterScope}>
        <ul>
          <li>Page structure, product capacity and supplied content agreed before work starts, with no fixed page, product, word or image cap.</li>
          <li>A prepared layout adapted to your logo, colours, typography and content, with mobile, tablet and desktop layouts.</li>
          <li>Readable type, keyboard access, visible focus, labelled forms, sensible image descriptions and reduced-motion support where relevant.</li>
          <li>An eligible standard domain and suitable basic hosting for one year in the bundled package, with client ownership and access.</li>
          <li>HTTPS setup, optimized images, page titles, descriptions, social sharing metadata, sitemap and basic indexing setup.</li>
          <li>WhatsApp, telephone, social-profile and map links. One enquiry form with up to {base.form_fields_max} fields, delivery testing and basic spam protection.</li>
          <li>{base.revision_rounds} consolidated revision round, launch configuration, source/handover and {base.defect_correction_days} days of correcting defects in the agreed build.</li>
        </ul>
        <p className={styles.hint}>The base fee covers an agreed prepared-layout scope; it does not promise unlimited custom design or content-production labour. Writing, logos, photography, paid assets, ongoing edits, content editing tools, catalogues, accounts, payments and bespoke 3D are additional scope. Search rankings are not guaranteed.</p>
      </div>
    </section>
    <section className={styles.section} id="additions" aria-labelledby="additions-title">
      <div className={styles.sectionHeading}><h2 id="additions-title">The full feature breakdown.</h2><p>{addons.length} additions, grouped by the job they do. These are extra one-time build charges in GHS, with the entry scope and ongoing dependency shown alongside each.</p></div>
      <div className={styles.catalogue}>
        {catalogue.groups.map((group) => <details key={group.id}>
          <summary>{group.name}</summary>
          <div>{addons.filter((a) => group.matches.includes(a.group)).map((a) => <article key={a.id} id={`feature-${a.id}`} className={styles.addon}>
            <div><h3>{a.name}</h3><p>{a.scope}.</p>{a.requires && <p>Needs: {a.requires}.</p>}{a.overlap_rule && <p>{a.overlap_rule}.</p>}</div>
            <div><strong>{charge(a)}</strong><p>Ongoing: {a.running_cost ?? "uses the site’s existing services; no separate subscription specified for this addition"}.</p></div>
          </article>)}</div>
        </details>)}
      </div>
      <p className={styles.hint}>Entry prices assume supplied content, reusable components, one supported provider and one revision within scope. Larger quantities, variants, migrations and custom integrations are confirmed in a written quote. Ongoing SEO/content work is separately scoped by monthly deliverables.</p>
    </section>
    <section className={styles.section} id="running-costs" aria-labelledby="running-title">
      <div className={styles.sectionHeading}><h2 id="running-title">Know what continues after launch.</h2><p>The website build is one part of the cost. Your quote separates the first year, future renewals, optional care and fees charged when services are used.</p></div>
      <div className={styles.runningIntro}>
        <div><h3>Your domain and services</h3><p>The domain is your address. Hosting serves the site. Email delivery sends enquiries; a business mailbox is a separate inbox. Stores or private accounts may need additional services, or a platform that already includes them.</p><p>The bundled package covers an eligible standard domain and suitable basic hosting for year one. From year two, renewal is payable at the selected plan’s disclosed price. If a store or backend needs different infrastructure, we quote the extra or replacement cost and credit included hosting work. A shared hosting team plan is not automatically billed in full for every website.</p></div>
        <div><h3>Optional care</h3><p>Handover has no ongoing Kemma care fee. Static care is {money(managed.annual_service_fee!)} per year for release backups, quarterly site/form checks, an annual renewal review and one hour of small edits across the year.</p><p>Active care starts at {money(active.monthly_service_fee_from!)} per month, with the CMS/store checks and up to 30 minutes of small edits agreed in writing. Infrastructure is separate. These care options are alternatives; static care does not cover a live store or database.</p><p>Neither plan promises unlimited changes or emergency response. Included defect correction still applies when you choose no care plan.</p></div>
      </div>
      <details className={styles.suppliers}><summary>See dated supplier examples and sources</summary><p>Observed on 10 September 2026. These illustrate possible costs, not a fixed Kemma pass-through fee or a provider selection. Availability, renewals, taxes and exchange rates are confirmed in your quote. USD stays in USD.</p><SupplierExamples /></details>
    </section>
    <section className={styles.section} aria-labelledby="process-title">
      <div className={styles.sectionHeading}><h2 id="process-title">A clear agreement before the build.</h2><p>Your full quote names the pages, features, content, revisions, delivery dependencies, supplier charges, renewals and any applicable taxes.</p></div>
      <div className={styles.process}>
        <div><h3>Scope and full quote</h3><p>Work through the goal, content and running services. Agree the complete scope and costs before a deposit.</p></div>
        <div><h3>Content and setup</h3><p>Supply the approved content and access. A small project normally begins with a 50% deposit. Bundled first-year services are included; any extra service payments are agreed in the quote.</p></div>
        <div><h3>Preview and refine</h3><p>Review a working preview on desktop and mobile, then use the included consolidated revision round.</p></div>
        <div><h3>Launch and handover</h3><p>After acceptance and the remaining payment, agree launch and receive the source, access and renewal responsibilities.</p></div>
      </div>
    </section>
    <section className={styles.section} aria-labelledby="questions-title">
      <div className={styles.sectionHeading}><h2 id="questions-title">A few practical questions.</h2><p>Ownership, support and future costs should be clear from the beginning.</p></div>
      <div className={styles.faq}>{questions.map(([q, answer]) => <details key={q}><summary>{q}</summary><p>{answer}</p></details>)}</div>
    </section>
      </div>
    </details>
  </>;
}

function ServerPriceSummary() {
  const guestStore = selectJourney(initialSelection(), "payments");
  const journeys: Array<[string, string, Selection]> = [
    ["enquiries", "Receive enquiries", initialSelection("starter")],
    ["orders", "Build product orders", initialSelection("catalogue")],
    ["payments", "Take payments online · guest checkout", guestStore],
  ];
  return <section className={styles.serverPricing} aria-labelledby="server-pricing-title" data-pricing-server-summary>
    <div className={styles.sectionHeading}><h2 id="server-pricing-title">Starting prices for the three journeys.</h2><p>These use the same catalogue as the interactive estimate. Guest checkout does not add customer accounts; accounts and other custom functions remain optional scope.</p></div>
    <div className={styles.priceTableWrap}><table>
      <thead><tr><th scope="col">Customer journey</th><th scope="col">{catalogue.launch.enabled ? "Launch price" : "Starting price"}</th>{catalogue.launch.enabled && <><th scope="col">Standard price</th><th scope="col">Savings</th></>}</tr></thead>
      <tbody>{journeys.map(([id, label, selection]) => {
        const result = estimate(selection);
        return <tr key={id} data-price-path={id} data-launch-price={packageLabel(result)} data-standard-price={standardPackageLabel(result)}>
          <th scope="row">{label}</th><td>{packageLabel(result)}</td>{catalogue.launch.enabled && <><td><s>{standardPackageLabel(result)}</s></td><td>{money(result.discount)}</td></>}
        </tr>;
      })}</tbody>
    </table></div>
    {catalogue.launch.enabled && <p className={styles.serverPriceTerms}>{launchTerms} The discount applies once per eligible bundled project. Build-only receives no launch discount.</p>}
    <p className={styles.serverPriceTerms}>The bundled package includes an eligible standard domain and suitable basic hosting for year one. From year two, the exact selected renewal and billing owner are agreed before deposit.</p>
  </section>;
}

function SupplierExamples() {
  const supplier = (id: string) => catalogue.suppliers.find((s) => s.id === id)!;
  const domain = supplier("stormer_com"), namecheap = supplier("namecheap_com"), shared = supplier("stormer_starter"), vercel = supplier("vercel_pro"), database = supplier("supabase_pro"), email = supplier("resend_free"), paystack = supplier("paystack_ghana"), ai = supplier("chatbase_hobby"), model = supplier("openai_gpt41_mini");
  const examples = [
    ["stormer_com", "Standard .com domain", `${money(domain.registration_year!)} first year; ${money(domain.renewal_year!)} annual renewal. The chosen name and checkout charges must be confirmed.`],
    ["namecheap_com", "Alternative domain example", `${money(namecheap.registration_sale_year!, "USD")} advertised first-year sale; ${money(namecheap.renewal_year!, "USD")} renewal. A ${money(namecheap.possible_icann_fee_year!, "USD")} ICANN fee may apply. A promotion is not a lasting price promise.`],
    ["cloudflare_static", "Static hosting", "Cloudflare Pages static-asset requests are free. Functions and other services have their own allowances; this does not make every application free to run."],
    ["stormer_starter", "Shared hosting", `From ${money(shared.annual_from!)} per year in this supplier example. Confirm the chosen plan, renewals, capacity and application suitability.`],
    ["vercel_pro", "Application hosting", `Vercel Pro from ${money(vercel.monthly_from!, "USD")}/month for the team plan, plus any applicable usage. Shared costs are allocated, not automatically charged in full to every client. Hobby is restricted to personal, non-commercial use.`],
    ["supabase_pro", "Database and managed accounts", `Supabase Pro from ${money(database.monthly_from!, "USD")}/month, extra projects from ${money(database.extra_project_monthly_from!, "USD")}/month. A store platform may already provide the needed database and accounts.`],
    ["resend_free", "Enquiry and transactional email", `Resend’s free example allows ${email.emails_month!.toLocaleString()} emails/month, ${email.emails_day}/day and ${email.domains} domains. Allowances and shared quotas matter. This is not an employee inbox.`],
    ["zoho_mail", "Business mailbox", "May be included in compatible hosting. Otherwise the selected per-user mailbox and renewal cost need a quote."],
    ["paystack_ghana", "Payment processing", `Paystack Ghana lists ${(paystack.transaction_rate! * 100).toFixed(2)}% per transaction. Provider charges are separate from Kemma’s build/integration fee; merchant approval and available methods must be confirmed.`],
    ["tawk", "Human live chat", "The core tawk.to chat tool is free. People replying, AI and paid branding options are separate."],
    ["chatbase_hobby", "Hosted AI assistant", `Chatbase Hobby’s example is ${money(ai.monthly!, "USD")}/month for ${ai.message_credits_month} message credits. Credits are not the same as customers or complete conversations.`],
    ["openai_gpt41_mini", "Model text-processing example", `GPT-4.1 mini: ${money(model.input_per_million_tokens!, "USD")} per million input tokens and ${money(model.output_per_million_tokens!, "USD")} per million output tokens. This covers model text processing only, not an entire assistant, hosting, controls or care.`],
    ["woocommerce", "Store platform", "WooCommerce core has no licence fee. Hosting, paid extensions and ongoing care are separate, and the chosen platform must suit the agreed store."],
  ];
  return <div className={styles.supplierList}>{examples.map(([id, name, description]) => <article key={id}><h3>{name}</h3><p>{description}</p><a className="text-link" href={supplier(id).source}>{name} source</a></article>)}</div>;
}
