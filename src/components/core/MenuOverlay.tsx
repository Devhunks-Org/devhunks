"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { getLenis } from "./SmoothScroll";

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  { index: "00", label: "HOME", href: "/" },
  { index: "01", label: "SERVICES", href: "#services" },
  { index: "02", label: "PROJECTS", href: "#projects" },
  { index: "03", label: "CONTACTS", href: "mailto:contact@awakeagency.dev" },
];

export default function MenuOverlay({ isOpen, onClose }: MenuOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const lenis = getLenis();
    if (isOpen) {
      lenis?.stop();
      if (overlayRef.current) {
        gsap.fromTo(
          overlayRef.current,
          { opacity: 0, scale: 0.98 },
          { opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" }
        );
      }
      gsap.fromTo(
        itemsRef.current.filter(Boolean),
        { y: 35, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, stagger: 0.06, ease: "power2.out", delay: 0.1 }
      );
    } else {
      lenis?.start();
    }
  }, [isOpen]);

  const handleNavClick = (href: string) => {
    onClose();
    if (href.startsWith("#")) {
      setTimeout(() => {
        const el = document.querySelector(href);
        if (el) getLenis()?.scrollTo(el as HTMLElement, { offset: -40, duration: 1.2 });
      }, 300);
    } else if (href.startsWith("mailto:")) {
      window.location.href = href;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-40 bg-[#ff003d] flex flex-col justify-between p-6 sm:p-10 md:p-14 overflow-hidden rounded-[24px] sm:rounded-[32px]"
      style={{ isolation: "isolate" }}
    >
      {/* Background large artistic outline "a" ribbon */}
      <svg
        className="absolute top-1/2 left-1/3 -translate-y-1/2 -translate-x-1/4 w-[110vw] max-w-[900px] h-auto pointer-events-none select-none opacity-15"
        viewBox="0 0 500 500"
        fill="none"
        stroke="#ffffff"
        strokeWidth="12"
      >
        <path d="M250 80 C 360 80, 420 160, 420 280 C 420 400, 340 440, 250 440 C 140 440, 90 370, 90 280 C 90 180, 160 120, 250 120 C 340 120, 390 190, 390 280" />
        <circle cx="250" cy="280" r="85" />
      </svg>

      {/* Top Header Placeholder spacing matching Hero */}
      <div className="h-10" />

      {/* Center Nav List */}
      <nav className="flex flex-col gap-3 sm:gap-5 self-end w-full max-w-xl pr-4 sm:pr-12 z-10">
        {MENU_ITEMS.map((item, i) => {
          const isHovered = hoveredIndex === i;
          return (
            <div
              key={item.label}
              ref={(el) => {
                itemsRef.current[i] = el;
              }}
              className="flex items-baseline gap-6 cursor-pointer group select-none transition-transform duration-200"
              style={{ transform: isHovered ? "translateX(10px)" : "translateX(0)" }}
              onClick={() => handleNavClick(item.href)}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span
                className="font-mono text-xs sm:text-sm text-white/50 tracking-[0.16em] w-8"
              >
                {item.index}
              </span>
              <div className="flex items-center gap-3">
                {isHovered && <span className="text-white text-3xl font-light leading-none">—</span>}
                <span
                  className="text-[clamp(2.4rem,5.5vw,5rem)] font-extrabold tracking-[-0.03em] leading-none transition-colors"
                  style={{
                    fontFamily: 'var(--font-display, "Syne", sans-serif)',
                    color: isHovered ? "#FFFFFF" : "rgba(255, 255, 255, 0.92)",
                  }}
                >
                  {item.label}
                </span>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Bottom Footer inside Menu */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-white/20 z-10">
        <a
          href="mailto:contact@awakeagency.dev"
          className="text-[11px] font-mono tracking-[0.14em] text-white/80 hover:text-white transition-colors uppercase"
        >
          SAY HELLO: contact@awakeagency.dev
        </a>
        <div className="flex gap-8">
          {["UPWORK", "LINKEDIN"].map((link) => (
            <a
              key={link}
              href="#"
              className="text-[11px] font-mono tracking-[0.18em] text-white/80 hover:text-white transition-colors"
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
