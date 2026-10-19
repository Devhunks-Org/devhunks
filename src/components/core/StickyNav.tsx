"use client";

import { useEffect, useState } from "react";
import { getLenis } from "./SmoothScroll";
import { SITE } from "@/lib/site";

export const OPEN_MENU_EVENT = "devhunks:open-menu";

/**
 * White bar that slides in once the hero is out of view and the user scrolls up,
 * and hides again while scrolling down.
 */
export default function StickyNav() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const pastHero = y > window.innerHeight * 0.9;
      if (!pastHero) setVisible(false);
      else if (y < lastY - 2) setVisible(true);
      else if (y > lastY + 2) setVisible(false);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openMenu = () => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { duration: 1, onComplete: () => window.dispatchEvent(new Event(OPEN_MENU_EVENT)) });
    else {
      window.scrollTo({ top: 0 });
      window.dispatchEvent(new Event(OPEN_MENU_EVENT));
    }
  };

  return (
    <div
      className="fixed inset-x-2.5 sm:inset-x-5 top-2.5 z-[60] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ transform: visible ? "translateY(0)" : "translateY(-140%)" }}
      aria-hidden={!visible}
    >
      <header className="font-tight flex items-center justify-between h-14 px-4 sm:px-5 rounded-[20px] bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgba(22,29,37,0.08)]">
        <a href="#home" className="text-[30px] leading-none tracking-[-0.03em] text-[#161d25]" tabIndex={visible ? 0 : -1}>
          {SITE.name}.
        </a>
        <div className="flex items-center gap-2.5">
          <a
            href={`mailto:${SITE.email}`}
            tabIndex={visible ? 0 : -1}
            className="hidden sm:inline-flex items-center h-9 px-5 rounded-full bg-[#f1f1f3] text-[16px] text-[#161d25] hover:bg-[#e8e9eb] transition-colors"
          >
            get in touch.
          </a>
          <button
            onClick={openMenu}
            tabIndex={visible ? 0 : -1}
            className="inline-flex items-center gap-3 h-9 pl-5 pr-4 rounded-full bg-[#ff003d] text-white text-[16px] hover:bg-[#e00036] transition-colors cursor-pointer"
          >
            menu.
            <svg width="18" height="11" viewBox="0 0 20 12" aria-hidden="true">
              <path d="M6 3 H19 M1 9 H14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>
    </div>
  );
}
