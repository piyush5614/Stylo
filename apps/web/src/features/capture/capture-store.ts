import { create } from "zustand";
import type { CapturedPosePayload, MeasurementAnalysis } from "@/types";

export type CaptureAngle = "front" | "right" | "back" | "left";

export interface PoseValidationStatus {
  fullBodyVisible: boolean;
  distanceOk: boolean; // 70-90% vertical frame occupancy
  correctAngle: boolean;
  armsApart: boolean; // A-pose
  uprightCamera: boolean;
  lightingOk: boolean;
  sharpnessOk: boolean;
  isReady: boolean;
}

interface CaptureState {
  // Wizard step
  activeStep: "height" | "front" | "right" | "back" | "left" | "review";
  setActiveStep: (step: CaptureState["activeStep"]) => void;

  // Ground truth user height
  heightCm: number;
  setHeightCm: (height: number) => void;

  // Stored poses
  capturedPoses: Record<CaptureAngle, CapturedPosePayload | null>;
  setCapturedPose: (angle: CaptureAngle, pose: CapturedPosePayload) => void;
  clearPoses: () => void;

  // Current pose live checks
  liveValidation: PoseValidationStatus;
  setLiveValidation: (val: Partial<PoseValidationStatus>) => void;

  // Voice prompts setting
  voicePromptsEnabled: boolean;
  toggleVoicePrompts: () => void;

  // Final measurement analysis
  analysisResult: MeasurementAnalysis | null;
  setAnalysisResult: (result: MeasurementAnalysis | null) => void;
}

export const useCaptureStore = create<CaptureState>((set) => ({
  activeStep: "height",
  setActiveStep: (activeStep) => set({ activeStep }),

  heightCm: 175,
  setHeightCm: (heightCm) => set({ heightCm }),

  capturedPoses: {
    front: null,
    right: null,
    back: null,
    left: null,
  },
  setCapturedPose: (angle, pose) =>
    set((state) => ({
      capturedPoses: { ...state.capturedPoses, [angle]: pose },
    })),
  clearPoses: () =>
    set({
      capturedPoses: { front: null, right: null, back: null, left: null },
      analysisResult: null,
    }),

  liveValidation: {
    fullBodyVisible: false,
    distanceOk: false,
    correctAngle: false,
    armsApart: false,
    uprightCamera: true,
    lightingOk: true,
    sharpnessOk: true,
    isReady: false,
  },
  setLiveValidation: (val) =>
    set((state) => {
      const merged = { ...state.liveValidation, ...val };
      merged.isReady =
        merged.fullBodyVisible &&
        merged.distanceOk &&
        merged.correctAngle &&
        merged.armsApart &&
        merged.uprightCamera &&
        merged.lightingOk &&
        merged.sharpnessOk;
      return { liveValidation: merged };
    }),

  voicePromptsEnabled: false,
  toggleVoicePrompts: () =>
    set((state) => ({ voicePromptsEnabled: !state.voicePromptsEnabled })),

  analysisResult: null,
  setAnalysisResult: (analysisResult) => set({ analysisResult }),
}));
