import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import type { Fabric, FabricInsight } from "@/types";
import { FabricDrawer } from "@/features/fabrics/FabricDrawer";

export const FabricsPage: React.FC = () => {
  const navigate = useNavigate();
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState<string>("");

  // Drawer state
  const [selectedFabricSlug, setSelectedFabricSlug] = useState<string | null>(null);
  const [insight, setInsight] = useState<FabricInsight | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);

  useEffect(() => {
    async function loadFabrics() {
      setIsLoading(true);
      try {
        const res = await api.fetchFabrics();
        setFabrics(res);
      } catch (err) {
        console.error("Failed to load fabrics:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadFabrics();
  }, []);

  const openDrawer = async (slug: string) => {
    setSelectedFabricSlug(slug);
    setIsInsightLoading(true);
    try {
      const data = await api.fetchFabricInsights(slug);
      setInsight(data);
    } catch (err) {
      console.error("Failed to load fabric insight:", err);
    } finally {
      setIsInsightLoading(false);
    }
  };

  const filteredFabrics = fabrics.filter((f) => {
    if (!selectedSeason) return true;
    return f.best_seasons?.some((s) => s.toLowerCase().includes(selectedSeason.toLowerCase()));
  });

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-3">
            <span>🧵 Part 9: Textile Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Fabric Science &amp; Textile Hub
          </h1>
          <p className="text-neutral-400 text-sm mt-1 max-w-2xl">
            Explore fabric breathability, stretch recovery, climate compatibility, and eco-certified care.
          </p>
        </div>

        {/* Climate filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 font-medium">Filter by Season:</span>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
          >
            <option value="">All Seasons</option>
            <option value="Spring">🌸 Spring</option>
            <option value="Summer">☀️ Summer</option>
            <option value="Autumn">🍂 Autumn</option>
            <option value="Winter">❄️ Winter</option>
          </select>
        </div>
      </div>

      {/* Grid of Fabric Cards */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-neutral-400">Loading textile library...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFabrics.map((fabric) => (
            <div
              key={fabric.id}
              className="flex flex-col justify-between rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 p-6 transition-all duration-300 shadow-xl group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">🧵</span>
                  <div className="flex flex-wrap gap-1">
                    {fabric.best_seasons?.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {fabric.name}
                </h3>
                <p className="mt-2 text-xs text-neutral-400 leading-relaxed line-clamp-3">
                  {fabric.description}
                </p>

                {/* Rating meters */}
                <div className="mt-5 space-y-2.5 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
                  <div>
                    <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                      <span>Breathability</span>
                      <span className="text-amber-400 font-semibold">{fabric.breathability} / 5</span>
                    </div>
                    <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full"
                        style={{ width: `${(fabric.breathability / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                      <span>Stretch</span>
                      <span className="text-sky-400 font-semibold">{fabric.stretch} / 5</span>
                    </div>
                    <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-sky-400 h-full rounded-full"
                        style={{ width: `${(fabric.stretch / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                      <span>Durability</span>
                      <span className="text-emerald-400 font-semibold">{fabric.durability} / 5</span>
                    </div>
                    <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full rounded-full"
                        style={{ width: `${(fabric.durability / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openDrawer(fabric.slug)}
                  className="flex-1 py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs transition text-center"
                >
                  Full Science &amp; Care
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/tryon?fabric=${encodeURIComponent(fabric.id)}`)}
                  className="py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition"
                  title="View garments made of this fabric"
                >
                  Try On →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fabric Drawer */}
      <FabricDrawer
        fabricSlug={selectedFabricSlug}
        insight={insight}
        isLoading={isInsightLoading}
        onClose={() => setSelectedFabricSlug(null)}
      />
    </div>
  );
};
