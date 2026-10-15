import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Modal,
  ProgressRing,
  Skeleton,
  Slider,
  Stepper,
  Tabs,
  Tooltip,
  useToastStore,
} from "@/components/ui";

export function DevDesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [stepperStep, setStepperStep] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [sliderVal, setSliderVal] = useState(72);
  const { addToast } = useToastStore();

  const stepperItems = [
    { label: "Front Angle" },
    { label: "Right Profile" },
    { label: "Back Pose" },
    { label: "Left Profile" },
  ];

  const tabItems = [
    { id: "all", label: "All Garments", badge: 12 },
    { id: "tops", label: "Tops" },
    { id: "bottoms", label: "Bottoms" },
    { id: "outerwear", label: "Outerwear" },
  ];

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-12 py-8">
      <div>
        <Badge variant="teal" size="sm" className="mb-2">
          [DEV ONLY] Style Guide
        </Badge>
        <h1 className="font-display text-3xl font-extrabold text-[var(--color-text-primary)]">
          StyleMirror Design System &amp; Component Gallery
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Testing all tokens, accessibility focus states, color variants, and micro-interactions.
        </p>
      </div>

      {/* 1. Buttons */}
      <Card className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">1. Buttons</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="accent">Accent Teal</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" isLoading>Loading State</Button>
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="lg">Large Hero</Button>
        </div>
      </Card>

      {/* 2. Badges */}
      <Card className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">2. Badges</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="brand">Brand Badge</Badge>
          <Badge variant="teal">Active Fit</Badge>
          <Badge variant="coral">Season Must-Have</Badge>
          <Badge variant="neutral">Neutral Outline</Badge>
          <Badge variant="outline">100% Linen</Badge>
        </div>
      </Card>

      {/* 3. Stepper & Progress Ring */}
      <Card className="flex flex-col gap-6">
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
          3. Stepper &amp; Circular Progress
        </h2>
        <div className="w-full">
          <Stepper
            steps={stepperItems}
            currentStep={stepperStep}
            onStepClick={(i) => setStepperStep(i)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-8 pt-4">
          <ProgressRing progress={94} label="94%" sublabel="Pose Accuracy" />
          <ProgressRing progress={sliderVal} label={`${sliderVal}cm`} sublabel="Waist Estimate" />
          <ProgressRing progress={48} label="48%" sublabel="Processing" strokeWidth={6} size={90} />
        </div>
      </Card>

      {/* 4. Tabs & Slider */}
      <Card className="flex flex-col gap-6">
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">4. Tabs &amp; Slider</h2>
        <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} />
        <div className="max-w-md pt-2">
          <Slider
            label="Chest Width Adjustment"
            unit=" cm"
            value={sliderVal}
            min={50}
            max={130}
            onChange={setSliderVal}
          />
        </div>
      </Card>

      {/* 5. Tooltip & Toasts & Modal */}
      <Card className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
          5. Feedback, Tooltip &amp; Dialogs
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <Tooltip content="Estimated with 96% AI confidence score">
            <span className="cursor-help underline text-sm text-[var(--color-brand-primary)]">
              Hover for Tooltip
            </span>
          </Tooltip>

          <Button
            variant="secondary"
            onClick={() =>
              addToast({
                title: "Measurements Updated",
                description: "Waist circumference adjusted to 72cm.",
                type: "success",
              })
            }
          >
            Trigger Success Toast
          </Button>

          <Button
            variant="secondary"
            onClick={() =>
              addToast({
                title: "Lighting Warning",
                description: "Please step into an evenly lit area.",
                type: "warning",
              })
            }
          >
            Trigger Warning Toast
          </Button>

          <Button variant="primary" onClick={() => setModalOpen(true)}>
            Open Sample Modal
          </Button>
        </div>

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Component Dialog Demo"
          description="Framer-motion spring animated modal dialog with keyboard trap."
        >
          <div className="py-2 text-sm text-[var(--color-text-secondary)]">
            This modal supports custom children, backdrop click to close, escape key listener, and responsive scaling.
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="primary" onClick={() => setModalOpen(false)}>
              Got It
            </Button>
          </div>
        </Modal>
      </Card>

      {/* 6. Skeletons */}
      <Card className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">6. Skeleton Loading States</h2>
        <div className="flex flex-col gap-2 max-w-sm">
          <Skeleton variant="text" />
          <Skeleton variant="text" className="w-2/3" />
          <Skeleton variant="rectangular" className="h-28 w-full mt-2" />
        </div>
      </Card>
    </div>
  );
}
