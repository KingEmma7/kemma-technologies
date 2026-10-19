import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: "ARS Pocket Privacy Notice",
  description:
    "How ARS Pocket handles on-device settings, optional hymn audio, feedback, reminders and Google Play updates and reviews.",
  path: "/ars-pocket/privacy",
});

const sections = [
  {
    id: "on-device-data",
    title: "What stays on your device",
    blocks: [
      { type: "paragraph", content: <>{"Daily readings, calendars, Library content, reading rhythm, reminder choices, appearance settings, playlists, saved-audio records, listening place and unsent feedback drafts stay on your device. Scripture, calendars, books and hymn words are packaged in the app and do not need a server connection to read. Android app-data backup is disabled."}</> },
      { type: "paragraph", content: <>{"ARS Pocket has no accounts, advertising or analytics services. Online hymn audio, Google Play updates and reviews, and feedback you choose to send work as described below."}</> },
    ],
  },
  {
    id: "hymn-audio",
    title: "Hymn audio and playlists",
    blocks: [
      { type: "paragraph", content: <>{"Piano recordings are delivered over HTTPS by Cloudflare at "}<strong>{"ars-pocket-audio.etagbor.workers.dev"}</strong>{". You choose whether to play or resume audio using internet data, or confirm a download. A collection download shows its measured remaining size before you confirm."}</> },
      { type: "paragraph", content: <>{"When you start a playlist, it may continue through that fixed ordered queue with the screen locked or the app in the background. Your internet choice applies only to the selected recordings. Playback stops at the final hymn; it does not repeat or start another playlist. A saved-only session does not switch to internet data if a recording is missing or damaged. Preparation is limited to the current and next selected recording. An explicitly started online queue may request its next selected recording without another tap."}</> },
      { type: "paragraph", content: <>{"Opening the app, opening an audio page or returning to the app does not start an audio catalogue request, availability check, download or new playback session. Loading a saved listening place does not start music. A restored session stays paused and does not retain permission to use internet data; playing again needs your action. Listening analytics are not sent."}</> },
      { type: "paragraph", content: <>{"Cloudflare receives ordinary connection details needed to deliver the selected file, including your IP address and the requested recording path. ARS Pocket does not attach an account or user identifier, reading history, favourites, notes, book progress or reminder choices. Cloudflare's network may derive your approximate location from your IP address and retain connection, operational and security records under its "}<a className="text-link" href="https://www.cloudflare.com/privacypolicy/">{"privacy policy"}</a>{" and applicable service and data-protection terms."}</> },
      { type: "paragraph", content: <>{"Saved recordings use persistent app-private storage, do not expire and are excluded from device backups. Remove them in "}<strong>{"Hymns → Audio center → Saved audio"}</strong>{". Uninstalling ARS Pocket or clearing its data removes these copies. A confirmed download queue pauses when the app leaves the foreground; continuing needs your action. Completed files stay saved."}</> },
      { type: "paragraph", content: <>{"Playlists, transfer records and the saved queue and listening place, including playback checkpoints, are stored locally. They are not uploaded as listening history. Android uses a foreground media-playback service and media notification for background playback and lock-screen controls. This feature does not request microphone recording or access to shared storage. Reminder choices remain separate."}</> },
      { type: "paragraph", content: <>{"The linked audio credit opens YouTube only when you tap it. YouTube's own privacy terms apply when you visit it."}</> },
    ],
  },
  {
    id: "app-updates",
    title: "App updates",
    blocks: [
      { type: "paragraph", content: <>{"On Android, ARS Pocket checks Google Play for an available app update after the Today screen opens. You can also check in More. You choose whether to download an update and when to restart the app."}</> },
      { type: "paragraph", content: <>{"Google Play processes device metadata, the app version, and information about the ARS Pocket modules and asset packs installed on your device to determine whether an update is available and its expected size. Google's in-app update documentation states that this information is encrypted, is not transferred to other third parties, and is deleted after a fixed retention period."}</> },
      { type: "paragraph", content: <>{"Google Play handles these checks and installations under its "}<a className="text-link" href="https://play.google.com/about/play-terms/index.html">{"Terms of Service"}</a>{" and "}<a className="text-link" href="https://policies.google.com/privacy">{"Google Privacy Policy"}</a>{". ARS Pocket does not send reading history, favourites, book progress, notes or reminder choices for update checks."}</> },
    ],
  },
  {
    id: "feedback",
    title: "Feedback you choose to send",
    blocks: [
      { type: "paragraph", content: <>{"When you press "}<strong>{"Send feedback"}</strong>{", ARS Pocket sends:"}</> },
      { type: "list", items: ["the feedback message you wrote;", "the app version;", "the device platform; and", "the operating-system version."] },
      { type: "paragraph", content: <>{"The form asks you not to include names, phone numbers, addresses or other private details. It does not collect a reply email address."}</> },
      { type: "paragraph", content: <>{"Feedback is never sent automatically or in the background. The app does not attach reading history, calendar activity, reminder history, notes, contacts, location, advertising identifiers or files from your device."}</> },
      { type: "paragraph", content: <>{"The message travels over HTTPS through an ARS Pocket Cloudflare Worker to a private Telegram group. Cloudflare relays the submission and Telegram hosts it in that group. Access is limited to people authorised by Kemma Technologies to handle ARS Pocket feedback. The providers' applicable service and data-protection terms govern their processing."}</> },
      { type: "paragraph", content: <>{"Feedback has no automatic expiry and may be retained without a fixed deletion date so the team can review product history. It is deleted manually when no longer needed or after a valid deletion request."}</> },
    ],
  },
  {
    id: "google-play-reviews",
    title: "Google Play reviews",
    blocks: [
      { type: "paragraph", content: <>{"After you have completed readings on five different days, ARS Pocket may ask Google Play to show its rating and review card. Requests are limited to once every 30 days. The eligibility count and last request time stay on your device; ARS Pocket does not send reading history or your private feedback draft to Google Play."}</> },
      { type: "paragraph", content: <>{"Share feedback also offers a link to write a public review on Google Play. Ratings and review text you choose to submit are handled by Google Play under its "}<a className="text-link" href="https://play.google.com/about/play-terms/index.html">{"Terms of Service"}</a>{" and "}<a className="text-link" href="https://policies.google.com/privacy">{"Privacy Policy"}</a>{". You can delete reviews through Google Play or your Google Account. ARS Pocket cannot determine whether a review card appeared or a review was submitted."}</> },
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    blocks: [
      { type: "paragraph", content: <>{"Daily-reading and prayer-time reminders are optional and scheduled on your device. If you enable them, ARS Pocket asks for notification permission where Android requires it. On Android, optional Alarms & reminders access helps reminders arrive close to the chosen time."}</> },
      { type: "paragraph", content: <>{"The app does not upload the chosen schedule or notification activity. Reminders use a local bell sound, which you can turn off in Notifications. They do not vibrate."}</> },
    ],
  },
  {
    id: "age-guidance",
    title: "Age guidance",
    blocks: [
      { type: "paragraph", content: <>{"ARS Pocket is intended for people aged 13 and older. It is not directed to children under 13."}</> },
    ],
  },
  {
    id: "sharing",
    title: "Sharing and sale",
    blocks: [
      { type: "paragraph", content: <>{"ARS Pocket does not sell personal data or use it for advertising. Cloudflare delivers requested hymn audio and relays feedback; Telegram receives feedback. These providers may process their respective request data or feedback in countries outside your country. Their applicable service and data-protection terms govern that processing. Google Play and YouTube handle your use of their services under their own terms and privacy policies."}</> },
    ],
  },
  {
    id: "choices-and-deletion",
    title: "Your choices and deletion requests",
    blocks: [
      { type: "paragraph", content: <>{"You can read the core app without using online hymn audio, sending feedback or enabling reminders. You can remove saved recordings in Audio center, disable reminders in ARS Pocket or Android settings, and clear local app data by uninstalling the app or using Android's app-storage controls."}</> },
      { type: "paragraph", content: <>{"To ask about, correct or delete feedback, email "}<strong>{SITE.arsPocketPrivacyEmail}</strong>{". Include the approximate date and time and a few distinctive words from the message so it can be located without an account identifier."}</> },
    ],
  },
  {
    id: "changes",
    title: "Changes",
    blocks: [
      { type: "paragraph", content: <>{"Updates to this notice will be available on the "}<a className="text-link" href={`${SITE.url}/ars-pocket/privacy`}>{"ARS Pocket privacy page"}</a>{". If data practices materially change, this notice and the Google Play Data safety declaration will be updated before any release that uses the new practices."}</> },
    ],
  },
] as const;

export default function ArsPocketPrivacyPage() {
  return (
    <article className="privacy-page wrap">
      <header className="privacy-header">
        <p className="context-label">ARS Pocket App</p>
        <h1 className="privacy-title">Privacy notice</h1>
        <p className="privacy-date">Effective 19 October 2026</p>
        <p className="privacy-intro">
          ARS Pocket is developed and maintained by {SITE.name} for the Apostles
          Revelation Society worldwide.
        </p>
      </header>

      <div className="privacy-sections">
        {sections.map((section) => (
          <section key={section.id} aria-labelledby={section.id}>
            <h2 id={section.id}>{section.title}</h2>
            <div className="privacy-paragraphs">
              {section.blocks.map((block, index) =>
                block.type === "list" ? (
                  <ul key={`${section.id}-${index}`}>
                    {block.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                ) : (
                  <p key={`${section.id}-${index}`}>{block.content}</p>
                )
              )}
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
