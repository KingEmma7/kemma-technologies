import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { PageTransition } from "@/components/layout/PageTransition";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
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
      <body>
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
