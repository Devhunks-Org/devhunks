"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { gsap } from "gsap";
import MenuOverlay, { MenuLetterStroke } from "@/components/core/MenuOverlay";
import GlitchText from "@/components/ui/GlitchText";

const CoinPhysicsCanvas = dynamic(() => import("@/components/canvas/CoinPhysicsCanvas"), {
  ssr: false,
});

const EMAIL = "contact@awakeagency.dev";

function LiveWarsawClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const formatted = new Date().toLocaleTimeString("en-GB", {
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

  return <span suppressHydrationWarning>{time || "07:40"}</span>;
}

export default function HeroSection() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropKey, setDropKey] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const baselineRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const [floorOffset, setFloorOffset] = useState(116);

  // Distance from the hairline to the card bottom = physics floor for the coins
  useEffect(() => {
    const updateFloorOffset = () => {
      if (!cardRef.current || !baselineRef.current) return;
      const cardRect = cardRef.current.getBoundingClientRect();
      const lineRect = baselineRef.current.getBoundingClientRect();
      const offset = cardRect.bottom - lineRect.top;
      if (offset > 0) setFloorOffset(Math.round(offset));
    };
    updateFloorOffset();
    window.addEventListener("resize", updateFloorOffset);
    return () => window.removeEventListener("resize", updateFloorOffset);
  }, []);

  // Coins drop on the first interaction with the page
  useEffect(() => {
    const start = () => {
      setDropKey((k) => (k === 0 ? 1 : k));
      cleanup();
    };
    const cleanup = () => {
      window.removeEventListener("pointermove", start);
      window.removeEventListener("touchstart", start);
      window.removeEventListener("wheel", start);
    };
    window.addEventListener("pointermove", start);
    window.addEventListener("touchstart", start, { passive: true });
    window.addEventListener("wheel", start, { passive: true });
    return cleanup;
  }, []);

  // Hero content fades out while the menu takes over the card
  useEffect(() => {
    if (!heroContentRef.current) return;
    gsap.to(heroContentRef.current, {
      autoAlpha: menuOpen ? 0 : 1,
      duration: menuOpen ? 0.2 : 0.35,
      ease: "power2.out",
    });
  }, [menuOpen]);

  const toggleMenu = () => {
    // Fresh set of coins falls in every time the menu closes
    if (menuOpen) setDropKey((k) => k + 1);
    setMenuOpen(!menuOpen);
  };

  return (
    <section className="w-full bg-white p-3 sm:p-5 select-none">
      <div
        ref={cardRef}
        className="relative w-full h-[calc(100svh-24px)] sm:h-[calc(100svh-40px)] min-h-[600px] bg-[#eb003c] text-white rounded-[22px] sm:rounded-[28px] overflow-hidden flex flex-col px-5 pt-6 pb-6 sm:px-11 sm:pt-11 sm:pb-12"
        style={{ isolation: "isolate" }}
      >
        {/* Menu background letter (behind everything) */}
        <MenuLetterStroke isOpen={menuOpen} />

        {/* Header */}
        <header className="relative z-50 flex items-center justify-between w-full">
          <Link
            href="/"
            className="font-tight text-[30px] sm:text-[46px] leading-none font-normal tracking-[-0.02em] text-white"
          >
            awake.
          </Link>

          <div className="flex items-center gap-2 sm:gap-3.5">
            <a
              href={`mailto:${EMAIL}`}
              className="font-tight hidden sm:inline-flex items-center h-11 rounded-full px-7 text-[17px] font-medium tracking-[-0.01em] text-white bg-white/20 hover:bg-white/30 transition-colors"
            >
              get in touch.
            </a>

            <button
              onClick={toggleMenu}
              className={`font-tight inline-flex items-center gap-4 h-10 sm:h-11 rounded-full pl-6 sm:pl-7 pr-5 sm:pr-6 text-[15px] sm:text-[17px] font-medium tracking-[-0.01em] text-[#eb003c] transition-colors cursor-pointer ${
                menuOpen ? "bg-white/90 hover:bg-white" : "bg-white"
              }`}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <span>{menuOpen ? "close." : "menu."}</span>
              {menuOpen ? (
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M2 2 L14 14 M14 2 L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="20" height="12" viewBox="0 0 20 12" aria-hidden="true">
                  <path d="M6 3 H19 M1 9 H14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </header>

        {/* Coins */}
        <div
          className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-300"
          style={{ opacity: menuOpen ? 0 : 1 }}
        >
          <CoinPhysicsCanvas floorOffset={floorOffset} dropKey={dropKey} paused={menuOpen} />
        </div>

        {/* Headline */}
        <div ref={heroContentRef} className="relative z-10 flex-1 flex flex-col justify-center lg:pt-14">
          <div className="font-wide grid grid-cols-1 lg:grid-cols-2 gap-x-8 text-[clamp(2.6rem,6.95vw,8.25rem)] font-[420] leading-[1.1] tracking-[-0.01em] uppercase">
            <h1 className="sr-only">We build websites people remember.</h1>
            <div className="flex flex-col" aria-hidden="true">
              <GlitchText text="WE" className="block" />
              <GlitchText text="WEBSITES" className="block" />
              <GlitchText text="REMEMBER." className="block" />
            </div>

            <div className="flex flex-col lg:items-end">
              <GlitchText text="BUILD" className="block" aria-hidden />
              <GlitchText text="PEOPLE" className="block" aria-hidden />
              <p className="font-tight normal-case tracking-normal font-normal text-white/90 text-[13px] sm:text-[16px] leading-[1.68] max-w-[330px] mt-6 lg:mt-[0.55em] lg:self-end">
                Awake is a creative digital studio in Warsaw. We design and build premium websites and web products
                for founders and product teams who need to stand out.
              </p>
            </div>
          </div>
        </div>

        {/* Hairline (coin floor) */}
        <div
          ref={baselineRef}
          className="relative z-10 w-full h-px bg-white/30 transition-opacity duration-300"
          style={{ opacity: menuOpen ? 0 : 1 }}
        />

        {/* Bottom row */}
        <div className="font-tight relative z-30 mt-8 sm:mt-[52px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] sm:text-[15px] uppercase tracking-[0.01em]">
          {menuOpen ? (
            <>
              <a href={`mailto:${EMAIL}`} className="hover:opacity-80 transition-opacity">
                <span className="text-white/75">SAY HELLO:&nbsp; </span>
                <span className="font-medium">{EMAIL.toUpperCase()}</span>
              </a>
              <div className="flex gap-10 font-medium">
                <a href="#" className="hover:underline underline-offset-4">UPWORK</a>
                <a href="#" className="hover:underline underline-offset-4">LINKEDIN</a>
              </div>
            </>
          ) : (
            <>
              <div>
                <span className="text-white/75">BASED IN: </span>
                <span className="font-medium">
                  WARSAW <LiveWarsawClock /> · 8°C
                </span>
              </div>
              <a href={`mailto:${EMAIL}`} className="hover:opacity-80 transition-opacity">
                <span className="text-white/75">SAY HELLO: </span>
                <span className="font-medium">{EMAIL.toUpperCase()}</span>
              </a>
            </>
          )}
        </div>

        <MenuOverlay isOpen={menuOpen} onClose={toggleMenu} />
      </div>
    </section>
  );
}
