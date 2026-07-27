"use client";

import { useEffect, useRef } from "react";

export type RevealDirection = "up" | "down" | "left" | "right" | "none";

interface RevealProps {
  children: React.ReactNode;
  /** Seconds before the transition starts once the element is in view. */
  delay?: number;
  direction?: RevealDirection;
  /** Seconds. */
  duration?: number;
  /** Reveal only the first time it enters the viewport. */
  once?: boolean;
  className?: string;
  /** Render as a different element where a <div> would be invalid. */
  as?: "div" | "li" | "article" | "section";
}

/**
 * Scroll-reveal wrapper.
 *
 * The hidden state is applied by CSS only under `html.js`, and that class is set
 * by a blocking inline script in the root layout. That ordering matters:
 *
 *   - Without JS, `.js` is never added, so content renders fully visible. The
 *     previous Framer Motion version emitted `opacity: 0` inline into the SSR
 *     HTML, which meant the whole page — including the hero <h1> — was blank
 *     until hydration, and stayed blank for ever if hydration failed.
 *   - With JS, the class is present before first paint, so there's no flash of
 *     un-hidden content.
 *
 * Reduced motion is handled in CSS: the offset and transition are dropped and
 * the element is simply visible.
 */
export function Reveal({
  children,
  delay = 0,
  direction = "up",
  duration = 0.6,
  once = true,
  className = "",
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  // Visibility is toggled as a DOM attribute rather than React state: it is
  // purely a CSS concern, it never affects the rendered markup, and routing it
  // through state would re-render every revealed subtree on scroll.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const show = () => node.setAttribute("data-reveal-visible", "true");

    // If IntersectionObserver is unavailable, show immediately rather than
    // leaving content permanently hidden.
    if (typeof IntersectionObserver === "undefined") {
      show();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          show();
          if (once) observer.disconnect();
        } else if (!once) {
          node.removeAttribute("data-reveal-visible");
        }
      },
      { rootMargin: "-80px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      data-reveal={direction}
      style={
        {
          "--reveal-delay": `${delay}s`,
          "--reveal-duration": `${duration}s`,
        } as React.CSSProperties
      }
      className={className}
    >
      {children}
    </Tag>
  );
}
