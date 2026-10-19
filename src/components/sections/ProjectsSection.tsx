"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

type Visual = "smoke" | "workspace" | "investor" | "studio";

const FEATURED_PROJECTS: {
  title: string;
  tag: string;
  visual: Visual;
  // Desktop placement inside the 1440 x 1750 canvas, expressed in vw
  left: string;
  top: string;
}[] = [
  { title: "Mihailove", tag: "Development", visual: "smoke", left: "8.9vw", top: "5vw" },
  { title: "Frame", tag: "Development", visual: "workspace", left: "66.2vw", top: "20.4vw" },
  { title: "Portfolio Ventures", tag: "Branding", visual: "investor", left: "15.35vw", top: "63.4vw" },
  { title: "Manypixels", tag: "Development", visual: "studio", left: "57.1vw", top: "80.2vw" },
];

const ARCHIVE_PROJECTS = [
  { title: "Condor", scope: "Development", year: "2026", preview: "linear-gradient(160deg,#0f172a,#334155)" },
  { title: "Cortland", scope: "Web design", year: "2026", preview: "linear-gradient(160deg,#fde68a,#f59e0b)" },
  { title: "Rally", scope: "Development", year: "2025", preview: "linear-gradient(160deg,#a7f3d0,#059669)" },
  { title: "Rhinestone", scope: "Development", year: "2025", preview: "linear-gradient(160deg,#c4b5fd,#6d28d9)" },
  { title: "Ezra", scope: "Development", year: "2024", preview: "linear-gradient(160deg,#fecdd3,#e11d48)" },
];

// Hand-drawn thread that loops around the cards (viewBox 1440 x 1750)
const THREAD_PATH =
  "M -60 20 C 40 10 80 70 110 70 C 150 70 170 -50 300 -60 C 470 -70 590 90 590 290 C 590 490 455 610 320 610 C 175 610 55 490 55 300 C 55 195 110 120 205 112 C 425 95 705 245 835 385 C 905 465 885 565 765 645 C 645 725 425 765 305 885 C 165 1025 165 1265 305 1345 C 465 1435 645 1305 605 1185 C 565 1065 385 1125 425 1265 C 475 1445 765 1505 905 1605 C 1005 1685 1105 1745 1520 1725";

// Scribble behind the archive list (viewBox 1400 x 580)
const SCRIBBLE_PATH =
  "M 1460 26 C 1300 36 1150 48 1040 54 C 900 62 760 64 735 80 C 705 100 920 128 920 154 C 920 180 732 204 732 230 C 732 256 920 280 920 306 C 920 334 800 360 730 382 C 650 406 590 424 500 438 C 400 454 220 470 140 472 C 100 473 130 455 126 448 C 118 434 98 426 82 428 C 60 431 42 450 41 476 C 40 502 52 522 64 532";

