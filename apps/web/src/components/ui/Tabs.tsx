import { motion } from "framer-motion";

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className = "" }: TabsProps) {
  return (
    <div
      role="tablist"
      className={`inline-flex rounded-xl p-1 bg-[var(--color-bg-surface-2)] border border-[var(--color-border-subtle)] ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative rounded-lg px-4 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer select-none flex items-center gap-1.5 ${
              isActive
                ? "text-[var(--color-text-primary)] font-semibold"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 rounded-lg bg-[var(--color-bg-surface-1)] shadow-sm -z-0"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
            {tab.badge && (
              <span className="relative z-10 text-[10px] rounded-full px-1.5 py-0.2 bg-[var(--color-brand-subtle)] text-[var(--color-brand-primary)]">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
