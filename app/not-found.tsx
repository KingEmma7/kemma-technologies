import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/ButtonLink";

export const metadata: Metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-[var(--dark-bg)] px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,155,60,0.06)_0%,transparent_70%)]" />
      <div className="relative z-10 text-center max-w-lg">
        <p className="text-xs uppercase tracking-widest text-[var(--gold)] mb-6">404</p>
        <h1 className="font-heading font-bold text-3xl md:text-5xl text-white mb-6">
          Page not found
        </h1>
        <p className="text-[var(--silver)] mb-10">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <ButtonLink href="/" size="lg">Back to Home</ButtonLink>
      </div>
    </section>
  );
}
