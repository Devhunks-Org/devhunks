"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const STATEMENT_A = [
  "We design and build",
  "websites, brand systems,",
  "and digital products that",
  "work as hard as they look.",
];

const STATEMENT_B = [
  "Whether you're launching",
  "a product, rebuilding a",
  "brand, or replacing a tired",
  "site, one team takes it",
  "from sketch to live build.",
];

const NODES = [
  [330, 140],
  [500, 140],
  [180, 230],
  [80, 330],
  [330, 330],
  [500, 330],
  [80, 600],
  [330, 600],
];

export default function ManifestoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(sectionRef);
      const linesA = q("[data-line-a]");
      const linesB = q("[data-line-b]");

      gsap.set(linesB, { scaleX: 0.35, scaleY: 0.55, autoAlpha: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=130%",
          scrub: 0.8,
          pin: cardRef.current,
          pinSpacing: true,
        },
      });

      tl.to({}, { duration: 0.25 })
        .to(linesA, { scaleX: 0.35, scaleY: 0.55, autoAlpha: 0, duration: 0.5, stagger: 0.08 })
        .to(q("[data-blueprint]"), { autoAlpha: 0.35, duration: 0.5 }, "<")
        .to(q("[data-disc]"), { scale: 0.82, xPercent: 18, duration: 0.8 }, "<")
        .to(linesB, { scaleX: 1, scaleY: 1, autoAlpha: 1, duration: 0.5, stagger: 0.08 }, "-=0.35")
        .to({}, { duration: 0.25 });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} id="about" className="relative w-full bg-white px-2.5 sm:px-5 pt-0 pb-5">
      <div
        ref={cardRef}
        className="relative w-full h-[calc(100svh-20px)] sm:h-[calc(100svh-40px)] min-h-[520px] bg-[#f1f1f3] text-[#161d25] rounded-[24px] sm:rounded-[32px] overflow-hidden flex items-center justify-center px-5 py-20 sm:px-10"
      >
        {/* Blueprint construction drawing */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1200 700"
          preserveAspectRatio="xMinYMid slice"
          fill="none"
          aria-hidden="true"
        >
          <g data-blueprint stroke="#d9d9de" strokeWidth="1">
            <line x1="0" y1="140" x2="1200" y2="140" />
            <line x1="0" y1="330" x2="1200" y2="330" />
            <line x1="0" y1="600" x2="1200" y2="600" />
            <line x1="80" y1="0" x2="80" y2="700" />
            <line x1="330" y1="0" x2="330" y2="700" />
            <line x1="500" y1="0" x2="500" y2="700" />
            <line x1="1110" y1="0" x2="1110" y2="700" />
            <rect x="80" y="330" width="250" height="270" fill="#e6e6ea" stroke="#c9c9cf" />
            <path d="M 180 230 L 500 230" strokeDasharray="4 6" />
            {NODES.map(([x, y]) => (
              <rect key={`${x}-${y}`} x={x - 3} y={y - 3} width="6" height="6" fill="#f1f1f3" stroke="#a9adb4" />
            ))}
          </g>
          <circle data-disc cx="330" cy="330" r="190" fill="#e4e4e8" stroke="#d2d2d8" />
        </svg>

        {/* Statements */}
        <div className="font-wide relative z-10 w-full max-w-[1260px] text-center font-medium leading-[1.02] tracking-[-0.02em] text-[clamp(1.6rem,5.55vw,5.6rem)]">
          <p className="sr-only">{STATEMENT_A.join(" ")} {STATEMENT_B.join(" ")}</p>
          <div aria-hidden="true">
            {STATEMENT_A.map((line) => (
              <span key={line} data-line-a className="block origin-center will-change-transform">
                {line}
              </span>
            ))}
          </div>
          <div aria-hidden="true" className="absolute inset-0 flex flex-col justify-center">
            {STATEMENT_B.map((line) => (
              <span key={line} data-line-b className="block origin-center will-change-transform">
                {line}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
