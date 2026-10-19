"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import MenuOverlay from "@/components/core/MenuOverlay";

const CoinPhysicsCanvas = dynamic(() => import("@/components/canvas/CoinPhysicsCanvas"), {
  ssr: false,
});

function LiveWarsawClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const formatted = now.toLocaleTimeString("en-GB", {
        timeZone: "Europe/Warsaw",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      setTime(formatted);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return <span>{time || "07:40"}</span>;
}

export default function HeroSection() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="w-full bg-[#f0f0ef] p-2 sm:p-3 md:p-4 select-none">
      {/* Framed Red Hero Card */}
      <div
        className="relative w-full min-h-[92vh] lg:min-h-[94vh] bg-[#ff003d] text-white rounded-[24px] sm:rounded-[32px] overflow-hidden flex flex-col justify-between p-6 sm:p-10 md:p-14 shadow-2xl"
        style={{ isolation: "isolate" }}
      >
        {/* Top Header */}
        <header className="relative z-50 flex items-center justify-between w-full">
          <a
            href="/"
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white hover:opacity-90 transition-opacity"
            style={{ fontFamily: 'var(--font-display, "Syne", sans-serif)' }}
          >
            awake.
          </a>

          <div className="flex items-center gap-3">
            <a
              href="mailto:contact@awakeagency.dev"
              className="rounded-full px-5 py-2 text-[11px] font-mono tracking-[0.1em] text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all"
            >
              get in touch.
            </a>

            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="rounded-full px-5 py-2 text-[11px] font-mono tracking-[0.1em] text-[#ff003d] bg-white hover:bg-white/90 font-medium flex items-center gap-2 transition-all shadow-sm"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? (
                <>
                  <span>close.</span>
                  <span className="font-bold text-sm leading-none">✕</span>
                </>
              ) : (
                <>
                  <span>menu.</span>
                  <span className="flex flex-col gap-[3px] w-3">
                    <span className="w-full h-[1.5px] bg-[#ff003d] block" />
                    <span className="w-full h-[1.5px] bg-[#ff003d] block" />
                  </span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* 2D Physics Coins Canvas */}
        {!menuOpen && <CoinPhysicsCanvas floorOffset={56} />}

        {/* Hero Headline & Subcopy (Split 2-Column Layout) */}
        {!menuOpen && (
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto pt-6 pb-4 pointer-events-none">
            {/* Left Column: WE / WEBSITES / REMEMBER. */}
            <div className="lg:col-span-7 flex flex-col">
              <h1
                className="text-[clamp(3.4rem,8.5vw,8.5rem)] font-extrabold leading-[0.92] tracking-[-0.04em] text-white uppercase"
                style={{ fontFamily: 'var(--font-display, "Syne", sans-serif)' }}
              >
                <span className="block">WE</span>
                <span className="block">WEBSITES</span>
                <span className="block">REMEMBER.</span>
              </h1>
            </div>

            {/* Right Column: BUILD / PEOPLE + Subcopy */}
            <div className="lg:col-span-5 flex flex-col justify-start lg:pl-6">
              <h2
                className="text-[clamp(3.4rem,8.5vw,8.5rem)] font-extrabold leading-[0.92] tracking-[-0.04em] text-white uppercase"
                style={{ fontFamily: 'var(--font-display, "Syne", sans-serif)' }}
              >
                <span className="block">BUILD</span>
                <span className="block">PEOPLE</span>
              </h2>

              <p
                className="text-white/85 text-xs sm:text-sm md:text-[13px] leading-relaxed max-w-sm mt-6 sm:mt-8"
                style={{ fontFamily: 'var(--font-display, "Syne", sans-serif)' }}
              >
                Awake is a creative digital studio in Warsaw. We design and build premium websites and web products for founders and product teams who need to stand out.
              </p>
            </div>
          </div>
        )}

        {/* Bottom Metadata Row */}
        {!menuOpen && (
          <div className="relative z-10 w-full pt-4 border-t border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[10px] sm:text-[11px] font-mono tracking-[0.14em] text-white/90 uppercase pointer-events-none">
            <div>
              BASED IN: WARSAW <LiveWarsawClock /> · 8°C
            </div>
            <a
              href="mailto:contact@awakeagency.dev"
              className="hover:text-white transition-colors pointer-events-auto"
            >
              SAY HELLO: CONTACT@AWAKEAGENCY.DEV
            </a>
          </div>
        )}

        {/* Full-Screen Menu Overlay (Takes over inside red card) */}
        <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>
    </section>
  );
}
