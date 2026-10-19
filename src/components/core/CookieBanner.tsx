"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "awake_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {}
    if (!stored) {
      const timer = setTimeout(() => setVisible(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = (choice: "all" | "none" | "choose") => {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="font-tight fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-[70] w-[calc(100%-24px)] sm:w-[300px] rounded-2xl bg-white p-4 text-[#161d25] shadow-[0_12px_40px_rgba(22,29,37,0.16)]">
      <p className="text-[12px] leading-[1.5]">
        We use cookies for the booking calendar and, if you allow it, Google Analytics to see how people find the
        site.{" "}
        <a href="#" className="underline underline-offset-2">
          More<span className="sr-only"> about cookies</span>
        </a>
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={() => dismiss("none")}
          className="h-8 rounded-full border border-[#dbdcde] text-[12px] tracking-[0.02em] hover:bg-[#f1f1f3] transition-colors cursor-pointer"
        >
          Reject all
        </button>
        <button
          onClick={() => dismiss("all")}
          className="h-8 rounded-full bg-[#161d25] text-white text-[12px] tracking-[0.02em] hover:bg-[#2d343b] transition-colors cursor-pointer"
        >
          Accept all
        </button>
      </div>
      <button
        onClick={() => dismiss("choose")}
        className="mt-2.5 w-full text-center text-[12px] text-[#161d25]/70 underline underline-offset-2 cursor-pointer"
      >
        Choose what to allow
      </button>
    </div>
  );
}
