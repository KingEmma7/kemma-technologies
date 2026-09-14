"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Brand } from "./Brand";
import { Appearance } from "./Appearance";

const links = [
  { href: "/work", label: "Work" },
  { href: "/demos", label: "Demos" },
  { href: "/pricing", label: "Pricing" },
  { href: "/services", label: "Capabilities" },
  { href: "/about", label: "Studio" },
];

export function Navigation() {
  const pathname = usePathname();
  // A route change naturally remounts only the menu, keeping appearance stable.
  return (
    <header className="header wrap" id="top">
      <Brand />
      <nav className="desktop-nav" aria-label="Main navigation">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={pathname.startsWith(link.href) ? "page" : undefined}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="header-actions">
        <Appearance />
        <Link className="contact-link" href="/contact">
          Let’s talk
        </Link>
        <MobileMenu key={pathname} />
      </div>
    </header>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);
  const holder = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (e.target instanceof Node && !holder.current?.contains(e.target))
        setOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const desktop = matchMedia("(min-width: 761px)");
    const resize = () => {
      if (desktop.matches) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", key);
    desktop.addEventListener("change", resize);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", key);
      desktop.removeEventListener("change", resize);
    };
  }, [open]);
  return (
    <div className="mobile-menu" ref={holder}>
      <button
        ref={button}
        className="menu-toggle"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen(!open)}
      >
        <span />
        <span />
      </button>
      <nav id="mobile-nav" aria-label="Mobile navigation" hidden={!open}>
        {links.map((link) => (
          <Link href={link.href} key={link.href} onClick={() => setOpen(false)}>
            {link.label}
          </Link>
        ))}
        <Link href="/contact" onClick={() => setOpen(false)}>
          Let’s talk
        </Link>
      </nav>
    </div>
  );
}
