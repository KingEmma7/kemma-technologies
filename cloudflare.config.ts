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
      BRIEF_SIGNING_SECRET: bindings.secret(),
      BRIEF_STORAGE_URL: bindings.secret(),
      BRIEF_STORAGE_SECRET: bindings.secret(),
      BRIEF_SHORT_LINKS: bindings.secret(),
      BRIEF_TO_EMAIL: bindings.secret(),
      BRIEF_EMAIL_MODE: bindings.secret(),
      NEXT_PUBLIC_SITE_URL: bindings.secret(),
    },
  }),
});
