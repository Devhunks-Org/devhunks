"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

type Visual = "mihailove" | "frame" | "portfolio" | "manypixels";

// Placement on the ≥1440px stage, in vw (reference: 1440 × 1749 stage)
const FEATURED_PROJECTS: { title: string; tag: string; visual: Visual; x: string; y: string }[] = [
  { title: "Mihailove", tag: "Development", visual: "mihailove", x: "8.889vw", y: "4.948vw" },
  { title: "Frame", tag: "Development", visual: "frame", x: "66.181vw", y: "20.43vw" },
  { title: "Portfolio Ventures", tag: "Branding", visual: "portfolio", x: "15.347vw", y: "63.387vw" },
  { title: "Manypixels", tag: "Development", visual: "manypixels", x: "57.097vw", y: "80.269vw" },
];

const ARCHIVE_PROJECTS = [
  { title: "Condor", scope: "Development", year: "2026", bg: "linear-gradient(160deg,#3b1a78,#1f0b4a)" },
  { title: "Cortland", scope: "Web design", year: "2026", bg: "linear-gradient(160deg,#4b5563,#1f2937)" },
  { title: "Rally", scope: "Development", year: "2025", bg: "linear-gradient(160deg,#3f7d4a,#1d4d2b)" },
  { title: "Rhinestone", scope: "Development", year: "2025", bg: "linear-gradient(160deg,#111,#000)" },
  { title: "Ezra", scope: "Development", year: "2024", bg: "linear-gradient(160deg,#f2701e,#e0550c)" },
];

/**
 * Thread around the featured cards, drawn in a 1440 × 1749 space.
 * Scaled to real pixels at runtime so dashes are exact and the stroke stays 32px.
 */
const THREAD_PATH =
  "M -60 40 C 20 40 60 -20 140 -40 C 260 -70 520 -40 590 160 C 650 330 560 560 360 610 C 170 655 40 520 50 340 C 60 150 220 30 400 40 C 600 52 800 170 900 260 C 960 315 930 360 900 420 C 860 500 880 560 940 600 C 870 680 640 760 520 860 C 640 900 700 1050 660 1200 C 610 1390 430 1460 300 1400 C 150 1330 110 1110 230 980 C 340 860 540 880 640 980 C 760 1100 900 1300 1080 1430 C 1220 1530 1380 1560 1520 1540";

/** Scribble behind the archive list, drawn in a 1400 × 580 box. */
const SCRIBBLE_PATH =
  "M 1460 30 C 1250 40 900 50 760 70 C 640 90 900 120 900 150 C 900 185 700 200 700 235 C 700 270 900 285 900 320 C 900 360 760 380 620 410 C 460 445 240 470 120 470 C 70 470 40 445 50 420 C 60 395 100 400 105 425 C 112 460 80 500 50 520";

/** Scale every x,y pair of an absolute M/C path. */
function scalePath(d: string, sx: number, sy: number) {
  let i = 0;
  return d.replace(/-?\d+(\.\d+)?/g, (n) => {
    const v = parseFloat(n) * (i++ % 2 === 0 ? sx : sy);
    return v.toFixed(1);
  });
}

