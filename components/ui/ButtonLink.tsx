import Link from "next/link";
import { type ButtonVariant, type ButtonSize, variantClasses, sizeClasses } from "./Button";

interface ButtonLinkProps {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
  /** Opens in new tab */
  external?: boolean;
}

/**
 * A styled link that looks like a Button. Use this instead of wrapping
 * <Button> inside <Link> (which produces invalid <a><button> nesting).
 */
export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  children,
  className = "",
  external = false,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-sm font-body",
        "transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(" ")}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {children}
    </Link>
  );
}
