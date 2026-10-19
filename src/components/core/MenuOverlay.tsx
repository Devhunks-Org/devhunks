"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { getLenis } from "./SmoothScroll";

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  { index: "00", label: "HOME", href: "/" },
  { index: "01", label: "SERVICES", href: "#services" },
  { index: "02", label: "PROJECTS", href: "#projects" },
  { index: "03", label: "CONTACTS", href: "mailto:contact@awakeagency.dev" },
];

/**
 * Monoline glyphs spelling "awake", drawn one after another behind the menu.
 * viewBox is 700 x 1000; each path is traced with stroke-dashoffset.
 */
const LETTER_PATHS = [
  // a — hook + stem, then bowl
  "M 70 390 C 95 170 250 35 450 35 C 600 35 670 120 655 250 L 590 905 M 640 470 C 420 455 215 535 215 700 C 215 860 400 925 600 895",
  // w
  "M 40 250 L 190 905 L 350 430 L 510 905 L 660 250",
  // a
  "M 70 390 C 95 170 250 35 450 35 C 600 35 670 120 655 250 L 590 905 M 640 470 C 420 455 215 535 215 700 C 215 860 400 925 600 895",
  // k
  "M 150 -40 L 115 960 M 610 330 L 130 720 M 320 565 L 640 960",
  // e
  "M 120 600 L 660 620 C 665 400 540 270 390 270 C 235 270 115 400 115 600 C 115 810 235 945 410 945 C 520 945 600 900 650 820",
];

export function MenuLetterStroke({ isOpen }: { isOpen: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const path = pathRef.current;
    if (!svg || !path) return;

    if (!isOpen) {
      gsap.to(svg, { autoAlpha: 0, duration: 0.2 });
      return;
    }

    gsap.set(svg, { autoAlpha: 1 });
    let letter = 0;
    const tl = gsap.timeline({ repeat: -1 });

    LETTER_PATHS.forEach(() => {
      tl.call(() => {
        path.setAttribute("d", LETTER_PATHS[letter % LETTER_PATHS.length]);
        letter++;
      })
        .fromTo(path, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" })
        .to({}, { duration: 4.6 })
        .to(path, { strokeDashoffset: -1, duration: 1.3, ease: "power2.inOut" })
        .to({}, { duration: 0.5 });
    });

    return () => {
      tl.kill();
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
      <path
        ref={pathRef}
        d={LETTER_PATHS[0]}
        pathLength={1}
        stroke="#e8135c"
        strokeWidth="58"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1 1"
        strokeDashoffset="1"
      />
    </svg>
  );
}

export default function MenuOverlay({ isOpen, onClose }: MenuOverlayProps) {
  const itemsRef = useRef<(HTMLLIElement | null)[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const lenis = getLenis();
    if (isOpen) {
      lenis?.stop();
      gsap.fromTo(
        itemsRef.current.filter(Boolean),
        { y: 40, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.06, ease: "power3.out", delay: 0.05 }
      );
    } else {
      lenis?.start();
    }
  }, [isOpen]);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (href.startsWith("mailto:")) return;
    e.preventDefault();
    setHoveredIndex(null);
    onClose();
    if (href.startsWith("#")) {
      setTimeout(() => {
        const el = document.querySelector(href);
        if (el) getLenis()?.scrollTo(el as HTMLElement, { offset: -40, duration: 1.2 });
      }, 300);
    } else {
      getLenis()?.scrollTo(0, { duration: 1 });
    }
  };

  if (!isOpen) return null;

  return (
    <nav
      className="absolute inset-x-0 top-[96px] bottom-[110px] z-40 flex items-center justify-end px-5 sm:px-11 pointer-events-none"
      aria-label="Main menu"
    >
      <ul className="flex flex-col gap-[clamp(1.5rem,6.2vh,4rem)] w-full sm:w-auto sm:mr-[8.4%] pointer-events-auto">
        {MENU_ITEMS.map((item, i) => {
          const isHovered = hoveredIndex === i;
          return (
            <li
              key={item.label}
              ref={(el) => {
                itemsRef.current[i] = el;
              }}
              className="flex items-center"
            >
              {/* Rotated index */}
              <span className="block w-[clamp(3rem,12.9vw,15rem)] shrink-0">
                <span className="font-tight block text-[13px] font-medium text-white [writing-mode:vertical-rl]">
                  {item.index}
                </span>
              </span>
              <a
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="font-wide relative flex items-center text-white uppercase leading-none font-[460] text-[clamp(2rem,2.8vw,3.3rem)] tracking-[-0.005em] transition-transform duration-300 ease-out"
                style={{ transform: isHovered ? "translateX(8px)" : "translateX(0)" }}
              >
                <span
                  className="absolute -left-[1.1em] top-1/2 h-[2px] w-[0.4em] bg-white origin-left transition-transform duration-300 ease-out"
                  style={{ transform: `translateY(-50%) scaleX(${isHovered ? 1 : 0})` }}
                />
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
