"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import dynamic from "next/dynamic";

gsap.registerPlugin(ScrollTrigger);

const CoinPileCanvas = dynamic(() => import("@/components/three/CoinPileCanvas"), {
  ssr: false,
  loading: () => <div className="absolute inset-0" style={{ backgroundColor: "var(--c-bg)" }} />,
});

const HEADLINE_PARTS = [
  { text: "We", accent: false },
  { text: "build", accent: false },
  { text: "websites", accent: false },
  { text: "people", accent: true },
  { text: "remember.", accent: true },
];

interface HeroSectionProps {
  ready: boolean;
}

export default function HeroSection({ ready }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const charsRef = useRef<HTMLSpanElement[]>([]);
  const [inView, setInView] = useState(true);

  // IntersectionObserver for canvas frameloop optimization
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Entrance animation once preloader finishes
  useGSAP(
    () => {
      if (!ready) return;
      const chars = charsRef.current.filter(Boolean);
      gsap.fromTo(
        chars,
        { yPercent: 100, rotateZ: 5, opacity: 0 },
        {
          yPercent: 0,
          rotateZ: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.018,
        }
      );
      gsap.fromTo(
        [subRef.current, metaRef.current],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power2.out", delay: 0.4 }
      );
    },
    { scope: sectionRef, dependencies: [ready] }
  );

  // Build character spans preserving words
  const buildChars = () => {
    let idx = 0;
    return HEADLINE_PARTS.map((part, pi) => (
      <span key={pi} className="inline-block whitespace-nowrap mr-[0.25em]">
        {part.text.trim().split("").map((char, ci) => {
          const i = idx++;
          return (
            <span
              key={`${pi}-${ci}`}
              ref={(el) => {
                if (el) charsRef.current[i] = el;
              }}
              className="char"
              style={{
                color: part.accent ? "var(--c-accent)" : "var(--c-text)",
                display: "inline-block",
              }}
            >
              {char}
            </span>
          );
        })}
      </span>
    ));
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative w-full min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--c-bg)" }}
    >
      {/* 3D Physics Canvas — background */}
      <div className="absolute inset-0 z-0">
        <CoinPileCanvas isInView={inView} />
      </div>

      {/* Foreground UI — pointer-events-none */}
      <div className="relative z-10 flex flex-col justify-between min-h-screen pt-32 pb-12 px-6 md:px-12 pointer-events-none">
        <div className="max-w-5xl">
          {/* Headline */}
          <h1
            ref={headlineRef}
            className="text-[clamp(2.4rem,6.5vw,5.8rem)] font-light leading-[1.05] tracking-[-0.04em] mb-8"
            style={{ fontFamily: "var(--font-display, sans-serif)" }}
            aria-label="We build websites people remember."
          >
            <span aria-hidden="true">{buildChars()}</span>
          </h1>

          {/* Subcopy */}
          <p
            ref={subRef}
            className="max-w-xl text-[clamp(0.95rem,1.5vw,1.15rem)] leading-relaxed"
            style={{ color: "var(--c-muted)" }}
          >
            Awake is a creative digital studio in Warsaw. We design and build premium
            websites and web products for founders and product teams who need to stand out.
          </p>
        </div>

        {/* Studio Metadata */}
        <div
          ref={metaRef}
          className="flex flex-wrap gap-8 md:gap-16 pt-6"
          style={{ borderTop: "1px solid var(--c-border)" }}
        >
          <div className="flex flex-col gap-1">
            <span
              className="text-[10px] uppercase tracking-[0.18em]"
              style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--c-dim)" }}
            >
              Based in
            </span>
            <span
              className="text-[12px] uppercase tracking-[0.12em]"
              style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--c-muted)" }}
            >
              Warsaw, Poland
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span
              className="text-[10px] uppercase tracking-[0.18em]"
              style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--c-dim)" }}
            >
              Say hello
            </span>
            <a
              href="mailto:contact@awakeagency.dev"
              className="text-[12px] uppercase tracking-[0.12em] transition-colors pointer-events-auto"
              style={{
                fontFamily: "var(--font-mono, monospace)",
                color: "var(--c-muted)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--c-accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--c-muted)")}
            >
              contact@awakeagency.dev
            </a>
          </div>
          <div className="flex flex-col gap-1">
            <span
              className="text-[10px] uppercase tracking-[0.18em]"
              style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--c-dim)" }}
            >
              Projects shipped
            </span>
            <span
              className="text-[12px] uppercase tracking-[0.12em]"
              style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--c-accent)" }}
            >
              60+
            </span>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div
        className="absolute bottom-6 right-8 z-10 flex flex-col items-center gap-2"
        style={{ opacity: ready ? 1 : 0, transition: "opacity 0.5s 1.2s" }}
      >
        <div
          className="w-px h-12 animate-pulse"
          style={{ backgroundColor: "var(--c-accent)" }}
        />
        <span
          className="text-[9px] uppercase tracking-[0.2em] -rotate-90 origin-center translate-y-4"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--c-dim)" }}
        >
          Scroll
        </span>
      </div>
    </section>
  );
}
