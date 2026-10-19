"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function ManifestoSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const state1Ref = useRef<HTMLDivElement>(null);
  const state2Ref = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<1 | 2>(1);

  useGSAP(
    () => {
      if (!containerRef.current || !state1Ref.current || !state2Ref.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=120%",
          scrub: 0.6,
          pin: cardRef.current,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (self.progress > 0.48) {
              setActiveTab(2);
            } else {
              setActiveTab(1);
            }
          },
        },
      });

      // State 1 active at start, smoothly fades out & slides slightly up
      tl.to(state1Ref.current, {
        opacity: 0,
        y: -30,
        scale: 0.98,
        ease: "power2.inOut",
        duration: 0.45,
      });

      // State 2 smoothly fades in & slides into place
      tl.fromTo(
        state2Ref.current,
        { opacity: 0, y: 30, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, ease: "power2.inOut", duration: 0.45 },
        "-=0.15"
      );
    },
    { scope: containerRef }
  );

  const manualToggle = (tab: 1 | 2) => {
    setActiveTab(tab);
    if (tab === 1) {
      gsap.to(state1Ref.current, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power2.out" });
      gsap.to(state2Ref.current, { opacity: 0, y: 25, scale: 0.98, duration: 0.4, ease: "power2.out" });
    } else {
      gsap.to(state1Ref.current, { opacity: 0, y: -25, scale: 0.98, duration: 0.4, ease: "power2.out" });
      gsap.to(state2Ref.current, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power2.out" });
    }
  };

  return (
    <section ref={containerRef} id="about" className="relative w-full bg-[#f0f0ef] select-none">
      {/* Outer framing wrapper matching Hero padding */}
      <div className="w-full p-2 sm:p-3 md:p-4">
        {/* Sticky Pinned Rounded Card Container */}
        <div
          ref={cardRef}
          className="relative w-full h-[88vh] min-h-[640px] max-h-[880px] bg-[#f2f2f1] text-[#18181b] rounded-[24px] sm:rounded-[32px] overflow-hidden flex items-center justify-center p-6 sm:p-12 md:p-16 border border-[#e5e5e3] shadow-md"
          style={{ isolation: "isolate" }}
        >
          {/* Subtle Before / After Floating Pills */}
          <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-30 flex items-center gap-1.5 bg-[#e4e4e2]/80 backdrop-blur-sm p-1 rounded-full border border-[#d8d8d5] pointer-events-auto">
            <button
              onClick={() => manualToggle(1)}
              className={`px-3 sm:px-4 py-1 text-[10px] font-mono tracking-[0.12em] rounded-full uppercase transition-all cursor-pointer ${
                activeTab === 1
                  ? "bg-[#18181b] text-white shadow-sm font-medium"
                  : "text-[#71717a] hover:text-[#18181b]"
              }`}
            >
              01 · BEFORE
            </button>
            <button
              onClick={() => manualToggle(2)}
              className={`px-3 sm:px-4 py-1 text-[10px] font-mono tracking-[0.12em] rounded-full uppercase transition-all cursor-pointer ${
                activeTab === 2
                  ? "bg-[#18181b] text-white shadow-sm font-medium"
                  : "text-[#71717a] hover:text-[#18181b]"
              }`}
            >
              02 · AFTER
            </button>
          </div>

          {/* STATE 1: Architectural Blueprint Wireframe (Matches User Reference Image 2) */}
          <div
            ref={state1Ref}
            className="absolute inset-0 flex items-center justify-center p-6 sm:p-12 md:p-16 transition-opacity duration-300"
          >
            {/* Architectural CAD Blueprint SVG Background */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 1200 700"
              preserveAspectRatio="xMidYMid meet"
              fill="none"
            >
              {/* Subtle Grid Lines */}
              <line x1="40" y1="140" x2="1160" y2="140" stroke="#e0e0de" strokeWidth="1" />
              <line x1="40" y1="320" x2="1160" y2="320" stroke="#e0e0de" strokeWidth="1" />
              <line x1="40" y1="600" x2="1160" y2="600" stroke="#e0e0de" strokeWidth="1" />
              <line x1="80" y1="40" x2="80" y2="660" stroke="#e0e0de" strokeWidth="1" />
              <line x1="330" y1="40" x2="330" y2="660" stroke="#e0e0de" strokeWidth="1" />
              <line x1="500" y1="40" x2="500" y2="660" stroke="#e0e0de" strokeWidth="1" />
              <line x1="1100" y1="40" x2="1100" y2="660" stroke="#e0e0de" strokeWidth="1" />

              {/* Compass Sector Wedge Arc (Left-Center) */}
              <path
                d="M 330 320 L 330 140 A 250 250 0 0 1 540 220 Z"
                fill="rgba(0, 0, 0, 0.04)"
                stroke="#c4c4c1"
                strokeWidth="1"
              />
              <path
                d="M 330 320 A 250 250 0 0 1 580 320"
                stroke="#d2d2cf"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <path
                d="M 330 320 A 180 180 0 0 1 510 320"
                stroke="#dededb"
                strokeWidth="1"
              />

              {/* Blueprint Rectangular Box (Bottom-Left) */}
              <rect
                x="80"
                y="320"
                width="250"
                height="280"
                fill="none"
                stroke="#c8c8c5"
                strokeWidth="1"
              />
              <rect
                x="98"
                y="338"
                width="140"
                height="150"
                fill="rgba(0, 0, 0, 0.03)"
                stroke="#dededb"
                strokeWidth="0.8"
              />

              {/* Bezier Anchor Control Square Nodes */}
              {[
                { x: 330, y: 140 },
                { x: 540, y: 220 },
                { x: 330, y: 320 },
                { x: 80, y: 320 },
                { x: 330, y: 600 },
                { x: 80, y: 600 },
                { x: 500, y: 320 },
                { x: 500, y: 140 },
                { x: 180, y: 220 },
              ].map((pt, idx) => (
                <rect
                  key={idx}
                  x={pt.x - 3}
                  y={pt.y - 3}
                  width="6"
                  height="6"
                  fill="#ffffff"
                  stroke="#9ca3af"
                  strokeWidth="1"
                />
              ))}
            </svg>

            {/* State 1 Centered Typography (Matching Image 2) */}
            <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
              <h2
                className="text-[clamp(1.9rem,4.4vw,3.75rem)] font-medium leading-[1.22] tracking-[-0.025em] text-[#18181b]"
                style={{ fontFamily: 'var(--font-grotesque, "Plus Jakarta Sans", sans-serif)' }}
              >
                We design and build<br />
                websites, brand systems,<br />
                and digital products that<br />
                work as hard as they look.
              </h2>
            </div>
          </div>

          {/* STATE 2: Bauhaus Geometric Composition (Matches User Reference Image 3) */}
          <div
            ref={state2Ref}
            className="absolute inset-0 flex items-center justify-center p-6 sm:p-12 md:p-16 opacity-0 pointer-events-none transition-opacity duration-300"
          >
            {/* Bauhaus Flat Geometric Shapes Background */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 1200 700"
              preserveAspectRatio="xMidYMid meet"
              fill="none"
            >
              {/* Soft Circular Disc (Centered-Left behind headline) */}
              <circle
                cx="330"
                cy="350"
                r="180"
                fill="rgba(0, 0, 0, 0.055)"
              />

              {/* Flat Soft Grey Square (Bottom-Left) */}
              <rect
                x="70"
                y="320"
                width="260"
                height="260"
                fill="rgba(0, 0, 0, 0.04)"
                stroke="rgba(0, 0, 0, 0.06)"
                strokeWidth="1"
              />
            </svg>

            {/* State 2 Centered Typography (Matching Image 3) */}
            <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
              <h2
                className="text-[clamp(1.9rem,4.4vw,3.75rem)] font-medium leading-[1.22] tracking-[-0.025em] text-[#18181b]"
                style={{ fontFamily: 'var(--font-grotesque, "Plus Jakarta Sans", sans-serif)' }}
              >
                Whether you&apos;re launching<br />
                a product, rebuilding a<br />
                brand, or replacing a tired<br />
                site, one team takes it<br />
                from sketch to live build.
              </h2>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
