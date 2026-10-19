"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const FEATURED_PROJECTS = [
  {
    id: "mihailove",
    title: "Mihailove",
    scope: "Jewellery E-Commerce",
    tag: "Development",
    x: 80,
    y: 60,
    accent: "#a855f7",
  },
  {
    id: "frame",
    title: "Frame",
    scope: "Product Architecture Site",
    tag: "Development",
    x: 980,
    y: 120,
    accent: "#06b6d4",
  },
  {
    id: "portfolio-ventures",
    title: "Portfolio Ventures",
    scope: "VC Brand & Web Platform",
    tag: "Branding",
    x: 300,
    y: 720,
    accent: "#f59e0b",
  },
  {
    id: "manypixels",
    title: "Manypixels",
    scope: "Design Subscription Platform",
    tag: "Development",
    x: 1400,
    y: 600,
    accent: "#10b981",
  },
];

const ARCHIVE_PROJECTS = [
  { title: "Condor", scope: "Development", year: "2026" },
  { title: "Cortland", scope: "Web design", year: "2026" },
  { title: "Rally", scope: "Development", year: "2025" },
  { title: "Rhinestone", scope: "Development", year: "2025" },
  { title: "Ezra", scope: "Development", year: "2024" },
];

function ProjectCard({ project }: { project: (typeof FEATURED_PROJECTS)[0] }) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={cardRef}
      className="absolute"
      style={{ left: project.x, top: project.y, width: 280, cursor: "pointer" }}
      onMouseEnter={() => {
        gsap.to(cardRef.current, { scale: 1.04, duration: 0.3, ease: "power2.out" });
      }}
      onMouseLeave={() => {
        gsap.to(cardRef.current, { scale: 1, duration: 0.3, ease: "power2.out" });
      }}
    >
      {/* Browser chrome wireframe preview */}
      <div
        className="w-full mb-3"
        style={{
          border: "1px solid var(--c-border)",
          backgroundColor: "var(--c-surface)",
          aspectRatio: "16/10",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Browser bar */}
        <div
          className="flex items-center gap-1.5 px-3 py-2"
          style={{ borderBottom: "1px solid var(--c-border)" }}
        >
          {["#EF4444", "#f59e0b", "#10b981"].map((c) => (
            <div key={c} className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
          ))}
          <div
            className="flex-1 h-4 rounded-sm ml-2"
            style={{ backgroundColor: "var(--c-border)" }}
          />
        </div>
        {/* Procedural geometric artwork */}
        <div className="absolute inset-0 top-8 flex items-center justify-center overflow-hidden">
          <svg width="100%" height="100%" viewBox="0 0 280 160">
            <rect x="20" y="20" width="240" height="120" fill="none" stroke={project.accent} strokeWidth="0.5" opacity="0.3" />
            <circle cx="140" cy="80" r="40" fill="none" stroke={project.accent} strokeWidth="0.8" opacity="0.5" />
            <line x1="20" y1="80" x2="260" y2="80" stroke={project.accent} strokeWidth="0.4" opacity="0.3" />
            <line x1="140" y1="20" x2="140" y2="140" stroke={project.accent} strokeWidth="0.4" opacity="0.3" />
            <polygon points="140,50 165,85 115,85" fill={project.accent} opacity="0.15" />
            <text x="140" y="84" textAnchor="middle" fontSize="10" fill={project.accent} opacity="0.5" fontFamily="monospace">
              {project.id.toUpperCase()}
            </text>
          </svg>
        </div>
      </div>
      {/* Card meta */}
      <div className="flex items-start justify-between">
        <div>
          <p
            className="text-sm font-medium"
            style={{ color: "var(--c-text)", fontFamily: "var(--font-display, sans-serif)" }}
          >
            {project.title}
          </p>
          <p
            className="text-[11px] mt-0.5"
            style={{ color: "var(--c-muted)", fontFamily: "var(--font-mono, monospace)" }}
          >
            {project.scope}
          </p>
        </div>
        <span
          className="text-[9px] uppercase tracking-[0.15em] px-2 py-1"
          style={{
            fontFamily: "var(--font-mono, monospace)",
            color: project.accent,
            border: `1px solid ${project.accent}`,
            opacity: 0.8,
          }}
        >
          {project.tag}
        </span>
      </div>
    </div>
  );
}

