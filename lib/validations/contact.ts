import { z } from "zod";

export const contactSchema = z.object({
  name:    z.string().min(2, "Name must be at least 2 characters"),
  email:   z.string().email("Please enter a valid email address"),
  company: z.string().optional(),
  message: z.string().min(20, "Message must be at least 20 characters"),
  // Honeypot: real users never see or fill this field (hidden via CSS).
  // Bots that auto-fill every input will populate it; the API checks this
  // and silently no-ops instead of returning an error, so the mechanism
  // isn't revealed by the response.
  website: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
