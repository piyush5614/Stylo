interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
}

export function Skeleton({ className = "", variant = "rectangular" }: SkeletonProps) {
  const variantStyles = {
    text: "h-4 w-full rounded",
    circular: "rounded-full",
    rectangular: "rounded-xl",
  };

  return (
    <div
      className={`animate-pulse bg-[var(--color-bg-surface-3)]/60 ${variantStyles[variant]} ${className}`}
      aria-hidden="true"
    />
  );
}
