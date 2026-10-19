"use client";

import { useRef } from "react";
import { gsap } from "gsap";

interface GlitchTextProps {
  text: string;
  className?: string;
  "aria-hidden"?: boolean;
}

/**
 * Splits text into chars; chars near the cursor get sliced (clip-path wipe)
 * and nudged sideways, then snap back — the hero hover effect from the reference.
 */
export default function GlitchText({ text, className, "aria-hidden": ariaHidden }: GlitchTextProps) {
  const charsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const busy = useRef<boolean[]>([]);

  const glitch = (i: number) => {
    const el = charsRef.current[i];
    if (!el || busy.current[i]) return;
    busy.current[i] = true;

    const fromLeft = Math.random() > 0.5;
    const cut = 35 + Math.random() * 45;
    const shift = (Math.random() - 0.5) * 0.35;

    gsap
      .timeline({ onComplete: () => void (busy.current[i] = false) })
      .set(el, {
        clipPath: fromLeft ? `inset(-10% 0% -10% ${cut}%)` : `inset(-10% ${cut}% -10% 0%)`,
        xPercent: shift * 100,
      })
      .to(el, {
        clipPath: fromLeft ? `inset(-10% 0% -10% ${cut / 3}%)` : `inset(-10% ${cut / 3}% -10% 0%)`,
        duration: 0.12,
        ease: "steps(2)",
      })
      .to(el, { clipPath: "inset(-10% 0% -10% 0%)", xPercent: 0, duration: 0.35, ease: "power3.out" })
      .to({}, { duration: 0.25 });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    charsRef.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      if (Math.abs(dx) < r.width * 0.9 && Math.abs(dy) < r.height * 0.6) glitch(i);
    });
  };

  return (
    <span className={`whitespace-nowrap ${className ?? ""}`} onPointerMove={onPointerMove} aria-hidden={ariaHidden}>
      {Array.from(text).map((ch, i) => (
        <span
          key={i}
          ref={(el) => {
            charsRef.current[i] = el;
          }}
          className="inline-block will-change-[clip-path]"
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}
