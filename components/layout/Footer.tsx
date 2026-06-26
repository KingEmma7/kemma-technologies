import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/work", label: "Work" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] bg-[#020204] py-16">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo-mark.svg" alt="Kemma Technologies" width={40} height={40} className="object-contain" />
              <span className="font-heading font-bold uppercase tracking-widest text-sm text-[var(--gold)]">
                Kemma Technologies
              </span>
            </Link>
            <p className="text-sm text-[var(--muted)] leading-relaxed max-w-xs">
              Engineering software, web platforms, and intelligent digital solutions for modern businesses.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-[var(--muted)] mb-4">Navigation</h3>
            <ul className="flex flex-col gap-3">
              {footerLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-[var(--silver)] hover:text-[var(--gold)] transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-[var(--muted)] mb-4">Contact</h3>
            <ul className="flex flex-col gap-3 text-sm text-[var(--silver)]">
              <li>
                <a href="mailto:hello@kemmatech.com" className="hover:text-[var(--gold)] transition-colors duration-200">
                  hello@kemmatech.com
                </a>
              </li>
              <li>Accra, Ghana</li>
              <li className="flex gap-4 pt-2">
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-[var(--gold)] transition-colors duration-200 uppercase tracking-widest text-xs">
                  LinkedIn
                </a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-[var(--gold)] transition-colors duration-200 uppercase tracking-widest text-xs">
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[var(--border)] pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--muted)] uppercase tracking-widest">
          <span>&copy; {year} Kemma Technologies. All rights reserved.</span>
          <span className="text-gold-gradient font-semibold">Built with precision.</span>
        </div>
      </Container>
    </footer>
  );
}
