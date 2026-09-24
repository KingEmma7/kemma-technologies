import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navigation } from "@/components/site/Navigation";
import { Footer } from "@/components/site/Footer";
import { SITE } from "@/lib/site";
import { jsonLdScript, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { themeScript } from "@/components/site/theme";

const instrument = localFont({
  src: [
    {
      path: "./fonts/instrument-sans-regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/instrument-sans-medium.ttf",
      weight: "500 700",
      style: "normal",
    },
  ],
  variable: "--font-instrument",
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
  },
  twitter: {
    card: "summary_large_image",
    title: "Kemma Technologies | Digital Platforms and Product Engineering",
    description: SITE.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-GB"
      data-theme="light"
      data-palette="powder"
      suppressHydrationWarning
      className={instrument.variable}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdScript(organizationJsonLd()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(websiteJsonLd()) }}
        />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <Navigation />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
