"use client";

import { motion, Variants, HTMLMotionProps } from "framer-motion";

interface RevealProps extends Omit<HTMLMotionProps<"div">, "variants" | "initial" | "whileInView" | "viewport" | "transition"> {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
  once?: boolean;
}

const directionVariants: Record<NonNullable<RevealProps["direction"]>, Variants> = {
  up: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  down: {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0 },
  },
  left: {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0 },
  },
  right: {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0 },
  },
  none: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
};

export function Reveal({
  children,
  delay = 0,
  direction = "up",
  duration = 0.6,
  once = true,
  className = "",
  ...rest
}: RevealProps) {
  return (
    <motion.div
      variants={directionVariants[direction]}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-80px" }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
