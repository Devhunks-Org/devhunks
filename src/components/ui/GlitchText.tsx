"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { onPreloaderDone } from "@/components/core/Preloader";

interface GlitchTextProps {
  text: string;
  className?: string;
  "aria-hidden"?: boolean;
  /** Rise the letters into place once the preloader is done */
  intro?: boolean;
  /** Extra delay (s) for the intro, to stagger lines */
  introDelay?: number;
}

/**
 * Each glyph sits in its own clipped box. Hover: the glyph whips out to the left and
 * slides back in from the right — always whole, never split. Intro: glyphs rise into
 * their boxes one after another. The box itself never moves, so physics bodies stay put.
 */
export default function GlitchText({
  text,
  className,
  "aria-hidden": ariaHidden,
  intro = false,
  introDelay = 0,
}: GlitchTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const busy = useRef<boolean[]>([]);

  const inners = () => rootRef.current?.querySelectorAll<HTMLElement>("[data-inner]") ?? [];

  const swipe = (i: number) => {
    const el = inners()[i];
    if (!el || busy.current[i]) return;
    busy.current[i] = true;
    gsap
      .timeline({ onComplete: () => void (busy.current[i] = false) })
      .to(el, { xPercent: -105, duration: 0.16, ease: "power2.in" })
      .set(el, { xPercent: 105 })
      .to(el, { xPercent: 0, duration: 0.42, ease: "expo.out" });
  };

  useGSAP(
    () => {
      if (!intro) return;
      const els = inners();
      gsap.set(els, { yPercent: 105 });

      return onPreloaderDone(() => {
        els.forEach((el, i) => (busy.current[i] = true));
        gsap.to(els, {
          yPercent: 0,
          duration: 1.25,
          ease: "power4.out",
          delay: introDelay,
          stagger: 0.045,
          // Hover stays off until the whole word has landed
          onComplete: () => els.forEach((_, i) => (busy.current[i] = false)),
        });
      });
    },
    { scope: rootRef, dependencies: [intro, introDelay] }
  );

  const onPointerMove = (e: React.PointerEvent) => {
    rootRef.current?.querySelectorAll<HTMLElement>("[data-glyph]").forEach((el, i) => {
      const r = el.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) swipe(i);
    });
  };

  return (
    <span ref={rootRef} className={`whitespace-nowrap ${className ?? ""}`} onPointerMove={onPointerMove} aria-hidden={ariaHidden}>
      {Array.from(text).map((ch, i) => {
        const glyph = ch === " " ? " " : ch;
        return (
          <span
            key={i}
            data-glyph
            data-char={glyph}
            className="relative inline-block align-top"
            style={{ clipPath: "inset(-4% 0% -4% 0%)" }}
          >
            <span data-inner className="inline-block will-change-transform">
              {glyph}
            </span>
          </span>
        );
      })}
    </span>
  );
}
