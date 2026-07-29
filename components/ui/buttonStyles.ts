/**
 * Shared button styling.
 *
 * These live in their own module with NO "use client" directive on purpose.
 *
 * They used to be exported from `Button.tsx`, which is a Client Component. Once
 * `ButtonLink` started being rendered from Server Components (Hero, AboutHero,
 * ServicesHero, CaseStudyContent), importing them across the client boundary
 * handed back client-reference proxies rather than the real objects — so
 * `variantClasses[variant]` was `undefined` and every ButtonLink rendered as
 * unstyled text. Keeping them in a neutral module lets both sides import the
 * actual values.
 */
export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--gold)] text-[#040406] font-semibold hover:brightness-110 shadow-[0_0_20px_rgba(200,155,60,0.3)]",
  secondary:
    "border border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[#040406]",
  ghost:
    "text-[var(--gold)] hover:text-white underline-offset-4 hover:underline",
};

export const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};
