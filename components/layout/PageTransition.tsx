"use client";

import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * Fades page content in on navigation.
 *
 * Previously this was a Framer Motion `AnimatePresence` with
 * `initial={{ opacity: 0 }}`, which put `opacity: 0` on the wrapper around
 * <main> in the server-rendered HTML — so every page on the site was blank
 * until hydration, and stayed blank if it never happened.
 *
 * The CSS animation is scoped to `html.js` and so simply doesn't apply without
 * JavaScript. The exit half of the old animation is not reproduced: App Router
 * navigations unmount immediately, so exit transitions never actually played.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  // Re-keying restarts the animation on each route change.
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
