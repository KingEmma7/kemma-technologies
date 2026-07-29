"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MessageCircle } from "lucide-react";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/lib/site";
import {
  BUDGET_RANGES,
  CONTACT_METHODS,
  PROJECT_STAGES,
  PROJECT_TYPES,
  TIMELINES,
  contactSchema,
  type ContactFormData,
} from "@/lib/validations/contact";

type Status = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { preferredContact: "Email" },
  });

  const onSubmit = async (data: ContactFormData) => {
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="py-16 pb-32 bg-[var(--dark-bg)]">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Form */}
          <div>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-8">
              {/* Honeypot — hidden from real users, catches basic bots that
                  auto-fill every field. Deliberately NOT named `website`: that
                  is a real field below, and a collision would silently discard
                  genuine enquiries as spam. */}
              <div className="sr-only" aria-hidden="true">
                <label htmlFor="nickname">Nickname</label>
                <input
                  id="nickname"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  {...register("nickname")}
                />
              </div>

              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <Input
                  label="Name *"
                  placeholder="Your name"
                  autoComplete="name"
                  error={errors.name?.message}
                  {...register("name")}
                />
                <Input
                  label="Email *"
                  type="email"
                  placeholder="you@organisation.com"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register("email")}
                />
              </div>

              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <Input
                  label="Organisation"
                  placeholder="Your organisation (optional)"
                  autoComplete="organization"
                  error={errors.organisation?.message}
                  {...register("organisation")}
                />
                <Input
                  label="Website"
                  placeholder="yourdomain.com (optional)"
                  autoComplete="url"
                  error={errors.website?.message}
                  {...register("website")}
                />
              </div>

              <Select
                label="Project type *"
                placeholder="Choose the closest match"
                options={PROJECT_TYPES}
                error={errors.projectType?.message}
                {...register("projectType")}
              />

              <Textarea
                label="What are you trying to build? *"
                placeholder="Tell us what you are trying to launch, improve or automate…"
                error={errors.description?.message}
                {...register("description")}
              />

              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <Select
                  label="Current stage"
                  placeholder="Optional"
                  options={PROJECT_STAGES}
                  error={errors.stage?.message}
                  {...register("stage")}
                />
                <Select
                  label="Desired timeline"
                  placeholder="Optional"
                  options={TIMELINES}
                  error={errors.timeline?.message}
                  {...register("timeline")}
                />
              </div>

              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <Select
                  label="Approximate budget"
                  placeholder="Optional"
                  options={BUDGET_RANGES}
                  error={errors.budget?.message}
                  {...register("budget")}
                />
                <Select
                  label="Preferred contact method"
                  options={CONTACT_METHODS}
                  error={errors.preferredContact?.message}
                  {...register("preferredContact")}
                />
              </div>

              <div className="flex flex-col gap-4">
                <Button
                  type="submit"
                  size="lg"
                  disabled={status === "loading"}
                  className="self-start"
                >
                  {status === "loading" ? "Sending…" : "Send Message"}
                </Button>

                <AnimatePresence>
                  {status === "success" && (
                    <motion.p
                      key="success"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      role="status"
                      className="text-[var(--success)] text-sm"
                    >
                      ✓ Message sent! We&apos;ll be in touch within 24 hours.
                    </motion.p>
                  )}
                  {status === "error" && (
                    <motion.p
                      key="error"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      role="alert"
                      className="text-[var(--error)] text-sm"
                    >
                      Something went wrong. Please email us directly at{" "}
                      <a href={`mailto:${SITE.email}`} className="underline">{SITE.email}</a>
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </div>

          {/* Contact info */}
          <div className="flex flex-col gap-12">
            <div>
              <h2 className="font-heading font-bold text-3xl text-white mb-6">Other ways to reach us</h2>
              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-2">Email</p>
                  <a href={`mailto:${SITE.email}`} className="inline-flex min-h-6 items-center text-lg text-[var(--silver)] transition-colors hover:text-[var(--gold)]">
                    {SITE.email}
                  </a>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-2">Location</p>
                  <p className="text-[var(--silver)] text-lg">{SITE.location}</p>
                </div>
                {SITE.whatsapp && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-2">WhatsApp</p>
                    <a
                      href={`https://wa.me/${SITE.whatsapp}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-[var(--silver)] hover:text-[var(--gold)] transition-colors text-lg"
                    >
                      <MessageCircle className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                      Message us on WhatsApp
                    </a>
                  </div>
                )}
                <div>
                  <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-2">Social</p>
                  <div className="flex gap-6">
                    <a href={SITE.social.linkedin} target="_blank" rel="noreferrer" className="text-[var(--silver)] hover:text-[var(--gold)] transition-colors">
                      LinkedIn
                    </a>
                    <a href={SITE.social.twitter} target="_blank" rel="noreferrer" className="text-[var(--silver)] hover:text-[var(--gold)] transition-colors">
                      X
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-[var(--border)] rounded-sm p-8 bg-[rgba(255,255,255,0.02)]">
              <Clock className="mb-4 h-7 w-7 text-[var(--gold)]" strokeWidth={1.5} aria-hidden="true" />
              <h3 className="font-heading font-semibold text-white text-lg mb-2">24-hour response</h3>
              <p className="text-[var(--silver)] text-sm leading-relaxed">
                We read every enquiry personally. You&apos;ll hear back directly from the founder or a senior technical collaborator — not an automated bot — within one business day.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
