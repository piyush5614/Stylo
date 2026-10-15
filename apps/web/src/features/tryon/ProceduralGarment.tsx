import React, { useMemo } from "react";
import * as THREE from "three";
import { type BoneScaleFactors } from "@/features/avatar/avatar-config";

export interface GarmentSlotState {
  garmentId: string;
  garmentSlug: string;
  name: string;
  category: "top" | "bottom" | "outerwear" | "cap" | "dress";
  selectedColorHex: string;
  selectedSize: string;
}

interface ProceduralGarmentProps {
  category: "top" | "bottom" | "outerwear" | "cap" | "dress";
  colorHex: string;
  sizeLabel: string;
  scales: BoneScaleFactors;
}

/**
 * Size-dependent ease multiplier for procedural garments.
 * XS: 0.94x, S: 0.97x, M: 1.00x, L: 1.04x, XL: 1.08x, XXL: 1.12x
 */
const SIZE_SCALE_MAP: Record<string, number> = {
  XS: 0.94,
  S: 0.97,
  M: 1.0,
  L: 1.04,
  XL: 1.08,
  XXL: 1.12,
};

/**
 * High-fidelity 3D procedural garment component.
 * Attaches directly to the avatar coordinate system and modally responds to:
 * 1. Category (Top, Bottom, Cap, Outerwear)
 * 2. Fabric / Color material switching (PBR material without reloading geometry)
 * 3. Anthropometric bone scales (Chest, Waist, Hip, Length)
 * 4. Size grading (XS - XXL)
 */
