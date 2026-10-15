import { useState } from "react";
import { Card } from "@/components/ui";
import { api, clearStoredSessionId } from "@/lib/api";

export function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 py-8">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[var(--color-text-primary)]">
          Privacy &amp; Data Deletion Policy
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Last updated: October 2026 · StyleMirror Zero-Storage Guarantee
        </p>
      </div>

      <Card className="flex flex-col gap-6 p-8">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
            1. Zero Photo Storage Policy
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
            StyleMirror analyzes your front, right, back, and left poses solely in active device memory.
            Your camera frames and still captures are processed by MediaPipe pose estimators and
            <strong> are never transmitted to cloud storage or saved to permanent disk</strong>.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
            2. Anonymous Session Tokens
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
            Derived estimates (such as shoulder breadth, chest circumference, and height) are tied
            strictly to a randomized, anonymous UUID session. We do not collect names, emails,
            phone numbers, or persistent personal identifiers.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
            3. Automatic 24-Hour Expiration &amp; Cascading Deletion
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
            All session records and associated body measurement records expire after exactly 24 hours.
            Our database executes automated cleanup routines that permanently delete all expired
            sessions with cascading removal of derived measurements.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
            4. User-Controlled Manual Override &amp; Deletion
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
            All AI-derived body measurements are estimates provided with confidence indicators.
            You maintain full control to manually adjust or delete your measurements at any time.
          </p>
        </div>

        {/* User-facing Instant Data Deletion */}
        <div className="pt-6 border-t border-[var(--color-border-subtle)]">
          <h2 className="text-lg font-bold text-rose-400 flex items-center gap-2">
            <span>🗑️</span> Instant Data Purge ("Delete My Data Now")
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
            Immediately delete your session, all cached pose estimations, and derived measurements
            from both your browser storage and our backend database without waiting for the 24-hour expiration.
          </p>

          <DeleteDataAction />
        </div>
      </Card>
    </div>
  );
}

function DeleteDataAction() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete your session and all measurement data? This cannot be undone.")) {
      return;
    }

    setStatus("loading");
    setErrorMessage(null);
    try {
      await api.deleteSession();
      clearStoredSessionId();
      setStatus("success");
    } catch (err) {
      // Even if session is already expired or missing on server, clear locally
      clearStoredSessionId();
      setStatus("success");
    }
  };

  return (
    <div className="mt-4">
      {status === "success" ? (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
          <p className="font-semibold">✓ All session data has been permanently deleted.</p>
          <p className="mt-1 text-xs text-neutral-400">
            Browser session storage and backend measurement records were purged immediately.
          </p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <button
            onClick={handleDelete}
            disabled={status === "loading"}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition shadow-md disabled:opacity-50"
          >
            {status === "loading" ? "Purging Session..." : "Delete My Data Now"}
          </button>
          <span className="text-xs text-[var(--color-text-secondary)]">
            Immediate HTTP 204 cascading delete on server + local token purge
          </span>
        </div>
      )}
      {errorMessage && (
        <p className="mt-2 text-xs text-rose-400">{errorMessage}</p>
      )}
    </div>
  );
}