function ProjectVisual({ visual, title }: { visual: Visual; title: string }) {
  if (visual === "smoke") {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(ellipse_at_30%_20%,#5b5e45_0%,#2b2d22_45%,#141510_100%)]">
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.18),transparent_40%),radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.12),transparent_35%)]" />
        <span className="relative font-tight text-white text-[clamp(1.5rem,2.6vw,2.4rem)] font-semibold tracking-[-0.02em] uppercase">
          {title}
        </span>
      </div>
    );
  }
  if (visual === "workspace") {
    return (
      <div className="absolute inset-0 bg-[#060606] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:22px_22px] flex items-center justify-center p-[8%]">
        <div className="w-full rounded-lg border border-white/15 bg-[#111] p-[8%] text-center shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
          <div className="flex gap-1 mb-4">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-1.5 w-1.5 rounded-full bg-white/30" />
            ))}
          </div>
          <p className="font-tight text-white text-[clamp(0.9rem,1.5vw,1.4rem)] font-semibold leading-tight">
            Meet the Intelligent
            <br />
            Workspace.
          </p>
          <span className="inline-block mt-3 h-2 w-12 rounded-full bg-[#c6f432]" />
        </div>
      </div>
    );
  }
  const isBlue = visual === "investor";
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center p-[9%] ${
        isBlue ? "bg-[linear-gradient(160deg,#2b55ff,#1532d6)]" : "bg-[#86c8f3]"
      }`}
    >
      <div className="w-full rounded-md bg-white p-[7%] shadow-xl">
        <div className="flex items-center justify-between mb-[10%]">
          <span className="h-1.5 w-8 rounded-full bg-[#161d25]" />
          <span className="h-1.5 w-5 rounded-full bg-[#161d25]/30" />
        </div>
        <p
          className={`font-tight font-semibold leading-tight text-[clamp(0.85rem,1.35vw,1.25rem)] ${
            isBlue ? "text-center text-[#161d25]" : "text-[#1d8fe0]"
          }`}
        >
          {isBlue ? (
            <>
              Best connected,
              <br />
              early stage investor
            </>
          ) : (
            <>
              On-demand
              <br />
              <span className="text-[#161d25]">graphic & web design</span>
            </>
          )}
        </p>
        <div className="mt-[10%] grid grid-cols-3 gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`aspect-square rounded ${isBlue ? "bg-[#e9edff]" : "bg-[#dff1fd]"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ArchiveList() {
  const cardRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  const onMove = (e: React.MouseEvent) => {
    if (!cardRef.current || !previewRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    gsap.to(previewRef.current, {
      y: e.clientY - rect.top - 99,
      x: (e.clientX - rect.left - rect.width / 2) * 0.12,
      duration: 0.5,
      ease: "power3.out",
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={() => setActive(null)}
      className="relative bg-[#f1f1f3] rounded-[24px] sm:rounded-[32px] pt-6 sm:pt-10 pb-16 sm:pb-[88px] overflow-hidden"
    >
      <svg
        data-scribble
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1400 580"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <path
          d={SCRIBBLE_PATH}
          pathLength={1}
          stroke="#fcd3dd"
          strokeWidth="32"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="1 1"
          strokeDashoffset="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Floating hover preview */}
      <div
        ref={previewRef}
        className="hidden md:block absolute left-1/2 top-0 -ml-[81px] w-[162px] h-[198px] rounded-2xl overflow-hidden pointer-events-none z-20 transition-[opacity,scale] duration-300"
        style={{ opacity: active === null ? 0 : 1, scale: active === null ? "0.8" : "1" }}
      >
        {ARCHIVE_PROJECTS.map((p, i) => (
          <div
            key={p.title}
            className="absolute inset-0 flex items-end p-3 transition-opacity duration-300"
            style={{ background: p.preview, opacity: active === i ? 1 : 0 }}
          >
            <span className="font-tight text-white text-sm font-medium">{p.title}</span>
          </div>
        ))}
      </div>

      <ul className="relative z-10">
        {ARCHIVE_PROJECTS.map((p, i) => (
          <li key={p.title}>
            <a
              href="#"
              onMouseEnter={() => setActive(i)}
              className="flex items-center justify-between h-[60px] sm:h-[76px] px-5 sm:px-10 text-[#161d25] group"
            >
              <span className="font-tight text-[22px] sm:text-[32px] font-medium leading-[1.2] transition-transform duration-300 group-hover:translate-x-2">
                {p.title}
              </span>
              <span className="font-tight flex items-center gap-3.5 text-[13px] sm:text-[16px]">
                {p.scope}
                <span className="h-[5px] w-[5px] rounded-full bg-[#161d25]" />
                {p.year}
              </span>
            </a>
          </li>
        ))}
      </ul>

      <a
        href="#projects"
        className="font-tight relative z-10 inline-flex items-center gap-2 mt-6 mx-5 sm:mx-10 text-[12px] font-medium uppercase tracking-[0.06em] text-[#161d25] hover:opacity-70 transition-opacity"
      >
        View all
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M2 8 L8 2 M3 2 H8 V7" stroke="currentColor" strokeWidth="1.4" fill="none" />
        </svg>
      </a>
    </div>
  );
}

export default function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(sectionRef);

      gsap.fromTo(
        q("[data-thread] path"),
        { strokeDashoffset: 1 },
        {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: { trigger: q("[data-grid]")[0], start: "top 85%", end: "bottom 60%", scrub: 0.6 },
        }
      );

      gsap.fromTo(
        q("[data-scribble] path"),
        { strokeDashoffset: 1 },
        {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: { trigger: q("[data-scribble]")[0], start: "top 80%", end: "bottom 70%", scrub: 0.6 },
        }
      );

      q("[data-card]").forEach((card) => {
        gsap.from(card, {
          y: 80,
          autoAlpha: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 90%" },
        });
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} id="projects" className="relative w-full bg-white pt-24 sm:pt-[200px] pb-5">
      <h2 className="font-tight text-center uppercase font-medium leading-none tracking-[-0.03em] text-[#161d25] text-[13.54vw] px-2.5 sm:px-5">
        Our projects
      </h2>

      {/* Featured cards + thread */}
      <div data-grid className="relative mt-12 sm:mt-[12vw] md:h-[121.5vw] px-5 md:px-0">
        <svg
          data-thread
          className="hidden md:block absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          viewBox="0 0 1440 1750"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <path
            d={THREAD_PATH}
            pathLength={1}
            stroke="#fcd3dd"
            strokeWidth="32"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1 1"
            strokeDashoffset="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <div className="flex flex-col gap-12 md:block">
          {FEATURED_PROJECTS.map((p) => (
            <a
              key={p.title}
              data-card
              href="#"
              className="group relative block md:absolute md:w-[26.4vw] md:left-[var(--l)] md:top-[var(--t)]"
              style={{ "--l": p.left, "--t": p.top } as React.CSSProperties}
            >
              <div className="relative aspect-[380/445] rounded-2xl overflow-hidden bg-[#d6d6dd]">
                <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]">
                  <ProjectVisual visual={p.visual} title={p.title} />
                </div>
              </div>
              <p className="font-tight mt-4 text-[12px] font-medium leading-none text-[#5d646b]">{p.tag}</p>
              <h3 className="font-tight mt-2.5 text-[26px] sm:text-[32px] font-medium leading-none text-[#161d25]">
                {p.title}
              </h3>
            </a>
          ))}
        </div>
      </div>

      <div className="px-2.5 sm:px-5 mt-16 sm:mt-[73px]">
        <ArchiveList />
      </div>
    </section>
  );
}
