"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const SERVICES = [
  {
    index: "01",
    title: "Webflow development",
    description:
      "Begin Webflow development with our Project Discovery session, aligning our team with your goals, timeline, and required functionalities. We prioritize understanding your content strategy, feature needs, and desired user experiences.",
    emblemPoints: "140,40 170,90 110,90",
  },
  {
    index: "02",
    title: "UX/UI design",
    description:
      "Join our UX/UI Design Workshop to kickstart your design journey. We'll analyze user experiences, pinpoint issues, and create a strategic vision for an engaging interface that aligns with business goals and user needs.",
    emblemPoints: "110,40 170,40 170,90 110,90",
  },
  {
    index: "03",
    title: "Branding",
    description:
      "By partnering with us for your branding needs, you receive a step-by-step, personalized experience that results in a compelling and memorable brand identity, ready to make its mark in your industry and beyond.",
    emblemPoints: "140,40 175,75 155,110 125,110 105,75",
  },
  {
    index: "04",
    title: "Webflow maintenance & support",
    description:
      "In the last phase, Webflow Site Launch & Training, we make your site live and provide comprehensive training. This includes a CMS walkthrough, content management best practices, and tips for ongoing maintenance.",
    emblemPoints: "140,40 175,65 165,100 115,100 105,65",
  },
];

function ServiceCard({
  service,
  cardIndex,
}: {
  service: (typeof SERVICES)[0];
  cardIndex: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      if (!svgRef.current) return;

      const paths = svgRef.current.querySelectorAll<SVGGeometryElement>("path, rect, line, polygon, circle");

      paths.forEach((path) => {
        let length = 0;
        try {
          length = path.getTotalLength ? path.getTotalLength() : 0;
        } catch {
          length = 200;
        }
        if (length === 0) length = 200;

        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });

        gsap.to(path, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 85%",
            end: "top 25%",
            scrub: 0.8,
          },
        });
      });
    },
    { scope: cardRef }
  );

  return (
    <div
      ref={cardRef}
      className="relative w-full px-8 py-10 overflow-hidden"
      style={{
        position: "sticky",
        top: `calc(12vh + ${cardIndex * 32}px)`,
        backgroundColor: "var(--c-surface)",
        border: "1px solid var(--c-border)",
        marginBottom: "1px",
        zIndex: cardIndex + 1,
      }}
    >
      {/* Blueprint SVG Overlay */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 560 200"
        preserveAspectRatio="none"
        fill="none"
        style={{ opacity: 0.35 }}
      >
        {/* Outer border */}
        <rect
          x="4"
          y="4"
          width="552"
          height="192"
          stroke="var(--c-accent)"
          strokeWidth="0.5"
        />
        {/* Corner crosshairs */}
        <line x1="4" y1="20" x2="4" y2="4" stroke="var(--c-accent)" strokeWidth="0.8" />
        <line x1="4" y1="4" x2="20" y2="4" stroke="var(--c-accent)" strokeWidth="0.8" />
        <line x1="540" y1="4" x2="556" y2="4" stroke="var(--c-accent)" strokeWidth="0.8" />
        <line x1="556" y1="4" x2="556" y2="20" stroke="var(--c-accent)" strokeWidth="0.8" />
        <line x1="4" y1="180" x2="4" y2="196" stroke="var(--c-accent)" strokeWidth="0.8" />
        <line x1="4" y1="196" x2="20" y2="196" stroke="var(--c-accent)" strokeWidth="0.8" />
        <line x1="540" y1="196" x2="556" y2="196" stroke="var(--c-accent)" strokeWidth="0.8" />
        <line x1="556" y1="180" x2="556" y2="196" stroke="var(--c-accent)" strokeWidth="0.8" />
        {/* Divider */}
        <line x1="200" y1="4" x2="200" y2="196" stroke="var(--c-accent)" strokeWidth="0.4" />
        {/* Unique emblem per card */}
        <polygon
          points={service.emblemPoints}
          stroke="var(--c-accent)"
          strokeWidth="0.6"
        />
        <circle cx="140" cy="100" r="50" stroke="var(--c-accent)" strokeWidth="0.4" />
      </svg>

      {/* Card content */}
      <div className="relative z-10 flex flex-col md:flex-row gap-8">
        {/* Index + title */}
        <div className="flex-shrink-0 w-full md:w-52">
          <span
            className="text-[10px] uppercase tracking-[0.18em] block mb-2"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--c-accent)" }}
          >
            {service.index}
          </span>
          <h3
            className="text-[clamp(1.1rem,2.2vw,1.6rem)] font-light leading-[1.15] tracking-[-0.02em]"
            style={{
              fontFamily: "var(--font-display, sans-serif)",
              color: "var(--c-text)",
            }}
          >
            {service.title}
          </h3>
        </div>

        {/* Description */}
        <div className="flex-1">
          <p
            className="text-[clamp(0.85rem,1.4vw,1rem)] leading-relaxed"
            style={{ color: "var(--c-muted)" }}
          >
            {service.description}
          </p>
          <button
            className="mt-6 text-[10px] uppercase tracking-[0.18em] flex items-center gap-3 transition-colors"
            style={{
              fontFamily: "var(--font-mono, monospace)",
              color: "var(--c-dim)",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--c-accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--c-dim)")}
          >
            more information <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      id="services"
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
          03 / SERVICES
        </span>
        <div className="flex-1 h-px" style={{ backgroundColor: "var(--c-border)" }} />
      </div>

      {/* Stacked sticky cards */}
      <div className="flex flex-col" style={{ gap: "1px" }}>
        {SERVICES.map((service, i) => (
          <ServiceCard key={service.index} service={service} cardIndex={i} />
        ))}
      </div>
    </section>
  );
}
