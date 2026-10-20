"use client";

import { useEffect, useRef, useState } from "react";
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

const ROWS = Math.max(STATEMENT_A.length, STATEMENT_B.length);

// Drum: every row is a ring around a vertical axis behind the text. A and B sit 105° apart.
const SWAP_ANGLE = 105;
const RADIUS = 0.443; // × card width (620px on a 1400px card)
const PERSPECTIVE = 1.143; // × card width (1600px on a 1400px card)

const INK = "rgb(22,29,37)";
const FILL = "#e5e4e7";
const KAPPA = 0.5523; // bezier handle length for a circle

/** Construction drawing, sized from the card (all values in px). */
function geometry(W: number, H: number) {
  const u = Math.min(H, W * 1.15); // keep proportions on narrow screens
  const sqX = W * 0.05;
  const sqY = H * 0.457;
  const side = u * 0.423;
  const r = u * 0.2625;
  const cx = sqX + u * 0.4375;
  const cy = H * 0.4425;
  return { sqX, sqY, side, r, cx, cy };
}

function setDrum(el: HTMLElement, deg: number, R: number) {
  const rad = (deg * Math.PI) / 180;
  el.style.transform = `translate3d(${R * Math.sin(rad)}px,0,${R * (Math.cos(rad) - 1)}px) rotateY(${deg}deg)`;
}

