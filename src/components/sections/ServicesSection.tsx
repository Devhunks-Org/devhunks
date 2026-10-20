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
    bg: "#ffffff",
    rotate: -2.2,
  },
  {
    index: "02",
    title: "UX/UI design",
    description:
      "Join our UX/UI Design Workshop to kickstart your design journey. We'll analyze user experiences, pinpoint issues, and create a strategic vision for an engaging interface that aligns with business goals and user needs.",
    bg: "#f1f1f3",
    rotate: -0.3,
  },
  {
    index: "03",
    title: "Branding",
    description:
      "By partnering with us for your branding needs, you receive a step-by-step, personalized experience that results in a compelling and memorable brand identity, ready to make its mark in your industry and beyond.",
    bg: "#e8e9eb",
    rotate: 1.7,
  },
  {
    index: "04",
    title: "Webflow maintenance & support",
    description:
      "In the last phase, Webflow Site Launch & Training, we make your site live and provide comprehensive training. This includes a CMS walkthrough, content management best practices, and tips for ongoing maintenance.",
    bg: "#dbdcde",
    rotate: 3.6,
  },
];

/** Thin line-art per service, drawn in the card's right half */
function ServiceArt({ index }: { index: number }) {
  const stroke = "#b9bcc2";
  const node = (x: number, y: number) => (
    <rect key={`${x}-${y}`} x={x - 3.5} y={y - 3.5} width="7" height="7" fill="none" stroke={stroke} />
  );

  return (
    <svg viewBox="0 0 420 300" className="w-full h-full" fill="none" stroke={stroke} strokeWidth="1" aria-hidden="true">
      {index === 0 && (
        <>
          <path d="M 120 40 H 240 M 120 40 V 120 H 60 M 240 40 V 200 M 120 120 H 300 V 260 M 180 120 V 260 H 360" />
          <path d="M 0 250 H 420" strokeDasharray="3 5" />
          {[
            [120, 40], [240, 40], [60, 120], [120, 120], [180, 120], [240, 120], [300, 120],
            [240, 200], [300, 200], [360, 200], [180, 260], [300, 260], [360, 260], [60, 200], [120, 200],
          ].map(([x, y]) => node(x, y))}
        </>
      )}
      {index === 1 && (
        <>
          <path d="M 0 60 H 420 M 0 200 H 420 M 110 0 V 300 M 300 0 V 300" />
          <rect x="140" y="30" width="70" height="120" rx="6" />
          <circle cx="175" cy="70" r="12" />
          <path d="M 152 110 H 198 M 152 124 H 186" />
          <rect x="40" y="150" width="70" height="120" rx="6" />
          <circle cx="75" cy="190" r="12" />
          <rect x="240" y="170" width="70" height="120" rx="6" />
          <path d="M 252 200 H 298 M 252 214 H 286" />
          <path d="M 210 90 C 260 90 230 190 240 220" strokeDasharray="3 5" />
        </>
      )}
      {index === 2 && (
        <>
          <circle cx="210" cy="150" r="110" />
          <circle cx="210" cy="150" r="55" />
          <path d="M 100 150 H 320 M 210 40 V 260 M 132 72 L 288 228 M 288 72 L 132 228" strokeDasharray="3 5" />
          {[[210, 40], [320, 150], [210, 260], [100, 150]].map(([x, y]) => node(x, y))}
        </>
      )}
      {index === 3 && (
        <>
          <ellipse cx="220" cy="150" rx="190" ry="60" transform="rotate(-18 220 150)" />
          <circle cx="250" cy="140" r="70" fill="#d2d3d6" fillOpacity="0.4" />
          <circle cx="250" cy="140" r="3" fill={stroke} />
          <path d="M 30 260 H 400" strokeDasharray="3 5" />
        </>
      )}
    </svg>
  );
}

export default function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-service-card]", sectionRef.current);
      const pin = pinRef.current;
      if (!cards.length || !pin) return;

      // Parked just below the panel's bottom edge with the top ~3rem peeking out, so the first card
      // is already visible while the section scrolls in and simply keeps rising once it pins.
      const parkedY = () => {
        const stack = cards[0].offsetParent as HTMLElement;
        const peek = parseFloat(getComputedStyle(document.documentElement).fontSize) * 2.6;
        return pin.offsetHeight - stack.offsetTop - peek;
      };

      gsap.set(cards, { y: parkedY, rotate: 0 });
      // Only the card whose turn it is shows while parked (avoids a mixed stack peeking out)
      gsap.set(cards.slice(1), { autoAlpha: 0 });

      const frame = () => parseFloat(getComputedStyle(document.documentElement).fontSize) * 1.25;

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: pin,
          start: () => `top top+=${frame()}`,
          end: () => `+=${window.innerHeight * 2.4}`,
          scrub: 0.6,
          pin,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Reference rhythm: each card rises over ~19% of the pin, a new one every ~25%
      const step = 0.254;
      const rise = 0.19;
      cards.forEach((card, i) => {
        const at = i * step;
        if (i > 0) tl.set(card, { autoAlpha: 1 }, at);
        tl.fromTo(
          card,
          { y: parkedY, rotate: 0 },
          { y: 0, rotate: SERVICES[i].rotate, duration: rise, immediateRender: false },
          at
        );
      });
      // Release right after the last card lands
      tl.to({}, { duration: 1 - (3 * step + rise) });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} id="services" className="relative w-full bg-white px-2.5 sm:px-5 pt-[5rem] pb-5">
      <div
        ref={pinRef}
        className="relative w-full h-[calc(100svh-20px)] sm:h-[calc(100svh-2.5rem)] min-h-[600px] bg-[#161d25] rounded-[24px] sm:rounded-[32px] overflow-hidden p-5 sm:p-10"
      >
        <h2 className="font-tight text-center uppercase text-white font-medium leading-none tracking-[-0.02em] text-[clamp(3rem,7.9vw,8rem)]">
          Services
        </h2>

        <div className="absolute left-1/2 -translate-x-1/2 top-[calc(20px+clamp(3rem,7.9vw,8rem)+48px)] sm:top-[calc(40px+clamp(3rem,7.9vw,8rem)+clamp(40px,7.5vw,108px))] w-[calc(100%-24px)] sm:w-[min(960px,calc(100%-80px))] h-[min(480px,calc(100%-170px))] sm:h-[min(480px,calc(100%-280px))]">
          {SERVICES.map((s, i) => (
            <article
              key={s.index}
              data-service-card
              className="absolute inset-0 rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 flex flex-col overflow-hidden will-change-transform"
              style={{ backgroundColor: s.bg, zIndex: i + 1 }}
            >
              <div className="hidden md:block absolute right-6 top-8 bottom-8 w-[44%] pointer-events-none">
                <ServiceArt index={i} />
              </div>

              <span className="font-tight text-[12px] font-medium tracking-[0.06em] text-[#c4002e]">{s.index}</span>
              <h3 className="font-tight mt-4 sm:mt-5 text-[26px] sm:text-[40px] font-medium leading-[1.1] text-[#161d25] md:max-w-[55%]">
                {s.title}
              </h3>
              <p className="font-tight relative mt-4 sm:mt-5 max-w-[632px] md:max-w-[55%] text-[14px] sm:text-[16px] leading-[1.3] text-[#2d343b]">
                {s.description}
              </p>
              <a
                href="#contact"
                className="font-tight relative mt-auto self-start inline-flex items-center h-10 px-5 rounded-full bg-[#161d25] text-white text-[16px] sm:text-[18px] hover:bg-[#2d343b] transition-colors"
              >
                more information
                <span className="sr-only"> about {s.title}</span>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
