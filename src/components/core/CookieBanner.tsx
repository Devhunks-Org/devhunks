"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "awake_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const timer = setTimeout(() => setVisible(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = (choice: "all" | "none" | "choose") => {
    localStorage.setItem(STORAGE_KEY, choice);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 max-w-sm p-5 flex flex-col gap-4"
      style={{
        backgroundColor: "var(--c-surface)",
        border: "1px solid var(--c-border)",
      }}
    >
      <p
        className="text-[12px] leading-relaxed"
        style={{ color: "var(--c-muted)", fontFamily: "var(--font-mono, monospace)" }}
      >
        We use cookies for the booking calendar and, if you allow it, Google Analytics to
        see how people find the site.
      </p>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => dismiss("all")}
          className="w-full py-2 text-[11px] uppercase tracking-[0.12em] transition-colors"
          style={{
            fontFamily: "var(--font-mono, monospace)",
            backgroundColor: "var(--c-accent)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Accept all
        </button>
        <button
          onClick={() => dismiss("choose")}
          className="w-full py-2 text-[11px] uppercase tracking-[0.12em] transition-colors"
          style={{
            fontFamily: "var(--font-mono, monospace)",
            backgroundColor: "transparent",
            color: "var(--c-text)",
            border: "1px solid var(--c-border)",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--c-accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--c-border)")}
        >
          Choose what to allow
        </button>
        <button
          onClick={() => dismiss("none")}
          className="w-full py-2 text-[11px] uppercase tracking-[0.12em] transition-colors"
          style={{
            fontFamily: "var(--font-mono, monospace)",
            backgroundColor: "transparent",
            color: "var(--c-dim)",
            border: "none",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--c-muted)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--c-dim)")}
        >
          Reject all
        </button>
      </div>
    </div>
  );
}
