"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { SITE, NAV_LINKS } from "@/lib/site";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  // Track previous pathname so we only close when it genuinely changes.
  const prevPathnameRef = useRef(pathname);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const hasOpenedRef = useRef(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close overlay when route changes (browser back/forward, programmatic navigation).
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      setOpen(false);
    }
  }, [pathname]);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  // Move focus into the overlay when it opens, and back to the trigger
  // button when it closes — keyboard and screen-reader users should never
  // lose their place.
  useEffect(() => {
    if (open) {
      hasOpenedRef.current = true;
      const firstFocusable = overlayRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      firstFocusable?.focus();
    } else if (hasOpenedRef.current) {
      // Only steal focus back to the trigger if the menu was actually open —
      // skip this on initial mount.
      toggleButtonRef.current?.focus();
    }
  }, [open]);

  // Escape closes the menu; Tab is trapped within the overlay while it's open.
  useEffect(() => {
    if (!open) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }

      if (e.key !== "Tab" || !overlayRef.current) return;

      const focusable = Array.from(
        overlayRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, close]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const overlayVariants = {
    closed: {
      clipPath: "circle(0% at calc(100% - 56px) 40px)",
      transition: { duration: prefersReducedMotion ? 0 : 0.5, ease: "easeInOut" as const },
    },
    open: {
      clipPath: "circle(150% at calc(100% - 56px) 40px)",
      transition: { duration: prefersReducedMotion ? 0 : 0.6, ease: "easeInOut" as const },
    },
  };

  const linkVariants = {
    closed: { opacity: 0, y: prefersReducedMotion ? 0 : 30 },
    open: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: prefersReducedMotion ? 0 : 0.1 + i * 0.07,
        duration: prefersReducedMotion ? 0 : 0.5,
        ease: "easeOut" as const,
      },
    }),
  };

  return (
    <>
      <header
        className={[
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled || open
            ? "bg-[rgba(4,4,6,0.92)] backdrop-blur-md border-b border-[var(--border)]"
            : "bg-transparent",
        ].join(" ")}
      >
        <div className="mx-auto max-w-7xl pl-3 pr-4 md:px-10 lg:px-16 h-20 md:h-32 flex items-center justify-between">
          {/* Logo — smaller on mobile; desktop size preserved at md+ */}
          <Link href="/" className="flex items-center justify-start z-[60] shrink-0" aria-label={`${SITE.name} home`}>
            <Image
              src="/logo.png"
              alt={SITE.name}
              width={1024}
              height={768}
              className="h-24 w-auto object-contain object-left md:h-36"
              priority
            />
          </Link>

          {/* Desktop inline links (always visible on md+) */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={[
                  "text-sm uppercase tracking-widest font-medium transition-colors duration-200",
                  pathname === href
                    ? "text-[var(--gold)]"
                    : "text-[var(--silver)] hover:text-[var(--gold)]",
                ].join(" ")}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Hamburger — triggers full-screen overlay on all breakpoints */}
          <button
            ref={toggleButtonRef}
            onClick={toggle}
            className="z-[60] flex flex-col justify-center items-center w-10 h-10 gap-[6px]"
            aria-expanded={open}
            aria-controls="nav-overlay"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <motion.span animate={open ? { rotate: 45, y: 9 } : { rotate: 0, y: 0 }} className="block w-6 h-px bg-[var(--gold)] origin-center" />
            <motion.span animate={open ? { opacity: 0 } : { opacity: 1 }} className="block w-6 h-px bg-[var(--gold)]" />
            <motion.span animate={open ? { rotate: -45, y: -9 } : { rotate: 0, y: 0 }} className="block w-6 h-px bg-[var(--gold)] origin-center" />
          </button>
        </div>
      </header>

      {/* Full-screen overlay menu — all breakpoints */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="nav-overlay"
            ref={overlayRef}
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 z-40 bg-[#040406] flex flex-col items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <nav className="flex flex-col items-center gap-6">
              {NAV_LINKS.map(({ href, label }, i) => (
                <motion.div
                  key={href}
                  custom={i}
                  variants={linkVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                >
                  <Link
                    href={href}
                    onClick={close}
                    className={[
                      "text-5xl md:text-7xl font-heading font-bold uppercase tracking-tight",
                      "transition-colors duration-200",
                      pathname === href
                        ? "text-gold-gradient"
                        : "text-[#444] hover:text-[var(--gold)]",
                    ].join(" ")}
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: prefersReducedMotion ? 0 : 0.5 } }}
              exit={{ opacity: 0 }}
              className="absolute bottom-10 flex gap-8 text-sm text-[var(--muted)] uppercase tracking-widest"
            >
              <a href={SITE.social.linkedin} target="_blank" rel="noreferrer" className="hover:text-[var(--gold)] transition-colors">LinkedIn</a>
              <a href={SITE.social.twitter}  target="_blank" rel="noreferrer" className="hover:text-[var(--gold)] transition-colors">X</a>
              <a href={`mailto:${SITE.email}`} className="hover:text-[var(--gold)] transition-colors">Email</a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
