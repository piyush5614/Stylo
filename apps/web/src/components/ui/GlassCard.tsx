import { forwardRef, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

interface CardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  variant?: "glass" | "solid" | "bordered";
  className?: string;
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = "glass", interactive = false, className = "", ...rest }, ref) => {
    const baseStyle =
      variant === "glass"
        ? "glass-panel"
        : variant === "bordered"
        ? "bg-[var(--color-bg-surface-1)] border border-[var(--color-border-subtle)]"
        : "bg-[var(--color-bg-surface-2)] shadow-md";

    const interactiveAnimation = interactive
      ? {
          whileHover: { y: -4, transition: { duration: 0.2 } },
          whileTap: { y: 0 },
        }
      : {};

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={`rounded-2xl p-6 ${baseStyle} ${className}`}
        {...interactiveAnimation}
        {...rest}
      >
        {children}
      </motion.div>
    );
  },
);

Card.displayName = "Card";

export const GlassCard = Card;
