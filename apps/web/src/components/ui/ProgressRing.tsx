import { motion } from "framer-motion";

interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  label,
  sublabel,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(Math.max(progress, 0), 100) / 100) * circumference;

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--color-bg-surface-3)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated fill */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--color-brand-primary)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-lg font-bold text-[var(--color-text-primary)]">
          {label ?? `${Math.round(progress)}%`}
        </span>
        {sublabel && (
          <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
