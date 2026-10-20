"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";

interface CoinColor {
  bg: string;
  glyph: string;
  rim: string;
}

// Sampled from the reference: whites, greys, near-black and three pinks
const COIN_PALETTES: CoinColor[] = [
  { bg: "#f4f4f6", glyph: "#d9dbe0", rim: "#e4e5e9" },
  { bg: "#e2e4e9", glyph: "#c4c7ce", rim: "#d2d4da" },
  { bg: "#a9adb4", glyph: "#8d9199", rim: "#9a9ea6" },
  { bg: "#7e8289", glyph: "#64686f", rim: "#71757c" },
  { bg: "#252830", glyph: "#8f95a0", rim: "#1b1d23" },
  { bg: "#f6bccc", glyph: "#ee99b1", rim: "#efacbf" },
  { bg: "#f07c9d", glyph: "#e45983", rim: "#e96b90" },
  { bg: "#ea4b75", glyph: "#d72d5c", rim: "#e03c69" },
];

interface CoinPhysicsCanvasProps {
  /** Distance in px from the bottom of the container to the hairline the coins rest on */
  floorOffset?: number;
  /** Change this value to drop a fresh set of coins; 0 = no coins yet */
  dropKey?: number;
  /** Skip simulation + drawing (e.g. while the menu covers the hero) */
  paused?: boolean;
  /**
   * CSS selector (searched inside the enclosing <section>) for single-character elements that act as
   * solid obstacles. Each glyph gets a static body fitted to its real ink bounds.
   */
  solidSelector?: string;
}

interface Coin {
  body: Matter.Body;
  palette: CoinColor;
  radius: number;
  /** ms timestamp when it popped in (drives the spawn scale) */
  born: number;
  /** Passing through letters (while held, and after release until it's clear of them) */
  ghost: boolean;
}

interface Solid {
  el: HTMLElement;
  body: Matter.Body;
  w: number;
  h: number;
}

const SOLID_CATEGORY = 0x0002;
const ALL = 0xffffffff;
const SPAWN_MS = 280;
const POP_MS = 260;

const easeOutBack = (t: number) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);

