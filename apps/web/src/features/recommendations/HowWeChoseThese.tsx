import React, { useState } from "react";

interface HowWeChoseTheseProps {
  bodyType: string;
  undertone: string;
}

export const HowWeChoseThese: React.FC<HowWeChoseTheseProps> = ({
  bodyType,
  undertone,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl bg-neutral-900/60 border border-neutral-800 p-5">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🔍</span>
          <div>
            <h2 className="text-sm font-bold text-white">How we chose these recommendations</h2>
            <p className="text-xs text-neutral-400">
              Deterministic, positive design rules — 100% explainable, zero black-box scoring.
            </p>
          </div>
        </div>
        <span className="text-sm text-neutral-400 font-mono transition-transform duration-200">
          {isOpen ? "▲ Less" : "▼ More"}
        </span>
      </button>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-neutral-800 space-y-4 text-xs text-neutral-300 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-neutral-800/40 border border-neutral-700/40">
              <span className="font-semibold text-amber-300 block mb-1">
                1. Proportions & Silhouette ({bodyType})
              </span>
              <p className="text-neutral-400 leading-relaxed">
                We compare shoulder breadth, waist indent, and hip ratios to catalog neckline and fit geometries (relaxed, regular, slim) to promote visual symmetry and balance.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-800/40 border border-neutral-700/40">
              <span className="font-semibold text-sky-300 block mb-1">
                2. Chromatic Harmony ({undertone})
              </span>
              <p className="text-neutral-400 leading-relaxed">
                Colorways are matched against tested palettes in CIELAB space to ensure complementary contrast with golden, olive, cool, or neutral undertones.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-800/40 border border-neutral-700/40">
              <span className="font-semibold text-emerald-300 block mb-1">
                3. Textile Physics & Climate
              </span>
              <p className="text-neutral-400 leading-relaxed">
                Natural fiber dynamics (linen breathability, cotton stretch, wool insulation) ensure pieces deliver authentic physical comfort throughout seasonal shifts.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 text-[11px] text-neutral-400">
            <span>All algorithms run client/session side. No photos are retained.</span>
            <span className="text-amber-400 font-medium">Rules config: docs/recommendation-rules.md</span>
          </div>
        </div>
      )}
    </div>
  );
};
