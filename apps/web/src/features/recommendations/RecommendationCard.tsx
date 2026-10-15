import React from "react";
import type { RecommendationItem } from "@/types";

interface RecommendationCardProps {
  item: RecommendationItem;
  onTryOn: (garmentSlug: string, colorHex?: string, sizeLabel?: string) => void;
  onViewFabric: (fabricSlug: string) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  item,
  onTryOn,
  onViewFabric,
}) => {
  const { garment, score, recommended_size, suggested_color, reasons, fabric_highlight } = item;

  return (
    <div className="flex flex-col justify-between rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 p-5 transition-all duration-300 shadow-xl group hover:shadow-2xl">
      <div>
        {/* Top Header: Category, Match Score & Recommended Size */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs uppercase font-semibold tracking-wider text-neutral-400 bg-neutral-800/80 px-2.5 py-1 rounded-md">
            {garment.category} • {garment.fit_type}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {Math.round(score)}% Match
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-800 text-amber-300 border border-neutral-700">
              Size {recommended_size}
            </span>
          </div>
        </div>

        {/* Title & Price */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
            {garment.name}
          </h3>
          <p className="text-sm font-medium text-neutral-400">
            ${garment.base_price?.toFixed(2) ?? "0.00"}
          </p>
        </div>

        {/* Color Harmonization Swatches */}
        {garment.colors && garment.colors.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
              <span>Suggested Colorway:</span>
              <span className="text-neutral-200 font-medium">
                {suggested_color?.name ?? garment.colors[0]?.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {garment.colors.map((c) => {
                const isSuggested = suggested_color?.hex === c.hex;
                return (
                  <div
                    key={c.id ?? c.hex}
                    title={`${c.name}${isSuggested ? " (Recommended for your undertone)" : ""}`}
                    className={`relative w-6 h-6 rounded-full border transition-transform ${
                      isSuggested
                        ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-neutral-900 scale-110 border-white"
                        : "border-neutral-700 opacity-80 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {isSuggested && (
                      <span className="absolute -top-1 -right-1 text-[8px] bg-amber-400 text-black rounded-full w-2.5 h-2.5 flex items-center justify-center font-bold">
                        ★
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Explainable Reasons */}
        <div className="space-y-1.5 mb-4 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400 block mb-1">
            Why this works for your profile
          </span>
          {reasons.map((reason, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-neutral-300">
              <span className="text-amber-400 font-bold">✦</span>
              <span>{reason}</span>
            </div>
          ))}
        </div>

        {/* Fabric Highlight Badge */}
        {fabric_highlight && (
          <button
            type="button"
            onClick={() => {
              const fSlug = garment.fabric?.slug ?? garment.fabric_name?.toLowerCase();
              if (fSlug) onViewFabric(fSlug);
            }}
            className="w-full text-left p-2.5 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700/50 text-xs text-neutral-300 flex items-center justify-between transition group/fab mb-4"
          >
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-sm">🧵</span>
              <span className="truncate italic text-neutral-300">{fabric_highlight}</span>
            </div>
            <span className="text-[10px] text-amber-400 font-medium shrink-0 ml-1">
              View Science →
            </span>
          </button>
        )}
      </div>

      {/* Action CTA */}
      <div className="pt-2">
        <button
          onClick={() =>
            onTryOn(
              garment.slug,
              suggested_color?.hex ?? garment.colors?.[0]?.hex,
              recommended_size
            )
          }
          className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black transition-all shadow-md hover:shadow-amber-500/20 flex items-center justify-center gap-2"
        >
          <span>Try On Avatar</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
