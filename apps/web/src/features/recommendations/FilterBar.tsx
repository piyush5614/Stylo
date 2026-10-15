import React from "react";

interface FilterBarProps {
  selectedOccasion: string;
  selectedSeason: string;
  onSelectOccasion: (occ: string) => void;
  onSelectSeason: (sea: string) => void;
}

const OCCASIONS = [
  { id: "", label: "All Occasions" },
  { id: "Casual", label: "Casual" },
  { id: "Work", label: "Work / Smart" },
  { id: "Formal", label: "Formal / Evening" },
  { id: "Active", label: "Activewear" },
];

const SEASONS = [
  { id: "", label: "All Seasons" },
  { id: "Spring", label: "🌸 Spring" },
  { id: "Summer", label: "☀️ Summer" },
  { id: "Autumn", label: "🍂 Autumn" },
  { id: "Winter", label: "❄️ Winter" },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedOccasion,
  selectedSeason,
  onSelectOccasion,
  onSelectSeason,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-3">
      {/* Occasion tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
        {OCCASIONS.map((occ) => {
          const isActive = selectedOccasion === occ.id;
          return (
            <button
              key={occ.id}
              onClick={() => onSelectOccasion(occ.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-amber-400 text-black shadow-sm"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              {occ.label}
            </button>
          );
        })}
      </div>

      {/* Season select */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <span className="text-xs text-neutral-400 font-medium">Climate/Season:</span>
        <select
          value={selectedSeason}
          onChange={(e) => onSelectSeason(e.target.value)}
          className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
        >
          {SEASONS.map((sea) => (
            <option key={sea.id} value={sea.id}>
              {sea.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
