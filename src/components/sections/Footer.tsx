"use client";

import { useEffect, useState } from "react";
import { getLenis } from "@/components/core/SmoothScroll";

function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-GB", {
          timeZone: "Europe/Warsaw",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return <span suppressHydrationWarning>{time}</span>;
}

export default function Footer() {
  const handleBackToTop = () => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.6, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Services", href: "#services" },
    { label: "Projects", href: "#projects" },
    { label: "Contacts", href: "mailto:contact@awakeagency.dev" },
  ];

  const socialLinks = [
    { label: "LinkedIn", href: "https://linkedin.com" },
    { label: "Upwork", href: "https://upwork.com" },
  ];

  return (
    <footer
      className="w-full px-6 md:px-12 pt-20 pb-8"
      style={{
        backgroundColor: "var(--c-bg)",
        borderTop: "1px solid var(--c-border)",
      }}
    >
      {/* Top row */}
      <div className="flex flex-col lg:flex-row gap-12 justify-between mb-20">
        {/* Left — wordmark + tagline */}
        <div className="flex flex-col gap-4">
          <span
            className="text-[clamp(3rem,8vw,6rem)] font-light leading-none tracking-[-0.04em]"
            style={{ fontFamily: "var(--font-display, sans-serif)", color: "var(--c-text)" }}
          >
            AWAKE.
          </span>
          <p
            className="text-[11px] uppercase tracking-[0.12em] max-w-xs"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--c-muted)" }}
          >
            Creative digital studio in Warsaw.
            <br />
            Premium websites and web products.
          </p>
        </div>

        {/* Right — nav + social + contact */}
        <div className="flex flex-wrap gap-16">
          {/* Navigation */}
          <div className="flex flex-col gap-3">
            <span
              className="text-[9px] uppercase tracking-[0.2em] mb-2"
              style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--c-dim)" }}
            >
              Navigation
            </span>
            {navLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-[12px] uppercase tracking-[0.1em] transition-colors"
                style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--c-muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--c-text)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--c-muted)")}
              >
                {label}
              </a>
            ))}
          </div>

          {/* Social */}
          <div className="flex flex-col gap-3">
            <span
              className="text-[9px] uppercase tracking-[0.2em] mb-2"
              style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--c-dim)" }}
            >
              Social
            </span>
            {socialLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] uppercase tracking-[0.1em] transition-colors"
                style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--c-muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--c-accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--c-muted)")}
              >
                {label} ↗
              </a>
            ))}
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <span
              className="text-[9px] uppercase tracking-[0.2em] mb-2"
              style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--c-dim)" }}
            >
              Contact
            </span>
            <a
              href="mailto:contact@awakeagency.dev"
              className="text-[12px] tracking-[0.05em] transition-colors"
              style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--c-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--c-accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--c-muted)")}
            >
              contact@awakeagency.dev
            </a>
            <div className="flex flex-col gap-1 mt-2">
              <span
                className="text-[9px] uppercase tracking-[0.15em]"
                style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--c-dim)" }}
              >
                Warsaw time
              </span>
              <span
                className="text-[12px] tabular-nums"
                style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--c-accent)" }}
              >
                <LiveClock />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="flex flex-wrap items-center justify-between gap-4 pt-6"
        style={{ borderTop: "1px solid var(--c-border)" }}
      >
        <p
          className="text-[10px] uppercase tracking-[0.1em]"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--c-dim)" }}
        >
          © Awake 2026. All rights reserved.{" "}
          <a href="#" className="hover:text-gray-400 transition-colors">Privacy</a>
          {" / "}
          <a href="#" className="hover:text-gray-400 transition-colors">Cookies</a>
          {" / "}
          <a href="#" className="hover:text-gray-400 transition-colors">Terms</a>
        </p>

        <button
          onClick={handleBackToTop}
          className="text-[10px] uppercase tracking-[0.18em] flex items-center gap-2 transition-colors"
          style={{
            fontFamily: "var(--font-mono, monospace)",
            color: "var(--c-muted)",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--c-accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--c-muted)")}
        >
          [ BACK TO TOP ↑ ]
        </button>
      </div>
    </footer>
  );
}
