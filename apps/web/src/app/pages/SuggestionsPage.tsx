import React, { useEffect, useState, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { api, getStoredSessionId } from "@/lib/api";
import type { FabricInsight, PersonalizedRecommendationsResponse } from "@/types";
import { RecommendationCard } from "@/features/recommendations/RecommendationCard";
import { ProfileEditor } from "@/features/recommendations/ProfileEditor";
import { FilterBar } from "@/features/recommendations/FilterBar";
import { HowWeChoseThese } from "@/features/recommendations/HowWeChoseThese";
import { FabricDrawer } from "@/features/fabrics/FabricDrawer";

export const SuggestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<PersonalizedRecommendationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Profile overrides
  const [occasion, setOccasion] = useState<string>("");
  const [season, setSeason] = useState<string>("");
  const [bodyType, setBodyType] = useState<string>("rectangle");
  const [undertone, setUndertone] = useState<string>("neutral");
  const [depth, setDepth] = useState<string>("medium");

  // Fabric Drawer State
  const [selectedFabricSlug, setSelectedFabricSlug] = useState<string | null>(null);
  const [fabricInsight, setFabricInsight] = useState<FabricInsight | null>(null);
  const [isFabricLoading, setIsFabricLoading] = useState(false);

  const [, startTransition] = useTransition();

  const loadRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let sessionId = getStoredSessionId();
      if (!sessionId) {
        // Create an ephemeral guest session if none exists
        const guestSession = await api.createSession({ consent_given: true });
        sessionId = guestSession.id;
      }

      const res = await api.fetchRecommendations({
        occasion: occasion || undefined,
        season: season || undefined,
      });

      setData(res);
      setBodyType(res.detected_body_type || "rectangle");
      setUndertone(res.detected_undertone || "neutral");
      setDepth(res.detected_depth || "medium");
    } catch (err) {
      console.error("Failed to load recommendations:", err);
      setError("Unable to load style recommendations. Please verify the API is running.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [occasion, season]);

  // Open fabric insights drawer
  const handleViewFabric = async (slug: string) => {
    setSelectedFabricSlug(slug);
    setIsFabricLoading(true);
    try {
      const insight = await api.fetchFabricInsights(slug);
      setFabricInsight(insight);
    } catch (err) {
      console.error("Failed to load fabric details:", err);
    } finally {
      setIsFabricLoading(false);
    }
  };

  // Navigating to TryOn page with garment preselected
  const handleTryOn = (garmentSlug: string, colorHex?: string, sizeLabel?: string) => {
    const params = new URLSearchParams();
    params.set("garment", garmentSlug);
    if (colorHex) params.set("color", colorHex);
    if (sizeLabel) params.set("size", sizeLabel);
    navigate(`/tryon?${params.toString()}`);
  };

  // Local re-scoring for modified attributes
  const handleUpdateBodyType = (newType: string) => {
    startTransition(() => {
      setBodyType(newType);
    });
  };

  const handleUpdateUndertone = (newTone: string) => {
    startTransition(() => {
      setUndertone(newTone);
    });
  };

  const handleUpdateDepth = (newDepth: string) => {
    startTransition(() => {
      setDepth(newDepth);
    });
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold mb-3">
            <span>✨ Part 8: Explainable Style Advisory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Curated Recommendations
          </h1>
          <p className="text-neutral-400 text-sm mt-1 max-w-2xl">
            Proportion-balancing cuts, skin-tone harmonious colorways, and climate-tailored textiles.
          </p>
        </div>

        <button
          onClick={() => navigate("/tryon")}
          className="self-start md:self-auto px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-sm font-semibold text-neutral-200 transition flex items-center gap-2"
        >
          <span>👤 View 3D Avatar</span>
        </button>
      </div>

      {/* Profile Attribute Overrides */}
      <ProfileEditor
        bodyType={bodyType}
        undertone={undertone}
        depth={depth}
        onUpdateBodyType={handleUpdateBodyType}
        onUpdateUndertone={handleUpdateUndertone}
        onUpdateDepth={handleUpdateDepth}
      />

      {/* Occasion & Climate / Season Filters */}
      <FilterBar
        selectedOccasion={occasion}
        selectedSeason={season}
        onSelectOccasion={setOccasion}
        onSelectSeason={setSeason}
      />

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={loadRecommendations}
            className="underline font-semibold hover:text-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* Garments Grid */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-neutral-400">
            Applying silhouette & chromatic harmony rules...
          </p>
        </div>
      ) : data?.items && data.items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.items.map((item) => (
            <RecommendationCard
              key={item.garment.id}
              item={item}
              onTryOn={handleTryOn}
              onViewFabric={handleViewFabric}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl border border-dashed border-neutral-800 p-8">
          <span className="text-4xl block mb-2">🏷️</span>
          <h3 className="text-base font-semibold text-white">No items found matching filter</h3>
          <p className="text-sm text-neutral-400 mt-1">
            Try clearing the occasion or climate filter above to explore the wider catalog.
          </p>
          <button
            onClick={() => {
              setOccasion("");
              setSeason("");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-neutral-800 text-white text-xs font-semibold hover:bg-neutral-700 transition"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Transparent Explainer */}
      <HowWeChoseThese bodyType={bodyType} undertone={undertone} />

      {/* Fabric Science Panel */}
      <FabricDrawer
        fabricSlug={selectedFabricSlug}
        insight={fabricInsight}
        isLoading={isFabricLoading}
        onClose={() => setSelectedFabricSlug(null)}
      />
    </div>
  );
};
