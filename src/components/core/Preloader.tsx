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
    if (!overlayRef.current) return;

    let finished = false;
    const complete = () => {
      if (finished) return;
      finished = true;
      if (overlayRef.current) {
        gsap.to(overlayRef.current, {
          yPercent: -100,
          duration: 0.6,
          ease: "power3.inOut",
          onComplete: () => {
            setVisible(false);
            onComplete();
          },
        });
      } else {
        setVisible(false);
        onComplete();
      }
    };

    const obj = { val: 0 };
    const tl = gsap.timeline({
      onComplete: complete,
    });

    tl.to(obj, {
      val: 100,
      duration: 0.9,
      ease: "power2.out",
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

    // Auto-dismiss safety timeout
    const timer = setTimeout(complete, 1600);

    return () => {
      clearTimeout(timer);
      tl.kill();
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center cursor-pointer select-none"
      style={{ backgroundColor: "var(--c-bg)" }}
      title="Click to enter"
      onClick={() => {
        if (overlayRef.current) {
          gsap.to(overlayRef.current, {
            yPercent: -100,
            duration: 0.4,
            ease: "power2.inOut",
            onComplete: () => {
              setVisible(false);
              onComplete();
            },
          });
        }
      }}
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
