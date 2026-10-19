import type { Metadata } from "next";
import { Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/core/SmoothScroll";

const syne = Syne({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Awake — Creative Digital Studio in Warsaw",
  description:
    "We design and build premium websites and web products for founders and product teams who need to stand out. Webflow, Next.js, motion and WebGL. 60+ projects shipped.",
  keywords: [
    "creative digital studio",
    "web design Warsaw",
    "Webflow development",
    "Next.js development",
    "motion design",
    "WebGL website",
  ],
  authors: [{ name: "Awake Studio" }],
  openGraph: {
    title: "Awake — Creative Digital Studio in Warsaw",
    description: "Premium websites and web products. 60+ projects shipped.",
    type: "website",
    locale: "en_GB",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${jetbrainsMono.variable}`}>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
