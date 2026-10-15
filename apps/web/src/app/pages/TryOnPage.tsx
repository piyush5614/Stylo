import React, { useMemo, useState } from "react";
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
import { type GarmentSlotState } from "@/features/tryon/ProceduralGarment";
import type { GarmentDetail, GarmentSummary } from "@/types";

type CategoryFilter = "all" | "top" | "bottom" | "outerwear" | "cap";

export const TryOnPage: React.FC = () => {
  // 1. Fetch user's active body profile
  const { data: profile, isLoading: isProfileLoading, isError: isProfileError } = useQuery({
    queryKey: ["body-profile"],
    queryFn: () => api.fetchProfile(),
    staleTime: 1000 * 60 * 5,
  });

  // 2. Fetch garment catalog
  const { data: catalogData, isLoading: isCatalogLoading } = useQuery({
    queryKey: ["catalog-garments"],
    queryFn: () => api.fetchGarments({ limit: 50 }),
  });

  // Active outfit slots (at most 1 per slot: top, bottom, outerwear, cap)
  const [wornGarments, setWornGarments] = useState<GarmentSlotState[]>([]);
  // Selected garment for inspection / fit details
  const [activeGarment, setActiveGarment] = useState<GarmentSummary | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [selectedSkinTone, setSelectedSkinTone] = useState<string>(
    POPULAR_SKIN_TONES[1]?.hex ?? "#f3d2b8"
  );

  // 3. Query active garment details (colors, sizes)
  const { data: garmentDetail } = useQuery({
    queryKey: ["garment-detail", activeGarment?.slug],
    queryFn: () => (activeGarment ? api.fetchGarmentDetail(activeGarment.slug) : null),
    enabled: Boolean(activeGarment),
  });

  // 4. Query AI fit recommendation for active garment
  const { data: fitRecommendation, isLoading: isFitLoading } = useQuery({
    queryKey: ["garment-fit", activeGarment?.slug],
    queryFn: () => (activeGarment ? api.fetchGarmentFit(activeGarment.slug) : null),
    enabled: Boolean(activeGarment),
  });

  // Redirect to /scan if no profile exists
  if (!isProfileLoading && (isProfileError || !profile)) {
    return <Navigate to="/scan" replace />;
  }

  const measurements: BodyMeasurements = useMemo(() => {
    if (!profile) return BASELINE_MEASUREMENTS;
    return {
      height_cm: profile.height_cm ?? BASELINE_MEASUREMENTS.height_cm,
      shoulder_cm: profile.shoulder_cm?.value_cm ?? BASELINE_MEASUREMENTS.shoulder_cm,
      chest_cm: profile.chest_cm?.value_cm ?? BASELINE_MEASUREMENTS.chest_cm,
      waist_cm: profile.waist_cm?.value_cm ?? BASELINE_MEASUREMENTS.waist_cm,
      hip_cm: profile.hip_cm?.value_cm ?? BASELINE_MEASUREMENTS.hip_cm,
      inseam_cm: profile.inseam_cm?.value_cm ?? BASELINE_MEASUREMENTS.inseam_cm,
      torso_cm: profile.torso_cm?.value_cm ?? BASELINE_MEASUREMENTS.torso_cm,
    };
  }, [profile]);

  // Garment catalog filtering
  const garments = catalogData?.items ?? [];
  const filteredGarments = garments.filter((g) => {
    if (categoryFilter === "all") return true;
    return g.category === categoryFilter;
  });

  // Find if a garment is currently worn
  const isGarmentWorn = (garmentId: string) => {
    return wornGarments.some((w) => w.garmentId === garmentId);
  };

  // Toggle or wear garment onto slot
  const handleWearGarment = (garment: GarmentSummary, detail?: GarmentDetail | null) => {
    setActiveGarment(garment);
    const existingIndex = wornGarments.findIndex((w) => w.garmentId === garment.id);

    if (existingIndex >= 0) {
      // Already worn: unwear it
      setWornGarments((prev) => prev.filter((w) => w.garmentId !== garment.id));
      return;
    }

    // Default color & size
    const defaultColor = detail?.colors?.find((c) => c.is_default)?.hex ??
      detail?.colors?.[0]?.hex ??
      "#243447";
    const recommendedSize = fitRecommendation?.recommended_size ??
      detail?.sizes?.[0]?.size_label ??
      "M";

    const newSlotItem: GarmentSlotState = {
      garmentId: garment.id,
      garmentSlug: garment.slug,
      name: garment.name,
      category: garment.category as GarmentSlotState["category"],
      selectedColorHex: defaultColor,
      selectedSize: recommendedSize,
    };

    // Replace item in the same category slot (one item per slot)
    setWornGarments((prev) => [
      ...prev.filter((w) => w.category !== garment.category),
      newSlotItem,
    ]);
  };

  // Change color swatch for the worn garment in real-time
  const handleColorChange = (garmentId: string, hex: string) => {
    setWornGarments((prev) =>
      prev.map((item) => (item.garmentId === garmentId ? { ...item, selectedColorHex: hex } : item))
    );
  };

  // Change size for the worn garment
  const handleSizeChange = (garmentId: string, size: string) => {
    setWornGarments((prev) =>
      prev.map((item) => (item.garmentId === garmentId ? { ...item, selectedSize: size } : item))
    );
  };

  const currentlyWornItem = wornGarments.find((w) => w.garmentId === activeGarment?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="teal" size="sm">
              3D Virtual Fitting Room
            </Badge>
            <Badge variant="outline" size="sm">
              Layering System Active
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 dark:text-stone-50 tracking-tight">
            Virtual Try-On & Sizing
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Mix and match garments. Fitted deterministically to your digital twin with ease-allowance grading.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/avatar">
            <Button variant="outline" size="md">
              🧍 Proportions & Avatars
            </Button>
          </Link>
          <Link to="/suggestions">
            <Button variant="primary" size="md">
              ✨ Style Suggestions &rarr;
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── MAIN 3D VIEWER & SELECTION GRID ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: 3D Three.js Interactive Fitting Stage (Col 7) */}
        <div className="lg:col-span-7 space-y-4">
          <AvatarViewer
            measurements={measurements}
            selectedSkinTone={selectedSkinTone}
            onSkinToneChange={setSelectedSkinTone}
            wornGarments={wornGarments}
          />

          {/* Currently Worn Outfit Summary Bar */}
          <GlassCard className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                WORN LOOK:
              </span>
              {wornGarments.length === 0 ? (
                <span className="text-xs text-stone-400 italic">No clothes selected (Base avatar)</span>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {wornGarments.map((item) => (
                    <span
                      key={item.garmentId}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/80 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/10"
                        style={{ backgroundColor: item.selectedColorHex }}
                      />
                      {item.name} ({item.selectedSize})
                    </span>
                  ))}
                </div>
              )}
            </div>
            {wornGarments.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setWornGarments([])}>
                Clear Outfit
              </Button>
            )}
          </GlassCard>
        </div>

        {/* Right: Garment Catalog & Fitting Advisor (Col 5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {(["all", "top", "bottom", "cap", "outerwear"] as CategoryFilter[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                  categoryFilter === cat
                    ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs"
                    : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 hover:bg-stone-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Garment Grid Gallery */}
          <div className="grid grid-cols-2 gap-3 max-h-[290px] overflow-y-auto pr-1">
            {isCatalogLoading ? (
              <div className="col-span-2 py-8 text-center text-xs text-stone-400">Loading catalog...</div>
            ) : (
              filteredGarments.map((g) => {
                const isSelected = activeGarment?.id === g.id;
                const isWorn = isGarmentWorn(g.id);

                return (
                  <button
                    key={g.id}
                    onClick={() => handleWearGarment(g, garmentDetail)}
                    className={`text-left p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-amber-500 bg-amber-500/5 ring-2 ring-amber-500/20"
                        : isWorn
                        ? "border-emerald-500/80 bg-emerald-500/5"
                        : "border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                          {g.category}
                        </span>
                        {isWorn && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs" title="Wearing" />
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
                        {g.name}
                      </h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 capitalize">
                        {g.fit_type} fit
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-900 dark:text-stone-100">
                        ${g.base_price}
                      </span>
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                        {isWorn ? "Draped ✓" : "+ Try On"}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Active Garment Try-On Controls & Fit Notes */}
          {activeGarment && (
            <GlassCard className="p-5 space-y-4 border-amber-500/30">
              <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-stone-800/80 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    {activeGarment.name}
                  </h3>
                  <span className="text-xs text-stone-500 dark:text-stone-400 capitalize">
                    {activeGarment.category} · {activeGarment.fit_type} fit
                  </span>
                </div>
                {fitRecommendation?.recommended_size && (
                  <Badge variant="teal" size="sm">
                    Recommended: Size {fitRecommendation.recommended_size}
                  </Badge>
                )}
              </div>

              {/* Color Swatches */}
              {garmentDetail?.colors && garmentDetail.colors.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                    Color Palette (Instant PBR Swap):
                  </span>
                  <div className="flex items-center gap-2">
                    {garmentDetail.colors.map((c) => {
                      const isCurrentColor = currentlyWornItem?.selectedColorHex === c.hex;
                      return (
                        <button
                          key={c.id}
                          onClick={() => handleColorChange(activeGarment.id, c.hex)}
                          title={c.name}
                          className={`w-7 h-7 rounded-full border-2 transition-transform ${
                            isCurrentColor ? "border-amber-500 scale-110 shadow-sm" : "border-stone-300 dark:border-stone-700"
                          }`}
                          style={{ backgroundColor: c.hex }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {garmentDetail?.sizes && garmentDetail.sizes.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-600 dark:text-stone-300">
                      Garment Size:
                    </span>
                    {fitRecommendation?.runner_up_size && (
                      <span className="text-stone-400 text-[11px]">
                        Runner-up: {fitRecommendation.runner_up_size}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {garmentDetail.sizes.map((s) => {
                      const isRec = fitRecommendation?.recommended_size === s.size_label;
                      const isChosen = currentlyWornItem?.selectedSize === s.size_label;

                      return (
                        <button
                          key={s.id}
                          onClick={() => handleSizeChange(activeGarment.id, s.size_label)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
                            isChosen
                              ? "bg-amber-500 text-white shadow-xs"
                              : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200"
                          }`}
                        >
                          {s.size_label}
                          {isRec && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sizing AI Fit Notes */}
              {isFitLoading ? (
                <div className="text-xs text-stone-400 py-2">Analyzing anatomical ease...</div>
              ) : fitRecommendation ? (
                <div className="space-y-2 pt-2 border-t border-stone-200/80 dark:border-stone-800/80 text-xs">
                  <p className="font-medium text-stone-700 dark:text-stone-300">
                    💡 {fitRecommendation.fit_summary}
                  </p>
                  <div className="space-y-1">
                    {fitRecommendation.area_details.map((area) => (
                      <div
                        key={area.area}
                        className="flex items-center justify-between text-[11px] py-0.5 border-b border-stone-100 dark:border-stone-800/50"
                      >
                        <span className="font-semibold capitalize text-stone-600 dark:text-stone-400">
                          {area.area}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                              area.fit_status === "ideal"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                : area.fit_status === "comfortable"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                            }`}
                          >
                            {area.fit_status} (+{area.ease_cm}cm)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};
