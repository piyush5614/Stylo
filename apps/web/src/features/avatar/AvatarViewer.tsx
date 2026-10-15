import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Button } from "@/components/ui/Button";
import {
  BASELINE_MEASUREMENTS,
  computeAvatarScales,
  POPULAR_SKIN_TONES,
  type BodyMeasurements,
} from "./avatar-config";
import { ParametricHumanMesh } from "./ParametricHumanMesh";

import { ProceduralGarment, type GarmentSlotState } from "@/features/tryon/ProceduralGarment";

interface AvatarViewerProps {
  measurements?: Partial<BodyMeasurements>;
  selectedSkinTone?: string;
  onSkinToneChange?: (hex: string) => void;
  wornGarments?: GarmentSlotState[];
  className?: string;
}

interface SceneContentProps {
  scales: ReturnType<typeof computeAvatarScales>;
  skinTone: string;
  isBreathing: boolean;
  wornGarments?: GarmentSlotState[];
  onFpsUpdate?: (fps: number) => void;
}

const SceneContent: React.FC<SceneContentProps> = ({
  scales,
  skinTone,
  isBreathing,
  wornGarments,
  onFpsUpdate,
}) => {
  const breathingGroupRef = useRef<THREE.Group>(null);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useFrame(({ clock }) => {
    // 1. Idle breathing animation
    if (breathingGroupRef.current) {
      if (isBreathing) {
        const t = clock.getElapsedTime();
        const breathFactor = Math.sin(t * 1.6) * 0.015;
        breathingGroupRef.current.scale.set(
          1 + breathFactor * 0.7,
          1 + breathFactor * 0.4,
          1 + breathFactor
        );
      } else {
        breathingGroupRef.current.scale.set(1, 1, 1);
      }
    }

    // 2. FPS calculation
    frameCountRef.current += 1;
    if (frameCountRef.current >= 60) {
      const now = performance.now();
      const delta = (now - lastTimeRef.current) / 1000;
      const currentFps = Math.round(frameCountRef.current / delta);
      if (onFpsUpdate) {
        onFpsUpdate(currentFps);
      }
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[2.5, 4.0, 3.0]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-2.5, 3.0, -2.0]} intensity={0.5} />
      <directionalLight position={[0, -2.0, 2.0]} intensity={0.2} />

      <group position={[0, -0.85, 0]}>
        <group ref={breathingGroupRef}>
          <ParametricHumanMesh scales={scales} skinColor={skinTone} />
          {wornGarments?.map((g) => (
            <ProceduralGarment
              key={`${g.category}-${g.garmentId}`}
              category={g.category}
              colorHex={g.selectedColorHex}
              sizeLabel={g.selectedSize}
              scales={scales}
            />
          ))}
        </group>
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.65}
          scale={2.2}
          blur={1.8}
          far={1.5}
        />
      </group>
    </>
  );
};

