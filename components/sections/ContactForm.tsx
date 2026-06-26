"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

const schema = z.object({
  name:    z.string().min(2, "Name must be at least 2 characters"),
  email:   z.string().email("Please enter a valid email address"),
  company: z.string().optional(),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

type FormData = z.infer<typeof schema>;
type Status = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <Input
                  label="Name *"
                  placeholder="Your name"
                  error={errors.name?.message}
                  {...register("name")}
                />
                <Input
                  label="Email *"
                  type="email"
                  placeholder="you@company.com"
                  error={errors.email?.message}
                  {...register("email")}
                />
              </div>

              <Input
                label="Company"
                placeholder="Your company (optional)"
                {...register("company")}
              />

              <Textarea
                label="Message *"
                placeholder="Tell us about your project — what you're building, your timeline and budget range..."
                error={errors.message?.message}
                {...register("message")}
              />

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
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-[var(--success)] text-sm"
                    >
                      ✓ Message sent! We&apos;ll be in touch within 24 hours.
                    </motion.p>
                  )}
                  {status === "error" && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-[var(--error)] text-sm"
                    >
                      Something went wrong. Please email us directly at hello@kemmatech.com
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
                  <a href="mailto:hello@kemmatech.com" className="text-[var(--silver)] hover:text-[var(--gold)] transition-colors text-lg">
                    hello@kemmatech.com
                  </a>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-2">Location</p>
                  <p className="text-[var(--silver)] text-lg">Accra, Ghana</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-2">Social</p>
                  <div className="flex gap-6">
                    <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-[var(--silver)] hover:text-[var(--gold)] transition-colors">
                      LinkedIn
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-[var(--silver)] hover:text-[var(--gold)] transition-colors">
                      Twitter
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Response promise */}
            <div className="border border-[var(--border)] rounded-sm p-8 bg-[rgba(255,255,255,0.02)]">
              <div className="text-4xl mb-4">⏱</div>
              <h3 className="font-heading font-semibold text-white text-lg mb-2">24-hour response</h3>
              <p className="text-[var(--silver)] text-sm leading-relaxed">
                We read every enquiry personally. You&apos;ll hear back from a senior team member — not an automated bot — within one business day.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
