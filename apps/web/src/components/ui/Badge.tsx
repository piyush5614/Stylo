import type { ReactNode } from "react";

type BadgeVariant = "brand" | "teal" | "coral" | "neutral" | "outline";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  brand: "bg-[var(--color-brand-subtle)] text-[var(--color-brand-primary)] border border-[var(--color-brand-primary)]/20",
  teal: "bg-[var(--color-accent-teal)]/15 text-[var(--color-accent-teal)] border border-[var(--color-accent-teal)]/30",
  coral: "bg-[var(--color-accent-coral)]/15 text-[var(--color-accent-coral)] border border-[var(--color-accent-coral)]/30",
  neutral: "bg-[var(--color-bg-surface-3)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]",
  outline: "border border-[var(--color-border-subtle)] text-[var(--color-text-muted)]",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[11px] rounded-md",
  md: "px-2.5 py-1 text-xs rounded-lg font-medium",
};

export function Badge({
  children,
  variant = "brand",
  size = "md",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-medium tracking-tight ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}
