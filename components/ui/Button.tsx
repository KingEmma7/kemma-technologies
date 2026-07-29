"use client";

import { forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

import {
  variantClasses,
  sizeClasses,
  type ButtonVariant,
  type ButtonSize,
} from "./buttonStyles";

// Re-exported for existing consumers. The definitions live in buttonStyles.ts
// so Server Components can import them without crossing the client boundary.
export { variantClasses, sizeClasses };
export type { ButtonVariant, ButtonSize };

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

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
