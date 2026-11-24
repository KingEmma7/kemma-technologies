import { bindings, defineConfig, defineWorker, triggers } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "kemma-website",
    entrypoint: "./worker/website/entry.ts",
    compatibilityDate: "2026-11-21",
    compatibilityFlags: ["nodejs_compat"],
    triggers: [triggers.scheduled({ schedule: "15 3 * * *" })],
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
      CRON_SECRET: bindings.secret(),
      RESEND_API_KEY: bindings.secret(),
      CONTACT_FROM_EMAIL: bindings.secret(),
      BRIEF_INTERNAL: bindings.worker({ worker: "kemma-brief-storage", exportName: "BriefInternal" }),
      BRIEF_STORAGE_URL: bindings.text("https://kemma-brief-storage.etagbor.workers.dev"),
      BRIEF_SHORT_LINKS: bindings.secret(),
      BRIEF_TO_EMAIL: bindings.secret(),
      NEXT_PUBLIC_SITE_URL: bindings.text("https://www.kemmatechnologies.com"),
    },
  }),
});
