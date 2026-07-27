"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// `ssr: false` is only valid inside a Client Component, which is the main
// reason this wrapper exists — Hero itself is a Server Component so the
// headline can render without waiting on any of this.
const HeroCanvas = dynamic(() => import("./HeroCanvas").then((m) => m.HeroCanvas), {
  ssr: false,
});

/**
 * Decides whether the WebGL particle field is worth mounting at all.
 *
 * Three.js + react-three-fiber are by far the heaviest thing on the homepage,
 * so they are only loaded when the visitor is on a larger viewport and has not
 * asked for reduced motion. Everyone else gets the static gradient already
 * painted behind this — a lighter experience, not a broken one.
 *
 * The global `prefers-reduced-motion` CSS guard cannot help here: it can't stop
 * a requestAnimationFrame loop inside useFrame, so the check has to gate the
 * mount itself.
 */
export function HeroCanvasMount() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const largeViewport = window.matchMedia("(min-width: 768px)");

    const sync = () => setEnabled(!reducedMotion.matches && largeViewport.matches);

    sync();
    reducedMotion.addEventListener("change", sync);
    largeViewport.addEventListener("change", sync);

    return () => {
      reducedMotion.removeEventListener("change", sync);
      largeViewport.removeEventListener("change", sync);
    };
  }, []);

  if (!enabled) return null;

  return <HeroCanvas />;
}
