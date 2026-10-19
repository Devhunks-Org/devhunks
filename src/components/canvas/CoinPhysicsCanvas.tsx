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
}

interface Coin {
  body: Matter.Body;
  palette: CoinColor;
  radius: number;
}

export default function CoinPhysicsCanvas({ floorOffset = 116, dropKey = 0, paused = false }: CoinPhysicsCanvasProps) {
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

    const { Engine, Composite, Bodies, Body } = Matter;
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

    const engine = Engine.create({ gravity: { x: 0, y: 1, scale: 0.0015 } });
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

    let coins: Coin[] = [];

    const coinRadius = () => (width < 768 ? 30 : Math.max(22, Math.min(36, width * 0.0215)));

    const drop = () => {
      coins.forEach((c) => Composite.remove(world, c.body));
      coins = [];

      const radius = coinRadius();
      const count = width < 768 ? 9 : Math.min(36, Math.round(width / 48));

      for (let i = 0; i < count; i++) {
        const x = radius + Math.random() * (width - radius * 2);
        const y = -radius - Math.random() * height * 0.9;
        const body = Bodies.circle(x, y, radius, {
          restitution: 0.35,
          friction: 0.08,
          frictionAir: 0.012,
          density: 0.0025,
        });
        Body.setAngle(body, Math.random() * Math.PI * 2);
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.15);
        coins.push({ body, palette: COIN_PALETTES[i % COIN_PALETTES.length], radius });
      }
      Composite.add(
        world,
        coins.map((c) => c.body)
      );
    };
    dropRef.current = drop;

    // Cursor repulsion (canvas itself stays pointer-transparent so the headline still gets hover)
    const mouse = { x: -9999, y: -9999, px: -9999, py: -9999 };
    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.px = mouse.x;
      mouse.py = mouse.y;
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onPointerLeave = () => {
      mouse.x = mouse.y = mouse.px = mouse.py = -9999;
    };
    window.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerleave", onPointerLeave);

    const drawCoin = ({ body, palette, radius }: Coin) => {
      ctx.save();
      ctx.translate(body.position.x, body.position.y);
      ctx.rotate(body.angle);

      // Drop shadow
      ctx.shadowColor = "rgba(60, 0, 15, 0.35)";
      ctx.shadowBlur = radius * 0.45;
      ctx.shadowOffsetY = radius * 0.18;
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

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (pausedRef.current) return;

      if (mouse.x > -9000) {
        const vx = (mouse.x - mouse.px) * 0.0006;
        const vy = (mouse.y - mouse.py) * 0.0006;
        coins.forEach(({ body, radius }) => {
          const dx = body.position.x - mouse.x;
          const dy = body.position.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          const reach = radius * 2.4;
          if (dist < reach && dist > 0.01) {
            const strength = ((reach - dist) / reach) * 0.012 * body.mass;
            Body.applyForce(body, body.position, {
              x: (dx / dist) * strength + vx * body.mass,
              y: (dy / dist) * strength + vy * body.mass - 0.002 * body.mass,
            });
          }
        });
        mouse.px = mouse.x;
        mouse.py = mouse.y;
      }

      Engine.update(engine, 1000 / 60);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      coins.forEach(drawCoin);
    };
    raf = requestAnimationFrame(loop);

    const onResize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      sizeCanvas();
      Body.setPosition(floor, { x: width / 2, y: height - floorOffset + wallThickness / 2 });
      Body.setPosition(rightWall, { x: width + wallThickness / 2, y: height / 2 });
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      dropRef.current = null;
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", onResize);
      Composite.clear(world, false);
      Engine.clear(engine);
    };
  }, [floorOffset]);

  useEffect(() => {
    if (dropKey > 0) dropRef.current?.();
  }, [dropKey, floorOffset]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
