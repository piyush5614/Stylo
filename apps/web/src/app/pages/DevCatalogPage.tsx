import { useEffect, useState } from "react";
import { Button, GlassCard } from "@/components/ui";
import { useCreateSession, useFabrics, useGarments } from "@/hooks/use-catalog";
import { useAppStore } from "@/stores/app-store";

/**
 * Temporary developer verification page.
 * Proves end-to-end integration: React -> FastAPI -> Supabase/Repositories.
 */
export function DevCatalogPage() {
  const session = useAppStore((state) => state.session);
  const createSessionMutation = useCreateSession();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  const {
    data: garmentsData,
    isLoading: isLoadingGarments,
    error: garmentsError,
  } = useGarments({ category: selectedCategory });

  const {
    data: fabricsData,
    isLoading: isLoadingFabrics,
  } = useFabrics();

  useEffect(() => {
    // Automatically trigger session creation if not existing
    if (!session && !createSessionMutation.isPending && !createSessionMutation.isSuccess) {
      createSessionMutation.mutate({ consent_given: true });
    }
  }, [session, createSessionMutation]);

  return (
    <div className="flex w-full max-w-6xl flex-col gap-8 py-8">
      {/* Dev Banner */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
        <div className="flex items-center gap-2 font-semibold">
          <span className="text-amber-400">⚡ [DEV ONLY]</span>
          <span>Temporary Catalog Verification View</span>
        </div>
        <p className="mt-1 text-xs text-amber-300/80">
          Validating the full chain: Frontend (TanStack Query + OpenAPI types) → Backend (FastAPI Routers) → Repositories / Supabase.
        </p>
      </div>

      {/* Session Diagnostics */}
      <GlassCard className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white">Active Session</h2>
          <p className="font-mono text-xs text-brand-300">
            {session ? session.id : createSessionMutation.isPending ? "Creating session..." : "No active session"}
          </p>
          {session && (
            <p className="mt-1 text-xs text-brand-400">
              Expires: {new Date(session.expires_at).toLocaleString()}
            </p>
          )}
        </div>
        <Button
          variant="secondary"
          onClick={() => createSessionMutation.mutate({ consent_given: true })}
          isLoading={createSessionMutation.isPending}
        >
          Refresh / Create Session
        </Button>
      </GlassCard>

      {/* Category Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-brand-300">Filter Category:</span>
        {["all", "top", "bottom", "outerwear", "cap"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat === "all" ? undefined : cat)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              (cat === "all" && !selectedCategory) || selectedCategory === cat
                ? "bg-brand-500 text-white"
                : "bg-surface-2 text-brand-300 hover:bg-surface-3"
            }`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Seeded Fabrics Overview */}
      <div>
        <h3 className="mb-3 font-display text-lg font-bold text-white">
          Available Fabrics ({fabricsData?.length ?? 0})
        </h3>
        {isLoadingFabrics ? (
          <div className="text-sm text-brand-400">Loading fabrics...</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {fabricsData?.map((fabric) => (
              <GlassCard key={fabric.id} className="p-3">
                <h4 className="font-semibold text-white text-sm">{fabric.name}</h4>
                <p className="mt-1 line-clamp-2 text-xs text-brand-300">{fabric.description}</p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-accent-400">
                  <span>Breathability: {fabric.breathability}/5</span>
                  <span>Stretch: {fabric.stretch}/5</span>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Seeded Garments Grid */}
      <div>
        <h3 className="mb-3 font-display text-lg font-bold text-white">
          Seeded Garments ({garmentsData?.total ?? 0})
        </h3>

        {isLoadingGarments && (
          <div className="py-8 text-center text-sm text-brand-400">
            Loading garments from API...
          </div>
        )}

        {garmentsError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            Error loading garments: {String(garmentsError)}
          </div>
        )}

        {garmentsData && garmentsData.items.length === 0 && (
          <div className="py-8 text-center text-sm text-brand-400">
            No garments found matching this filter.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {garmentsData?.items.map((garment) => (
            <GlassCard key={garment.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-md bg-brand-500/20 px-2 py-0.5 text-[11px] font-medium text-brand-300 uppercase">
                    {garment.category}
                  </span>
                  <span className="font-semibold text-accent-400">
                    ${garment.base_price.toFixed(2)}
                  </span>
                </div>
                <h4 className="mt-2 font-display text-base font-bold text-white">
                  {garment.name}
                </h4>
                <div className="mt-1 flex items-center gap-2 text-xs text-brand-300">
                  <span>Fabric: <strong className="text-white">{garment.fabric_name ?? "Standard"}</strong></span>
                  <span>·</span>
                  <span>Fit: <strong className="text-white">{garment.fit_type}</strong></span>
                </div>
                {garment.occasion && garment.occasion.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {garment.occasion.map((occ) => (
                      <span
                        key={occ}
                        className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-brand-300"
                      >
                        {occ}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-4 border-t border-glass-border pt-3">
                <span className="font-mono text-[11px] text-brand-700">
                  slug: {garment.slug}
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