export default function CoinPhysicsCanvas({
  floorOffset = 116,
  dropKey = 0,
  paused = false,
  solidSelector,
}: CoinPhysicsCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const dropRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { Engine, Composite, Bodies, Body, Constraint, Query } = Matter;
    let width = container.clientWidth;
    let height = container.clientHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const sizeCanvas = () => {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    sizeCanvas();

    // Extra iterations keep fast coins from tunnelling through thin letter stems
    const engine = Engine.create({
      gravity: { x: 0, y: 1, scale: 0.0015 },
      positionIterations: 10,
      velocityIterations: 8,
    });
    const world = engine.world;

    const wallThickness = 200;
    const floor = Bodies.rectangle(width / 2, height - floorOffset + wallThickness / 2, width * 3, wallThickness, {
      isStatic: true,
      friction: 0.6,
      restitution: 0.3,
    });
    const leftWall = Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height * 6, { isStatic: true });
    const rightWall = Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 6, {
      isStatic: true,
    });
    Composite.add(world, [floor, leftWall, rightWall]);

    /* ---------------- Solid text ---------------- */

    let solids: Solid[] = [];
    const measureCtx = document.createElement("canvas").getContext("2d");

    /** Ink box of a glyph element, in canvas coordinates (null when hidden / empty). */
    const glyphBox = (el: HTMLElement, origin: DOMRect) => {
      const r = el.getBoundingClientRect();
      const raw = el.dataset.char ?? el.textContent ?? "";
      if (!measureCtx || !raw.trim() || r.width === 0) return null;
      const cs = getComputedStyle(el);
      // Measure what is actually painted (the hero headline is uppercased in CSS)
      const ch =
        cs.textTransform === "uppercase" ? raw.toUpperCase() : cs.textTransform === "lowercase" ? raw.toLowerCase() : raw;
      measureCtx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const m = measureCtx.measureText(ch);
      const fontSize = parseFloat(cs.fontSize);
      const lineHeight = parseFloat(cs.lineHeight) || fontSize;
      // Baseline inside the line box (CSS centres ascent+descent in the line-height)
      const contentH = m.fontBoundingBoxAscent + m.fontBoundingBoxDescent;
      const baseline = r.top + (lineHeight - contentH) / 2 + m.fontBoundingBoxAscent;
      const top = baseline - m.actualBoundingBoxAscent;
      const bottom = baseline + m.actualBoundingBoxDescent;
      const left = r.left + (r.width - m.width) / 2 - m.actualBoundingBoxLeft;
      const right = r.left + (r.width - m.width) / 2 + m.actualBoundingBoxRight;
      return {
        x: (left + right) / 2 - origin.left,
        y: (top + bottom) / 2 - origin.top,
        w: Math.max(4, right - left),
        h: Math.max(4, bottom - top),
      };
    };

    const buildSolids = () => {
      solids.forEach((s) => Composite.remove(world, s.body));
      solids = [];
      if (!solidSelector) return;
      const scope = container.closest("section") ?? document;
      const origin = canvas.getBoundingClientRect();
      scope.querySelectorAll<HTMLElement>(solidSelector).forEach((el) => {
        const box = glyphBox(el, origin);
        if (!box) return;
        const body = Bodies.rectangle(box.x, box.y, box.w, box.h, {
          isStatic: true,
          friction: 0.4,
          restitution: 0.45,
          chamfer: { radius: Math.min(box.w, box.h) * 0.12 },
          collisionFilter: { category: SOLID_CATEGORY },
        });
        solids.push({ el, body, w: box.w, h: box.h });
      });
      Composite.add(
        world,
        solids.map((s) => s.body)
      );
    };

    // Letters move (intro rise, glitch nudges): follow them without rebuilding bodies
    const syncSolids = () => {
      if (!solids.length) return;
      const origin = canvas.getBoundingClientRect();
      for (const s of solids) {
        const box = glyphBox(s.el, origin);
        if (!box) continue;
        const { x, y } = s.body.position;
        if (Math.abs(box.x - x) > 0.5 || Math.abs(box.y - y) > 0.5) {
          Body.setPosition(s.body, { x: box.x, y: box.y });
        }
      }
    };

    buildSolids();
    // Fonts swap in after first paint — re-measure once they're ready
    document.fonts?.ready.then(buildSolids);

    /* ---------------- Coins ---------------- */

    let coins: Coin[] = [];
    const coinRadius = () => (width < 768 ? 30 : Math.max(22, Math.min(36, width * 0.0215)));

    // Coins pour in one by one from two spouts top-left and get flung to the right
    let queue = 0;
    let nextSpawnAt = 0;
    let spawned = 0;

    const spawnCoin = (now: number) => {
      const radius = coinRadius();
      const mobile = width < 768;
      const spout = spawned % 2 === 0 ? 0.09 : 0.18;
      const x = width * (mobile ? spout + 0.05 : spout) + (Math.random() - 0.5) * radius * 0.6;
      let y = height * 0.17 + (Math.random() - 0.5) * radius * 0.4;
      // Phones: the headline is small and high up — pour from just below it so it isn't buried
      if (mobile && solids.length) {
        const textBottom = Math.max(...solids.map((s) => s.body.bounds.max.y));
        y = Math.max(y, textBottom + radius * 1.6);
      }
      const body = Bodies.circle(x, y, radius, {
        restitution: 0.45,
        friction: 0.06,
        frictionAir: 0.008,
        density: 0.0025,
      });
      const push = mobile ? 4 + Math.random() * 3 : 7 + Math.random() * 6;
      Body.setVelocity(body, { x: push, y: -2 - Math.random() * 3 });
      Body.setAngle(body, Math.random() * Math.PI * 2);
      Body.setAngularVelocity(body, 0.05 + Math.random() * 0.12);
      coins.push({
        body,
        palette: COIN_PALETTES[Math.floor(Math.random() * COIN_PALETTES.length)],
        radius,
        born: now,
        ghost: false,
      });
      Composite.add(world, body);
      spawned++;
    };

    const drop = () => {
      coins.forEach((c) => Composite.remove(world, c.body));
      coins = [];
      buildSolids();
      queue = width < 768 ? 10 : Math.min(34, Math.round(width / 46));
      spawned = 0;
      nextSpawnAt = performance.now();
    };
    dropRef.current = drop;

    /* ---------------- Pointer: push, grab, drag, throw ---------------- */

    // Canvas stays pointer-transparent (headline keeps its hover), so listen on window
    const mouse = { x: -9999, y: -9999, px: -9999, py: -9999, inside: false };
    let grab: { constraint: Matter.Constraint; body: Matter.Body } | null = null;
    let cursor = "";

    const setCursor = (c: string) => {
      if (c === cursor) return;
      cursor = c;
      document.documentElement.style.cursor = c;
    };

    const toLocal = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
        inside: clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom,
      };
    };

    const setGhost = (body: Matter.Body, on: boolean) => {
      const coin = coins.find((c) => c.body === body);
      if (coin) coin.ghost = on;
      body.collisionFilter = { ...body.collisionFilter, mask: on ? ALL & ~SOLID_CATEGORY : ALL };
    };

    const coinAt = (x: number, y: number) =>
      Query.point(
        coins.map((c) => c.body),
        { x, y }
      )[0];

    const onPointerMove = (e: PointerEvent) => {
      const p = toLocal(e.clientX, e.clientY);
      mouse.x = p.x;
      mouse.y = p.y;
      mouse.inside = p.inside;
      if (grab) {
        grab.constraint.pointA = { x: p.x, y: p.y };
        return;
      }
      if (!pausedRef.current) setCursor(p.inside && coinAt(p.x, p.y) ? "grab" : "");
    };

    const onPointerDown = (e: PointerEvent) => {
      if (pausedRef.current || e.button !== 0) return;
      const p = toLocal(e.clientX, e.clientY);
      if (!p.inside) return;
      const body = coinAt(p.x, p.y);
      if (!body) return;
      e.preventDefault();
      const constraint = Constraint.create({
        pointA: { x: p.x, y: p.y },
        bodyB: body,
        pointB: { x: p.x - body.position.x, y: p.y - body.position.y },
        stiffness: 0.18,
        damping: 0.12,
        length: 0,
      });
      Composite.add(world, constraint);
      grab = { constraint, body };
      setGhost(body, true);
      mouse.x = mouse.px = p.x;
      mouse.y = mouse.py = p.y;
      setCursor("grabbing");
    };

    const release = () => {
      if (!grab) return;
      Composite.remove(world, grab.constraint);
      // Keep the throw, but not so fast it skips through letters
      const { body } = grab;
      const max = 38;
      const v = body.velocity;
      const speed = Math.hypot(v.x, v.y);
      if (speed > max) Body.setVelocity(body, { x: (v.x / speed) * max, y: (v.y / speed) * max });
      grab = null;
      setCursor("");
      // Swallow the click that follows a drag so dropping a coin on a link doesn't follow it
      const swallow = (ev: MouseEvent) => {
        ev.preventDefault();
        ev.stopPropagation();
      };
      window.addEventListener("click", swallow, { capture: true, once: true });
      // The click (if any) fires in the same task as pointerup; drop the guard right after
      window.setTimeout(() => window.removeEventListener("click", swallow, { capture: true }), 0);
    };

    const onPointerLeave = () => {
      mouse.x = mouse.y = mouse.px = mouse.py = -9999;
      mouse.inside = false;
      release();
    };

    // While dragging on touch, stop the page from scrolling
    const onTouchMove = (e: TouchEvent) => {
      if (grab) e.preventDefault();
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("pointerleave", onPointerLeave);

    /* ---------------- Render ---------------- */

    const drawCoin = ({ body, palette, radius, born }: Coin) => {
      const lifted = grab?.body === body;
      const pop = Math.min(1, (performance.now() - born) / POP_MS);
      const scale = (lifted ? 1.08 : 1) * (pop < 1 ? Math.max(0.01, easeOutBack(pop)) : 1);
      ctx.save();
      ctx.translate(body.position.x, body.position.y);
      ctx.rotate(body.angle);
      if (scale !== 1) ctx.scale(scale, scale);

      // Drop shadow (deeper while lifted)
      ctx.shadowColor = lifted ? "rgba(60, 0, 15, 0.45)" : "rgba(60, 0, 15, 0.35)";
      ctx.shadowBlur = radius * (lifted ? 0.9 : 0.45);
      ctx.shadowOffsetY = radius * (lifted ? 0.4 : 0.18);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = palette.rim;
      ctx.fill();
      ctx.shadowColor = "transparent";

      // Face with a soft top-left highlight
      const grad = ctx.createRadialGradient(-radius * 0.35, -radius * 0.4, radius * 0.1, 0, 0, radius);
      grad.addColorStop(0, "rgba(255,255,255,0.22)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.9, 0, Math.PI * 2);
      ctx.fillStyle = palette.bg;
      ctx.fill();
      ctx.fillStyle = grad;
      ctx.fill();

      // Embossed "d." mark
      ctx.fillStyle = palette.glyph;
      ctx.font = `500 ${Math.round(radius * 1.15)}px "Helvetica Neue", Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("d.", radius * 0.04, -radius * 0.06);

      ctx.restore();
    };

    // Skip all work while the hero is scrolled out of view (keeps scrolling frames free)
    let onScreen = true;
    const io = new IntersectionObserver(([entry]) => (onScreen = entry.isIntersecting), { rootMargin: "100px" });
    io.observe(container);

    let raf = 0;
    let frame = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (pausedRef.current || !onScreen) return;
      frame++;
      const now = performance.now();

      // One per tick at most, so a throttled/background tab never dumps a burst
      if (queue > 0 && now >= nextSpawnAt) {
        spawnCoin(now);
        queue--;
        nextSpawnAt = now + SPAWN_MS;
      }

      // A released ghost turns solid again once it no longer overlaps any letter
      if (frame % 2 === 0 && solids.length) {
        const solidBodies = solids.map((s) => s.body);
        for (const c of coins) {
          if (!c.ghost || c.body === grab?.body) continue;
          if (Query.collides(c.body, solidBodies).length === 0) setGhost(c.body, false);
        }
      }

      if (frame % 3 === 0) syncSolids();

      // A quick swipe flicks nearby coins; a slow approach leaves them so they can be grabbed
      if (mouse.inside && !grab) {
        const mvx = mouse.x - mouse.px;
        const mvy = mouse.y - mouse.py;
        const speed = Math.hypot(mvx, mvy);
        if (speed > 6) {
          coins.forEach(({ body, radius }) => {
            const dist = Math.hypot(body.position.x - mouse.x, body.position.y - mouse.y);
            const reach = radius * 1.8;
            if (dist < reach) {
              const k = ((reach - dist) / reach) * 0.00055 * body.mass;
              Body.applyForce(body, body.position, { x: mvx * k, y: mvy * k - 0.004 * body.mass });
            }
          });
        }
      }
      mouse.px = mouse.x;
      mouse.py = mouse.y;

      Engine.update(engine, 1000 / 60);

      // Speed cap: protects thin glyph stems from tunnelling
      for (const { body, radius } of coins) {
        if (body === grab?.body) continue;
        const v = body.velocity;
        const speed = Math.hypot(v.x, v.y);
        const max = radius * 0.9;
        if (speed > max) Body.setVelocity(body, { x: (v.x / speed) * max, y: (v.y / speed) * max });
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      // Draw the held coin last so it floats above the pile
      coins.forEach((c) => c.body !== grab?.body && drawCoin(c));
      const held = coins.find((c) => c.body === grab?.body);
      if (held) drawCoin(held);
    };
    raf = requestAnimationFrame(loop);

    const onResize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      sizeCanvas();
      Body.setPosition(floor, { x: width / 2, y: height - floorOffset + wallThickness / 2 });
      Body.setPosition(rightWall, { x: width + wallThickness / 2, y: height / 2 });
      buildSolids();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      dropRef.current = null;
      setCursor("");
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      window.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", onResize);
      Composite.clear(world, false);
      Engine.clear(engine);
    };
  }, [floorOffset, solidSelector]);

  useEffect(() => {
    if (dropKey > 0) dropRef.current?.();
  }, [dropKey, floorOffset, solidSelector]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
