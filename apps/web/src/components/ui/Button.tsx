import { forwardRef, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

type ButtonVariant = "primary" | "secondary" | "ghost" | "accent" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-hover)] shadow-md shadow-[var(--color-brand-primary)]/20",
  secondary:
    "bg-[var(--color-bg-surface-2)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface-3)] border border-[var(--color-border-subtle)]",
  outline:
    "bg-transparent text-[var(--color-brand-primary)] hover:bg-[var(--color-brand-subtle)] border border-[var(--color-brand-primary)]",
  ghost:
    "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface-2)] hover:text-[var(--color-text-primary)]",
  accent:
    "bg-[var(--color-accent-teal)] text-[var(--color-bg-base)] hover:opacity-90 font-bold",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-7 py-3.5 text-base rounded-2xl gap-2.5 font-semibold",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      children,
      className = "",
      disabled,
      ...rest
    },
    ref,
  ) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.98 }}
        className={`
          inline-flex items-center justify-center
          font-medium transition-colors cursor-pointer select-none
          disabled:opacity-50 disabled:pointer-events-none
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
        disabled={disabled ?? isLoading}
        {...rest}
      >
        {isLoading && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="opacity-25"
            />
            <path
              d="M4 12a8 8 0 018-8"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="opacity-80"
            />
          </svg>
        )}
        {children}
      </motion.button>
    );
  },
);

Button.displayName = "Button";
