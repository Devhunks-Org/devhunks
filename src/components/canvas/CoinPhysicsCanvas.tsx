"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";

interface CoinColor {
  bg: string;
  textColor: string;
  borderColor: string;
  shadowColor: string;
}

const COIN_PALETTES: CoinColor[] = [
  // White coin
  { bg: "#FFFFFF", textColor: "#161D25", borderColor: "#E2E8F0", shadowColor: "rgba(0,0,0,0.18)" },
  // Blush pink coin
  { bg: "#F8B4C4", textColor: "#881337", borderColor: "#F472B6", shadowColor: "rgba(0,0,0,0.15)" },
  // Rose / Coral coin
  { bg: "#E5536D", textColor: "#FFFFFF", borderColor: "#BE123C", shadowColor: "rgba(0,0,0,0.2)" },
  // Silver / Grey coin
  { bg: "#94A3B8", textColor: "#0F172A", borderColor: "#64748B", shadowColor: "rgba(0,0,0,0.18)" },
  // Dark charcoal coin
  { bg: "#1E293B", textColor: "#FFFFFF", borderColor: "#0F172A", shadowColor: "rgba(0,0,0,0.25)" },
  // Light grey coin
  { bg: "#E2E8F0", textColor: "#334155", borderColor: "#CBD5E1", shadowColor: "rgba(0,0,0,0.15)" },
];

interface CoinPhysicsCanvasProps {
  floorOffset?: number; // Distance in pixels from bottom where the baseline is
}

export default function CoinPhysicsCanvas({ floorOffset = 70 }: CoinPhysicsCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let width = container.clientWidth;
    let height = container.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Matter.js setup
    const { Engine, World, Bodies, Body, Vector } = Matter;

    const engine = Engine.create({
      gravity: { x: 0, y: 1.15, scale: 0.001 },
    });

    const world = engine.world;

    // Walls
    const wallThickness = 120;
    const floorY = height - floorOffset;

    let floor = Bodies.rectangle(width / 2, floorY + wallThickness / 2, width * 2, wallThickness, {
      isStatic: true,
      friction: 0.4,
      restitution: 0.45,
    });

    let leftWall = Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height * 2, {
      isStatic: true,
      friction: 0.2,
      restitution: 0.4,
    });

    let rightWall = Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 2, {
      isStatic: true,
      friction: 0.2,
      restitution: 0.4,
    });

    World.add(world, [floor, leftWall, rightWall]);

    // Create coins
    const coinRadius = width < 768 ? 19 : 24;
    const COIN_COUNT = width < 768 ? 18 : 28;

    const coins: { body: Matter.Body; palette: CoinColor; radius: number }[] = [];

    for (let i = 0; i < COIN_COUNT; i++) {
      const palette = COIN_PALETTES[i % COIN_PALETTES.length];
      // Distribute coins with some resting on floor, some dropping from above
      const startX = (width * 0.35) + (Math.random() * (width * 0.6));
      const startY = i < 16 ? (floorY - 20 - (i * 12)) : (floorY - 200 - Math.random() * 350);

      const body = Bodies.circle(startX, startY, coinRadius, {
        restitution: 0.5,
        friction: 0.35,
        frictionAir: 0.015,
        density: 0.002,
        angle: Math.random() * Math.PI * 2,
      });

      coins.push({ body, palette, radius: coinRadius });
      World.add(world, body);
    }

    // Mouse interaction - Repulsor
    const mousePos = { x: -1000, y: -1000 };
    const prevMousePos = { x: -1000, y: -1000 };
    let isHovering = false;

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      prevMousePos.x = mousePos.x;
      prevMousePos.y = mousePos.y;
      mousePos.x = clientX - rect.left;
      mousePos.y = clientY - rect.top;
      isHovering = true;
    };

    const onPointerLeave = () => {
      isHovering = false;
      mousePos.x = -1000;
      mousePos.y = -1000;
    };

    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("touchmove", onPointerMove);
    canvas.addEventListener("mouseleave", onPointerLeave);

    // Apply repulsion force inside game loop
    const repulseRadius = width < 768 ? 70 : 95;
    const repulseForce = 0.035;

    let animationId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const delta = Math.min(currentTime - lastTime, 32);
      lastTime = currentTime;

      Engine.update(engine, delta);

      // Repulsion logic
      if (isHovering && mousePos.x > 0 && mousePos.y > 0) {
        const mouseVelocityX = (mousePos.x - prevMousePos.x) * 0.08;
        const mouseVelocityY = (mousePos.y - prevMousePos.y) * 0.08;

        coins.forEach(({ body, radius }) => {
          const dx = body.position.x - mousePos.x;
          const dy = body.position.y - mousePos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < repulseRadius + radius) {
            const overlap = (repulseRadius + radius) - dist;
            const forceMag = (overlap / repulseRadius) * repulseForce;
            const angle = Math.atan2(dy, dx);

            Body.applyForce(body, body.position, {
              x: Math.cos(angle) * forceMag + mouseVelocityX * 0.001,
              y: Math.sin(angle) * forceMag + mouseVelocityY * 0.001 - 0.001,
            });

            // Add torque / spin
            Body.setAngularVelocity(body, body.angularVelocity + (Math.random() - 0.5) * 0.05);
          }
        });
      }

      // Render
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Render coins
      coins.forEach(({ body, palette, radius }) => {
        const { x, y } = body.position;
        const angle = body.angle;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Drop shadow
        ctx.shadowColor = palette.shadowColor;
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;

        // Circle fill
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fillStyle = palette.bg;
        ctx.fill();

        // Stroke border
        ctx.shadowColor = "transparent";
        ctx.lineWidth = 1;
        ctx.strokeStyle = palette.borderColor;
        ctx.stroke();

        // Embossed inner bevel ring
        ctx.beginPath();
        ctx.arc(0, 0, radius - 3.5, 0, Math.PI * 2);
        ctx.lineWidth = 0.75;
        ctx.strokeStyle = "rgba(255,255,255,0.35)";
        ctx.stroke();

        // Embossed logo "a." in center
        ctx.fillStyle = palette.textColor;
        ctx.font = `bold ${Math.round(radius * 1.05)}px var(--font-display, "Syne", sans-serif)`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("a.", 0, 1);

        ctx.restore();
      });

      ctx.restore();

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      const currentDpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * currentDpr;
      canvas.height = height * currentDpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const newFloorY = height - floorOffset;
      Body.setPosition(floor, { x: width / 2, y: newFloorY + wallThickness / 2 });
      Body.setPosition(rightWall, { x: width + wallThickness / 2, y: height / 2 });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mouseleave", onPointerLeave);
      World.clear(world, false);
      Engine.clear(engine);
    };
  }, [floorOffset]);

  return (
    <div ref={containerRef} className="absolute inset-0 z-20 pointer-events-auto">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
