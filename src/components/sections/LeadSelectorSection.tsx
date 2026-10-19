"use client";

import { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const SCOPES = ["development", "web design", "branding"] as const;
type Scope = (typeof SCOPES)[number];

const MARQUEE_TEXT = "development — web design — branding — ";

function Marquee({ direction = 1, speed = 1 }: { direction?: 1 | -1; speed?: number }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!trackRef.current) return;
    const el = trackRef.current;
    const totalWidth = el.scrollWidth / 2;

    tweenRef.current = gsap.to(el, {
      x: direction > 0 ? -totalWidth : totalWidth,
      duration: 28 / speed,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: (x) => {
          const val = parseFloat(x);
          if (direction > 0 && val <= -totalWidth) return "0px";
          if (direction < 0 && val >= totalWidth) return "0px";
          return `${x}px`;
        },
      },
    });

    return () => {
      tweenRef.current?.kill();
    };
  }, [direction, speed]);

  // Expose speed update via imperative handle
  useEffect(() => {
    if (tweenRef.current) {
      tweenRef.current.timeScale(speed);
    }
  }, [speed]);

  const repeated = MARQUEE_TEXT.repeat(6);

  return (
    <div className="overflow-hidden w-full select-none" aria-hidden="true">
      <div ref={trackRef} className="flex whitespace-nowrap" style={{ willChange: "transform" }}>
        {[repeated, repeated].map((txt, idx) => (
          <span
            key={idx}
            className="text-[clamp(2.5rem,6vw,5rem)] font-light tracking-[-0.03em] pr-8"
            style={{
              fontFamily: "var(--font-display, sans-serif)",
              color: "transparent",
              WebkitTextStroke: "1px var(--c-border)",
              display: "block",
            }}
          >
            {txt}
          </span>
        ))}
      </div>
    </div>
  );
}

interface FormData {
  name: string;
  email: string;
  brief: string;
  budget: string;
}

