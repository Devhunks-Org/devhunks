"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const OPTIONS = ["development", "web design", "branding"];
// Repeat the options so the column always overflows the band (looks endless)
const REPEATS = 7;
const ITEMS = Array.from({ length: OPTIONS.length * REPEATS }, (_, i) => OPTIONS[i % OPTIONS.length]);

export default function LeadSelectorSection() {
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  // Start in the middle copy so there is room to move both ways
  const [index, setIndex] = useState(OPTIONS.length * Math.floor(REPEATS / 2));
  const paused = useRef(false);

  const indexRef = useRef(index);

  const centreOf = (i: number) => {
    const item = itemRefs.current[i];
    return item ? item.offsetTop + item.offsetHeight / 2 : 0;
  };

  // Centre the active pill vertically
  useEffect(() => {
    indexRef.current = index;
    if (listRef.current) gsap.to(listRef.current, { y: -centreOf(index), duration: 0.7, ease: "power3.inOut" });
  }, [index]);

  // Gentle autoplay; before running out of items, jump (invisibly) back to the same label in the middle copy
  useEffect(() => {
    const id = setInterval(() => {
      if (paused.current || !listRef.current) return;
      let current = indexRef.current;
      if (current + 1 > ITEMS.length - OPTIONS.length * 2) {
        current -= OPTIONS.length * 2;
        gsap.set(listRef.current, { y: -centreOf(current) });
      }
      setIndex(current + 1);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  const selected = ITEMS[index];

  return (
    <section id="contact" className="relative w-full bg-white px-2.5 sm:px-5 pb-5">
      <div
        className="relative w-full h-[520px] sm:h-[619px] bg-[#ff003d] rounded-[24px] sm:rounded-[32px] overflow-hidden"
        onMouseEnter={() => (paused.current = true)}
        onMouseLeave={() => (paused.current = false)}
      >
        <div className="absolute inset-0 flex flex-col justify-between py-8 md:py-0 md:grid md:grid-cols-[1fr_auto_1fr] items-center px-6 md:px-[120px]">
          <p className="font-tight text-white font-medium leading-none tracking-[-0.02em] text-[clamp(2.5rem,7.9vw,7.2rem)] text-center md:text-left">
            I need
          </p>

          {/* Vertical pill carousel */}
          <div className="relative w-full md:w-auto h-[250px] md:h-0 overflow-hidden md:overflow-visible [mask-image:linear-gradient(transparent,black_28%,black_72%,transparent)] md:[mask-image:none]">
            <div className="absolute inset-x-0 top-1/2 md:top-0 flex justify-center">
            <ul ref={listRef} className="flex flex-col items-center gap-4 md:gap-6">
              {ITEMS.map((label, i) => {
                const active = i === index;
                return (
                  <li
                    key={i}
                    ref={(el) => {
                      itemRefs.current[i] = el;
                    }}
                  >
                    <button
                      onClick={() => setIndex(i)}
                      className={`font-tight lowercase font-medium whitespace-nowrap rounded-full border-2 border-white leading-none transition-colors duration-300 cursor-pointer text-[clamp(2.2rem,4.86vw,4.4rem)] pt-[0.16em] pb-[0.31em] px-[0.43em] ${
                        active ? "bg-white text-[#ff003d]" : "bg-transparent text-white hover:bg-white/10"
                      }`}
                    >
                      {label}
                    </button>
                  </li>
                );
              })}
            </ul>
            </div>
          </div>

          <div className="flex justify-center md:justify-end w-full">
            <a
              href={`mailto:contact@awakeagency.dev?subject=${encodeURIComponent(`I need ${selected}`)}`}
              className="font-tight inline-flex items-center gap-3 rounded-full bg-white text-[#ff003d] font-medium leading-none text-[clamp(1.8rem,3.2vw,3rem)] pt-[0.2em] pb-[0.3em] px-[0.45em] hover:bg-white/90 transition-colors"
            >
              next
              <svg width="0.7em" height="0.7em" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M2 10 H17 M11 4 L17 10 L11 16" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
