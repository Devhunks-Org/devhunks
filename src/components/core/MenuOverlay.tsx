"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
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
 * viewBox is 700 x 1000; each path is traced with stroke-dashoffset.
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
                className="font-wide relative flex items-center text-white uppercase leading-none font-medium text-[clamp(2rem,3.05vw,3.6rem)] tracking-[-0.01em] transition-transform duration-300 ease-out"
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
