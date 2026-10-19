"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const PARAGRAPHS = [
  "We design and build websites, brand systems, and digital products that work as hard as they look.",
  "Whether you're launching a product, rebuilding a brand, or replacing a tired site, one team takes it from sketch to live build.",
];

function SplitParagraph({ text, index }: { text: string; index: number }) {
  const pRef = useRef<HTMLParagraphElement>(null);

  const words = text.split(" ");

  useGSAP(
    () => {
      if (!pRef.current) return;
      const spans = pRef.current.querySelectorAll<HTMLSpanElement>(".word-char");
      if (!spans.length) return;

      gsap.fromTo(
        spans,
        { opacity: 0.15, color: "var(--c-dim)", yPercent: 12 },
        {
          opacity: 1,
          color: "var(--c-text)",
          yPercent: 0,
          stagger: 0.015,
          ease: "none",
          scrollTrigger: {
            trigger: pRef.current,
            start: "top 78%",
            end: "bottom 35%",
            scrub: 0.6,
          },
        }
      );
    },
    { scope: pRef }
  );

  return (
    <p
      ref={pRef}
      aria-label={text}
      className="text-[clamp(1.35rem,3.2vw,2.6rem)] font-light leading-[1.25] tracking-[-0.02em]"
      style={{ fontFamily: "var(--font-display, sans-serif)" }}
    >
      {words.map((word, wi) => (
        <span key={wi} className="inline-block overflow-hidden mr-[0.28em] mb-1">
          <span
            className="word-char inline-block"
            aria-hidden="true"
            style={{ opacity: 0.15, color: "var(--c-dim)" }}
          >
            {word}
          </span>
        </span>
      ))}
    </p>
  );
}

export default function ManifestoSection() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative w-full py-32 md:py-48 px-6 md:px-12 lg:px-24"
      style={{ backgroundColor: "var(--c-bg)" }}
    >
      {/* Section index */}
      <div
        className="flex items-center gap-4 mb-16"
        style={{ borderTop: "1px solid var(--c-border)", paddingTop: "1.5rem" }}
      >
        <span
          className="text-[10px] uppercase tracking-[0.18em]"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--c-dim)" }}
        >
          01 / STUDIO
        </span>
        <div className="flex-1 h-px" style={{ backgroundColor: "var(--c-border)" }} />
      </div>

      {/* Manifesto text */}
      <div className="flex flex-col gap-12 max-w-5xl">
        {PARAGRAPHS.map((text, i) => (
          <SplitParagraph key={i} text={text} index={i} />
        ))}
      </div>

      {/* Architectural crosshair decoration */}
      <div
        className="absolute right-12 top-1/2 -translate-y-1/2 crosshair w-2 h-2 hidden xl:block"
        style={{ borderRadius: 0 }}
      />
    </section>
  );
}
