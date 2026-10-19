"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import {
  Physics,
  RigidBody,
  CuboidCollider,
  BallCollider,
  InstancedRigidBodies,
  type InstancedRigidBodyProps,
  type RapierRigidBody,
} from "@react-three/rapier";
import * as THREE from "three";

const COIN_COUNT = 65;

function Coins() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const instances = useMemo<InstancedRigidBodyProps[]>(() => {
    return Array.from({ length: COIN_COUNT }, (_, i) => ({
      key: `coin-${i}`,
      position: [
        (Math.random() - 0.5) * 6,
        4 + Math.random() * 8,
        (Math.random() - 0.5) * 1.2,
      ] as [number, number, number],
      rotation: [
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
      ] as [number, number, number],
    }));
  }, []);

  return (
    <InstancedRigidBodies
      instances={instances}
      colliders="hull"
      restitution={0.25}
      friction={0.6}
    >
      <instancedMesh ref={meshRef} args={[undefined, undefined, COIN_COUNT]} castShadow>
        <cylinderGeometry args={[0.55, 0.55, 0.12, 32]} />
        <meshStandardMaterial
          color="#18181b"
          metalness={0.92}
          roughness={0.18}
        />
      </instancedMesh>
    </InstancedRigidBodies>
  );
}

function MouseRepulsor() {
  const repulsorRef = useRef<RapierRigidBody>(null);
  const { viewport, pointer } = useThree();

  useFrame(() => {
    if (!repulsorRef.current) return;
    const x = (pointer.x * viewport.width) / 2;
    const y = (pointer.y * viewport.height) / 2;
    repulsorRef.current.setNextKinematicTranslation({ x, y: y - 1.5, z: 0 });
  });

  return (
    <RigidBody ref={repulsorRef} type="kinematicPosition" colliders={false}>
      <BallCollider args={[1.2]} />
    </RigidBody>
  );
}

function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight
        position={[2, 4, 2]}
        color="#EF4444"
        intensity={40}
        distance={12}
      />
      <directionalLight
        position={[-4, 6, -2]}
        color="#60a5fa"
        intensity={1.5}
      />
      <Environment preset="city" />

      <Physics gravity={[0, -9.81, 0]}>
        {/* Coins */}
        <Coins />

        {/* Mouse repulsor */}
        <MouseRepulsor />

        {/* Invisible boundaries */}
        {/* Floor */}
        <CuboidCollider args={[12, 0.1, 4]} position={[0, -3.2, 0]} />
        {/* Left wall */}
        <CuboidCollider args={[0.1, 10, 4]} position={[-5.5, 0, 0]} />
        {/* Right wall */}
        <CuboidCollider args={[0.1, 10, 4]} position={[5.5, 0, 0]} />
        {/* Front glass */}
        <CuboidCollider args={[12, 10, 0.1]} position={[0, 0, 1.8]} />
        {/* Back glass */}
        <CuboidCollider args={[12, 10, 0.1]} position={[0, 0, -1.8]} />
      </Physics>
    </>
  );
}

interface CoinPileCanvasProps {
  isInView?: boolean;
}

export default function CoinPileCanvas({ isInView = true }: CoinPileCanvasProps) {
  return (
    <Canvas
      frameloop={isInView ? "always" : "never"}
      camera={{ position: [0, 1.5, 8], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <Scene />
    </Canvas>
  );
}
