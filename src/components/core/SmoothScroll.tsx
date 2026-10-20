"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;

export function getLenis() {
  return lenisInstance;
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      // Frame-rate independent damping: a long, soft glide at 60/120/144Hz alike
      lerp: 0.07,
      smoothWheel: true,
      wheelMultiplier: 0.85,
      // Touch keeps the device's native momentum (smoothest on phones)
      syncTouch: false,
      touchMultiplier: 1.2,
      autoRaf: false,
    });

    lenisRef.current = lenis;
    lenisInstance = lenis;

    // The preloader locks scrolling until it hands over to the hero
    if (document.documentElement.dataset.loading) lenis.stop();

    // ScrollTrigger reads Lenis' animated position, updated in the same frame
    lenis.on("scroll", ScrollTrigger.update);

    // One clock for everything: Lenis + GSAP share the display's rAF (120Hz on 120Hz screens)
    const updateTicker = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    // Mobile URL-bar show/hide shouldn't trigger a full ScrollTrigger recalculation mid-scroll
    ScrollTrigger.config({ ignoreMobileResize: true });

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return <>{children}</>;
}
