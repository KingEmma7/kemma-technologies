"use client";

import { useRef, useState } from "react";
import { useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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

export function ContactForm() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const pending = useRef(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { preferredContact: "Email" },
  });
  const error = (name: FieldPath<ContactFormData>) =>
    errors[name]?.message ? (
      <span className="field-error" id={`${name}-error`}>
        {errors[name]?.message}
      </span>
    ) : null;
  const accessibility = (name: FieldPath<ContactFormData>) => ({
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });
  const select = (
    name: FieldPath<ContactFormData>,
    label: string,
    options: readonly string[],
    required = false,
  ) => (
    <label>
      {label}
      <select {...register(name)} {...accessibility(name)} required={required}>
        {name !== "preferredContact" && (
          <option value="">
            {required ? "Choose the closest match" : "Optional"}
          </option>
        )}
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      {error(name)}
    </label>
  );

  async function submit(data: ContactFormData) {
    if (pending.current) return;
    pending.current = true;
    setStatus("loading");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok || !(await response.json()).ok)
        throw new Error("Enquiry could not be sent");
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    } finally {
      pending.current = false;
    }
  }

  return (
    <div className="contact-page-grid wrap">
      <form
        className="contact-form"
        onSubmit={handleSubmit(submit)}
        noValidate
        aria-label="Project enquiry"
        aria-busy={status === "loading"}
      >
        <p className="form-intro">
          A rough idea is a good place to start. Fields marked * are required.
        </p>
        <fieldset disabled={status === "loading"}>
          <legend className="sr-only">Your project enquiry</legend>
          <div className="sr-only" aria-hidden="true">
            <label>
              Nickname
              <input
                tabIndex={-1}
                autoComplete="off"
                {...register("nickname")}
              />
            </label>
          </div>
          <div className="field-row">
            <label>
              Your name *
              <input
                autoComplete="name"
                placeholder="Name"
                maxLength={100}
                required
                {...register("name")}
                {...accessibility("name")}
              />
              {error("name")}
            </label>
            <label>
              Your email *
              <input
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                maxLength={254}
                required
                {...register("email")}
                {...accessibility("email")}
              />
              {error("email")}
            </label>
          </div>
          {select("projectType", "I’m interested in *", PROJECT_TYPES, true)}
          <label>
            A little about your idea *
            <textarea
              rows={4}
              placeholder="What would you like to build or improve?"
              minLength={20}
              maxLength={4000}
              required
              {...register("description")}
              {...accessibility("description")}
            />
            {error("description")}
          </label>
          <details className="enquiry-options">
            <summary>
              Add project details{" "}
              <span className="optional-label">Optional</span>
              <span className="details-symbol" aria-hidden="true" />
            </summary>
            <div className="field-row">
              <label>
                Organisation
                <input
                  autoComplete="organization"
                  maxLength={150}
                  {...register("organisation")}
                  {...accessibility("organisation")}
                />
                {error("organisation")}
              </label>
              <label>
                Website
                <input
                  autoComplete="url"
                  placeholder="yourdomain.com"
                  maxLength={200}
                  {...register("website")}
                  {...accessibility("website")}
                />
                {error("website")}
              </label>
            </div>
            <div className="field-row">
              {select("stage", "Current stage", PROJECT_STAGES)}
              {select("timeline", "Desired timeline", TIMELINES)}
            </div>
            <div className="field-row">
              {select("budget", "Approximate budget", BUDGET_RANGES)}
              {select("preferredContact", "Preferred contact", CONTACT_METHODS)}
            </div>
            <p className="form-note">
              If you prefer a call or WhatsApp, include your number in the
              project description.
            </p>
          </details>
          <p className="form-note">
            Your details are used to respond to this enquiry.
          </p>
          <button className="solid-button" type="submit">
            {status === "loading" ? "Sending enquiry…" : "Send enquiry"}
          </button>
        </fieldset>
        {status === "success" && (
          <p className="form-status" role="status">
            Thank you. Your enquiry has been sent. We’ll read it and get back to
            you by email.
          </p>
        )}
        {status === "error" && (
          <p className="form-status form-error" role="alert">
            Your enquiry couldn’t be sent. Your details are still here, so you
            can try again or{" "}
            <a href={`mailto:${SITE.email}`}>email us directly</a>.
          </p>
        )}
      </form>
      <aside className="contact-aside">
        <h2>Contact Kemma directly</h2>
        <p>
          Tell us what matters to your business, where you are now, and what
          you’d like to change.
        </p>
        <dl>
          <div>
            <dt>Phone</dt>
            <dd>
              <a href={`tel:${SITE.phone.e164}`}>{SITE.phone.display}</a>
            </dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </dd>
          </div>
          <div>
            <dt>Based in</dt>
            <dd>
              {SITE.location}
              <br />
              Working with organisations everywhere.
            </dd>
          </div>
        </dl>
        <div className="contact-social">
          <a
            href={`https://wa.me/${SITE.whatsapp}`}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
          <a href={SITE.social.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href={SITE.social.twitter} target="_blank" rel="noreferrer">
            X
          </a>
        </div>
      </aside>
    </div>
  );
}
