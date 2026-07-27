"use client";

import { useEffect } from "react";
import Lenis from "lenis";

interface SmoothScrollProps {
  children: React.ReactNode;
}

/**
 * Momentum scrolling via Lenis, driven by its own rAF loop.
 *
 * This previously ran Lenis off the GSAP ticker and registered ScrollTrigger to
 * keep the two in sync — but no ScrollTrigger animation ever existed in the
 * codebase, so GSAP + ScrollTrigger were shipped on every route purely to call
 * `lenis.raf()`. A plain rAF loop does the same job with no dependency.
 *
 * Reduced motion is re-checked live rather than only at mount, so toggling the
 * OS setting takes effect without a reload.
 */
export function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;
    let frame = 0;

    const start = () => {
      if (lenis) return;
      const instance = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      lenis = instance;

      const raf = (time: number) => {
        instance.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
    };

    const stop = () => {
      cancelAnimationFrame(frame);
      // destroy() also unsets the styles Lenis applied, so native scrolling
      // takes over cleanly when reduced motion is switched on mid-session.
      lenis?.destroy();
      lenis = null;
    };

    const sync = () => (query.matches ? stop() : start());

    sync();
    query.addEventListener("change", sync);

    return () => {
      query.removeEventListener("change", sync);
      stop();
    };
  }, []);

  return <>{children}</>;
}
