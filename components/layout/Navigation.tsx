"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/work", label: "Work" },
  { href: "/contact", label: "Contact" },
];

const overlayVariants = {
  closed: { clipPath: "circle(0% at calc(100% - 40px) 40px)", transition: { duration: 0.5, ease: "easeInOut" as const } },
  open:   { clipPath: "circle(150% at calc(100% - 40px) 40px)", transition: { duration: 0.6, ease: "easeInOut" as const } },
};

const linkVariants = {
  closed: { opacity: 0, y: 30 },
  open:   (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.07, duration: 0.5, ease: "easeOut" as const },
  }),
};

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [close]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

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
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="relative z-60 flex items-center gap-3" aria-label="Kemma Technologies home">
            <Image
              src="/logo-mark.svg"
              alt="Kemma Technologies"
              width={44}
              height={44}
              className="object-contain"
              priority
            />
            <span className="font-heading font-bold text-base tracking-widest uppercase text-[var(--gold)] hidden sm:block">
              Kemma Technologies
            </span>
          </Link>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {navLinks.map(({ href, label }) => (
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

          {/* Hamburger */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="relative z-[60] flex flex-col justify-center items-center w-10 h-10 gap-[6px] md:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <motion.span
              animate={open ? { rotate: 45, y: 9 } : { rotate: 0, y: 0 }}
              className="block w-7 h-px bg-[var(--gold)] origin-center transition-all"
            />
            <motion.span
              animate={open ? { opacity: 0 } : { opacity: 1 }}
              className="block w-7 h-px bg-[var(--gold)]"
            />
            <motion.span
              animate={open ? { rotate: -45, y: -9 } : { rotate: 0, y: 0 }}
              className="block w-7 h-px bg-[var(--gold)] origin-center transition-all"
            />
          </button>

          {/* Desktop hamburger (full-screen menu trigger) */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="relative z-[60] hidden md:flex flex-col justify-center items-center w-10 h-10 gap-[6px]"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <motion.span animate={open ? { rotate: 45, y: 9 } : { rotate: 0, y: 0 }} className="block w-6 h-px bg-[var(--gold)] origin-center" />
            <motion.span animate={open ? { opacity: 0 } : { opacity: 1 }} className="block w-6 h-px bg-[var(--gold)]" />
            <motion.span animate={open ? { rotate: -45, y: -9 } : { rotate: 0, y: 0 }} className="block w-6 h-px bg-[var(--gold)] origin-center" />
          </button>
        </div>
      </header>

      {/* Full-screen overlay menu */}
      <AnimatePresence>
        {open && (
          <motion.div
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
              {navLinks.map(({ href, label }, i) => (
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
                        : "text-[#333] hover:text-[var(--gold)]",
                    ].join(" ")}
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Social row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.5 } }}
              exit={{ opacity: 0 }}
              className="absolute bottom-10 flex gap-8 text-sm text-[var(--muted)] uppercase tracking-widest"
            >
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-[var(--gold)] transition-colors">LinkedIn</a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-[var(--gold)] transition-colors">Twitter</a>
              <a href="mailto:hello@kemmatech.com" className="hover:text-[var(--gold)] transition-colors">Email</a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