export default function ManifestoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ W: number; H: number } | null>(null);

  // The drawing is built in card pixels, so track the card size
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const ro = new ResizeObserver(() => {
      // Full card box (the drawing spans the padding too)
      const width = card.offsetWidth;
      const height = card.offsetHeight;
      setSize((s) => (s && Math.abs(s.W - width) < 1 && Math.abs(s.H - height) < 1 ? s : { W: width, H: height }));
    });
    ro.observe(card);
    return () => ro.disconnect();
  }, []);

  useGSAP(
    () => {
      if (!size || !sectionRef.current || !cardRef.current) return;
      const q = gsap.utils.selector(sectionRef);
      const R = size.W * RADIUS;

      const rowsA = q<HTMLElement>("[data-line-a]");
      const rowsB = q<HTMLElement>("[data-line-b]");
      rowsA.forEach((el) => setDrum(el, 0, R));
      rowsB.forEach((el) => setDrum(el, SWAP_ANGLE, R));

      /** Prepare a stroke for a dash draw-in (returns its length). */
      const prepDraw = (el: SVGGeometryElement) => {
        const len = el.getTotalLength();
        gsap.set(el, { strokeDasharray: `${len} ${len + 2}`, strokeDashoffset: len });
        return len;
      };

      const lines = q<SVGGeometryElement>("[data-draw]");
      lines.forEach(prepDraw);
      const wipes = q<SVGGeometryElement>("[data-wipe]");
      wipes.forEach(prepDraw);
      const pops = q("[data-pop]");
      gsap.set(pops, { scale: 0, transformOrigin: "50% 50%", transformBox: "fill-box" });

      // 1 — while the card scrolls in: the wireframe draws itself
      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            end: "top top",
            scrub: 0.6,
          },
        })
        .to(lines, { strokeDashoffset: 0, duration: 1, stagger: 0.04, ease: "none" }, 0)
        .to(pops, { scale: 1, duration: 0.35, stagger: 0.03, ease: "back.out(2)" }, 0.45);

      // 2 — pinned: fills wipe in, the drum turns A → B, the wireframe fades away
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: () => `top top+=${parseFloat(getComputedStyle(document.documentElement).fontSize) * 1.25}`,
          end: "+=128%",
          scrub: 0.8,
          pin: cardRef.current,
          invalidateOnRefresh: true,
        },
      });

      tl.to(wipes, { strokeDashoffset: 0, duration: 0.24, ease: "power1.inOut" }, 0);

      const turnStart = 0.22;
      const rowDur = 0.3;
      const rowStagger = 0.065;
      for (let i = 0; i < ROWS; i++) {
        const a = rowsA[i];
        const b = rowsB[i];
        const proxy = { deg: 0 };
        tl.to(
          proxy,
          {
            deg: -SWAP_ANGLE,
            duration: rowDur,
            ease: "sine.inOut",
            onUpdate: () => {
              if (a) setDrum(a, proxy.deg, R);
              if (b) setDrum(b, proxy.deg + SWAP_ANGLE, R);
            },
          },
          turnStart + i * rowStagger
        );
      }

      tl.to(q("[data-wire]"), { autoAlpha: 0, duration: 0.3, ease: "power1.inOut" }, turnStart + 0.05).to(
        {},
        { duration: 0.22 }
      );

      // This pin is created after the sections below it measured their positions — recalc them
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    },
    { scope: sectionRef, dependencies: [size], revertOnUpdate: true }
  );

  const g = size ? geometry(size.W, size.H) : null;
  const lineStroke = { stroke: INK, strokeOpacity: 0.12, strokeWidth: 1.25, fill: "none" } as const;
  const shapeStroke = { stroke: INK, strokeOpacity: 0.2, strokeWidth: 1.25, fill: "none" } as const;
  const handleStroke = { stroke: INK, strokeOpacity: 0.22, strokeWidth: 1.25, fill: "none" } as const;

  return (
    <section ref={sectionRef} id="about" className="relative w-full bg-white px-2.5 sm:px-5 pb-5">
      <div
        ref={cardRef}
        className="relative w-full h-[calc(100svh-20px)] sm:h-[calc(100svh-2.5rem)] min-h-[520px] bg-[#f1f0f3] text-[#161d25] rounded-[24px] sm:rounded-[32px] overflow-hidden flex items-center justify-center px-5 py-16 sm:px-10 sm:py-20"
      >
        {/* Construction drawing */}
        {size && g && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 ${size.W} ${size.H}`}
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <clipPath id="about-circle-clip">
                <circle cx={g.cx} cy={g.cy} r={g.r} />
              </clipPath>
              <clipPath id="about-square-clip">
                <rect x={g.sqX} y={g.sqY} width={g.side} height={g.side} />
              </clipPath>
            </defs>

            {/* Fills: thick strokes revealed by dash = pie wipe (circle) and sweep (square) */}
            <g clipPath="url(#about-square-clip)">
              <path
                data-wipe
                d={`M ${g.sqX + g.side * 0.75} ${g.sqY + g.side * 0.25} H ${g.sqX + g.side * 0.25} V ${g.sqY + g.side * 0.75} H ${g.sqX + g.side * 0.75} Z`}
                stroke={FILL}
                strokeWidth={g.side / 2 + 2}
                strokeLinejoin="miter"
                strokeMiterlimit={4}
              />
            </g>
            <g clipPath="url(#about-circle-clip)">
              {/* Two halves grow from the top, both ways round */}
              <path
                data-wipe
                d={`M ${g.cx} ${g.cy - g.r / 2} A ${g.r / 2} ${g.r / 2} 0 0 1 ${g.cx} ${g.cy + g.r / 2}`}
                stroke={FILL}
                strokeWidth={g.r + 2}
              />
              <path
                data-wipe
                d={`M ${g.cx} ${g.cy - g.r / 2} A ${g.r / 2} ${g.r / 2} 0 0 0 ${g.cx} ${g.cy + g.r / 2}`}
                stroke={FILL}
                strokeWidth={g.r + 2}
              />
            </g>

            {/* Square outline stays after the wireframe is gone */}
            <path
              data-draw
              d={`M ${g.sqX} ${g.sqY} H ${g.sqX + g.side} V ${g.sqY + g.side} H ${g.sqX} Z`}
              {...shapeStroke}
            />

            <g data-wire>
              {/* Grid: tangents of the circle and the square edges */}
              <path data-draw d={`M ${g.sqX} 0 V ${size.H}`} {...lineStroke} />
              <path data-draw d={`M ${g.sqX + g.side} 0 V ${size.H}`} {...lineStroke} />
              <path data-draw d={`M ${g.cx + g.r} 0 V ${size.H}`} {...lineStroke} />
              <path data-draw d={`M 0 ${g.cy - g.r} H ${size.W}`} {...lineStroke} />
              <path data-draw d={`M 0 ${g.sqY} H ${size.W}`} {...lineStroke} />
              <path data-draw d={`M 0 ${g.sqY + g.side} H ${size.W}`} {...lineStroke} />

              {/* Circle outline, from the top, clockwise */}
              <path
                data-draw
                d={`M ${g.cx} ${g.cy - g.r} A ${g.r} ${g.r} 0 1 1 ${g.cx - 0.01} ${g.cy - g.r}`}
                {...shapeStroke}
              />

              {/* Bezier handles at the four cardinal points */}
              {[
                [g.cx, g.cy - g.r, 1, 0],
                [g.cx + g.r, g.cy, 0, 1],
                [g.cx, g.cy + g.r, 1, 0],
                [g.cx - g.r, g.cy, 0, 1],
              ].map(([x, y, dx, dy], i) => {
                const k = KAPPA * g.r;
                return (
                  <g key={`h${i}`}>
                    <path data-draw d={`M ${x - dx * k} ${y - dy * k} L ${x + dx * k} ${y + dy * k}`} {...handleStroke} />
                    <circle data-pop cx={x - dx * k} cy={y - dy * k} r={3} {...handleStroke} />
                    <circle data-pop cx={x + dx * k} cy={y + dy * k} r={3} {...handleStroke} />
                  </g>
                );
              })}

              {/* Anchor squares: circle cardinal points + square corners */}
              {[
                [g.cx, g.cy - g.r],
                [g.cx + g.r, g.cy],
                [g.cx, g.cy + g.r],
                [g.cx - g.r, g.cy],
                [g.sqX, g.sqY],
                [g.sqX + g.side, g.sqY],
                [g.sqX + g.side, g.sqY + g.side],
                [g.sqX, g.sqY + g.side],
              ].map(([x, y], i) => (
                <rect
                  key={`a${i}`}
                  data-pop
                  x={x - 3.5}
                  y={y - 3.5}
                  width={7}
                  height={7}
                  fill="#f1f0f3"
                  stroke={INK}
                  strokeOpacity={0.42}
                  strokeWidth={1.25}
                />
              ))}
            </g>
          </svg>
        )}

        {/* Statements on the drum */}
        <h2 className="sr-only">
          {STATEMENT_A.join(" ")} {STATEMENT_B.join(" ")}
        </h2>
        <div
          aria-hidden="true"
          className="font-wide relative z-10 w-full text-center font-medium leading-none text-[6.9vw] sm:text-[5.55vw]"
          style={{ perspective: size ? `${size.W * PERSPECTIVE}px` : "1600px" }}
        >
          {Array.from({ length: ROWS }, (_, i) => (
            <div key={i} className="relative whitespace-nowrap" style={{ transformStyle: "preserve-3d" }}>
              <span
                data-line-a
                className="block [backface-visibility:hidden] will-change-transform"
                style={{ transformOrigin: "50% 50%" }}
              >
                {STATEMENT_A[i] ?? " "}
              </span>
              <span
                data-line-b
                className="absolute inset-0 block [backface-visibility:hidden] will-change-transform"
                style={{ transformOrigin: "50% 50%", transform: "rotateY(105deg) translateZ(-9999px)" }}
              >
                {STATEMENT_B[i] ?? ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
