"use client";

import { useEffect } from "react";
import { ButtonLink } from "@/components/ui/ButtonLink";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Route-segment error boundary. Catches render/render-phase errors thrown by
 * any page or layout below this one and shows a branded fallback instead of
 * Next.js's default error screen.
 */
export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-[var(--dark-bg)] px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,155,60,0.06)_0%,transparent_70%)]" />
      <div className="relative z-10 text-center max-w-lg">
        <p className="text-xs uppercase tracking-widest text-[var(--gold)] mb-6">Error</p>
        <h1 className="font-heading font-bold text-3xl md:text-5xl text-white mb-6">
          Something went wrong
        </h1>
        <p className="text-[var(--silver)] mb-10">
          An unexpected error occurred while loading this page. Please try again, or head back home.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-8 py-4 text-lg rounded-sm font-body bg-[var(--gold)] text-[#040406] font-semibold hover:brightness-110 transition-all duration-200"
          >
            Try again
          </button>
          <ButtonLink href="/" variant="secondary" size="lg">Back to Home</ButtonLink>
        </div>
      </div>
    </section>
  );
}