function ProjectVisual({ visual, hover }: { visual: Visual; hover?: boolean }) {
  switch (visual) {
    case "mihailove":
      return hover ? (
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(ellipse_at_40%_30%,#6b6f55_0%,#3a3c2d_45%,#1b1c15_100%)]">
          <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_70%_75%,rgba(255,255,255,0.18),transparent_40%),radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.12),transparent_35%)]" />
          <span className="relative font-tight text-white text-[2.1vw] font-semibold tracking-[-0.01em] uppercase">Mihailove</span>
        </div>
      ) : (
        <div className="absolute inset-0 bg-[linear-gradient(150deg,#1d1d1f_0%,#2b2620_40%,#5b4520_75%,#2a2017_100%)]">
          <div className="absolute inset-[8%_-12%_24%_14%] rotate-[-14deg] rounded-xl bg-[repeating-linear-gradient(115deg,#3b2b17_0_18px,#a77a3a_18px_22px,#2a1f12_22px_40px)] opacity-90 shadow-2xl" />
          <div className="absolute inset-x-0 bottom-0 h-[24%] bg-[linear-gradient(180deg,transparent,#0c0c0d)]" />
        </div>
      );
    case "frame":
      return hover ? (
        <div className="absolute inset-0 grid place-items-center bg-[#050505]">
          <span className="flex items-center gap-[0.6vw] font-tight text-white text-[1.9vw] font-semibold">
            <span className="inline-block size-[1.4vw] rounded-[0.3vw] border-[0.28vw] border-white" />
            Frame
          </span>
        </div>
      ) : (
        <div className="absolute inset-0 bg-[#060606] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:22px_22px] grid place-items-center p-[8%]">
          <div className="w-full rounded-lg border border-white/15 bg-[#111] px-[8%] py-[10%] text-center shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
            <p className="font-tight text-white text-[1.05vw] font-medium leading-tight">
              Meet the Intelligent
              <br />
              Workspace.
            </p>
            <span className="inline-block mt-3 h-1.5 w-8 rounded-full bg-[#c6f432]" />
          </div>
        </div>
      );
    case "portfolio":
      return hover ? (
        <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(160deg,#2f5bff,#1532d6)]">
          <span className="font-tight text-white text-[1.6vw] font-medium tracking-[0.04em]">⌐PORTFOLIO</span>
        </div>
      ) : (
        <div className="absolute inset-0 grid place-items-center p-[5%] bg-[linear-gradient(160deg,#1f3dff,#1532d6)]">
          <div className="w-full rounded-md bg-white p-[6%] shadow-xl">
            <p className="text-center font-tight text-[0.9vw] font-semibold leading-tight text-[#161d25]">
              Best connected,
              <br />
              early stage investor
            </p>
            <div className="mt-[8%] grid grid-cols-3 gap-1.5">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <span key={i} className="aspect-[4/3] rounded bg-[#e9edff]" />
              ))}
            </div>
          </div>
        </div>
      );
    case "manypixels":
      return hover ? (
        <div className="absolute inset-0 grid place-items-center bg-[#86c8f3]">
          <span className="font-tight text-[#14213d] text-[1.8vw] font-bold">manypixels</span>
        </div>
      ) : (
        <div className="absolute inset-0 grid place-items-center p-[8%] bg-[#86c8f3]">
          <div className="w-full rounded-md bg-white p-[6%] shadow-xl">
            <p className="font-tight text-[0.95vw] font-semibold leading-tight text-[#1d8fe0]">
              On-demand
              <br />
              <span className="text-[#161d25]">graphic &amp; web design</span>
            </p>
            <div className="mt-[8%] grid grid-cols-3 gap-1.5">
              {[0, 1, 2].map((i) => (
                <span key={i} className="aspect-square rounded bg-[#dff1fd]" />
              ))}
            </div>
          </div>
        </div>
      );
  }
}

/** Draws `pathEl` so its tip tracks how far the viewport has reached down the path. */
function useScrollDraw(
  pathRef: React.RefObject<SVGPathElement | null>,
  triggerRef: React.RefObject<HTMLElement | null>,
  d: string | null,
  reach = 0.72
) {
  useGSAP(
    () => {
      const path = pathRef.current;
      const trigger = triggerRef.current;
      if (!path || !trigger || !d) return;

      const total = path.getTotalLength();
      // Sample the path: for each length, the deepest y reached so far (monotonic)
      const N = 600;
      const lens: number[] = [];
      const deepest: number[] = [];
      let maxY = -Infinity;
      for (let i = 0; i <= N; i++) {
        const l = (total * i) / N;
        maxY = Math.max(maxY, path.getPointAtLength(l).y);
        lens.push(l);
        deepest.push(maxY);
      }
      const lengthForDepth = (y: number) => {
        let lo = 0;
        let hi = N;
        while (lo < hi) {
          const mid = (lo + hi + 1) >> 1;
          if (deepest[mid] <= y) lo = mid;
          else hi = mid - 1;
        }
        return deepest[0] > y ? 0 : lens[lo];
      };

      gsap.set(path, { strokeDasharray: `0 ${total + 10}`, strokeDashoffset: 0 });
      const state = { drawn: 0 };
      const apply = () => gsap.set(path, { strokeDasharray: `${state.drawn} ${total + 10}` });

      const st = ScrollTrigger.create({
        trigger,
        start: "top bottom",
        end: "bottom top",
        onUpdate: () => {
          const svgTop = path.ownerSVGElement!.getBoundingClientRect().top;
          const target = lengthForDepth(window.innerHeight * reach - svgTop);
          gsap.to(state, { drawn: target, duration: 0.6, ease: "power2.out", overwrite: true, onUpdate: apply });
        },
      });
      st.update?.();

      return () => st.kill();
    },
    { dependencies: [d] }
  );
}

