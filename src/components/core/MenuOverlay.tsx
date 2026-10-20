"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { getLenis } from "./SmoothScroll";
import { SITE } from "@/lib/site";

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  { index: "00", label: "HOME", href: "/" },
  { index: "01", label: "SERVICES", href: "#services" },
  { index: "02", label: "PROJECTS", href: "#projects" },
  { index: "03", label: "CONTACTS", href: `mailto:${SITE.email}` },
];

/**
 * Monoline glyphs spelling "devhunks", drawn one after another behind the menu.
 * viewBox is 700 x 1000. Separate strokes of a letter are separate "M" sub-paths.
 */
const LETTER_PATHS = [
  // d — tall stem, then bowl
  "M 600 -40 L 590 945 M 600 470 C 400 445 160 525 160 700 C 160 865 380 935 590 895",
  // e
  "M 120 600 L 660 620 C 665 400 540 270 390 270 C 235 270 115 400 115 600 C 115 810 235 945 410 945 C 520 945 600 900 650 820",
  // v
  "M 60 270 L 350 930 L 640 270",
  // h
  "M 130 -40 L 120 945 M 125 560 C 180 400 300 330 420 330 C 560 330 620 420 620 560 L 615 945",
  // u
  "M 110 290 L 110 700 C 110 860 220 935 360 935 C 500 935 600 850 610 700 M 610 290 L 605 955",
  // n
  "M 110 300 L 110 955 M 112 520 C 160 380 280 320 400 320 C 540 320 610 410 610 560 L 605 955",
  // k
  "M 150 -40 L 115 960 M 610 330 L 130 720 M 320 565 L 640 960",
  // s
  "M 600 380 C 560 300 470 270 370 270 C 230 270 140 330 140 430 C 140 540 260 570 380 600 C 520 635 620 680 620 790 C 620 890 520 945 370 945 C 240 945 150 900 100 820",
];

const SUB_PATHS = LETTER_PATHS.map((d) => d.split(/(?=M)/).map((p) => p.trim()));
const MAX_STROKES = Math.max(...SUB_PATHS.map((p) => p.length));
const STROKE_WIDTH = 58;
const DRAW_SPEED = 1500; // svg units per second
const HOLD = 3.6;

/**
 * Giant letters behind the menu. Each stroke is revealed from its start to its end
 * (real measured lengths, one stroke after another), held, then erased in the same
 * direction before the next letter begins.
 */
export function MenuLetterStroke({ isOpen }: { isOpen: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    const svg = svgRef.current;
    const paths = pathRefs.current.filter((p): p is SVGPathElement => !!p);
    if (!svg || !paths.length) return;

    if (!isOpen) {
      gsap.to(svg, { autoAlpha: 0, duration: 0.45, ease: "power2.out" });
      return;
    }

    let letter = 0;
    let current: gsap.core.Timeline | null = null;
    let killed = false;

    /** Load the next letter; every stroke parked fully hidden at its start point */
    const load = () => {
      const strokes = SUB_PATHS[letter % SUB_PATHS.length];
      letter++;
      return paths.map((p, i) => {
        const d = strokes[i];
        if (!d) {
          gsap.set(p, { autoAlpha: 0 });
          return 0;
        }
        p.setAttribute("d", d);
        const len = p.getTotalLength();
        // Gap longer than dash + round caps, so no dot peeks out before or after the reveal
        gsap.set(p, {
          strokeDasharray: `${len} ${len + STROKE_WIDTH * 2}`,
          strokeDashoffset: len + STROKE_WIDTH,
          autoAlpha: 1,
        });
        return len;
      });
    };

    const cycle = () => {
      if (killed) return;
      const lengths = load();
      const tl = gsap.timeline({ onComplete: cycle });
      paths.forEach((p, i) => {
        if (!lengths[i]) return;
        tl.to(p, {
          strokeDashoffset: 0,
          duration: Math.max(0.35, lengths[i] / DRAW_SPEED),
          ease: "sine.inOut",
        });
      });
      tl.to({}, { duration: HOLD });
      paths.forEach((p, i) => {
        if (!lengths[i]) return;
        tl.to(p, {
          strokeDashoffset: -(lengths[i] + STROKE_WIDTH),
          duration: Math.max(0.3, lengths[i] / (DRAW_SPEED * 1.15)),
          ease: "sine.inOut",
        });
      });
      tl.to({}, { duration: 0.35 });
      current = tl;
    };

    gsap.fromTo(svg, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, delay: 0.3, ease: "power2.out" });
    const startId = window.setTimeout(cycle, 350);

    return () => {
      killed = true;
      window.clearTimeout(startId);
      current?.kill();
    };
  }, [isOpen]);

  return (
    <svg
      ref={svgRef}
      className="absolute top-[-4%] right-[4%] h-[108%] aspect-[7/10] pointer-events-none z-0 invisible"
      viewBox="0 0 700 1000"
      fill="none"
      aria-hidden="true"
    >
      {Array.from({ length: MAX_STROKES }, (_, i) => (
        <path
          key={i}
          ref={(el) => {
            pathRefs.current[i] = el;
          }}
          d={SUB_PATHS[0][i] ?? "M 0 0"}
          stroke="#e8135c"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ visibility: "hidden" }}
        />
      ))}
    </svg>
  );
}

