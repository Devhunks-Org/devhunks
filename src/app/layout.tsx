import type { Metadata } from "next";
import { Syne, JetBrains_Mono, Plus_Jakarta_Sans, Inter_Tight } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/core/SmoothScroll";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-grotesque",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Devhunks — Creative Digital Studio",
  description:
    "We design and build premium websites and web products for founders and product teams who need to stand out. Webflow, Next.js, motion and WebGL.",
  keywords: [
    "creative digital studio",
    "web design agency",
    "Webflow development",
    "Next.js development",
    "motion design",
    "WebGL website",
  ],
  authors: [{ name: "Devhunks" }],
  openGraph: {
    title: "Devhunks — Creative Digital Studio",
    description: "Premium websites and web products for founders and product teams.",
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
    <html lang="en" className={`${syne.variable} ${jakarta.variable} ${jetbrainsMono.variable} ${interTight.variable}`}>
      <body suppressHydrationWarning>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
