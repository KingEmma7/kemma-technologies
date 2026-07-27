import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { PageTransition } from "@/components/layout/PageTransition";
import { SITE } from "@/lib/site";
import { absoluteUrl, jsonLdScript, organizationJsonLd, websiteJsonLd } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Kemma Technologies | Digital Platforms and Product Engineering",
    template: "%s | Kemma Technologies",
  },
  description: SITE.description,
  keywords: [
    "digital platforms",
    "product engineering",
    "web applications",
    "business systems",
    "Next.js development",
    "software engineering",
  ],
  openGraph: {
    title: "Kemma Technologies | Digital Platforms and Product Engineering",
    description: SITE.description,
    type: "website",
    locale: "en_GB",
    url: SITE.url,
    siteName: SITE.name,
    // Explicit image in addition to the file-based app/opengraph-image.png
    // convention — some crawlers (e.g. link-unfurling bots) don't always
    // resolve the file-based route correctly, so we set it directly too.
    images: [{ url: absoluteUrl("/opengraph-image.png"), alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kemma Technologies | Digital Platforms and Product Engineering",
    description: SITE.description,
    images: [absoluteUrl("/twitter-image.png")],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        {/* Marks that scripting is available, before first paint. Scroll-reveal
            hidden states are scoped to `html.js`, so without this the page
            still renders fully visible instead of blank. Must stay inline and
            render-blocking — deferring it would cause a visible flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js')`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(organizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(websiteJsonLd()) }}
        />
      </head>
      {/* suppressHydrationWarning: browser extensions (e.g. ColorZilla, Grammarly)
          inject attributes onto <body> before React hydrates. This is a benign,
          well-documented mismatch — see https://react.dev/link/hydration-mismatch */}
      <body suppressHydrationWarning>
        <a href="#main" className="skip-link">Skip to main content</a>
        <SmoothScroll>
          <Navigation />
          <PageTransition>
            <main id="main">{children}</main>
          </PageTransition>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
