"use client";

import { useEffect, useState } from "react";
import { getLenis } from "./SmoothScroll";

interface NavbarProps {
  onMenuToggle: () => void;
  menuOpen: boolean;
}

function LiveClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const formatted = now.toLocaleTimeString("en-GB", {
        timeZone: "Europe/Warsaw",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      setTime(formatted);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return <span suppressHydrationWarning>{time}</span>;
}

export default function Navbar({ onMenuToggle, menuOpen }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const lenis = getLenis();
    if (!lenis) return;
    const handler = ({ scroll }: { scroll: number }) => {
      setScrolled(scroll > 40);
    };
    lenis.on("scroll", handler);
    return () => lenis.off("scroll", handler);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-14"
      style={{
        borderBottom: scrolled ? `1px solid var(--c-border)` : "1px solid transparent",
        backgroundColor: scrolled ? "rgba(9,9,11,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition: "background-color 0.3s, border-color 0.3s",
      }}
    >
      {/* Left — wordmark + location + clock */}
      <div className="flex items-center gap-6">
        <a
          href="/"
          className="text-sm font-semibold tracking-[0.1em] uppercase"
          style={{ color: "var(--c-text)", fontFamily: "var(--font-display, sans-serif)" }}
        >
          AWAKE
        </a>
        <span
          className="hidden md:flex items-center gap-2 text-[11px] uppercase tracking-[0.12em]"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--c-muted)" }}
        >
          Based in: Warsaw{" "}
          <span style={{ color: "var(--c-accent)" }}>[ <LiveClock /> ]</span>
        </span>
      </div>

      {/* Center — email */}
      <a
        href="mailto:contact@awakeagency.dev"
        className="hidden lg:block text-[11px] uppercase tracking-[0.12em] transition-colors"
        style={{
          fontFamily: "var(--font-mono, monospace)",
          color: "var(--c-muted)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--c-text)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--c-muted)")}
      >
        Say hello: contact@awakeagency.dev
      </a>

      {/* Right — CTA + Menu */}
      <div className="flex items-center gap-4">
        <a
          href="mailto:contact@awakeagency.dev"
          className="hidden sm:flex items-center text-[11px] uppercase tracking-[0.12em] px-4 py-2 border transition-all"
          style={{
            fontFamily: "var(--font-mono, monospace)",
            borderColor: "var(--c-border)",
            color: "var(--c-text)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--c-accent)";
            e.currentTarget.style.color = "var(--c-accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--c-border)";
            e.currentTarget.style.color = "var(--c-text)";
          }}
        >
          [ GET IN TOUCH ]
        </a>

        <button
          onClick={onMenuToggle}
          className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] transition-colors"
          style={{
            fontFamily: "var(--font-mono, monospace)",
            color: menuOpen ? "var(--c-bg)" : "var(--c-text)",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <span className="relative w-5 h-3 flex flex-col justify-between">
            <span
              className="absolute left-0 w-full h-px transition-all duration-300"
              style={{
                backgroundColor: menuOpen ? "#09090B" : "var(--c-text)",
                top: menuOpen ? "50%" : "0",
                transform: menuOpen ? "translateY(-50%) rotate(45deg)" : "none",
              }}
            />
            <span
              className="absolute left-0 w-full h-px transition-all duration-300"
              style={{
                backgroundColor: menuOpen ? "#09090B" : "var(--c-text)",
                top: menuOpen ? "50%" : "100%",
                transform: menuOpen ? "translateY(-50%) rotate(-45deg)" : "none",
                opacity: menuOpen ? 1 : 1,
              }}
            />
          </span>
          <span className="hidden sm:inline">{menuOpen ? "close." : "menu."}</span>
        </button>
      </div>
    </header>
  );
}