export const AvatarViewer: React.FC<AvatarViewerProps> = ({
  measurements = BASELINE_MEASUREMENTS,
  selectedSkinTone = POPULAR_SKIN_TONES[1]?.hex ?? "#f3d2b8",
  onSkinToneChange,
  wornGarments = [],
  className = "",
}) => {
  const [skinTone, setSkinTone] = useState<string>(selectedSkinTone);
  const [autoRotate, setAutoRotate] = useState(false);
  const [isBreathing, setIsBreathing] = useState(true);
  const [fps, setFps] = useState<number>(60);
  const [webGlSupported, setWebGlSupported] = useState<boolean>(true);

  const controlsRef = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const hasWebGL = Boolean(
        window.WebGLRenderingContext &&
          (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
      setWebGlSupported(hasWebGL);
    } catch {
      setWebGlSupported(false);
    }
  }, []);

  useEffect(() => {
    setSkinTone(selectedSkinTone);
  }, [selectedSkinTone]);

  const scales = useMemo(() => {
    return computeAvatarScales(measurements);
  }, [measurements]);

  const setCameraView = (angleRad: number) => {
    if (!controlsRef.current) return;
    setAutoRotate(false);
    const distance = 2.4;
    const x = Math.sin(angleRad) * distance;
    const z = Math.cos(angleRad) * distance;

    controlsRef.current.object.position.set(x, 0.15, z);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  };

  const handleFrontView = () => setCameraView(0);
  const handleBackView = () => setCameraView(Math.PI);
  const handleRightView = () => setCameraView(Math.PI / 2);
  const handleLeftView = () => setCameraView(-Math.PI / 2);
  const handle360Spin = () => {
    setAutoRotate(true);
  };

  const handleSelectSkinTone = (hex: string) => {
    setSkinTone(hex);
    if (onSkinToneChange) {
      onSkinToneChange(hex);
    }
  };

  if (!webGlSupported) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-stone-100 dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 h-[520px]">
        <span className="text-4xl mb-4">⚠️</span>
        <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">
          Hardware Acceleration Disabled
        </h3>
        <p className="text-sm text-stone-600 dark:text-stone-400 max-w-sm mb-4">
          WebGL is not supported or hardware acceleration is turned off in your browser settings.
          Enable WebGL to render your 360° 3D avatar.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-gradient-to-b from-stone-50 via-stone-100 to-stone-200 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 shadow-inner ${className}`}
    >
      {/* ─── TOP BAR: FPS, BREATHING, AUTO-ROTATE ─── */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-white/80 dark:bg-stone-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-200/60 dark:border-stone-800/60 shadow-xs text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-stone-600 dark:text-stone-300 font-semibold">{fps} FPS</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setIsBreathing((prev) => !prev)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md transition-all ${
              isBreathing
                ? "bg-stone-900 text-white border-stone-800 dark:bg-stone-100 dark:text-stone-900"
                : "bg-white/80 dark:bg-stone-900/80 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800"
            }`}
            title="Toggle Idle Respiration"
          >
            {isBreathing ? "🫁 Breathing On" : "⏸ Idle Paused"}
          </button>
          <button
            onClick={() => setAutoRotate((prev) => !prev)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md transition-all ${
              autoRotate
                ? "bg-amber-500 text-white border-amber-600"
                : "bg-white/80 dark:bg-stone-900/80 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800"
            }`}
            title="Toggle Auto Spin"
          >
            {autoRotate ? "🔄 Spinning" : "🔄 Auto-Rotate"}
          </button>
        </div>
      </div>

      {/* ─── 3D THREE.JS CANVAS ─── */}
      <div className="w-full h-[520px] cursor-grab active:cursor-grabbing">
        <Canvas
          camera={{ position: [0, 0.15, 2.4], fov: 45 }}
          shadows
          dpr={[1, 2]}
          gl={{
            powerPreference: "high-performance",
            antialias: true,
            alpha: true,
          }}
        >
          <Suspense fallback={null}>
            <SceneContent
              scales={scales}
              skinTone={skinTone}
              isBreathing={isBreathing}
              wornGarments={wornGarments}
              onFpsUpdate={setFps}
            />
            <OrbitControls
              ref={controlsRef}
              enablePan={false}
              enableZoom={true}
              minDistance={1.2}
              maxDistance={3.8}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 2 + 0.15}
              enableDamping={true}
              dampingFactor={0.06}
              autoRotate={autoRotate}
              autoRotateSpeed={2.2}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* ─── BOTTOM CONTROLS: QUICK ANGLES & SKIN TONES ─── */}
      <div className="p-4 border-t border-stone-200/80 dark:border-stone-800/80 bg-white/60 dark:bg-stone-900/60 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={handleFrontView}>
            Front
          </Button>
          <Button variant="outline" size="sm" onClick={handleRightView}>
            Right
          </Button>
          <Button variant="outline" size="sm" onClick={handleBackView}>
            Back
          </Button>
          <Button variant="outline" size="sm" onClick={handleLeftView}>
            Left
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handle360Spin}
            className="text-amber-600 dark:text-amber-400 font-semibold"
          >
            360° Spin
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
            Skin Tone:
          </span>
          <div className="flex items-center gap-1.5">
            {POPULAR_SKIN_TONES.map((tone) => {
              const isSelected = skinTone.toLowerCase() === tone.hex.toLowerCase();
              return (
                <button
                  key={tone.id}
                  onClick={() => handleSelectSkinTone(tone.hex)}
                  title={tone.name}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    isSelected
                      ? "border-amber-500 scale-110 shadow-sm"
                      : "border-white/80 dark:border-stone-700 hover:scale-105"
                  }`}
                  style={{ backgroundColor: tone.hex }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
