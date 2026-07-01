import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { PageTransition } from "@/components/layout/PageTransition";
import { SITE } from "@/lib/site";

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
    default: "Kemma Technologies",
    template: "%s | Kemma Technologies",
  },
  description:
    "Engineering software, web platforms, and intelligent digital solutions for modern businesses.",
  keywords: [
    "software engineering",
    "web platforms",
    "digital solutions",
    "Ghana",
    "technology",
  ],
  openGraph: {
    title: "Kemma Technologies",
    description:
      "Engineering software, web platforms, and intelligent digital solutions for modern businesses.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kemma Technologies",
    description:
      "Engineering software, web platforms, and intelligent digital solutions for modern businesses.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      {/* suppressHydrationWarning: browser extensions (e.g. ColorZilla, Grammarly)
          inject attributes onto <body> before React hydrates. This is a benign,
          well-documented mismatch — see https://react.dev/link/hydration-mismatch */}
      <body suppressHydrationWarning>
        <SmoothScroll>
          <Navigation />
          <PageTransition>
            <main>{children}</main>
          </PageTransition>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
