import { AnimatePresence, motion } from "framer-motion";
import { create } from "zustand";

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: "info" | "success" | "warning" | "error";
}

interface ToastStore {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            className={`pointer-events-auto rounded-xl p-4 glass-panel border shadow-xl flex items-start justify-between gap-3 ${
              toast.type === "error"
                ? "border-red-500/40 bg-red-500/10"
                : toast.type === "success"
                ? "border-teal-500/40 bg-teal-500/10"
                : "border-[var(--color-border-subtle)]"
            }`}
          >
            <div>
              <h5 className="text-sm font-semibold text-[var(--color-text-primary)]">
                {toast.title}
              </h5>
              {toast.description && (
                <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
