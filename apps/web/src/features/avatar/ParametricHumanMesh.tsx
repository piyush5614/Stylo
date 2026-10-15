import React, { useMemo } from "react";
import * as THREE from "three";
import { type BoneScaleFactors } from "./avatar-config";

interface ParametricHumanMeshProps {
  scales: BoneScaleFactors;
  skinColor: string;
}

/**
 * High-quality segmented parametric humanoid avatar.
 * Built with segmented anatomical primitives (head, neck, clavicle/shoulders, chest,
 * waist, hips/pelvis, upper/lower arms, hands, thighs, calves, feet) with smooth normals.
 * 
 * Directly modulates scale and position from real-time anthropometric measurements,
 * guaranteeing instantaneous visual updates even without an external GLB.
 */
export const ParametricHumanMesh: React.FC<ParametricHumanMeshProps> = ({
  scales,
  skinColor,
}) => {
  const skinMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(skinColor),
      roughness: 0.55,
      metalness: 0.05,
    });
  }, [skinColor]);

  // Underwear material for decency and realism
  const undergarmentMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color("#1e293b"),
      roughness: 0.8,
      metalness: 0.1,
    });
  }, []);

  // Compute anatomical vertical offsets based on leg length, torso length, and overall height
  const legHeight = 0.82 * scales.legLength;
  const torsoHeight = 0.52 * scales.torsoLength;
  const hipBaseY = legHeight;
  const waistBaseY = hipBaseY + torsoHeight * 0.42;
  const chestBaseY = hipBaseY + torsoHeight * 0.78;
  const shoulderBaseY = hipBaseY + torsoHeight;
  const neckBaseY = shoulderBaseY + 0.08;
  const headBaseY = neckBaseY + 0.14;

  const shoulderHalfSpan = 0.21 * scales.shoulderWidth;

  return (
    <group scale={[1, scales.overallHeight, 1]}>
      {/* ─── HEAD & NECK ─── */}
      <group position={[0, headBaseY, 0]}>
        {/* Cranium / Face */}
        <mesh material={skinMaterial} castShadow receiveShadow>
          <sphereGeometry args={[0.11, 32, 24]} />
        </mesh>
        {/* Jaw contour */}
        <mesh position={[0, -0.06, 0.02]} scale={[0.85, 0.9, 0.95]} material={skinMaterial} castShadow>
          <sphereGeometry args={[0.08, 24, 16]} />
        </mesh>
      </group>

      {/* Neck */}
      <mesh position={[0, neckBaseY, 0]} material={skinMaterial} castShadow>
        <cylinderGeometry args={[0.048, 0.055, 0.1, 24]} />
      </mesh>

      {/* ─── TORSO SEGMENTS ─── */}
      {/* Chest (Pectorals / Ribcage) */}
      <mesh
        position={[0, chestBaseY, 0]}
        scale={[scales.chestDepthWidth[0], 1, scales.chestDepthWidth[1]]}
        material={skinMaterial}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.18, 0.15, torsoHeight * 0.45, 32]} />
      </mesh>

      {/* Waist (Abdomen / Natural Waist) */}
      <mesh
        position={[0, waistBaseY, 0]}
        scale={[scales.waistDepthWidth[0], 1, scales.waistDepthWidth[1]]}
        material={skinMaterial}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.15, 0.165, torsoHeight * 0.4, 32]} />
      </mesh>

      {/* Pelvis / Hips (Undergarment) */}
      <mesh
        position={[0, hipBaseY + 0.06, 0]}
        scale={[scales.hipDepthWidth[0], 1, scales.hipDepthWidth[1]]}
        material={undergarmentMaterial}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.165, 0.145, 0.18, 32]} />
      </mesh>

      {/* ─── SHOULDERS & CLAVICLES ─── */}
      {/* Clavicle Cross-Bar */}
      <mesh position={[0, shoulderBaseY - 0.02, 0]} material={skinMaterial} castShadow>
        <boxGeometry args={[shoulderHalfSpan * 2, 0.06, 0.12 * scales.chestDepthWidth[1]]} />
      </mesh>

      {/* Left Shoulder Deltoid */}
      <mesh position={[-shoulderHalfSpan, shoulderBaseY - 0.03, 0]} material={skinMaterial} castShadow>
        <sphereGeometry args={[0.07, 24, 16]} />
      </mesh>

      {/* Right Shoulder Deltoid */}
      <mesh position={[shoulderHalfSpan, shoulderBaseY - 0.03, 0]} material={skinMaterial} castShadow>
        <sphereGeometry args={[0.07, 24, 16]} />
      </mesh>

      {/* ─── ARMS (A-Pose 25-degree lateral abduction) ─── */}
      {/* Left Arm */}
      <group position={[-shoulderHalfSpan - 0.03, shoulderBaseY - 0.04, 0]} rotation={[0, 0, 0.35]}>
        {/* Upper Arm */}
        <mesh position={[0, -0.15, 0]} material={skinMaterial} castShadow>
          <cylinderGeometry args={[0.046, 0.04, 0.28, 20]} />
        </mesh>
        {/* Elbow */}
        <mesh position={[0, -0.3, 0]} material={skinMaterial}>
          <sphereGeometry args={[0.038, 16, 16]} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0, -0.45, 0]} material={skinMaterial} castShadow>
          <cylinderGeometry args={[0.038, 0.032, 0.26, 20]} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.61, 0]} scale={[1, 1.4, 0.6]} material={skinMaterial} castShadow>
          <sphereGeometry args={[0.035, 16, 12]} />
        </mesh>
      </group>

      {/* Right Arm */}
      <group position={[shoulderHalfSpan + 0.03, shoulderBaseY - 0.04, 0]} rotation={[0, 0, -0.35]}>
        {/* Upper Arm */}
        <mesh position={[0, -0.15, 0]} material={skinMaterial} castShadow>
          <cylinderGeometry args={[0.046, 0.04, 0.28, 20]} />
        </mesh>
        {/* Elbow */}
        <mesh position={[0, -0.3, 0]} material={skinMaterial}>
          <sphereGeometry args={[0.038, 16, 16]} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0, -0.45, 0]} material={skinMaterial} castShadow>
          <cylinderGeometry args={[0.038, 0.032, 0.26, 20]} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.61, 0]} scale={[1, 1.4, 0.6]} material={skinMaterial} castShadow>
          <sphereGeometry args={[0.035, 16, 12]} />
        </mesh>
      </group>

      {/* ─── LEGS & FEET ─── */}
      {/* Left Leg */}
      <group position={[-0.11 * scales.hipDepthWidth[0], hipBaseY, 0]}>
        {/* Thigh (Upper Leg) */}
        <mesh position={[0, -legHeight * 0.27, 0]} material={skinMaterial} castShadow receiveShadow>
          <cylinderGeometry args={[0.082 * scales.hipDepthWidth[0], 0.065, legHeight * 0.5, 24]} />
        </mesh>
        {/* Knee */}
        <mesh position={[0, -legHeight * 0.52, 0]} material={skinMaterial}>
          <sphereGeometry args={[0.06, 20, 16]} />
        </mesh>
        {/* Calf / Shin (Lower Leg) */}
        <mesh position={[0, -legHeight * 0.77, 0]} material={skinMaterial} castShadow receiveShadow>
          <cylinderGeometry args={[0.06, 0.042, legHeight * 0.46, 24]} />
        </mesh>
        {/* Foot */}
        <mesh position={[0, -legHeight + 0.02, 0.06]} scale={[1, 0.7, 2.0]} material={skinMaterial} castShadow>
          <boxGeometry args={[0.08, 0.05, 0.12]} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group position={[0.11 * scales.hipDepthWidth[0], hipBaseY, 0]}>
        {/* Thigh (Upper Leg) */}
        <mesh position={[0, -legHeight * 0.27, 0]} material={skinMaterial} castShadow receiveShadow>
          <cylinderGeometry args={[0.082 * scales.hipDepthWidth[0], 0.065, legHeight * 0.5, 24]} />
        </mesh>
        {/* Knee */}
        <mesh position={[0, -legHeight * 0.52, 0]} material={skinMaterial}>
          <sphereGeometry args={[0.06, 20, 16]} />
        </mesh>
        {/* Calf / Shin (Lower Leg) */}
        <mesh position={[0, -legHeight * 0.77, 0]} material={skinMaterial} castShadow receiveShadow>
          <cylinderGeometry args={[0.06, 0.042, legHeight * 0.46, 24]} />
        </mesh>
        {/* Foot */}
        <mesh position={[0, -legHeight + 0.02, 0.06]} scale={[1, 0.7, 2.0]} material={skinMaterial} castShadow>
          <boxGeometry args={[0.08, 0.05, 0.12]} />
        </mesh>
      </group>
    </group>
  );
};
