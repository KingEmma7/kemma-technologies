"use client";

import { useRef, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { ParticleField } from "./ParticleField";

export function HeroCanvas() {
  const mouse = useRef<[number, number]>([0, 0]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    mouse.current = [
      (e.clientX / window.innerWidth - 0.5) * 2,
      (e.clientY / window.innerHeight - 0.5) * -2,
    ];
  }, []);

  return (
    <div
      className="absolute inset-0 z-0"
      onMouseMove={handleMouseMove}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.5} />
        <ParticleField mouse={mouse} />
      </Canvas>
    </div>
  );
}
