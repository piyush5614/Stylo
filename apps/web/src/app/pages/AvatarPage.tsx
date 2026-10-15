import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { AvatarViewer } from "@/features/avatar/AvatarViewer";
import {
  BASELINE_MEASUREMENTS,
  POPULAR_SKIN_TONES,
  type BodyMeasurements,
} from "@/features/avatar/avatar-config";

export const AvatarPage: React.FC = () => {
  // 1. Fetch current body profile from session API
  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ["body-profile"],
    queryFn: () => api.fetchProfile(),
    staleTime: 1000 * 60 * 5,
  });

  const [selectedSkinTone, setSelectedSkinTone] = useState<string>(
    POPULAR_SKIN_TONES[1]?.hex ?? "#f3d2b8"
  );

  // Editable local overrides for interactive live-testing in the browser
  const [interactiveMeasurements, setInteractiveMeasurements] = useState<
    BodyMeasurements | null
  >(null);

  // 2. Loading state with progress indicator
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin mb-6" />
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">
          Generating 3D Avatar...
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Mapping body dimensions to parametric humanoid skeletal rig.
        </p>
      </div>
    );
  }

  // 3. Redirect to /scan if no profile exists
  if (isError || !profile) {
    return <Navigate to="/scan" replace />;
  }

  // Extract base numerical values from profile (extracting value_cm from DimensionEstimate)
  const profileMeasurements: BodyMeasurements = {
    height_cm: profile.height_cm ?? BASELINE_MEASUREMENTS.height_cm,
    shoulder_cm: profile.shoulder_cm?.value_cm ?? BASELINE_MEASUREMENTS.shoulder_cm,
    chest_cm: profile.chest_cm?.value_cm ?? BASELINE_MEASUREMENTS.chest_cm,
    waist_cm: profile.waist_cm?.value_cm ?? BASELINE_MEASUREMENTS.waist_cm,
    hip_cm: profile.hip_cm?.value_cm ?? BASELINE_MEASUREMENTS.hip_cm,
    inseam_cm: profile.inseam_cm?.value_cm ?? BASELINE_MEASUREMENTS.inseam_cm,
    torso_cm: profile.torso_cm?.value_cm ?? BASELINE_MEASUREMENTS.torso_cm,
  };

  const currentMeasurements: BodyMeasurements = interactiveMeasurements ?? profileMeasurements;

  const handleSliderChange = (key: keyof BodyMeasurements, val: number) => {
    setInteractiveMeasurements((prev) => ({
      ...(prev ?? currentMeasurements),
      [key]: val,
    }));
  };

  const handleResetToEstimated = () => {
    setInteractiveMeasurements(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ─── PAGE HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="brand" size="sm">
              Parametric 3D Avatar
            </Badge>
            <Badge variant="outline" size="sm">
              {profile.body_type ? profile.body_type.toUpperCase() : "STANDARD"}
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 dark:text-stone-50 tracking-tight">
            Your Digital Twin
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Built from your calibrated orthogonal scans. Rotatable 360° with dynamic skeletal scaling.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/scan">
            <Button variant="outline" size="md">
              🔄 Retake Scans
            </Button>
          </Link>
          <Link to="/tryon">
            <Button variant="primary" size="md">
              👗 Virtual Try-On &rarr;
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── MAIN VIEWER & SLIDERS GRID ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: 3D WebGL Canvas (Col 7) */}
        <div className="lg:col-span-7">
          <AvatarViewer
            measurements={currentMeasurements}
            selectedSkinTone={selectedSkinTone}
            onSkinToneChange={setSelectedSkinTone}
          />
        </div>

        {/* Right: Parametric Dimensions & Live Sliders (Col 5) */}
        <div className="lg:col-span-5 space-y-6">
          <GlassCard className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  Live Anthropometry Controls
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Drag sliders to visibly modulate avatar mesh proportions in real-time.
                </p>
              </div>
              {interactiveMeasurements && (
                <Button variant="ghost" size="sm" onClick={handleResetToEstimated}>
                  Reset
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {/* Height */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-stone-700 dark:text-stone-300">Height</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400">
                    {Math.round(currentMeasurements.height_cm)} cm
                  </span>
                </div>
                <input
                  type="range"
                  min="145"
                  max="210"
                  value={Math.round(currentMeasurements.height_cm)}
                  onChange={(e) => handleSliderChange("height_cm", Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Shoulder Width */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-stone-700 dark:text-stone-300">Shoulder Width</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400">
                    {Math.round(currentMeasurements.shoulder_cm)} cm
                  </span>
                </div>
                <input
                  type="range"
                  min="32"
                  max="56"
                  value={Math.round(currentMeasurements.shoulder_cm)}
                  onChange={(e) => handleSliderChange("shoulder_cm", Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Chest */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-stone-700 dark:text-stone-300">Chest Circumference</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400">
                    {Math.round(currentMeasurements.chest_cm)} cm
                  </span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="135"
                  value={Math.round(currentMeasurements.chest_cm)}
                  onChange={(e) => handleSliderChange("chest_cm", Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Waist */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-stone-700 dark:text-stone-300">Waist Circumference</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400">
                    {Math.round(currentMeasurements.waist_cm)} cm
                  </span>
                </div>
                <input
                  type="range"
                  min="55"
                  max="125"
                  value={Math.round(currentMeasurements.waist_cm)}
                  onChange={(e) => handleSliderChange("waist_cm", Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Hips */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-stone-700 dark:text-stone-300">Hip Circumference</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400">
                    {Math.round(currentMeasurements.hip_cm)} cm
                  </span>
                </div>
                <input
                  type="range"
                  min="75"
                  max="135"
                  value={Math.round(currentMeasurements.hip_cm)}
                  onChange={(e) => handleSliderChange("hip_cm", Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Inseam / Legs */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-stone-700 dark:text-stone-300">Inseam (Legs)</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400">
                    {Math.round(currentMeasurements.inseam_cm)} cm
                  </span>
                </div>
                <input
                  type="range"
                  min="62"
                  max="98"
                  value={Math.round(currentMeasurements.inseam_cm)}
                  onChange={(e) => handleSliderChange("inseam_cm", Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Torso */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-stone-700 dark:text-stone-300">Torso Length</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400">
                    {Math.round(currentMeasurements.torso_cm)} cm
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="68"
                  value={Math.round(currentMeasurements.torso_cm)}
                  onChange={(e) => handleSliderChange("torso_cm", Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </GlassCard>

          {/* Quick preset cards for 3 distinct body profiles */}
          <GlassCard className="p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Verify Benchmark Proportions
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setInteractiveMeasurements({
                    height_cm: 182,
                    shoulder_cm: 48,
                    chest_cm: 104,
                    waist_cm: 80,
                    hip_cm: 94,
                    inseam_cm: 86,
                    torso_cm: 54,
                  })
                }
                className="text-xs"
              >
                Athletic (V-Shape)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setInteractiveMeasurements({
                    height_cm: 165,
                    shoulder_cm: 38,
                    chest_cm: 92,
                    waist_cm: 72,
                    hip_cm: 102,
                    inseam_cm: 74,
                    torso_cm: 48,
                  })
                }
                className="text-xs"
              >
                Curvy (Hourglass)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setInteractiveMeasurements({
                    height_cm: 172,
                    shoulder_cm: 41,
                    chest_cm: 92,
                    waist_cm: 80,
                    hip_cm: 92,
                    inseam_cm: 78,
                    torso_cm: 50,
                  })
                }
                className="text-xs"
              >
                Slender (Rectangle)
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
