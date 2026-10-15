interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  label?: string;
  unit?: string;
  className?: string;
}

export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  unit = "",
  className = "",
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`w-full flex flex-col gap-2 ${className}`}>
      {(label || unit) && (
        <div className="flex items-center justify-between text-xs">
          {label && (
            <span className="font-medium text-[var(--color-text-secondary)]">
              {label}
            </span>
          )}
          <span className="font-mono font-bold text-[var(--color-text-primary)]">
            {value}
            {unit}
          </span>
        </div>
      )}
      <div className="relative flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-[var(--color-bg-surface-3)] accent-[var(--color-brand-primary)]"
          style={{
            background: `linear-gradient(to right, var(--color-brand-primary) ${percentage}%, var(--color-bg-surface-3) ${percentage}%)`,
          }}
        />
      </div>
    </div>
  );
}
