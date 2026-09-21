import Link from "next/link";
import { SITE } from "@/lib/site";
import { Brand } from "./Brand";

export function Footer() {
  return (
    <footer className="footer wrap">
      <Brand />
      <p>© {new Date().getFullYear()} Kemma Technologies</p>
      <div>
        <a href={`mailto:${SITE.email}`}>Email</a>
        <Link href="/demos">Demos</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/contact">Contact</Link>
        <a href="#top">Back to top</a>
      </div>
    </footer>
  );
}
