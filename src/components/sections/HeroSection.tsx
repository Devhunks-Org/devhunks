"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { gsap } from "gsap";
import MenuOverlay, { MenuLetterStroke } from "@/components/core/MenuOverlay";
import { OPEN_MENU_EVENT } from "@/components/core/StickyNav";
import GlitchText from "@/components/ui/GlitchText";

const CoinPhysicsCanvas = dynamic(
  () => import("@/components/canvas/CoinPhysicsCanvas"),
  {
    ssr: false,
  },
);

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

  // The sticky nav's menu button scrolls back up and opens the menu here
  useEffect(() => {
    const open = () => setMenuOpen(true);
    window.addEventListener(OPEN_MENU_EVENT, open);
    return () => window.removeEventListener(OPEN_MENU_EVENT, open);
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
    <section id="home" className="w-full bg-white p-2.5 sm:p-5 select-none">
      <div
        ref={cardRef}
        className="relative w-full h-[calc(100svh-20px)] sm:h-[calc(100svh-40px)] min-h-[560px] bg-[#ff003d] text-white rounded-[24px] sm:rounded-[32px] overflow-hidden flex flex-col p-5 sm:p-10"
        style={{ isolation: "isolate" }}
      >
        {/* Menu background letter (behind everything) */}
        <MenuLetterStroke isOpen={menuOpen} />

        {/* Header */}
        <header className="relative z-50 flex items-center justify-between w-full h-10">
          <Link
            href="/"
            className="font-tight text-[34px] sm:text-[40px] leading-none tracking-[-0.03em] text-white"
          >
            awake.
          </Link>

          <div className="flex items-center gap-3">
            <a
              href={`mailto:${EMAIL}`}
              className="font-tight hidden sm:inline-flex items-center h-10 rounded-full px-[22px] text-[18px] text-white bg-white/30 hover:bg-white/40 transition-colors"
            >
              get in touch.
            </a>

            <button
              onClick={toggleMenu}
              className="font-tight inline-flex items-center gap-4 h-10 rounded-full pl-[25px] pr-[22px] text-[18px] text-[#d90033] bg-white hover:bg-white/90 transition-colors cursor-pointer"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <span>{menuOpen ? "close." : "menu."}</span>
              {menuOpen ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <path
                    d="M2 2 L14 14 M14 2 L2 14"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="12"
                  viewBox="0 0 20 12"
                  aria-hidden="true"
                >
                  <path
                    d="M6 3 H19 M1 9 H14"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
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
          <CoinPhysicsCanvas
            floorOffset={floorOffset}
            dropKey={dropKey}
            paused={menuOpen}
          />
        </div>

        {/* Headline: rows "We · build / websites · people / remember." */}
        <div
          ref={heroContentRef}
          className="relative z-10 flex-1 flex flex-col justify-start sm:justify-center pt-14 sm:pt-0"
        >
          <div className="relative">
            <h1
              aria-label="We build websites people remember."
              className="font-wide uppercase font-medium text-white leading-none text-[6.9vw] sm:text-[7.64vw] min-[1800px]:text-[8.6rem]"
            >
              <span className="flex flex-wrap gap-x-[0.28em] sm:justify-between">
                <GlitchText text="We" />
                <GlitchText text="build" />
              </span>
              <span className="flex flex-wrap gap-x-[0.28em] sm:justify-between">
                <GlitchText text="websites" />
                <GlitchText text="people" />
              </span>
              <span className="block">
                <GlitchText text="remember." />
              </span>
            </h1>

            <p className="font-tight mt-6 sm:mt-0 sm:absolute sm:right-0 sm:top-[calc(66.67%+34px)] max-w-[300px] text-[15px] leading-6 text-white">
              Awake is a creative digital studio in Warsaw. We design and build
              premium websites and web products for founders and product teams
              who need to stand out.
            </p>
          </div>
        </div>

        {/* Hairline (coin floor) */}
        <div
          ref={baselineRef}
          className="relative z-10 w-full h-px bg-white/40 transition-opacity duration-300"
          style={{ opacity: menuOpen ? 0 : 1 }}
        />

        {/* Bottom row */}
        <div className="font-tight relative z-30 mt-6 sm:mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-2 text-[13px] sm:text-[15px] leading-6 uppercase tracking-[0.02em]">
          {menuOpen ? (
            <>
              <a
                href={`mailto:${EMAIL}`}
                className="hover:opacity-80 transition-opacity"
              >
                <span className="text-white/75">Say hello: </span>
                <span>{EMAIL}</span>
              </a>
              <div className="flex gap-10">
                <a href="#" className="hover:underline underline-offset-4">
                  Upwork
                </a>
                <a href="#" className="hover:underline underline-offset-4">
                  LinkedIn
                </a>
              </div>
            </>
          ) : (
            <>
              <div>
                <span className="text-white/75">Based in: </span>
                <span>
                  Warsaw <LiveWarsawClock /> · 8°C
                </span>
              </div>
              <a
                href={`mailto:${EMAIL}`}
                className="hover:opacity-80 transition-opacity"
              >
                <span className="text-white/75">Say hello: </span>
                <span>{EMAIL}</span>
              </a>
            </>
          )}
        </div>

        <MenuOverlay isOpen={menuOpen} onClose={toggleMenu} />
      </div>
    </section>
  );
}