export default function MenuOverlay({ isOpen, onClose }: MenuOverlayProps) {
  const navRef = useRef<HTMLElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  // Stay mounted while the exit animation plays
  const [rendered, setRendered] = useState(isOpen);
  if (isOpen && !rendered) setRendered(true);
  const exitRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const lenis = getLenis();
    if (isOpen) lenis?.stop();
    else lenis?.start();
  }, [isOpen]);

  useGSAP(
    () => {
      const nav = navRef.current;
      if (!nav) return;
      const labels = nav.querySelectorAll("[data-menu-label]");
      const indices = nav.querySelectorAll("[data-menu-index]");

      if (isOpen) {
        exitRef.current?.kill();
        exitRef.current = null;
        gsap
          .timeline({ defaults: { overwrite: "auto" } })
          .fromTo(labels, { yPercent: 115 }, { yPercent: 0, duration: 1.1, stagger: 0.08, ease: "expo.out" }, 0.18)
          .fromTo(
            indices,
            { autoAlpha: 0, y: 12 },
            { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: "power3.out" },
            0.3
          );
      } else {
        exitRef.current = gsap
          .timeline({ defaults: { overwrite: "auto" }, onComplete: () => setRendered(false) })
          .to(labels, { yPercent: -115, duration: 0.5, stagger: 0.05, ease: "power3.in" }, 0)
          .to(indices, { autoAlpha: 0, y: -10, duration: 0.35, stagger: 0.05, ease: "power2.in" }, 0);
      }
    },
    { dependencies: [isOpen, rendered], scope: navRef }
  );

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (href.startsWith("mailto:")) return;
    e.preventDefault();
    setHoveredIndex(null);
    onClose();
    if (href.startsWith("#")) {
      setTimeout(() => {
        const el = document.querySelector(href);
        if (el) getLenis()?.scrollTo(el as HTMLElement, { offset: -40, duration: 1.2 });
      }, 600);
    } else {
      getLenis()?.scrollTo(0, { duration: 1 });
    }
  };

  if (!rendered) return null;

  return (
    <nav
      ref={navRef}
      className="absolute inset-x-0 top-[96px] bottom-[110px] z-40 flex items-center justify-end px-5 sm:px-11 pointer-events-none"
      aria-label="Main menu"
      aria-hidden={!isOpen}
    >
      <ul
        className={`flex flex-col gap-[clamp(1.5rem,6.2vh,4rem)] w-full sm:w-auto sm:mr-[8.4%] ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {MENU_ITEMS.map((item, i) => {
          const isHovered = hoveredIndex === i;
          return (
            <li key={item.label} className="flex items-center">
              {/* Rotated index */}
              <span className="block w-[clamp(3rem,12.9vw,15rem)] shrink-0">
                <span
                  data-menu-index
                  className="font-tight block text-[13px] font-medium text-white [writing-mode:vertical-rl] invisible"
                >
                  {item.index}
                </span>
              </span>
              <a
                href={item.href}
                tabIndex={isOpen ? 0 : -1}
                onClick={(e) => handleNavClick(e, item.href)}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="font-wide relative flex items-center text-white uppercase leading-none font-medium text-[clamp(2rem,3.05vw,3.6rem)] tracking-[-0.01em] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ transform: isHovered ? "translateX(10px)" : "translateX(0)" }}
              >
                <span
                  className="absolute -left-[1.1em] top-1/2 h-[2px] w-[0.4em] bg-white origin-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ transform: `translateY(-50%) scaleX(${isHovered ? 1 : 0})` }}
                />
                {/* Mask: the label slides up into view */}
                <span className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
                  <span data-menu-label className="block will-change-transform">
                    {item.label}
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
