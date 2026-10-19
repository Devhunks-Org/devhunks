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
  // Crisp White
  { bg: "#FFFFFF", textColor: "#18181B", borderColor: "#E4E4E7", shadowColor: "rgba(0,0,0,0.22)" },
  // Blush Pink
  { bg: "#FBCFE8", textColor: "#9D174D", borderColor: "#F472B6", shadowColor: "rgba(0,0,0,0.18)" },
  // Soft Coral / Rose
  { bg: "#E54B64", textColor: "#FFFFFF", borderColor: "#BE123C", shadowColor: "rgba(0,0,0,0.22)" },
  // Slate Grey
  { bg: "#94A3B8", textColor: "#0F172A", borderColor: "#64748B", shadowColor: "rgba(0,0,0,0.2)" },
  // Deep Charcoal / Onyx
  { bg: "#18181B", textColor: "#FFFFFF", borderColor: "#09090B", shadowColor: "rgba(0,0,0,0.3)" },
  // Pale Silver
  { bg: "#E2E8F0", textColor: "#334155", borderColor: "#CBD5E1", shadowColor: "rgba(0,0,0,0.18)" },
  // Pure White 2
  { bg: "#FFFFFF", textColor: "#0F172A", borderColor: "#E2E8F0", shadowColor: "rgba(0,0,0,0.22)" },
];

interface CoinPhysicsCanvasProps {
  floorOffset?: number; // Distance in pixels from bottom where the baseline hairline is
}

export default function CoinPhysicsCanvas({ floorOffset = 85 }: CoinPhysicsCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let width = container.clientWidth;
    let height = container.clientHeight;
    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Matter.js setup
    const { Engine, World, Bodies, Body, Mouse, MouseConstraint } = Matter;

    const engine = Engine.create({
      gravity: { x: 0, y: 1.05, scale: 0.001 },
    });

    const world = engine.world;

    // Boundary walls
    const wallThickness = 160;
    const floorY = height - floorOffset;

    let floor = Bodies.rectangle(width / 2, floorY + wallThickness / 2, width * 3, wallThickness, {
      isStatic: true,
      friction: 0.5,
      restitution: 0.55,
    });

    let leftWall = Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height * 4, {
      isStatic: true,
      friction: 0.2,
      restitution: 0.5,
    });

    let rightWall = Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 4, {
      isStatic: true,
      friction: 0.2,
      restitution: 0.5,
    });

    World.add(world, [floor, leftWall, rightWall]);

    // Coin dimensions
    const isMobile = width < 768;
    const coinRadius = isMobile ? 20 : 26;
    const COIN_COUNT = isMobile ? 18 : 26;

    const coins: { body: Matter.Body; palette: CoinColor; radius: number }[] = [];

    // Specific distribution matching Awake agency:
    // Some on left (x: 40px to 160px), one at ~35%, rest clustering along right (50% to 95%)
    for (let i = 0; i < COIN_COUNT; i++) {
      const palette = COIN_PALETTES[i % COIN_PALETTES.length];
      let startX: number;
      let startY: number;

      if (i === 0) {
        // Floating high near "WE"
        startX = width * 0.22;
        startY = height * 0.28;
      } else if (i === 1) {
        startX = width * 0.05;
        startY = floorY - coinRadius - 10;
      } else if (i === 2) {
        startX = width * 0.09;
        startY = floorY - coinRadius - 10;
      } else if (i === 3) {
        startX = width * 0.13;
        startY = floorY - coinRadius - 10;
      } else if (i === 4) {
        startX = width * 0.36;
        startY = floorY - coinRadius - 10;
      } else if (i === 5) {
        // Floating near "BUILD PEOPLE"
        startX = width * 0.78;
        startY = height * 0.58;
      } else if (i === 6) {
        startX = width * 0.83;
        startY = height * 0.58;
      } else if (i === 7) {
        startX = width * 0.90;
        startY = height * 0.60;
      } else {
        // Cluster across bottom right baseline (50% to 96%)
        const t = (i - 8) / (COIN_COUNT - 8);
        startX = width * (0.50 + t * 0.45) + (Math.random() - 0.5) * 15;
        startY = floorY - coinRadius - 5 - (Math.random() * 80);
      }

      const body = Bodies.circle(startX, startY, coinRadius, {
        restitution: 0.58,
        friction: 0.4,
        frictionAir: 0.015,
        density: 0.002,
        angle: (Math.random() - 0.5) * 0.5,
      });

      coins.push({ body, palette, radius: coinRadius });
      World.add(world, body);
    }

    // Mouse Constraint for direct dragging
    const mouse = Mouse.create(canvas);
    // Adjust mouse pixel ratio
    mouse.pixelRatio = dpr;

    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      },
    });

    World.add(world, mouseConstraint);

    // Dynamic mouse hover repulsion
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
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    canvas.addEventListener("mouseleave", onPointerLeave);

    const repulseRadius = isMobile ? 75 : 105;
    const repulseForce = 0.038;

    let animationId: number;

    const loop = () => {
      // Fixed 60fps step to prevent matter-js delta warnings and ensure buttery physics
      Engine.update(engine, 1000 / 60);

      // Repulsion when cursor is near
      if (isHovering && mousePos.x > 0 && mousePos.y > 0) {
        const mouseVelocityX = (mousePos.x - prevMousePos.x) * 0.09;
        const mouseVelocityY = (mousePos.y - prevMousePos.y) * 0.09;

        coins.forEach(({ body, radius }) => {
          // Skip repulsion on body currently held by mouse constraint
          if (mouseConstraint.body === body) return;

          const dx = body.position.x - mousePos.x;
          const dy = body.position.y - mousePos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < repulseRadius + radius) {
            const overlap = repulseRadius + radius - dist;
            const forceMag = (overlap / repulseRadius) * repulseForce;
            const angle = Math.atan2(dy, dx);

            Body.applyForce(body, body.position, {
              x: Math.cos(angle) * forceMag + mouseVelocityX * 0.0012,
              y: Math.sin(angle) * forceMag + mouseVelocityY * 0.0012 - 0.0015,
            });

            Body.setAngularVelocity(body, body.angularVelocity + (Math.random() - 0.5) * 0.04);
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

        // Soft drop shadow
        ctx.shadowColor = palette.shadowColor;
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 5;

        // Base circle
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fillStyle = palette.bg;
        ctx.fill();

        // Stroke border
        ctx.shadowColor = "transparent";
        ctx.lineWidth = 1;
        ctx.strokeStyle = palette.borderColor;
        ctx.stroke();

        // Embossed inner highlight bevel ring
        ctx.beginPath();
        ctx.arc(0, 0, radius - 3.5, 0, Math.PI * 2);
        ctx.lineWidth = 0.75;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.stroke();

        // Embossed logo "a." in center
        ctx.fillStyle = palette.textColor;
        ctx.font = `bold ${Math.round(radius * 1.08)}px var(--font-grotesque, "Plus Jakarta Sans", sans-serif)`;
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
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />
    </div>
  );
}
