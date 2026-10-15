import { create } from "zustand";
import type { Session } from "@/types";

interface AppState {
  /** The current anonymous session, if any. */
  session: Session | null;
  setSession: (session: Session | null) => void;

  /** Current step in the main flow. */
  step: "landing" | "capture" | "measurements" | "avatar" | "tryon" | "recommendations";
  setStep: (step: AppState["step"]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  session: null,
  setSession: (session) => set({ session }),

  step: "landing",
  setStep: (step) => set({ step }),
}));
