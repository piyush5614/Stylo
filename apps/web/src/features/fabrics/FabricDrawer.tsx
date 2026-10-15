import React from "react";
import type { FabricInsight } from "@/types";

interface FabricDrawerProps {
  fabricSlug: string | null;
  insight: FabricInsight | null;
  isLoading: boolean;
  onClose: () => void;
}

export const FabricDrawer: React.FC<FabricDrawerProps> = ({
  fabricSlug,
  insight,
  isLoading,
  onClose,
}) => {
  if (!fabricSlug) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in flex justify-end">
      <div
        className="w-full max-w-md bg-neutral-900 border-l border-neutral-800 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl transition-transform"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fabric-title"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧵</span>
              <h2 id="fabric-title" className="text-xl font-bold text-white capitalize">
                {insight?.fabric_name ?? fabricSlug} Intelligence
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-neutral-800 transition"
              aria-label="Close fabric panel"
            >
              ✕
            </button>
          </div>

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-neutral-400">Loading textile science...</p>
            </div>
          ) : insight ? (
            <div className="mt-6 space-y-6">
              {/* Short explanation */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-xs uppercase font-bold tracking-wider text-amber-400 block mb-1">
                  Why this suits you
                </span>
                <p className="text-sm text-neutral-200 leading-relaxed">
                  {insight.why_it_suits_you}
                </p>
              </div>

              {/* Climate Suitability */}
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-neutral-400 block mb-2">
                  Best For Climate & Season
                </span>
                <p className="text-sm text-neutral-300 mb-2">{insight.best_for_climate}</p>
                <div className="flex flex-wrap gap-2">
                  {insight.best_seasons.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 text-xs rounded-full bg-neutral-800 text-neutral-300 font-medium"
                    >
                      🌱 {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Performance Radars / Meters */}
              <div className="space-y-3 p-4 rounded-xl bg-neutral-800/40 border border-neutral-800">
                <span className="text-xs uppercase font-bold tracking-wider text-neutral-400 block mb-1">
                  Material Performance
                </span>

                {/* Breathability */}
                <div>
                  <div className="flex justify-between text-xs text-neutral-300 mb-1">
                    <span>Breathability</span>
                    <span className="font-semibold text-amber-400">
                      {insight.breathability_rating} / 5
                    </span>
                  </div>
                  <div className="w-full bg-neutral-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(insight.breathability_rating / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Stretch */}
                <div>
                  <div className="flex justify-between text-xs text-neutral-300 mb-1">
                    <span>Stretch & Flexibility</span>
                    <span className="font-semibold text-sky-400">
                      {insight.stretch_rating} / 5
                    </span>
                  </div>
                  <div className="w-full bg-neutral-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(insight.stretch_rating / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Durability */}
                <div>
                  <div className="flex justify-between text-xs text-neutral-300 mb-1">
                    <span>Longevity & Durability</span>
                    <span className="font-semibold text-emerald-400">
                      {insight.durability_rating} / 5
                    </span>
                  </div>
                  <div className="w-full bg-neutral-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(insight.durability_rating / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Key Benefits */}
              {insight.benefits && insight.benefits.length > 0 && (
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-neutral-400 block mb-2">
                    Textile Benefits
                  </span>
                  <ul className="space-y-1.5 text-sm text-neutral-300">
                    {insight.benefits.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 text-sm mt-0.5">✓</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Care Instructions */}
              {insight.care_instructions && insight.care_instructions.length > 0 && (
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-neutral-400 block mb-2">
                    Care Guidelines
                  </span>
                  <ul className="space-y-1.5 text-sm text-neutral-400">
                    {insight.care_instructions.map((c, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-neutral-500 text-sm mt-0.5">▪</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skin Sensitivity Notice */}
              {insight.skin_sensitivity_note && (
                <div className="p-3 rounded-lg bg-neutral-800/60 border border-neutral-700 text-xs text-neutral-300">
                  <span className="font-semibold text-amber-300">Skin Comfort: </span>
                  {insight.skin_sensitivity_note}
                </div>
              )}
            </div>
          ) : (
            <p className="mt-8 text-neutral-400 text-sm">No insights available for this textile.</p>
          )}
        </div>

        <div className="pt-6 border-t border-neutral-800 mt-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-sm transition"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
