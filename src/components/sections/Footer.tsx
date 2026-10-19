"use client";

import { useEffect, useState } from "react";
import { getLenis } from "@/components/core/SmoothScroll";

const EMAIL = "contact@awakeagency.dev";

const NAV = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "Projects", href: "#projects" },
  { label: "Contacts", href: "#contact" },
];

const SOCIAL = [
  { label: "LinkedIn", href: "#" },
  { label: "Upwork", href: "#" },
];

function WarsawTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString("en-GB", {
          timeZone: "Europe/Warsaw",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    update();
    const id = setInterval(update, 10000);
    return () => clearInterval(id);
  }, []);
  return <span suppressHydrationWarning>{time}</span>;
}

export default function Footer() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async (e: React.MouseEvent) => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      e.preventDefault();
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable — fall through to the mailto link
    }
  };

  const scrollTo = (e: React.MouseEvent, href: string) => {
    const lenis = getLenis();
    const target = href === "#home" ? 0 : (document.querySelector(href) as HTMLElement | null);
    if (!lenis || target === null) return;
    e.preventDefault();
    lenis.scrollTo(target, { duration: 1.4 });
  };

  return (
    <footer className="w-full bg-white px-2.5 sm:px-5 pb-2.5 sm:pb-5">
      <div className="font-tight bg-[#161d25] text-white rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 min-h-[436px] flex flex-col justify-between gap-14">
        <div className="grid grid-cols-2 md:grid-cols-[479fr_253fr_384fr_204fr] gap-y-10 gap-x-6">
          <a href="#home" onClick={(e) => scrollTo(e, "#home")} className="col-span-2 md:col-span-1 text-[40px] leading-none tracking-[-0.03em]">
            awake.
          </a>

          <ul className="flex flex-col gap-2.5 text-[18px] leading-none">
            {NAV.map((l) => (
              <li key={l.label}>
                <a href={l.href} onClick={(e) => scrollTo(e, l.href)} className="hover:opacity-60 transition-opacity">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <ul className="flex flex-col gap-2.5 text-[18px] leading-none">
            {SOCIAL.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="hover:opacity-60 transition-opacity">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="col-span-2 md:col-span-1 flex flex-col gap-8">
            <div>
              <p className="text-[15px] leading-none text-white/45">Contact us</p>
              <a href={`mailto:${EMAIL}`} onClick={copyEmail} className="mt-2 inline-block text-[18px] leading-none hover:opacity-60 transition-opacity">
                {copied ? "Copied to clipboard." : EMAIL}
              </a>
            </div>
            <div>
              <p className="text-[15px] leading-none text-white/45">Based in</p>
              <p className="mt-2 text-[18px] leading-none">
                Warsaw <WarsawTime /> · 8°C
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-[479fr_253fr_384fr_204fr] gap-y-6 gap-x-6 items-end">
          <p className="col-span-2 md:col-span-1 text-[15px] leading-none order-3 md:order-none">
            © Awake {new Date().getFullYear()}. All rights reserved.
          </p>
          <div className="flex gap-4 text-[12px] leading-none uppercase tracking-[0.06em]">
            <a href="#" className="hover:opacity-60 transition-opacity">Privacy</a>
            <a href="#" className="hover:opacity-60 transition-opacity">Cookies</a>
            <a href="#" className="hover:opacity-60 transition-opacity">Terms</a>
          </div>
          <span className="hidden md:block" />
          <a href="#home" onClick={(e) => scrollTo(e, "#home")} className="justify-self-end md:justify-self-start inline-flex items-center gap-2 text-[15px] leading-none hover:opacity-60 transition-opacity">
            Back to top
            <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden="true">
              <path d="M5 11 V1 M1 5 L5 1 L9 5" stroke="currentColor" strokeWidth="1.4" fill="none" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
