import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, Slider, Stepper, useToastStore } from "@/components/ui";
import { useAnalyzeMeasurements } from "@/hooks/use-measurements";
import { CameraPoseViewfinder } from "@/features/capture/CameraPoseViewfinder";
import { SilhouetteOverlay } from "@/features/capture/SilhouetteOverlay";
import { MeasurementResultsView } from "@/features/capture/MeasurementResultsView";
import {
  useCaptureStore,
  type CaptureAngle,
} from "@/features/capture/capture-store";

const wizardSteps = [
  { label: "Height" },
  { label: "Front Pose" },
  { label: "Right Profile" },
  { label: "Back Pose" },
  { label: "Left Profile" },
  { label: "Results" },
];

const angleSequence: CaptureAngle[] = ["front", "right", "back", "left"];

export function CaptureFlowPage() {
  const navigate = useNavigate();
  const {
    activeStep,
    setActiveStep,
    heightCm,
    setHeightCm,
    capturedPoses,
    setCapturedPose,
    liveValidation,
    voicePromptsEnabled,
    toggleVoicePrompts,
    analysisResult,
    setAnalysisResult,
  } = useCaptureStore();

  const analyzeMutation = useAnalyzeMeasurements();
  const { addToast } = useToastStore();
  const [manualCaptureAllowed] = useState(true);

  // Map step to numerical index for Stepper component
  const currentStepIndex =
    activeStep === "height"
      ? 0
      : activeStep === "front"
      ? 1
      : activeStep === "right"
      ? 2
      : activeStep === "back"
      ? 3
      : activeStep === "left"
      ? 4
      : 5;

  const currentAngle = (activeStep !== "height" && activeStep !== "review")
    ? (activeStep as CaptureAngle)
    : "front";

  const handlePoseCaptured = async (base64Img: string, landmarks: any[]) => {
    setCapturedPose(currentAngle, {
      angle: currentAngle,
      image_base64: base64Img,
      landmarks,
    });

    addToast({
      title: `${currentAngle.toUpperCase()} captured`,
      description: "Frame analyzed in memory",
      type: "success",
    });

    const currentIndex = angleSequence.indexOf(currentAngle);
    if (currentIndex < angleSequence.length - 1) {
      setActiveStep(angleSequence[currentIndex + 1]!);
    } else {
      // Completed all 4 poses -> send to backend analysis
      try {
        const posesPayload = Object.values({
          ...capturedPoses,
          [currentAngle]: { angle: currentAngle, image_base64: base64Img, landmarks },
        }).filter(Boolean) as any[];

        const res = await analyzeMutation.mutateAsync({
          height_cm: heightCm,
          poses: posesPayload,
        });

        setAnalysisResult(res);
        setActiveStep("review");
      } catch (err: any) {
        addToast({
          title: "Analysis Failed",
          description: err.message || "Could not compute body dimensions.",
          type: "error",
        });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 py-6">
      {/* Progress Stepper */}
      <div className="w-full">
        <Stepper steps={wizardSteps} currentStep={currentStepIndex} />
      </div>

      {/* Step 1: Ground Truth Height Entry */}
      {activeStep === "height" && (
        <Card className="max-w-md mx-auto w-full flex flex-col gap-6 p-8 text-center">
          <span className="text-5xl">📏</span>
          <div>
            <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
              Enter Your Exact Stature
            </h1>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              Used for millimetric scale calibration across all 4 camera frames.
            </p>
          </div>

          <div className="my-2">
            <Slider
              label="Ground-Truth Stature"
              unit=" cm"
              value={heightCm}
              min={120}
              max={230}
              onChange={setHeightCm}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] border-t border-[var(--color-border-subtle)] pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={voicePromptsEnabled}
                onChange={toggleVoicePrompts}
                className="accent-[var(--color-brand-primary)]"
              />
              <span>Enable voice guidance</span>
            </label>
          </div>

          <Button
            size="lg"
            variant="primary"
            onClick={() => setActiveStep("front")}
            className="glow-brand"
          >
            Next: Position Front Pose ➔
          </Button>
        </Card>
      )}

      {/* Steps 2-5: Live Camera Viewfinder with Overlay */}
      {activeStep !== "height" && activeStep !== "review" && (
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center justify-between w-full max-w-lg">
            <div>
              <h2 className="font-display text-xl font-bold text-[var(--color-text-primary)] capitalize">
                {activeStep} Capture
              </h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                {activeStep === "front" && "Stand upright in A-pose with palms open."}
                {activeStep === "right" && "Turn 90° to your right side."}
                {activeStep === "back" && "Turn with your back directly facing the camera."}
                {activeStep === "left" && "Turn 90° to your left side."}
              </p>
            </div>
            <Badge variant="brand" size="md">
              Step {currentStepIndex} of 4
            </Badge>
          </div>

          <div className="relative w-full max-w-lg">
            <CameraPoseViewfinder
              angle={currentAngle}
              onPoseCaptured={handlePoseCaptured}
            />
            <SilhouetteOverlay
              angle={currentAngle}
              isReady={liveValidation.isReady}
            />
          </div>

          {/* Controls: Retake & Manual Fallback Capture */}
          <div className="flex items-center justify-between w-full max-w-lg text-xs">
            <button
              onClick={() => {
                if (currentStepIndex > 1) {
                  setActiveStep(angleSequence[currentStepIndex - 2]!);
                } else {
                  setActiveStep("height");
                }
              }}
              className="text-[var(--color-text-muted)] hover:underline"
            >
              ← Back
            </button>

            {manualCaptureAllowed && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePoseCaptured("data:image/jpeg;base64,mock", [])}
              >
                Manual Snap (Fallback)
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Step 6: Measurement Results & Manual Corrections */}
      {activeStep === "review" && analysisResult && (
        <MeasurementResultsView
          analysis={analysisResult}
          onContinueToAvatar={() => navigate("/avatar")}
        />
      )}
    </div>
  );
}
