/**
 * Data-driven Avatar Mapping Configuration.
 * 
 * Maps 7 body measurements (height, shoulder, chest, waist, hips, inseam, torso)
 * to normalized bone scales and morph target blendshapes.
 * 
 * Every parameter is clamped to prevent physical mesh explosion or inversion.
 */

export interface BodyMeasurements {
  height_cm: number;
  shoulder_cm: number;
  chest_cm: number;
  waist_cm: number;
  hip_cm: number;
  inseam_cm: number;
  torso_cm: number;
}

export interface BoneScaleFactors {
  overallHeight: number;
  shoulderWidth: number;
  chestDepthWidth: [number, number]; // [scaleX, scaleZ]
  waistDepthWidth: [number, number]; // [scaleX, scaleZ]
  hipDepthWidth: [number, number];   // [scaleX, scaleZ]
  legLength: number;
  torsoLength: number;
}

export interface SkinToneOption {
  id: string;
  name: string;
  hex: string;
  subsurface: string;
}

export const POPULAR_SKIN_TONES: SkinToneOption[] = [
  { id: "fair-cool", name: "Fair Cool", hex: "#fbe4d8", subsurface: "#f9c8b8" },
  { id: "light-neutral", name: "Light Neutral", hex: "#f3d2b8", subsurface: "#e8b89d" },
  { id: "medium-warm", name: "Medium Warm", hex: "#dfb08c", subsurface: "#d1976f" },
  { id: "tan-olive", name: "Tan Olive", hex: "#be895b", subsurface: "#a76c40" },
  { id: "deep-warm", name: "Deep Warm", hex: "#8a5736", subsurface: "#6f3c1d" },
  { id: "rich-dark", name: "Rich Dark", hex: "#4b2f1f", subsurface: "#381f12" },
];

/**
 * Standard baseline anthropometric dimensions for an adult humanoid reference model (cm).
 */
export const BASELINE_MEASUREMENTS: BodyMeasurements = {
  height_cm: 172.0,
  shoulder_cm: 42.0,
  chest_cm: 94.0,
  waist_cm: 78.0,
  hip_cm: 98.0,
  inseam_cm: 79.0,
  torso_cm: 51.0,
};

/**
 * Min/Max safety limits for clamping to ensure 3D mesh integrity.
 */
export const MEASUREMENT_SAFETY_LIMITS: Record<
  keyof BodyMeasurements,
  { min: number; max: number; minScale: number; maxScale: number }
> = {
  height_cm: { min: 140, max: 215, minScale: 0.82, maxScale: 1.25 },
  shoulder_cm: { min: 32, max: 56, minScale: 0.78, maxScale: 1.35 },
  chest_cm: { min: 70, max: 135, minScale: 0.75, maxScale: 1.45 },
  waist_cm: { min: 55, max: 130, minScale: 0.70, maxScale: 1.55 },
  hip_cm: { min: 75, max: 140, minScale: 0.75, maxScale: 1.45 },
  inseam_cm: { min: 62, max: 98, minScale: 0.80, maxScale: 1.25 },
  torso_cm: { min: 40, max: 68, minScale: 0.80, maxScale: 1.30 },
};

/**
 * Utility function to clamp a value between a lower and upper bound.
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Maps raw measurement values in cm to clamped 3D bone scales.
 */
export function computeAvatarScales(measurements: Partial<BodyMeasurements>): BoneScaleFactors {
  const merged: BodyMeasurements = {
    height_cm: measurements.height_cm ?? BASELINE_MEASUREMENTS.height_cm,
    shoulder_cm: measurements.shoulder_cm ?? BASELINE_MEASUREMENTS.shoulder_cm,
    chest_cm: measurements.chest_cm ?? BASELINE_MEASUREMENTS.chest_cm,
    waist_cm: measurements.waist_cm ?? BASELINE_MEASUREMENTS.waist_cm,
    hip_cm: measurements.hip_cm ?? BASELINE_MEASUREMENTS.hip_cm,
    inseam_cm: measurements.inseam_cm ?? BASELINE_MEASUREMENTS.inseam_cm,
    torso_cm: measurements.torso_cm ?? BASELINE_MEASUREMENTS.torso_cm,
  };

  // 1. Overall Height
  const rawHeightScale = merged.height_cm / BASELINE_MEASUREMENTS.height_cm;
  const overallHeight = clamp(
    rawHeightScale,
    MEASUREMENT_SAFETY_LIMITS.height_cm.minScale,
    MEASUREMENT_SAFETY_LIMITS.height_cm.maxScale
  );

  // 2. Shoulder Width (lateral scale)
  const rawShoulderScale = merged.shoulder_cm / BASELINE_MEASUREMENTS.shoulder_cm;
  const shoulderWidth = clamp(
    rawShoulderScale,
    MEASUREMENT_SAFETY_LIMITS.shoulder_cm.minScale,
    MEASUREMENT_SAFETY_LIMITS.shoulder_cm.maxScale
  );

  // 3. Chest Circumference -> (Width X, Depth Z)
  const rawChestRatio = merged.chest_cm / BASELINE_MEASUREMENTS.chest_cm;
  const chestClamped = clamp(
    rawChestRatio,
    MEASUREMENT_SAFETY_LIMITS.chest_cm.minScale,
    MEASUREMENT_SAFETY_LIMITS.chest_cm.maxScale
  );
  // Anteroposterior depth expands slightly faster with circumference
  const chestDepthWidth: [number, number] = [chestClamped, chestClamped * 1.05];

  // 4. Waist Circumference -> (Width X, Depth Z)
  const rawWaistRatio = merged.waist_cm / BASELINE_MEASUREMENTS.waist_cm;
  const waistClamped = clamp(
    rawWaistRatio,
    MEASUREMENT_SAFETY_LIMITS.waist_cm.minScale,
    MEASUREMENT_SAFETY_LIMITS.waist_cm.maxScale
  );
  const waistDepthWidth: [number, number] = [waistClamped, waistClamped * 1.08];

  // 5. Hip Circumference -> (Width X, Depth Z)
  const rawHipRatio = merged.hip_cm / BASELINE_MEASUREMENTS.hip_cm;
  const hipClamped = clamp(
    rawHipRatio,
    MEASUREMENT_SAFETY_LIMITS.hip_cm.minScale,
    MEASUREMENT_SAFETY_LIMITS.hip_cm.maxScale
  );
  const hipDepthWidth: [number, number] = [hipClamped * 1.02, hipClamped];

  // 6. Leg Length (Inseam)
  const rawLegRatio = merged.inseam_cm / BASELINE_MEASUREMENTS.inseam_cm;
  const legLength = clamp(
    rawLegRatio,
    MEASUREMENT_SAFETY_LIMITS.inseam_cm.minScale,
    MEASUREMENT_SAFETY_LIMITS.inseam_cm.maxScale
  );

  // 7. Torso Length
  const rawTorsoRatio = merged.torso_cm / BASELINE_MEASUREMENTS.torso_cm;
  const torsoLength = clamp(
    rawTorsoRatio,
    MEASUREMENT_SAFETY_LIMITS.torso_cm.minScale,
    MEASUREMENT_SAFETY_LIMITS.torso_cm.maxScale
  );

  return {
    overallHeight,
    shoulderWidth,
    chestDepthWidth,
    waistDepthWidth,
    hipDepthWidth,
    legLength,
    torsoLength,
  };
}