function useBoxSize(ref: React.RefObject<HTMLElement | null>) {
  const [size, setSize] = useState<{ W: number; H: number } | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const W = el.offsetWidth;
      const H = el.offsetHeight;
      setSize((s) => (s && Math.abs(s.W - W) < 1 && Math.abs(s.H - H) < 1 ? s : { W, H }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

function ArchiveList() {
  const panelRef = useRef<HTMLDivElement>(null);
  const scribbleRef = useRef<SVGPathElement>(null);
  const [active, setActive] = useState<number | null>(null);
  // Most-recent-first order of shown previews, for the stacked deck
  const [history, setHistory] = useState<number[]>([]);
  const size = useBoxSize(panelRef);
  const d = size ? scalePath(SCRIBBLE_PATH, size.W / 1400, size.H / 580) : null;
  useScrollDraw(scribbleRef, panelRef, d, 0.78);

  const activate = (i: number) => {
    setActive(i);
    setHistory((h) => [i, ...h.filter((x) => x !== i)].slice(0, 4));
  };

  return (
    <div
      ref={panelRef}
      onMouseLeave={() => setActive(null)}
      className="relative isolate overflow-hidden bg-[#f1f1f3] rounded-[var(--r-panel)] pt-[var(--inset)] pb-[var(--inset)] xl:pt-[2.5rem] xl:pb-[5.5rem]"
    >
      {size && d && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${size.W} ${size.H}`}
          fill="none"
          aria-hidden="true"
        >
          <path ref={scribbleRef} d={d} stroke="#fcd3dd" strokeWidth={32} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}

      {/* Preview deck: centred, layers stack back as you move between rows */}
      <div className="hidden xl:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[270px] h-[330px] pointer-events-none z-[2]">
        {ARCHIVE_PROJECTS.map((p, i) => {
          const depth = active === null ? -1 : history.indexOf(i);
          const shown = depth >= 0 && depth < 3;
          const style: React.CSSProperties = shown
            ? {
                opacity: [1, 0.55, 0.25][depth],
                transform: `translateY(${[0, -9, -16][depth]}%) scale(${[1, 0.92, 0.85][depth]})`,
                filter: `blur(${[0, 6, 10][depth]}px)`,
                zIndex: 10 - depth,
              }
            : { opacity: 0, transform: "translateY(6%) scale(0.92)", filter: "blur(8px)", zIndex: 0 };
          return (
            <div
              key={p.title}
              className="absolute inset-0 rounded-[var(--r-card)] overflow-hidden bg-[#d6d6dd] transition-[opacity,transform,filter] duration-[600ms] ease-[var(--e-out)] will-change-[transform,opacity,filter]"
              style={{ ...style, background: p.bg }}
            >
              <div className="absolute inset-[12%_10%] rounded-md bg-white/90 shadow-lg" />
              <span className="absolute left-[16%] top-[18%] font-tight text-[13px] font-semibold text-[#161d25]">{p.title}</span>
            </div>
          );
        })}
      </div>

      <ul className="relative z-[1] flex flex-col">
        {ARCHIVE_PROJECTS.map((p, i) => {
          const isActive = active === i;
          const dim = active !== null && !isActive;
          return (
            <li
              key={p.title}
              className="transition-[background-color,opacity] duration-[600ms] ease-[var(--e-out)]"
              style={{ background: isActive ? "rgba(255,255,255,0.55)" : "transparent", opacity: dim ? 0.4 : 1 }}
            >
              <a
                href="#"
                onMouseEnter={() => activate(i)}
                onFocus={() => activate(i)}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center h-[4.75rem] px-[var(--inset)] text-[#161d25]"
              >
                <span className="font-tight font-medium leading-[1.2] text-[length:var(--t-card-title)]">{p.title}</span>
                <span className="font-tight justify-self-end inline-flex items-center gap-[0.875rem] text-[1rem] leading-[1.2] whitespace-nowrap">
                  <span>{p.scope}</span>
                  <span
                    className="size-[0.3125rem] rounded-full bg-current transition-[color,opacity] duration-[600ms] ease-[var(--e-out)]"
                    style={{ color: isActive ? "#d90033" : "#161d25", opacity: isActive ? 1 : 0.4 }}
                  />
                  <span
                    className="min-w-[2.625rem] text-right transition-colors duration-[600ms] ease-[var(--e-out)]"
                    style={{ color: isActive ? "#d90033" : "#161d25" }}
                  >
                    {p.year}
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>

      <div className="relative z-[1] px-[var(--inset)] mt-6 xl:mt-[3rem]">
        <a
          href="#projects"
          className="font-tight inline-flex items-center gap-[0.375rem] text-[0.75rem] uppercase tracking-[0.06em] text-[#161d25] transition-colors duration-[600ms] ease-[var(--e-out)] hover:text-[#d90033]"
        >
          View all
          <svg width="8" height="8" viewBox="0 0 10 10" aria-hidden="true">
            <path d="M2 8 L8 2 M3 2 H8 V7" stroke="currentColor" strokeWidth="1.4" fill="none" />
          </svg>
        </a>
      </div>
    </div>
  );
}

function CaseCard({ project }: { project: (typeof FEATURED_PROJECTS)[number] }) {
  return (
    <a href="#" className="group block">
      <span className="relative block aspect-[380/440] w-full overflow-hidden rounded-[var(--r-card)] bg-[#f1f1f3]">
        {/* Base image */}
        <span className="absolute inset-0 transition-[transform,opacity] duration-[800ms,400ms] ease-[var(--e-out)] group-hover:scale-[1.06] group-hover:opacity-0">
          <ProjectVisual visual={project.visual} />
        </span>
        {/* Hover image dissolves in */}
        <span className="absolute inset-0 scale-[1.08] opacity-0 blur-[6px] transition-[transform,opacity,filter] duration-[800ms,400ms,600ms] ease-[var(--e-out)] group-hover:scale-100 group-hover:opacity-100 group-hover:blur-0">
          <ProjectVisual visual={project.visual} hover />
        </span>
      </span>
      <span className="mt-[0.75rem] md:mt-[1rem] flex flex-col gap-[0.5rem] md:gap-[0.75rem]">
        <span className="font-tight text-[0.75rem] font-medium leading-none text-[#5d646b]">{project.tag}</span>
        <span className="font-tight font-medium leading-none text-[#161d25] opacity-90 text-[length:var(--t-card-title)]">
          {project.title}
        </span>
      </span>
    </a>
  );
}

export default function ProjectsSection() {
  const stageRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<SVGPathElement>(null);
  const size = useBoxSize(stageRef);
  // Thread only exists on the free-form ≥1440px stage
  const wide = size !== null && size.W >= 1440;
  const d = wide && size ? scalePath(THREAD_PATH, size.W / 1440, size.H / 1749) : null;
  useScrollDraw(threadRef, stageRef, d, 0.72);

  return (
    <section id="projects" className="relative bg-white">
      <div className="mx-auto w-[calc(100%-var(--frame)*2)] isolate pt-[4rem] md:pt-[12.5rem]">
        <h2 className="relative z-0 font-tight font-medium uppercase leading-none text-[#161d25] text-left md:text-center md:whitespace-nowrap text-[length:var(--t-mega)]">
          Our projects
        </h2>

        {/* Stage: full-bleed on ≥1440px (cards placed freely), 2-col / 1-col grid below */}
        <div className="relative w-full min-[1440px]:w-[calc(100%+var(--frame)*2)] min-[1440px]:-ml-[var(--frame)]">
          <div
            ref={stageRef}
            className="relative grid grid-cols-1 gap-[2rem] mt-[1.75rem] mb-[3rem] md:max-[1439px]:grid-cols-2 md:max-[1439px]:gap-x-[2.5rem] md:max-[1439px]:gap-y-[5rem] md:max-[1439px]:mt-[6rem] md:max-[1439px]:mb-[8rem] min-[1440px]:block min-[1440px]:h-[121.458vw] min-[1440px]:mt-[11.9444vw] min-[1440px]:mb-[clamp(8rem,10vw,12.5rem)]"
          >
            {wide && size && d && (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none overflow-visible -z-[1]"
                viewBox={`0 0 ${size.W} ${size.H}`}
                fill="none"
                aria-hidden="true"
              >
                <path ref={threadRef} d={d} stroke="#fcd3dd" strokeWidth={32} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}

            {FEATURED_PROJECTS.map((p, i) => (
              <div
                key={p.title}
                data-case
                className={`relative z-[1] w-full min-[1440px]:absolute min-[1440px]:w-[26.3889vw] min-[1440px]:left-[var(--x)] min-[1440px]:top-[var(--y)] ${
                  i % 2 === 1 ? "md:max-[1439px]:mt-[7.5rem]" : ""
                }`}
                style={{ "--x": p.x, "--y": p.y } as React.CSSProperties}
              >
                <CaseCard project={p} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Archive */}
      <div className="mx-auto w-[calc(100%-var(--frame)*2)] pt-[3.5rem] md:pt-[4.5625rem]">
        <ArchiveList />
      </div>
    </section>
  );
}
