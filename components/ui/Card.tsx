"use client";

import { motion, HTMLMotionProps } from "framer-motion";

interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  glow?: boolean;
}

export function Card({ children, glow = false, className = "", ...rest }: CardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 20px 60px rgba(200,155,60,0.15)" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={[
        "rounded-sm border border-[var(--border)] bg-[rgba(255,255,255,0.03)]",
        "backdrop-blur-sm p-8 transition-colors duration-300",
        glow ? "shadow-[0_0_30px_rgba(200,155,60,0.08)]" : "",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
