import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { type BoneScaleFactors } from "./avatar-config";
import { ParametricHumanMesh } from "./ParametricHumanMesh";

interface RiggedAvatarMeshProps {
  modelUrl: string;
  scales: BoneScaleFactors;
  skinColor: string;
}

/**
 * Loads and modulates an external rigged GLB humanoid mesh.
 * If the file is not yet available, falls back gracefully to ParametricHumanMesh.
 */
export const RiggedAvatarMesh: React.FC<RiggedAvatarMeshProps> = ({
  modelUrl,
  scales,
  skinColor,
}) => {
  const [loadError, setLoadError] = useState(false);

  // Fallback to parametric if load fails or file is absent
  if (loadError) {
    return <ParametricHumanMesh scales={scales} skinColor={skinColor} />;
  }

  return (
    <React.Suspense fallback={<ParametricHumanMesh scales={scales} skinColor={skinColor} />}>
      <LoadedGLBModel
        modelUrl={modelUrl}
        scales={scales}
        skinColor={skinColor}
        onError={() => setLoadError(true)}
      />
    </React.Suspense>
  );
};

interface LoadedGLBModelProps {
  modelUrl: string;
  scales: BoneScaleFactors;
  skinColor: string;
  onError: () => void;
}

const LoadedGLBModel: React.FC<LoadedGLBModelProps> = ({
  modelUrl,
  scales,
  skinColor,
  onError,
}) => {
  const gltf = useGLTF(modelUrl, undefined, undefined, () => {
    onError();
  });

  const clonedScene = useMemo(() => {
    if (!gltf?.scene) return null;
    return gltf.scene.clone(true);
  }, [gltf]);

  const avatarRef = useRef<THREE.Group>(null);

  // Traverse bones and materials to apply scaling and skin tone
  useEffect(() => {
    if (!clonedScene) return;

    const skinToneColor = new THREE.Color(skinColor);

    clonedScene.traverse((child) => {
      // 1. Modulate materials with skin tone
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          // Apply skin tone to body / skin / head materials
          const matName = mat.name.toLowerCase();
          if (
            matName.includes("skin") ||
            matName.includes("body") ||
            matName.includes("face") ||
            matName.includes("head") ||
            matName === ""
          ) {
            mat.color.copy(skinToneColor);
            mat.roughness = 0.55;
            mat.metalness = 0.05;
          }
        }
      }

      // 2. Modulate standard humanoid bones if found
      if ((child as THREE.Bone).isBone) {
        const bone = child as THREE.Bone;
        const name = bone.name.toLowerCase();

        if (name.includes("spine1") || name.includes("spine2") || name.includes("chest")) {
          bone.scale.set(scales.chestDepthWidth[0], 1, scales.chestDepthWidth[1]);
        } else if (name.includes("spine") || name.includes("waist") || name.includes("stomach")) {
          bone.scale.set(scales.waistDepthWidth[0], 1, scales.waistDepthWidth[1]);
        } else if (name.includes("hips") || name.includes("pelvis")) {
          bone.scale.set(scales.hipDepthWidth[0], scales.torsoLength, scales.hipDepthWidth[1]);
        } else if (name.includes("shoulder") || name.includes("clavicle")) {
          bone.scale.set(scales.shoulderWidth, 1, 1);
        } else if (name.includes("upleg") || name.includes("thigh")) {
          bone.scale.set(1, scales.legLength, 1);
        }
      }
    });
  }, [clonedScene, scales, skinColor]);

  if (!clonedScene) {
    return <ParametricHumanMesh scales={scales} skinColor={skinColor} />;
  }

  return (
    <primitive
      ref={avatarRef}
      object={clonedScene}
      scale={[1, scales.overallHeight, 1]}
      position={[0, 0, 0]}
    />
  );
};
