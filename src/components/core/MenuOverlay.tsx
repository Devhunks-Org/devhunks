"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { getLenis } from "./SmoothScroll";

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { index: "00", label: "Home", href: "/" },
  { index: "01", label: "Services", href: "#services" },
  { index: "02", label: "Projects", href: "#projects" },
  { index: "03", label: "Contacts", href: "mailto:contact@awakeagency.dev" },
];

export default function MenuOverlay({ isOpen, onClose }: MenuOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const lenis = getLenis();

    if (isOpen) {
      lenis?.stop();
      tlRef.current = gsap.timeline();
      tlRef.current.to(overlayRef.current, {
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
        duration: 0.6,
        ease: "expo.inOut",
      });
      tlRef.current.fromTo(
        itemRefs.current.filter(Boolean),
        { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: "power3.out" },
        "-=0.2"
      );
    } else {
      lenis?.start();
      tlRef.current = gsap.timeline();
      tlRef.current.to(itemRefs.current.filter(Boolean), {
        yPercent: -110,
        opacity: 0,
        duration: 0.3,
        stagger: 0.04,
        ease: "power2.in",
      });
      tlRef.current.to(
        overlayRef.current,
        {
          clipPath: "polygon(0 0, 100% 0, 100% 0%, 0 0%)",
          duration: 0.55,
          ease: "expo.inOut",
        },
        "-=0.15"
      );
    }

    return () => {
      tlRef.current?.kill();
    };
  }, [isOpen]);

  const handleNavClick = (href: string) => {
    onClose();
    if (href.startsWith("#")) {
      setTimeout(() => {
        const el = document.querySelector(href);
        if (el) getLenis()?.scrollTo(el as HTMLElement, { offset: -80, duration: 1.2 });
      }, 700);
    } else if (href.startsWith("mailto:")) {
      window.location.href = href;
    } else {
      window.location.href = href;
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-40 flex flex-col"
      style={{
        backgroundColor: "var(--c-accent)",
        clipPath: "polygon(0 0, 100% 0, 100% 0%, 0 0%)",
        pointerEvents: isOpen ? "all" : "none",
      }}
    >
      {/* Top bar spacing */}
      <div className="h-14" />

      {/* Main nav */}
      <nav className="flex-1 flex flex-col justify-center px-10 md:px-20 gap-2">
        {NAV_ITEMS.map(({ index, label, href }, i) => (
          <div key={label} className="overflow-hidden py-1">
            <span
              ref={(el) => { itemRefs.current[i] = el; }}
              className="flex items-baseline gap-6 cursor-pointer"
              onClick={() => handleNavClick(href)}
              style={{ display: "flex" }}
            >
              <span
                className="text-[11px] uppercase tracking-[0.18em] mt-2"
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  color: "#09090B",
                  opacity: 0.6,
                }}
              >
                {index}
              </span>
              <span
                className="text-[clamp(3rem,9vw,7rem)] font-light leading-[0.95] tracking-[-0.03em] transition-colors"
                style={{
                  fontFamily: "var(--font-display, sans-serif)",
                  color: "#09090B",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#F4F4F5")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#09090B")}
              >
                {label}
              </span>
            </span>
          </div>
        ))}
      </nav>

      {/* Footer inside menu */}
      <div
        className="px-10 md:px-20 pb-10 flex flex-wrap items-center justify-between gap-4"
        style={{ borderTop: "1px solid rgba(9,9,11,0.2)" }}
      >
        <div className="flex gap-6">
          {["UPWORK", "LINKEDIN"].map((link) => (
            <a
              key={link}
              href="#"
              className="text-[11px] uppercase tracking-[0.18em] transition-opacity hover:opacity-70"
              style={{ fontFamily: "var(--font-mono, monospace)", color: "#09090B" }}
            >
              {link}
            </a>
          ))}
        </div>
        <a
          href="mailto:contact@awakeagency.dev"
          className="text-[11px] uppercase tracking-[0.12em] transition-opacity hover:opacity-70"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "#09090B" }}
        >
          contact@awakeagency.dev
        </a>
      </div>
    </div>
  );
}
