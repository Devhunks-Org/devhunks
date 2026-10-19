"use client";

import { useEffect, useRef, useState } from "react";
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
  const cardRef = useRef<HTMLDivElement>(null);
  const baselineRef = useRef<HTMLDivElement>(null);
  const [floorOffset, setFloorOffset] = useState(88);

  // Compute exact floor offset from baseline line to card bottom
  useEffect(() => {
    const updateFloorOffset = () => {
      if (cardRef.current && baselineRef.current) {
        const cardRect = cardRef.current.getBoundingClientRect();
        const lineRect = baselineRef.current.getBoundingClientRect();
        // Distance from baseline line to bottom of card
        const offset = cardRect.bottom - lineRect.top;
        if (offset > 0) {
          setFloorOffset(Math.round(offset));
        }
      }
    };

    updateFloorOffset();
    window.addEventListener("resize", updateFloorOffset);
    return () => window.removeEventListener("resize", updateFloorOffset);
  }, []);

  return (
    <section className="w-full bg-[#f0f0ef] p-2 sm:p-3 md:p-4 select-none">
      {/* Framed Red Hero Card */}
      <div
        ref={cardRef}
        className="relative w-full min-h-[92vh] lg:min-h-[94vh] bg-[#ff003d] text-white rounded-[24px] sm:rounded-[32px] overflow-hidden flex flex-col justify-between p-6 sm:p-10 md:p-12 shadow-2xl"
        style={{ isolation: "isolate" }}
      >
        {/* Top Header */}
        <header className="relative z-50 flex items-center justify-between w-full">
          <a
            href="/"
            className="text-2xl sm:text-[32px] font-extrabold tracking-[-0.03em] text-white hover:opacity-90 transition-opacity lowercase"
            style={{ fontFamily: 'var(--font-grotesque, "Plus Jakarta Sans", sans-serif)' }}
          >
            awake.
          </a>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <a
              href="mailto:contact@awakeagency.dev"
              className="rounded-full px-4 sm:px-5 py-2 text-[11px] font-mono tracking-[0.1em] text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all"
            >
              get in touch.
            </a>

            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="rounded-full px-4 sm:px-5 py-2 text-[11px] font-mono tracking-[0.1em] text-[#ff003d] bg-white hover:bg-white/95 font-semibold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
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
        <CoinPhysicsCanvas floorOffset={floorOffset} />

        {/* Hero Headline & Subcopy Grid (WE aligned top, BUILD aligned with WEBSITES) */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 w-full gap-x-8 gap-y-0 my-auto pt-4 pb-8 select-none pointer-events-none">
          {/* Left Column: WE / WEBSITES / REMEMBER. */}
          <div
            className="flex flex-col text-[clamp(2.6rem,6.8vw,6.8rem)] font-extrabold leading-[0.93] tracking-[-0.035em] text-white uppercase"
            style={{ fontFamily: 'var(--font-grotesque, "Plus Jakarta Sans", sans-serif)' }}
          >
            <h1 className="flex flex-col">
              <span className="block">WE</span>
              <span className="block">WEBSITES</span>
              <span className="block">REMEMBER.</span>
            </h1>
          </div>

          {/* Right Column: BUILD / PEOPLE / Subcopy */}
          <div
            className="flex flex-col text-[clamp(2.6rem,6.8vw,6.8rem)] font-extrabold leading-[0.93] tracking-[-0.035em] text-white uppercase"
            style={{ fontFamily: 'var(--font-grotesque, "Plus Jakarta Sans", sans-serif)' }}
          >
            {/* Invisible spacer matching "WE" to align BUILD with WEBSITES */}
            <span className="hidden lg:block select-none pointer-events-none opacity-0" aria-hidden="true">
              WE
            </span>
            <span className="block">BUILD</span>
            <span className="block">PEOPLE</span>

            <p
              className="text-white/90 text-[12px] sm:text-[13px] leading-relaxed max-w-[280px] sm:max-w-[320px] mt-6 sm:mt-8 font-normal normal-case tracking-normal"
              style={{ fontFamily: 'var(--font-grotesque, "Plus Jakarta Sans", sans-serif)' }}
            >
              Awake is a creative digital studio in Warsaw. We design and build premium websites and web products for founders and product teams who need to stand out.
            </p>
          </div>
        </div>

        {/* Bottom Metadata Row with Hairline Baseline */}
        <div
          ref={baselineRef}
          className="relative z-30 w-full pt-4 border-t border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[10px] sm:text-[11px] font-mono tracking-[0.14em] text-white/90 uppercase"
        >
          <div>
            BASED IN: <span className="font-semibold text-white">WARSAW <LiveWarsawClock /></span> · 8°C
          </div>
          <a
            href="mailto:contact@awakeagency.dev"
            className="hover:text-white transition-colors pointer-events-auto"
          >
            SAY HELLO: <span className="font-semibold text-white">CONTACT@AWAKEAGENCY.DEV</span>
          </a>
        </div>

        {/* Full-Screen Menu Overlay (Takes over inside red card) */}
        <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>
    </section>
  );
}
