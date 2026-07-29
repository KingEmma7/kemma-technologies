import { z } from "zod";

/**
 * Enquiry form options.
 *
 * Kept here rather than in the component so the form UI and the server-side
 * validation can never drift apart — a value that renders in the <select> is
 * by definition a value the schema accepts.
 */
export const PROJECT_TYPES = [
  "New digital platform",
  "Website or web application",
  "Existing product improvement",
  "Internal business system",
  "E-commerce or payments",
  "Technical audit",
  "Ongoing engineering support",
  "Partnership",
  "Other",
] as const;

export const PROJECT_STAGES = [
  "Just an idea",
  "Scoping and planning",
  "Design in progress",
  "Existing product to improve",
  "Ready to build",
] as const;

export const TIMELINES = [
  "As soon as possible",
  "1–3 months",
  "3–6 months",
  "6+ months",
  "Not sure yet",
] as const;

/**
 * Budget is optional by design. Asking is useful for qualifying work; forcing
 * it turns a warm enquiry into an abandoned form.
 */
export const BUDGET_RANGES = [
  "Under $5,000",
  "$5,000 – $15,000",
  "$15,000 – $50,000",
  "$50,000+",
  "Prefer to discuss",
] as const;

export const CONTACT_METHODS = ["Email", "WhatsApp", "Phone call"] as const;

/** Optional <select> fields submit "" when untouched — treat that as absent. */
const optionalChoice = <T extends readonly [string, ...string[]]>(values: T) =>
  z.union([z.enum(values), z.literal("")]).optional();

export const contactSchema = z.object({
  name:  z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),

  organisation: z.string().optional(),

  // Free text rather than z.string().url(): people type "acme.com" without a
  // scheme, and rejecting that is friction for a field that is only context.
  website: z.string().max(200).optional(),

  projectType: z.enum(PROJECT_TYPES, {
    message: "Please choose the closest project type",
  }),

  description: z.string().min(20, "Please give us at least a couple of sentences"),

  stage:    optionalChoice(PROJECT_STAGES),
  timeline: optionalChoice(TIMELINES),
  budget:   optionalChoice(BUDGET_RANGES),

  // No .default() here on purpose: a Zod default makes the schema's input and
  // output types diverge, which breaks react-hook-form's resolver generics.
  // The initial value is set via `defaultValues` in the form instead.
  preferredContact: z.enum(CONTACT_METHODS),

  // Honeypot. Real users never see or fill this (hidden via CSS + aria-hidden
  // + tabIndex -1); bots that fill every input will populate it, and the API
  // silently no-ops so the mechanism isn't revealed by the response.
  //
  // NOTE: this was previously named `website`, which now collides with the real
  // website field above. Renaming it is required — if both used `website`, a
  // genuine enquiry that filled it in would be silently discarded as spam.
  nickname: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
