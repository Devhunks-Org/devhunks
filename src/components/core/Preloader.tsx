"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!overlayRef.current || !counterRef.current || !lineRef.current) return;

    const obj = { val: 0 };

    const tl = gsap.timeline({
      onComplete: () => {
        // Slide overlay up
        gsap.to(overlayRef.current, {
          yPercent: -100,
          duration: 0.9,
          ease: "expo.inOut",
          onComplete: () => {
            setVisible(false);
            onComplete();
          },
        });
      },
    });

    tl.to(obj, {
      val: 100,
      duration: 1.8,
      ease: "power3.inOut",
      onUpdate: () => {
        const pct = Math.round(obj.val);
        if (counterRef.current) {
          counterRef.current.textContent = `${String(pct).padStart(3, "0")}%`;
        }
        if (lineRef.current) {
          lineRef.current.style.width = `${pct}%`;
        }
      },
    });

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ backgroundColor: "var(--c-bg)" }}
    >
      {/* Counter */}
      <div className="relative flex flex-col items-center gap-8 w-full px-12">
        <span
          ref={counterRef}
          className="tabular-nums text-[clamp(3rem,10vw,8rem)] font-light tracking-[-0.04em] leading-none"
          style={{
            fontFamily: "var(--font-display, sans-serif)",
            color: "var(--c-text)",
          }}
        >
          000%
        </span>

        {/* Crimson progress line */}
        <div
          className="relative w-full h-px overflow-hidden"
          style={{ backgroundColor: "var(--c-border)" }}
        >
          <div
            ref={lineRef}
            className="absolute left-0 top-0 h-full w-0 transition-none"
            style={{ backgroundColor: "var(--c-accent)" }}
          />
        </div>

        {/* Studio label */}
        <p
          className="text-xs uppercase tracking-[0.18em]"
          style={{
            fontFamily: "var(--font-mono, monospace)",
            color: "var(--c-muted)",
          }}
        >
          Loading Studio
        </p>
      </div>
    </div>
  );
}
