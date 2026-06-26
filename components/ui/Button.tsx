"use client";

import { forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

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

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", children, className = "", ...rest }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={[
          "inline-flex items-center justify-center gap-2 rounded-sm font-body cursor-pointer",
          "transition-all duration-200",
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(" ")}
        {...rest}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button };
