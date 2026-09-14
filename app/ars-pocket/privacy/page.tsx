import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: "ARS Pocket Privacy Notice",
  description:
    "How ARS Pocket handles on-device settings, optional feedback and reminders.",
  path: "/ars-pocket/privacy",
});

const sections = [
  {
    id: "on-device-data",
    title: "What stays on your device",
    paragraphs: [
      "The daily readings, calendars, Library content, reading rhythm, reminder choices, appearance settings and unsent feedback drafts stay on your device. Scripture and calendar content is packaged in the app and is not fetched from a server. Android app-data backup is disabled.",
      "ARS Pocket has no accounts, advertising or analytics in version 1.0.0.",
    ],
  },
  {
    id: "feedback",
    title: "Feedback you choose to send",
    paragraphs: [
      "When you press Send feedback, ARS Pocket sends the message you wrote together with the app version, device platform and operating-system version. The form asks you not to include names, phone numbers, addresses or other private details. It does not collect a reply email address.",
      "Feedback is never sent automatically or in the background. It does not include reading history, calendar activity, reminder history, notes, contacts, location, advertising identifiers or files from your device.",
      "The message travels over HTTPS through an ARS Pocket Cloudflare Worker to a private Telegram group. Access is limited to people authorised by Kemma Technologies to handle ARS Pocket feedback. Cloudflare and Telegram process the message only as needed to relay and deliver it.",
      "Feedback has no automatic expiry and may be retained without a fixed deletion date so the team can review product history. It is deleted manually when no longer needed or after a valid deletion request.",
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    paragraphs: [
      "Daily-reading and prayer-time reminders are optional and scheduled on the device. If you enable them, ARS Pocket asks for notification permission where Android requires it. The app does not upload the chosen schedule or notification activity. Reminders use no sound or vibration.",
    ],
  },
  {
    id: "age-guidance",
    title: "Age guidance",
    paragraphs: [
      "ARS Pocket is intended for people aged 13 and older. It is not directed to children under 13.",
    ],
  },
  {
    id: "sharing",
    title: "Sharing and sale",
    paragraphs: [
      "ARS Pocket does not sell personal data or use it for advertising. Cloudflare and Telegram are service providers used only to relay and deliver feedback. They may process feedback in countries outside the sender’s country; their safeguards and service terms apply to that processing.",
    ],
  },
  {
    id: "choices-and-deletion",
    title: "Your choices and deletion requests",
    paragraphs: [
      "You can use the core app without sending feedback or enabling reminders. You can disable notifications in ARS Pocket or Android settings. You can clear locally stored app data by uninstalling the app or using Android’s app-storage controls.",
      `To ask about, correct or delete feedback, email ${SITE.arsPocketPrivacyEmail}. Include the approximate date and time and a few distinctive words from the message so it can be located without an account identifier.`,
    ],
  },
  {
    id: "changes",
    title: "Changes",
    paragraphs: [
      "If ARS Pocket’s data practices materially change, this notice and the Google Play Data safety declaration will be updated before any release that uses the new practices.",
    ],
  },
] as const;

export default function ArsPocketPrivacyPage() {
  return (
    <article className="privacy-page wrap">
      <header className="privacy-header">
        <p className="context-label">ARS Pocket App</p>
        <h1 className="privacy-title">Privacy notice</h1>
        <p className="privacy-date">Effective 19 August 2026</p>
        <p className="privacy-intro">
          ARS Pocket is developed and maintained by {SITE.name} for the Apostles
          Revelation Society, Wovenu Memorial Chapel.
        </p>
      </header>

      <div className="privacy-sections">
        {sections.map((section) => (
          <section key={section.id} aria-labelledby={section.id}>
            <h2 id={section.id}>{section.title}</h2>
            <div className="privacy-paragraphs">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section
        aria-labelledby="ars-pocket-privacy-contact"
        className="privacy-contact"
      >
        <h2 id="ars-pocket-privacy-contact">Contact</h2>
        <address className="privacy-address">
          Emmanuel Mawulolo Tagbor
          <br />
          {SITE.name}
          <br />
          <a
            className="text-link"
            href={`mailto:${SITE.arsPocketPrivacyEmail}`}
          >
            {SITE.arsPocketPrivacyEmail}
          </a>
        </address>
      </section>
    </article>
  );
}
