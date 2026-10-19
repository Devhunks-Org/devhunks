"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { getLenis } from "./SmoothScroll";

/** Fired on window once the overlay has collapsed into the hero card. */
export const PRELOADER_DONE_EVENT = "devhunks:preloader-done";

declare global {
  interface Window {
    __devhunksPreloaderDone?: boolean;
  }
}

/** Run `cb` after the preloader finishes (immediately if it already has). */
export function onPreloaderDone(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  if (window.__devhunksPreloaderDone) {
    cb();
    return () => {};
  }
  window.addEventListener(PRELOADER_DONE_EVENT, cb, { once: true });
  return () => window.removeEventListener(PRELOADER_DONE_EVENT, cb);
}

const MIN_DURATION = 1.6; // seconds — never flash, even on a warm cache
const MAX_WAIT = 6; // seconds — never trap the visitor on a slow asset

/**
 * Full-screen red overlay with a 0–100% counter that tracks real loading (fonts + window load).
 * At 100% it shrinks (clip-path) into the exact rect + radius of the hero card, then hands over.
 */
export default function Preloader() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const overlay = overlayRef.current;
    const counter = counterRef.current;
    if (!overlay || !counter) return;

    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Always start at the top with scrolling locked
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    root.dataset.loading = "true";
    const lockId = window.setTimeout(() => getLenis()?.stop(), 0);

    // Real readiness signals
    let ready = false;
    const fonts = document.fonts?.ready ?? Promise.resolve();
    const loaded =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((r) => window.addEventListener("load", () => r(), { once: true }));
    Promise.all([fonts, loaded]).then(() => (ready = true));

    const start = performance.now();
    let shown = 0;
    let finished = false;

    const finish = () => {
      root.removeAttribute("data-loading");
      getLenis()?.start();
      window.__devhunksPreloaderDone = true;
      window.dispatchEvent(new Event(PRELOADER_DONE_EVENT));
      setMounted(false);
    };

    const reveal = () => {
      const card = document.querySelector<HTMLElement>("[data-hero-card]");
      const tl = gsap.timeline({ onComplete: finish });
      tl.to(counter, { autoAlpha: 0, y: -8, duration: 0.3, ease: "power2.in" });

      if (!card || reduceMotion) {
        tl.to(overlay, { autoAlpha: 0, duration: 0.4, ease: "power1.out" });
        return;
      }

      const r = card.getBoundingClientRect();
      const radius = parseFloat(getComputedStyle(card).borderTopLeftRadius) || 0;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      tl.fromTo(
        overlay,
        { clipPath: "inset(0px 0px 0px 0px round 0px)" },
        {
          clipPath: `inset(${r.top}px ${vw - r.right}px ${vh - r.bottom}px ${r.left}px round ${radius}px)`,
          duration: 1.05,
          ease: "expo.inOut",
        },
        "-=0.05"
      )
        // Overlay now sits exactly on the card (same colour) — drop it invisibly
        .set(overlay, { autoAlpha: 0 });
    };

    // Smoothly chase the real progress; time gives a floor so the count never stalls or jumps
    const tick = () => {
      if (finished) return;
      const elapsed = (performance.now() - start) / 1000;
      const timeShare = Math.min(elapsed / MIN_DURATION, 1);
      const target = ready || elapsed > MAX_WAIT ? timeShare : Math.min(timeShare, 0.9);
      shown += (target - shown) * 0.14;
      if (target === 1 && 1 - shown < 0.012) shown = 1;
      counter.textContent = `${Math.round(shown * 100)}%`;

      if (shown === 1) {
        finished = true;
        gsap.ticker.remove(tick);
        reveal();
      }
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      window.clearTimeout(lockId);
      root.removeAttribute("data-loading");
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[300] bg-[#ff003d] will-change-[clip-path]"
      aria-hidden="true"
    >
      <span
        ref={counterRef}
        className="font-tight absolute left-5 bottom-5 sm:left-10 sm:bottom-10 text-[15px] leading-6 tabular-nums text-white"
      >
        0%
      </span>
    </div>
  );
}
