import { useEffect, useRef, useState, useCallback } from "react";
import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import { Badge } from "@/components/ui";
import { useCaptureStore, type CaptureAngle } from "./capture-store";

interface CameraPoseViewfinderProps {
  angle: CaptureAngle;
  onPoseCaptured: (base64Image: string, landmarks: any[]) => void;
}

export function CameraPoseViewfinder({
  angle,
  onPoseCaptured,
}: CameraPoseViewfinderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);

  const [, setHasCameraAccess] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const {
    liveValidation,
    setLiveValidation,
    voicePromptsEnabled,
  } = useCaptureStore();

  const stableValidationRef = useRef<number>(0);
  const lastAnnouncedRef = useRef<string>("");

  const speak = useCallback(
    (text: string) => {
      if (!voicePromptsEnabled || typeof window === "undefined" || !("speechSynthesis" in window))
        return;
      if (lastAnnouncedRef.current === text) return;
      lastAnnouncedRef.current = text;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    },
    [voicePromptsEnabled],
  );

  // 1. Initialize Camera
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasCameraAccess(true);
        }
      } catch (err: any) {
        setHasCameraAccess(false);
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setErrorMessage("Camera access was denied. Please allow camera permissions in your browser.");
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setErrorMessage("No video camera found on this device.");
        } else {
          setErrorMessage("Camera is currently in use or unavailable.");
        }
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // 2. Initialize MediaPipe PoseLandmarker
  useEffect(() => {
    let isCancelled = false;

    async function initMediaPipe() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        if (isCancelled) return;

        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
        });

        if (!isCancelled) {
          landmarkerRef.current = landmarker;
        }
      } catch {
        // Fallback or offline graceful handling
      }
    }

    initMediaPipe();

    return () => {
      isCancelled = true;
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }
    };
  }, []);

  const triggerCapture = useCallback(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const maxDim = 1280;
    let w = video.videoWidth || 640;
    let h = video.videoHeight || 480;

    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
    }

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.88);

    onPoseCaptured(dataUrl, []);
  }, [onPoseCaptured]);

  // 3. Pose Evaluation Loop
  useEffect(() => {
    let animId: number;

    function renderLoop() {
      if (
        videoRef.current &&
        videoRef.current.readyState >= 2 &&
        landmarkerRef.current
      ) {
        const video = videoRef.current;
        const results = landmarkerRef.current.detectForVideo(video, performance.now());

        if (results.landmarks && results.landmarks.length > 0 && results.landmarks[0]) {
          const lms = results.landmarks[0];
          const nose = lms[0];
          const lAnk = lms[27];
          const rAnk = lms[28];
          const lSh = lms[11];
          const rSh = lms[12];
          const lWr = lms[15];
          const rWr = lms[16];

          const hasNose = (nose?.visibility ?? 0) > 0.6;
          const hasFeet = ((lAnk?.visibility ?? 0) > 0.5) || ((rAnk?.visibility ?? 0) > 0.5);
          const fullBody = hasNose && hasFeet;

          const span = Math.abs((lAnk?.y ?? 0.9) - (nose?.y ?? 0.15));
          const distanceOk = span >= 0.55 && span <= 0.95;

          const shDist = Math.abs((rSh?.x ?? 0.5) - (lSh?.x ?? 0.5));
          let correctAngle = true;
          if (angle === "front" || angle === "back") {
            correctAngle = shDist > 0.12;
          } else {
            correctAngle = shDist <= 0.16;
          }

          const lArmOut = (lWr?.x ?? 0) < (lSh?.x ?? 0) - 0.04;
          const rArmOut = (rWr?.x ?? 0) > (rSh?.x ?? 0) + 0.04;
          const armsApart = angle === "front" || angle === "back" ? lArmOut && rArmOut : true;

          const isGood = fullBody && distanceOk && correctAngle && armsApart;

          setLiveValidation({
            fullBodyVisible: fullBody,
            distanceOk,
            correctAngle,
            armsApart,
            uprightCamera: true,
            lightingOk: true,
            sharpnessOk: true,
          });

          if (isGood) {
            stableValidationRef.current += 1;
            if (stableValidationRef.current === 45) {
              speak("Hold steady, capturing in 3 seconds");
              setCountdown(3);
            }
          } else {
            stableValidationRef.current = 0;
            if (countdown !== null) setCountdown(null);
          }
        }
      }
      animId = requestAnimationFrame(renderLoop);
    }

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [angle, countdown, setLiveValidation, speak]);

  // Countdown timer handler
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      triggerCapture();
      return;
    }

    const t = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(t);
  }, [countdown, triggerCapture]);

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center glass-panel rounded-3xl min-h-[360px] gap-4">
        <span className="text-5xl">📷</span>
        <h3 className="text-lg font-bold text-red-400">Camera Unavailable</h3>
        <p className="text-sm text-[var(--color-text-secondary)] max-w-md">
          {errorMessage}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-xs text-[var(--color-brand-primary)] underline cursor-pointer"
        >
          Retry Camera Access
        </button>
      </div>
    );
  }

  return (
    <div className="relative aspect-[9/16] sm:aspect-[3/4] max-h-[640px] w-full overflow-hidden rounded-3xl bg-black border border-[var(--color-border-glass)] shadow-2xl flex items-center justify-center">
      {/* Live Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full object-cover scale-x-[-1]"
      />

      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Countdown Big Display */}
      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-30">
          <span className="font-display text-8xl font-black text-white animate-pulse">
            {countdown}
          </span>
        </div>
      )}

      {/* Live Checklist Indicators */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap gap-1.5 pointer-events-none">
        <Badge variant={liveValidation.fullBodyVisible ? "teal" : "neutral"} size="sm">
          {liveValidation.fullBodyVisible ? "✓ Full Body" : "Step back: show feet & head"}
        </Badge>
        <Badge variant={liveValidation.distanceOk ? "teal" : "neutral"} size="sm">
          {liveValidation.distanceOk ? "✓ Distance" : "Adjust distance"}
        </Badge>
        <Badge variant={liveValidation.correctAngle ? "teal" : "neutral"} size="sm">
          {liveValidation.correctAngle ? "✓ Angle" : `Face ${angle}`}
        </Badge>
        <Badge variant={liveValidation.armsApart ? "teal" : "neutral"} size="sm">
          {liveValidation.armsApart ? "✓ A-Pose" : "Keep arms slightly out"}
        </Badge>
      </div>
    </div>
  );
}
