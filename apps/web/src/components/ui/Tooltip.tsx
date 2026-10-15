import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: "top" | "bottom";
}

export function Tooltip({ content, children, position = "top" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            role="tooltip"
            initial={{ opacity: 0, y: position === "top" ? 4 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={`absolute left-1/2 -translate-x-1/2 z-50 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-medium text-white bg-black/80 backdrop-blur-md border border-white/10 shadow-lg pointer-events-none ${
              position === "top" ? "bottom-full mb-2" : "top-full mt-2"
            }`}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
