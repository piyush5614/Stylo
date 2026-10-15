import { useState } from "react";
import { Badge, Button, Card, ProgressRing, useToastStore } from "@/components/ui";
import { useUpdateProfileOverrides } from "@/hooks/use-measurements";
import type { MeasurementAnalysis } from "@/types";

interface MeasurementResultCardProps {
  label: string;
  fieldKey: string;
  valueCm: number;
  confidence: number;
  isEdited: boolean;
  onEdit: (field: string, newVal: number) => void;
}

function MeasurementResultRow({
  label,
  fieldKey,
  valueCm,
  confidence,
  isEdited,
  onEdit,
}: MeasurementResultCardProps) {
  const [editing, setEditing] = useState(false);
  const [draftVal, setDraftVal] = useState(valueCm);

  const confPercent = Math.round(confidence * 100);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-[var(--color-bg-surface-2)]/60 border border-[var(--color-border-subtle)] gap-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-[var(--color-text-primary)]">
            {label}
          </span>
          {isEdited && (
            <Badge variant="teal" size="sm">
              Adjusted
            </Badge>
          )}
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <span>Confidence:</span>
          <span
            className={`font-semibold ${
              confPercent >= 85
                ? "text-[var(--color-accent-teal)]"
                : "text-[var(--color-accent-coral)]"
            }`}
          >
            {confPercent}%
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.5"
              value={draftVal}
              onChange={(e) => setDraftVal(Number(e.target.value))}
              className="w-20 rounded-lg bg-[var(--color-bg-surface-1)] border border-[var(--color-border-subtle)] px-2 py-1 text-sm font-mono text-center font-bold text-[var(--color-text-primary)]"
            />
            <span className="text-xs text-[var(--color-text-muted)]">cm</span>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                onEdit(fieldKey, draftVal);
                setEditing(false);
              }}
            >
              Save
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg font-extrabold text-[var(--color-text-primary)]">
              {valueCm.toFixed(1)} <span className="text-xs font-normal text-[var(--color-text-muted)]">cm</span>
            </span>
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-[var(--color-brand-primary)] hover:underline cursor-pointer"
            >
              Adjust
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface MeasurementResultsViewProps {
  analysis: MeasurementAnalysis;
  onContinueToAvatar: () => void;
}

export function MeasurementResultsView({
  analysis,
  onContinueToAvatar,
}: MeasurementResultsViewProps) {
  const [overrides, setOverrides] = useState<Record<string, number>>(
    (analysis.manual_overrides as Record<string, number>) || {}
  );
  const updateMutation = useUpdateProfileOverrides();
  const { addToast } = useToastStore();

  const handleEdit = (field: string, val: number) => {
    const updated = { ...overrides, [field]: val };
    setOverrides(updated);
    updateMutation.mutate({
      [field]: val,
      manual_overrides: updated,
    });
    addToast({
      title: "Measurement updated",
      description: `Saved override for ${field} (${val} cm)`,
      type: "success",
    });
  };

  const overallScore = Math.round(analysis.overall_confidence * 100);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 py-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 glass-panel rounded-3xl p-6 sm:p-8">
        <div>
          <Badge variant="teal" size="sm" className="mb-2">
            Scan Complete
          </Badge>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)]">
            Your Body Profile Estimates
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-xl">
            {analysis.disclaimer}
          </p>
          {analysis.body_type && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-brand-subtle)] px-2.5 py-1 text-xs font-bold text-[var(--color-brand-primary)]">
              <span>Somatic Silhouette:</span>
              <strong className="text-white">{analysis.body_type}</strong>
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          <ProgressRing
            progress={overallScore}
            size={110}
            label={`${overallScore}%`}
            sublabel="Confidence"
          />
        </div>
      </div>

      {/* Measurement Items List */}
      <Card className="flex flex-col gap-3 p-6 sm:p-8">
        <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-2">
          Estimated Anatomical Proportions
        </h2>

        <MeasurementResultRow
          label="Shoulder Breadth"
          fieldKey="shoulder_cm"
          valueCm={overrides.shoulder_cm ?? analysis.shoulder_cm.value_cm}
          confidence={analysis.shoulder_cm.confidence}
          isEdited={"shoulder_cm" in overrides}
          onEdit={handleEdit}
        />
        <MeasurementResultRow
          label="Chest Circumference"
          fieldKey="chest_cm"
          valueCm={overrides.chest_cm ?? analysis.chest_cm.value_cm}
          confidence={analysis.chest_cm.confidence}
          isEdited={"chest_cm" in overrides}
          onEdit={handleEdit}
        />
        <MeasurementResultRow
          label="Waist Circumference"
          fieldKey="waist_cm"
          valueCm={overrides.waist_cm ?? analysis.waist_cm.value_cm}
          confidence={analysis.waist_cm.confidence}
          isEdited={"waist_cm" in overrides}
          onEdit={handleEdit}
        />
        <MeasurementResultRow
          label="Hips Circumference"
          fieldKey="hip_cm"
          valueCm={overrides.hip_cm ?? analysis.hip_cm.value_cm}
          confidence={analysis.hip_cm.confidence}
          isEdited={"hip_cm" in overrides}
          onEdit={handleEdit}
        />
        <MeasurementResultRow
          label="Inseam Length"
          fieldKey="inseam_cm"
          valueCm={overrides.inseam_cm ?? analysis.inseam_cm.value_cm}
          confidence={analysis.inseam_cm.confidence}
          isEdited={"inseam_cm" in overrides}
          onEdit={handleEdit}
        />
        <MeasurementResultRow
          label="Torso Length"
          fieldKey="torso_cm"
          valueCm={overrides.torso_cm ?? analysis.torso_cm.value_cm}
          confidence={analysis.torso_cm.confidence}
          isEdited={"torso_cm" in overrides}
          onEdit={handleEdit}
        />
      </Card>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-[var(--color-text-muted)]">
          Photos processed strictly in memory and never stored on disk.
        </p>
        <Button
          size="lg"
          variant="primary"
          onClick={onContinueToAvatar}
          className="glow-brand w-full sm:w-auto"
        >
          Build 3D Avatar ➔
        </Button>
      </div>
    </div>
  );
}
