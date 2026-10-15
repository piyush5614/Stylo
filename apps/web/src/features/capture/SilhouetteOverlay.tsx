import type { CaptureAngle } from "./capture-store";

interface SilhouetteOverlayProps {
  angle: CaptureAngle;
  isReady: boolean;
}

export function SilhouetteOverlay({ angle, isReady }: SilhouetteOverlayProps) {
  const strokeColor = isReady ? "var(--color-accent-teal)" : "var(--color-brand-primary)";

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <svg
        viewBox="0 0 400 800"
        className="h-full w-auto max-h-[85%] transition-all duration-300 opacity-70"
        fill="none"
        stroke={strokeColor}
        strokeWidth="3"
        strokeDasharray={isReady ? "none" : "8 8"}
      >
        {/* Head */}
        <circle cx="200" cy="110" r="45" />

        {/* Neck */}
        <line x1="200" y1="155" x2="200" y2="185" />

        {angle === "front" || angle === "back" ? (
          <>
            {/* Shoulders */}
            <line x1="130" y1="200" x2="270" y2="200" />
            {/* Arms in A-Pose */}
            <line x1="130" y1="200" x2="90" y2="380" />
            <line x1="270" y1="200" x2="310" y2="380" />
            {/* Torso */}
            <path d="M 140 200 L 160 340 L 150 420 L 250 420 L 240 340 L 260 200 Z" />
            {/* Legs */}
            <line x1="175" y1="420" x2="165" y2="720" />
            <line x1="225" y1="420" x2="235" y2="720" />
          </>
        ) : (
          <>
            {/* Profile Spine & Chest Curve */}
            <path d="M 200 185 Q 220 280 205 350 Q 225 410 200 460" />
            <path d="M 195 185 Q 175 280 185 350 Q 175 420 190 460" />
            {/* Profile Arm */}
            <line x1="200" y1="210" x2="215" y2="380" />
            {/* Profile Leg */}
            <line x1="195" y1="460" x2="195" y2="730" />
          </>
        )}

        {/* Framing Guides: Top of Head & Floor Contact */}
        <line x1="50" y1="65" x2="350" y2="65" strokeWidth="1" strokeDasharray="4 4" />
        <text x="55" y="55" fill={strokeColor} fontSize="12" fontFamily="sans-serif">
          HEAD ALIGNMENT
        </text>

        <line x1="50" y1="740" x2="350" y2="740" strokeWidth="1" strokeDasharray="4 4" />
        <text x="55" y="760" fill={strokeColor} fontSize="12" fontFamily="sans-serif">
          FEET GROUND PLANE
        </text>
      </svg>
    </div>
  );
}