export default function LeadSelectorSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [activeScope, setActiveScope] = useState<Scope>("development");
  const [marqueeSpeed, setMarqueeSpeed] = useState(1);
  const [step, setStep] = useState<1 | 2 | "done">(1);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    brief: "",
    budget: "$10k–$25k",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const handleScopeClick = (scope: Scope) => {
    setActiveScope(scope);
    setMarqueeSpeed(2.5);
    setTimeout(() => setMarqueeSpeed(1), 1200);
  };

  const validate = () => {
    const errs: Partial<FormData> = {};
    if (!formData.name.trim()) errs.name = "Required";
    if (!formData.email.includes("@")) errs.email = "Valid email required";
    if (!formData.brief.trim()) errs.brief = "Required";
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setStep("done");
  };

  // Expand form with GSAP
  useGSAP(
    () => {
      if (step === 2 && formRef.current) {
        gsap.fromTo(
          formRef.current,
          { height: 0, opacity: 0 },
          { height: "auto", opacity: 1, duration: 0.5, ease: "power2.out" }
        );
      }
    },
    { scope: sectionRef, dependencies: [step] }
  );

  return (
    <section
      ref={sectionRef}
      id="lead"
      className="w-full py-24 md:py-36 overflow-hidden"
      style={{ backgroundColor: "var(--c-bg)", borderTop: "1px solid var(--c-border)" }}
    >
      {/* Section header */}
      <div className="px-6 md:px-12 mb-12">
        <div
          className="flex items-center gap-4"
          style={{ borderTop: "1px solid var(--c-border)", paddingTop: "1.5rem" }}
        >
          <span
            className="text-[10px] uppercase tracking-[0.18em]"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--c-dim)" }}
          >
            04 / START A PROJECT
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: "var(--c-border)" }} />
        </div>
      </div>

      {/* Marquee row 1 */}
      <Marquee direction={1} speed={marqueeSpeed} />

      {/* Interactive configurator */}
      <div className="px-6 md:px-12 py-16 flex flex-col items-center gap-10">
        {step === 1 || step === 2 ? (
          <>
            {/* Scope selector */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-center">
              <span
                className="text-[clamp(1.2rem,3vw,2rem)] font-light"
                style={{ fontFamily: "var(--font-display, sans-serif)", color: "var(--c-muted)" }}
              >
                I need
              </span>
              {SCOPES.map((scope) => (
                <button
                  key={scope}
                  onClick={() => handleScopeClick(scope)}
                  className="px-5 py-2 transition-all duration-200 text-[clamp(1.2rem,3vw,2rem)] font-light"
                  style={{
                    fontFamily: "var(--font-display, sans-serif)",
                    backgroundColor: activeScope === scope ? "var(--c-accent)" : "transparent",
                    color: activeScope === scope ? "#fff" : "var(--c-dim)",
                    border: `1px solid ${activeScope === scope ? "var(--c-accent)" : "var(--c-border)"}`,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (activeScope !== scope) {
                      e.currentTarget.style.borderColor = "var(--c-muted)";
                      e.currentTarget.style.color = "var(--c-text)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeScope !== scope) {
                      e.currentTarget.style.borderColor = "var(--c-border)";
                      e.currentTarget.style.color = "var(--c-dim)";
                    }
                  }}
                >
                  {scope}
                </button>
              ))}
            </div>

            {/* Continue button */}
            {step === 1 && (
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] px-8 py-3 transition-all"
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  backgroundColor: "var(--c-accent)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--c-accent-hover, #DC2626)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--c-accent)")}
              >
                Continue →
              </button>
            )}

            {/* Step 2 form */}
            {step === 2 && (
              <div
                ref={formRef}
                className="w-full max-w-lg flex flex-col gap-4"
                style={{ overflow: "hidden" }}
              >
                {[
                  { key: "name", label: "Your name", type: "text" },
                  { key: "email", label: "Email address", type: "email" },
                ].map(({ key, label, type }) => (
                  <div key={key} className="flex flex-col gap-1">
                    <label
                      className="text-[10px] uppercase tracking-[0.15em]"
                      style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--c-dim)" }}
                    >
                      {label}
                    </label>
                    <input
                      type={type}
                      value={formData[key as keyof FormData]}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, [key]: e.target.value }))
                      }
                      className="w-full px-4 py-3 text-sm outline-none transition-colors"
                      style={{
                        backgroundColor: "var(--c-surface)",
                        border: errors[key as keyof FormData]
                          ? "1px solid var(--c-accent)"
                          : "1px solid var(--c-border)",
                        color: "var(--c-text)",
                        fontFamily: "var(--font-mono, monospace)",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--c-muted)")}
                      onBlur={(e) =>
                        (e.currentTarget.style.borderColor = errors[key as keyof FormData]
                          ? "var(--c-accent)"
                          : "var(--c-border)")
                      }
                    />
                    {errors[key as keyof FormData] && (
                      <span
                        className="text-[10px]"
                        style={{ color: "var(--c-accent)", fontFamily: "var(--font-mono, monospace)" }}
                      >
                        {errors[key as keyof FormData]}
                      </span>
                    )}
                  </div>
                ))}

                <div className="flex flex-col gap-1">
                  <label
                    className="text-[10px] uppercase tracking-[0.15em]"
                    style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--c-dim)" }}
                  >
                    Project brief
                  </label>
                  <textarea
                    rows={4}
                    value={formData.brief}
                    onChange={(e) => setFormData((prev) => ({ ...prev, brief: e.target.value }))}
                    className="w-full px-4 py-3 text-sm outline-none resize-none transition-colors"
                    style={{
                      backgroundColor: "var(--c-surface)",
                      border: errors.brief ? "1px solid var(--c-accent)" : "1px solid var(--c-border)",
                      color: "var(--c-text)",
                      fontFamily: "var(--font-mono, monospace)",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--c-muted)")}
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = errors.brief
                        ? "var(--c-accent)"
                        : "var(--c-border)")
                    }
                  />
                  {errors.brief && (
                    <span
                      className="text-[10px]"
                      style={{ color: "var(--c-accent)", fontFamily: "var(--font-mono, monospace)" }}
                    >
                      {errors.brief}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    className="text-[10px] uppercase tracking-[0.15em]"
                    style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--c-dim)" }}
                  >
                    Budget range
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {["$10k–$25k", "$25k–$50k", "$50k+"].map((budget) => (
                      <button
                        key={budget}
                        onClick={() => setFormData((prev) => ({ ...prev, budget }))}
                        className="px-4 py-2 text-[11px] uppercase tracking-[0.12em] transition-all"
                        style={{
                          fontFamily: "var(--font-mono, monospace)",
                          backgroundColor: formData.budget === budget ? "var(--c-accent)" : "transparent",
                          color: formData.budget === budget ? "#fff" : "var(--c-muted)",
                          border: `1px solid ${formData.budget === budget ? "var(--c-accent)" : "var(--c-border)"}`,
                          cursor: "pointer",
                        }}
                      >
                        {budget}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  className="mt-4 w-full py-4 text-[11px] uppercase tracking-[0.18em] transition-colors"
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    backgroundColor: "var(--c-accent)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#DC2626")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--c-accent)")}
                >
                  Send inquiry →
                </button>
              </div>
            )}
          </>
        ) : (
          /* Done state */
          <div className="flex flex-col items-center gap-4 py-12">
            <div
              className="w-12 h-12 flex items-center justify-center"
              style={{ border: "1px solid var(--c-accent)", color: "var(--c-accent)" }}
            >
              ✓
            </div>
            <p
              className="text-[clamp(1rem,2vw,1.4rem)] font-light tracking-[-0.02em]"
              style={{ fontFamily: "var(--font-display, sans-serif)", color: "var(--c-text)" }}
            >
              Inquiry received.
            </p>
            <p
              className="text-[11px] uppercase tracking-[0.12em]"
              style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--c-muted)" }}
            >
              We&apos;ll be in touch within 24 hours.
            </p>
          </div>
        )}
      </div>

      {/* Marquee row 2 */}
      <Marquee direction={-1} speed={marqueeSpeed} />
    </section>
  );
}
