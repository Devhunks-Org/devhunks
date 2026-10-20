"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { onPreloaderDone } from "@/components/core/Preloader";
import MenuOverlay, { MenuLetterStroke } from "@/components/core/MenuOverlay";
import { OPEN_MENU_EVENT } from "@/components/core/StickyNav";
import GlitchText from "@/components/ui/GlitchText";
import { SITE } from "@/lib/site";

const CoinPhysicsCanvas = dynamic(
  () => import("@/components/canvas/CoinPhysicsCanvas"),
  {
    ssr: false,
  },
);

const EMAIL = SITE.email;

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

  // Intro: hidden until the preloader hands over, then header / headline / meta animate in
  useGSAP(
    () => {
      const card = cardRef.current;
      if (!card) return;
      const q = gsap.utils.selector(card);
      const header = q("[data-intro-header] > *");
      const fades = q("[data-intro-fade]");
      const line = baselineRef.current;

      gsap.set(header, { autoAlpha: 0, y: -14 });
      gsap.set(fades, { autoAlpha: 0, y: 14 });
      gsap.set(line, { scaleX: 0, transformOrigin: "left center" });

      return onPreloaderDone(() => {
        gsap
          .timeline({ defaults: { ease: "expo.out" } })
          .to(header, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.1)
          .to(line, { scaleX: 1, duration: 1.4, ease: "power3.inOut" }, 0.2)
          .to(fades, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.45)
          // Coins start pouring in once the letters have appeared
          .call(() => setDropKey((k) => (k === 0 ? 1 : k)), undefined, 0.9);
      });
    },
    { scope: cardRef }
  );

  // The sticky nav's menu button scrolls back up and opens the menu here
  useEffect(() => {
    const open = () => setMenuOpen(true);
    window.addEventListener(OPEN_MENU_EVENT, open);
    return () => window.removeEventListener(OPEN_MENU_EVENT, open);
  }, []);

  // Menu choreography: headline letters slip up out of their boxes, then rise back in once the
  // menu has left. Same clipped boxes as the intro, so the motion reads as one system.
  const firstMenuRun = useRef(true);
  useEffect(() => {
    const content = heroContentRef.current;
    if (!content) return;
    if (firstMenuRun.current) {
      firstMenuRun.current = false;
      return;
    }
    const letters = content.querySelectorAll("h1 [data-inner]");
    const para = content.querySelector("p");

    if (menuOpen) {
      content.style.pointerEvents = "none";
      gsap
        .timeline({ defaults: { overwrite: "auto" } })
        .to(letters, { yPercent: -108, duration: 0.6, ease: "power3.in", stagger: { each: 0.012 } }, 0)
        .to(para, { autoAlpha: 0, y: -12, duration: 0.45, ease: "power2.in" }, 0);
    } else {
      content.style.pointerEvents = "";
      gsap
        .timeline({ defaults: { overwrite: "auto" }, delay: 0.42 })
        .fromTo(letters, { yPercent: 108 }, { yPercent: 0, duration: 1.15, ease: "expo.out", stagger: { each: 0.018 } }, 0)
        .fromTo(para, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out" }, 0.25);
    }
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
        data-hero-card
        className="relative w-full h-[calc(100svh-20px)] sm:h-[calc(100svh-2.5rem)] min-h-[560px] bg-[#ff003d] text-white rounded-[24px] sm:rounded-[32px] overflow-hidden flex flex-col p-5 sm:p-10"
        style={{ isolation: "isolate" }}
      >
        {/* Menu background letter (behind everything) */}
        <MenuLetterStroke isOpen={menuOpen} />

        {/* Header */}
        <header data-intro-header className="relative z-50 flex items-center justify-between w-full h-10">
          <Link
            href="/"
            className="font-tight text-[34px] sm:text-[40px] leading-none tracking-[-0.03em] text-white"
          >
            {SITE.name}.
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
              {/* Label rolls between "menu." and "close." */}
              <span className="relative block h-[1.25em] overflow-hidden leading-[1.25em]">
                <span
                  className="block transition-transform duration-700 ease-[var(--e-out)]"
                  style={{ transform: menuOpen ? "translateY(-50%)" : "translateY(0)" }}
                >
                  <span className="block">menu.</span>
                  <span className="block" aria-hidden="true">
                    close.
                  </span>
                </span>
              </span>
              {/* Two offset bars morph into an ✕ */}
              <span className="relative block h-3 w-[18px]" aria-hidden="true">
                <span
                  className="absolute left-0 right-0 top-1/2 -mt-[0.9px] h-[1.8px] rounded-full bg-current transition-transform duration-700 ease-[var(--e-out)]"
                  style={{ transform: menuOpen ? "rotate(45deg) scaleX(0.9)" : "translate(2.5px,-3px) scaleX(0.72)" }}
                />
                <span
                  className="absolute left-0 right-0 top-1/2 -mt-[0.9px] h-[1.8px] rounded-full bg-current transition-transform duration-700 ease-[var(--e-out)]"
                  style={{ transform: menuOpen ? "rotate(-45deg) scaleX(0.9)" : "translate(-2.5px,3px) scaleX(0.72)" }}
                />
              </span>
            </button>
          </div>
        </header>

        {/* Coins */}
        <div
          className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-500 ease-[cubic-bezier(0.65,0,0.35,1)]"
          style={{ opacity: menuOpen ? 0 : 1, transitionDelay: menuOpen ? "0ms" : "450ms" }}
        >
          <CoinPhysicsCanvas
            floorOffset={floorOffset}
            dropKey={dropKey}
            paused={menuOpen}
            solidSelector="[data-glyph]"
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
                <GlitchText text="We" intro introDelay={0} />
                <GlitchText text="build" intro introDelay={0.12} />
              </span>
              <span className="flex flex-wrap gap-x-[0.28em] sm:justify-between">
                <GlitchText text="websites" intro introDelay={0.22} />
                <GlitchText text="people" intro introDelay={0.36} />
              </span>
              <span className="block">
                <GlitchText text="remember." intro introDelay={0.46} />
              </span>
            </h1>

            <p data-intro-fade className="font-tight mt-6 sm:mt-0 sm:absolute sm:right-0 sm:top-[calc(66.67%+34px)] max-w-[300px] text-[15px] leading-6 text-white">
              {SITE.displayName} is a creative digital studio working remotely,
              worldwide. We design and build premium websites and web products
              for founders and product teams who need to stand out.
            </p>
          </div>
        </div>

        {/* Hairline (coin floor) */}
        <div
          ref={baselineRef}
          className="relative z-10 w-full h-px bg-white/40 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] origin-left"
          style={{
            opacity: menuOpen ? 0 : 1,
            transform: menuOpen ? "scaleX(0.6)" : "scaleX(1)",
            transitionDelay: menuOpen ? "0ms" : "350ms",
          }}
        />

        {/* Bottom row — hero meta and menu meta crossfade in the same spot */}
        <div
          data-intro-fade
          className="font-tight relative z-30 mt-6 sm:mt-10 grid text-[13px] sm:text-[15px] leading-6 uppercase tracking-[0.02em]"
        >
          {[false, true].map((forMenu) => {
            const active = forMenu === menuOpen;
            return (
              <div
                key={String(forMenu)}
                aria-hidden={!active}
                className={`[grid-area:1/1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-2 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
                }`}
                style={{ transitionDelay: active ? "250ms" : "0ms" }}
              >
                {forMenu ? (
                  <>
                    <a href={`mailto:${EMAIL}`} tabIndex={active ? 0 : -1} className="hover:opacity-80 transition-opacity">
                      <span className="text-white/75">Say hello: </span>
                      <span>{EMAIL}</span>
                    </a>
                    <div className="flex gap-10">
                      <a href={SITE.links.upwork} tabIndex={active ? 0 : -1} className="hover:underline underline-offset-4">
                        Upwork
                      </a>
                      <a href={SITE.links.linkedin} tabIndex={active ? 0 : -1} className="hover:underline underline-offset-4">
                        LinkedIn
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-white/75">Based in: </span>
                      <span>{SITE.location}</span>
                    </div>
                    <a href={`mailto:${EMAIL}`} tabIndex={active ? 0 : -1} className="hover:opacity-80 transition-opacity">
                      <span className="text-white/75">Say hello: </span>
                      <span>{EMAIL}</span>
                    </a>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <MenuOverlay isOpen={menuOpen} onClose={toggleMenu} />
      </div>
    </section>
  );
}
