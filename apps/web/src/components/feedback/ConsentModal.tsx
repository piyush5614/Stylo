import { Button, Modal } from "@/components/ui";

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  isLoading?: boolean;
}

export function ConsentModal({
  isOpen,
  onClose,
  onAccept,
  isLoading = false,
}: ConsentModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Camera Scan & Privacy Consent"
      description="StyleMirror is built privacy-first from the ground up."
      maxWidth="md"
    >
      <div className="flex flex-col gap-4">
        {/* Key Points */}
        <div className="flex flex-col gap-3 rounded-2xl bg-[var(--color-bg-surface-2)] p-4 border border-[var(--color-border-subtle)] text-xs sm:text-sm text-[var(--color-text-secondary)]">
          <div className="flex items-start gap-3">
            <span className="text-xl">🔒</span>
            <div>
              <strong className="text-[var(--color-text-primary)]">
                In-Memory Vision Only
              </strong>
              <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                Your 4 photos are processed live in browser/memory and{" "}
                <span className="text-[var(--color-accent-teal)] font-semibold">
                  never saved or uploaded to storage
                </span>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xl">📐</span>
            <div>
              <strong className="text-[var(--color-text-primary)]">
                Derived Estimates Only
              </strong>
              <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                Only estimated body dimensions (chest, waist, hips) are linked to
                an anonymous session token.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xl">⏳</span>
            <div>
              <strong className="text-[var(--color-text-primary)]">
                24-Hour Auto-Delete
              </strong>
              <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                Sessions expire and are automatically erased after 24 hours.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Decline
          </Button>
          <Button
            variant="primary"
            onClick={onAccept}
            isLoading={isLoading}
            className="glow-brand"
          >
            I Agree &amp; Continue
          </Button>
        </div>
      </div>
    </Modal>
  );
}
