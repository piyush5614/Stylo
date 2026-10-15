import { GlassCard } from "@/components/ui";

/** Placeholder for the guided capture flow – implemented in Part 3. */
export function CapturePage() {
  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-6 pt-10">
      <GlassCard className="flex flex-col items-center gap-4 text-center">
        <span className="text-5xl">📸</span>
        <h2 className="font-display text-2xl font-bold text-white">
          Photo Capture
        </h2>
        <p className="text-brand-300">
          The guided 4-angle photo capture will be implemented in Part 3.
        </p>
      </GlassCard>
    </div>
  );
}
