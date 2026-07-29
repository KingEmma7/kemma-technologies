import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SITE, NAV_LINKS } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] bg-[#020204] py-16">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center w-fit">
              <Image
                src="/logo.png"
                alt={SITE.name}
                width={1024}
                height={768}
                className="h-32 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-[var(--muted)] leading-relaxed max-w-xs">
              {SITE.tagline}
            </p>
          </div>

          {/* Links */}
          <div>
            <h2 className="text-xs uppercase tracking-widest text-[var(--muted)] mb-4">Navigation</h2>
            <ul className="flex flex-col gap-3">
              {NAV_LINKS.filter((l) => l.href !== "/").map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="inline-flex min-h-6 items-center text-sm text-[var(--silver)] transition-colors duration-200 hover:text-[var(--gold)]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-xs uppercase tracking-widest text-[var(--muted)] mb-4">Contact</h2>
            <ul className="flex flex-col gap-3 text-sm text-[var(--silver)]">
              <li>
                <a href={`mailto:${SITE.email}`} className="inline-flex min-h-6 items-center hover:text-[var(--gold)] transition-colors duration-200">
                  {SITE.email}
                </a>
              </li>
              <li>{SITE.location}</li>
              <li className="flex gap-4 pt-2">
                <a href={SITE.social.linkedin} target="_blank" rel="noreferrer" className="inline-flex min-h-6 items-center uppercase tracking-widest text-xs hover:text-[var(--gold)] transition-colors duration-200">
                  LinkedIn
                </a>
                <a href={SITE.social.twitter} target="_blank" rel="noreferrer" className="inline-flex min-h-6 items-center uppercase tracking-widest text-xs hover:text-[var(--gold)] transition-colors duration-200">
                  X
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--border)] pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--muted)] uppercase tracking-widest">
          <span>&copy; {year} {SITE.name}. All rights reserved.</span>
          <span className="text-gold-gradient font-semibold">Built with precision.</span>
        </div>
      </Container>
    </footer>
  );
}
