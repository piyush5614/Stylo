import { motion } from "framer-motion";

interface Step {
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number; // 0-indexed
  onStepClick?: (stepIndex: number) => void;
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Background Track */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-[var(--color-bg-surface-3)] -z-0" />

        {/* Active Progress Bar */}
        <motion.div
          className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-[var(--color-brand-primary)] -z-0"
          initial={{ width: 0 }}
          animate={{
            width: `${(currentStep / Math.max(steps.length - 1, 1)) * 100}%`,
          }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={step.label}
              className="flex flex-col items-center relative z-10"
              onClick={() => onStepClick && onStepClick(idx)}
            >
              <motion.div
                whileHover={onStepClick ? { scale: 1.1 } : {}}
                className={`
                  flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all
                  ${
                    isCurrent
                      ? "bg-[var(--color-brand-primary)] text-white ring-4 ring-[var(--color-brand-subtle)]"
                      : isCompleted
                      ? "bg-[var(--color-accent-teal)] text-[var(--color-bg-base)]"
                      : "bg-[var(--color-bg-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]"
                  }
                  ${onStepClick ? "cursor-pointer" : ""}
                `}
              >
                {isCompleted ? "✓" : idx + 1}
              </motion.div>
              <span
                className={`mt-2 text-xs font-medium text-center hidden sm:block ${
                  isCurrent
                    ? "text-[var(--color-text-primary)] font-bold"
                    : "text-[var(--color-text-muted)]"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
