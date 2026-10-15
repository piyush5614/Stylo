import React from "react";

interface ProfileEditorProps {
  bodyType: string;
  undertone: string;
  depth: string;
  onUpdateBodyType: (val: string) => void;
  onUpdateUndertone: (val: string) => void;
  onUpdateDepth: (val: string) => void;
}

const BODY_TYPES = [
  { value: "hourglass", label: "Hourglass", desc: "Balanced shoulders & hips with defined waist" },
  { value: "inverted_triangle", label: "Inverted Triangle", desc: "Broad shoulders tapering to hips" },
  { value: "pear", label: "Pear", desc: "Gentle shoulder line with fuller hip proportion" },
  { value: "rectangle", label: "Rectangle", desc: "Streamlined alignment across torso" },
  { value: "round", label: "Round", desc: "Soft torso contours with relaxed waistline" },
];

const UNDERTONES = [
  { value: "warm", label: "Warm", hex: "#E3DAC9", desc: "Golden, peachy, or olive undertones" },
  { value: "cool", label: "Cool", hex: "#243447", desc: "Rose, pink, or bluish undertones" },
  { value: "neutral", label: "Neutral", hex: "#D8CBB5", desc: "Balanced harmony across spectrum" },
];

const DEPTHS = [
  { value: "light", label: "Fair / Light" },
  { value: "medium", label: "Medium / Tan" },
  { value: "deep", label: "Rich / Deep" },
];

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  bodyType,
  undertone,
  depth,
  onUpdateBodyType,
  onUpdateUndertone,
  onUpdateDepth,
}) => {
  return (
    <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>✨</span> Active Profile Attributes
          </h2>
          <p className="text-xs text-neutral-400">
            Detected from your scan. Modify anytime to test styling adaptability.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Body Type Selection */}
        <div>
          <label className="text-xs uppercase font-semibold tracking-wider text-neutral-400 block mb-1.5">
            Body Proportion
          </label>
          <select
            value={bodyType}
            onChange={(e) => onUpdateBodyType(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {BODY_TYPES.map((bt) => (
              <option key={bt.value} value={bt.value}>
                {bt.label}
              </option>
            ))}
          </select>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            {BODY_TYPES.find((b) => b.value === bodyType)?.desc}
          </span>
        </div>

        {/* Undertone Selection */}
        <div>
          <label className="text-xs uppercase font-semibold tracking-wider text-neutral-400 block mb-1.5">
            Complexion Undertone
          </label>
          <select
            value={undertone}
            onChange={(e) => onUpdateUndertone(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {UNDERTONES.map((ut) => (
              <option key={ut.value} value={ut.value}>
                {ut.label} ({ut.desc.split(" ")[0]})
              </option>
            ))}
          </select>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            {UNDERTONES.find((u) => u.value === undertone)?.desc}
          </span>
        </div>

        {/* Skin Depth Selection */}
        <div>
          <label className="text-xs uppercase font-semibold tracking-wider text-neutral-400 block mb-1.5">
            Skin Depth
          </label>
          <select
            value={depth}
            onChange={(e) => onUpdateDepth(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {DEPTHS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            Calibrates contrast & palette saturation
          </span>
        </div>
      </div>
    </div>
  );
};