function DraggableCanvas() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: -80, y: -60 });
  const targetPos = useRef({ x: -80, y: -60 });
  const rafRef = useRef<number>(0);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  useEffect(() => {
    const animate = () => {
      currentPos.current.x = lerp(currentPos.current.x, targetPos.current.x, 0.08);
      currentPos.current.y = lerp(currentPos.current.y, targetPos.current.y, 0.08);

      if (canvasRef.current) {
        canvasRef.current.style.transform = `translate(${currentPos.current.x}px, ${currentPos.current.y}px)`;
      }

      setCoords({
        x: Math.round(-currentPos.current.x),
        y: Math.round(-currentPos.current.y),
      });

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    startPos.current = { x: e.clientX - currentPos.current.x, y: e.clientY - currentPos.current.y };
    viewportRef.current?.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const nx = e.clientX - startPos.current.x;
    const ny = e.clientY - startPos.current.y;
    targetPos.current.x = clamp(nx, -1700, 80);
    targetPos.current.y = clamp(ny, -1100, 60);
  }, []);

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  return (
    <div
      ref={viewportRef}
      className="relative overflow-hidden rounded-none"
      style={{
        height: "75vh",
        border: "1px solid var(--c-border)",
        cursor: isDragging.current ? "grabbing" : "grab",
        backgroundColor: "var(--c-bg)",
        backgroundImage: `radial-gradient(circle, var(--c-border) 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* HUD */}
      <div
        className="absolute top-4 left-4 z-10 px-3 py-2 text-[10px] uppercase tracking-[0.15em] pointer-events-none"
        style={{
          fontFamily: "var(--font-mono, monospace)",
          color: "var(--c-dim)",
          backgroundColor: "rgba(9,9,11,0.7)",
          border: "1px solid var(--c-border)",
        }}
      >
        CANVAS COORDS — X: {String(coords.x).padStart(4, "0")} Y: {String(coords.y).padStart(4, "0")} |{" "}
        DRAG TO EXPLORE
      </div>

      {/* Pannable canvas */}
      <div
        ref={canvasRef}
        style={{
          position: "absolute",
          width: 2200,
          height: 1400,
          willChange: "transform",
        }}
      >
        {FEATURED_PROJECTS.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </div>
  );
}

function ArchiveRow({ project, index }: { project: (typeof ARCHIVE_PROJECTS)[0]; index: number }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={rowRef}
      className="group flex items-center justify-between px-0 py-5 transition-all duration-300"
      style={{
        borderBottom: "1px solid var(--c-border)",
        backgroundColor: hovered ? "var(--c-surface)" : "transparent",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center gap-6">
        <span
          className="text-[10px] uppercase tracking-[0.15em] w-6"
          style={{ fontFamily: "var(--font-mono, monospace)", color: hovered ? "var(--c-accent)" : "var(--c-dim)" }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span
          className="text-[clamp(1rem,2.5vw,1.5rem)] font-light tracking-[-0.02em] transition-transform duration-300"
          style={{
            fontFamily: "var(--font-display, sans-serif)",
            color: "var(--c-text)",
            transform: hovered ? "translateX(12px)" : "translateX(0)",
          }}
        >
          {project.title}
        </span>
      </div>
      <div className="flex items-center gap-8">
        <span
          className="hidden sm:block text-[11px] uppercase tracking-[0.12em]"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--c-muted)" }}
        >
          {project.scope}
        </span>
        <span
          className="text-[11px] uppercase tracking-[0.12em]"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--c-dim)" }}
        >
          {project.year}
        </span>
        <span
          className="text-sm transition-colors duration-300"
          style={{ color: hovered ? "var(--c-accent)" : "var(--c-dim)" }}
        >
          →
        </span>
      </div>
    </div>
  );
}

export default function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="w-full py-24 md:py-36 px-6 md:px-12"
      style={{ backgroundColor: "var(--c-bg)" }}
    >
      {/* Section header */}
      <div
        className="flex items-center gap-4 mb-14"
        style={{ borderTop: "1px solid var(--c-border)", paddingTop: "1.5rem" }}
      >
        <span
          className="text-[10px] uppercase tracking-[0.18em]"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--c-dim)" }}
        >
          02 / OUR PROJECTS
        </span>
        <div className="flex-1 h-px" style={{ backgroundColor: "var(--c-border)" }} />
      </div>

      {/* 2D Draggable Canvas */}
      <DraggableCanvas />

      {/* Archive Table */}
      <div className="mt-20">
        <p
          className="text-[10px] uppercase tracking-[0.18em] mb-6"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--c-dim)" }}
        >
          Chronological Archive
        </p>
        <div style={{ borderTop: "1px solid var(--c-border)" }}>
          {ARCHIVE_PROJECTS.map((p, i) => (
            <ArchiveRow key={p.title} project={p} index={i} />
          ))}
        </div>
        <div className="mt-8 flex justify-end">
          <button
            className="text-[11px] uppercase tracking-[0.18em] flex items-center gap-3 transition-colors"
            style={{
              fontFamily: "var(--font-mono, monospace)",
              color: "var(--c-muted)",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--c-accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--c-muted)")}
          >
            View all projects <span>→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