export const ProceduralGarment: React.FC<ProceduralGarmentProps> = ({
  category,
  colorHex,
  sizeLabel,
  scales,
}) => {
  const sizeFactor = SIZE_SCALE_MAP[sizeLabel.toUpperCase()] ?? 1.0;

  // Garment PBR Material with fabric textile roughness
  const garmentMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.72,
      metalness: 0.08,
      side: THREE.DoubleSide,
    });
  }, [colorHex]);

  // Compute anatomical anchor points matching ParametricHumanMesh
  const legHeight = 0.82 * scales.legLength;
  const torsoHeight = 0.52 * scales.torsoLength;
  const hipBaseY = legHeight;
  const waistBaseY = hipBaseY + torsoHeight * 0.42;
  const chestBaseY = hipBaseY + torsoHeight * 0.78;
  const shoulderBaseY = hipBaseY + torsoHeight;
  const neckBaseY = shoulderBaseY + 0.08;
  const headBaseY = neckBaseY + 0.14;
  const shoulderHalfSpan = 0.21 * scales.shoulderWidth;

  // ─── 1. TOP (Crewneck T-Shirt / Shirt / Sweater) ───
  if (category === "top") {
    const topChestScaleX = scales.chestDepthWidth[0] * 1.04 * sizeFactor;
    const topChestScaleZ = scales.chestDepthWidth[1] * 1.04 * sizeFactor;
    const topWaistScaleX = scales.waistDepthWidth[0] * 1.06 * sizeFactor;
    const topWaistScaleZ = scales.waistDepthWidth[1] * 1.06 * sizeFactor;

    return (
      <group>
        {/* Upper Chest / Torso Body */}
        <mesh
          position={[0, chestBaseY, 0]}
          scale={[topChestScaleX, 1.02, topChestScaleZ]}
          material={garmentMaterial}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.185, 0.158, torsoHeight * 0.48, 32]} />
        </mesh>

        {/* Midriff / Waist Hem */}
        <mesh
          position={[0, waistBaseY, 0]}
          scale={[topWaistScaleX, 1.02, topWaistScaleZ]}
          material={garmentMaterial}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.158, 0.172, torsoHeight * 0.42, 32]} />
        </mesh>

        {/* Ribbed Collar */}
        <mesh position={[0, shoulderBaseY + 0.02, 0]} material={garmentMaterial} castShadow>
          <torusGeometry args={[0.065, 0.012, 16, 32]} />
        </mesh>

        {/* Left Sleeve */}
        <group position={[-shoulderHalfSpan - 0.03, shoulderBaseY - 0.04, 0]} rotation={[0, 0, 0.35]}>
          <mesh position={[0, -0.1, 0]} scale={[1.15 * sizeFactor, 1, 1.15 * sizeFactor]} material={garmentMaterial} castShadow>
            <cylinderGeometry args={[0.054, 0.048, 0.18, 24]} />
          </mesh>
        </group>

        {/* Right Sleeve */}
        <group position={[shoulderHalfSpan + 0.03, shoulderBaseY - 0.04, 0]} rotation={[0, 0, -0.35]}>
          <mesh position={[0, -0.1, 0]} scale={[1.15 * sizeFactor, 1, 1.15 * sizeFactor]} material={garmentMaterial} castShadow>
            <cylinderGeometry args={[0.054, 0.048, 0.18, 24]} />
          </mesh>
        </group>
      </group>
    );
  }

  // ─── 2. BOTTOM (Trousers / Straight Denim) ───
  if (category === "bottom") {
    const hipScaleX = scales.hipDepthWidth[0] * 1.06 * sizeFactor;
    const hipScaleZ = scales.hipDepthWidth[1] * 1.06 * sizeFactor;

    return (
      <group>
        {/* Waistband & Seat / Pelvis */}
        <mesh
          position={[0, hipBaseY + 0.07, 0]}
          scale={[hipScaleX, 1.02, hipScaleZ]}
          material={garmentMaterial}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.172, 0.152, 0.22, 32]} />
        </mesh>

        {/* Left Pant Leg */}
        <group position={[-0.11 * scales.hipDepthWidth[0], hipBaseY, 0]}>
          {/* Thigh */}
          <mesh
            position={[0, -legHeight * 0.27, 0]}
            scale={[1.08 * sizeFactor, 1, 1.08 * sizeFactor]}
            material={garmentMaterial}
            castShadow
            receiveShadow
          >
            <cylinderGeometry args={[0.09 * scales.hipDepthWidth[0], 0.072, legHeight * 0.52, 24]} />
          </mesh>
          {/* Shin / Pant Cuff */}
          <mesh
            position={[0, -legHeight * 0.75, 0]}
            scale={[1.12 * sizeFactor, 1, 1.12 * sizeFactor]}
            material={garmentMaterial}
            castShadow
            receiveShadow
          >
            <cylinderGeometry args={[0.07, 0.058, legHeight * 0.48, 24]} />
          </mesh>
        </group>

        {/* Right Pant Leg */}
        <group position={[0.11 * scales.hipDepthWidth[0], hipBaseY, 0]}>
          {/* Thigh */}
          <mesh
            position={[0, -legHeight * 0.27, 0]}
            scale={[1.08 * sizeFactor, 1, 1.08 * sizeFactor]}
            material={garmentMaterial}
            castShadow
            receiveShadow
          >
            <cylinderGeometry args={[0.09 * scales.hipDepthWidth[0], 0.072, legHeight * 0.52, 24]} />
          </mesh>
          {/* Shin / Pant Cuff */}
          <mesh
            position={[0, -legHeight * 0.75, 0]}
            scale={[1.12 * sizeFactor, 1, 1.12 * sizeFactor]}
            material={garmentMaterial}
            castShadow
            receiveShadow
          >
            <cylinderGeometry args={[0.07, 0.058, legHeight * 0.48, 24]} />
          </mesh>
        </group>
      </group>
    );
  }

  // ─── 3. CAP (Structured 6-Panel Cap) ───
  if (category === "cap") {
    return (
      <group position={[0, headBaseY + 0.08, 0]}>
        {/* Cap Dome / Crown */}
        <mesh scale={[1.05 * sizeFactor, 0.7, 1.08 * sizeFactor]} material={garmentMaterial} castShadow>
          <sphereGeometry args={[0.115, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        </mesh>
        {/* Visor / Brim */}
        <mesh
          position={[0, -0.01, 0.1]}
          rotation={[0.15, 0, 0]}
          scale={[1.2 * sizeFactor, 0.2, 1.1 * sizeFactor]}
          material={garmentMaterial}
          castShadow
        >
          <boxGeometry args={[0.14, 0.015, 0.09]} />
        </mesh>
        {/* Top Button */}
        <mesh position={[0, 0.08, 0]} material={garmentMaterial}>
          <sphereGeometry args={[0.012, 12, 12]} />
        </mesh>
      </group>
    );
  }

  // ─── 4. OUTERWEAR (Jacket / Coat) ───
  if (category === "outerwear") {
    const coatChestScaleX = scales.chestDepthWidth[0] * 1.12 * sizeFactor;
    const coatChestScaleZ = scales.chestDepthWidth[1] * 1.12 * sizeFactor;
    const coatWaistScaleX = scales.waistDepthWidth[0] * 1.14 * sizeFactor;
    const coatWaistScaleZ = scales.waistDepthWidth[1] * 1.14 * sizeFactor;

    return (
      <group>
        <mesh
          position={[0, chestBaseY, 0]}
          scale={[coatChestScaleX, 1.05, coatChestScaleZ]}
          material={garmentMaterial}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.198, 0.17, torsoHeight * 0.52, 32]} />
        </mesh>
        <mesh
          position={[0, waistBaseY - 0.05, 0]}
          scale={[coatWaistScaleX, 1.08, coatWaistScaleZ]}
          material={garmentMaterial}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.17, 0.185, torsoHeight * 0.52, 32]} />
        </mesh>
      </group>
    );
  }

  return null;
};
