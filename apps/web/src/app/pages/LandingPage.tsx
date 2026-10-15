import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { ConsentModal } from "@/components/feedback/ConsentModal";
import { Badge, Button, Card } from "@/components/ui";
import { useCreateSession } from "@/hooks/use-catalog";

const howItWorksSteps = [
  {
    step: "01",
    title: "Guided 4-Angle Capture",
    desc: "Take four quick photos (front, right, back, left) with real-time pose guidance. Everything runs in-memory on your device.",
    icon: "📸",
  },
  {
    step: "02",
    title: "3D Parametric Avatar",
    desc: "We compute 7 key body dimensions and generate an interactive 3D digital double you can inspect in full 360° rotation.",
    icon: "🧍",
  },
  {
    step: "03",
    title: "Virtual Try-On & Advice",
    desc: "Preview 3D garments fitted to your exact proportions, with fabric specifications, color matching, and size guidance.",
    icon: "✨",
  },
];

const modules = [
  { title: "Accurate Body Estimation", desc: "Height, shoulders, chest, waist, hips, inseam, torso with confidence score.", tag: "Vision AI" },
  { title: "360° Interactive Avatar", desc: "WebGL-powered parametric 3D body representation using Three.js.", tag: "3D Engine" },
  { title: "Auto-Fitting 3D Catalog", desc: "Realistic digital garments auto-draped onto your personalized avatar.", tag: "Virtual Try-On" },
  { title: "Smart Sizing & Fit Advisor", desc: "Eliminates return guesswork by matching your curves to garment dimensions.", tag: "Recommendation" },
  { title: "Palette & Skin-Tone Harmony", desc: "Color theory recommendations tuned to your natural undertone.", tag: "Styling" },
  { title: "Fabric Science & Care", desc: "Textile breathability, stretch ratings, eco benefits, and washing instructions.", tag: "Textile Tech" },
  { title: "Zero-Storage Privacy", desc: "Photos processed strictly in memory and never stored in any cloud bucket.", tag: "Privacy First" },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export function LandingPage() {
  const navigate = useNavigate();
  const [consentOpen, setConsentOpen] = useState(false);
  const createSession = useCreateSession();

  const handleStartScan = () => {
    setConsentOpen(true);
  };

  const handleConsentAccepted = async () => {
    try {
      await createSession.mutateAsync({ consent_given: true });
      setConsentOpen(false);
      navigate("/scan");
    } catch {
      // Navigate on completion or fallback
      setConsentOpen(false);
      navigate("/scan");
    }
  };

  return (
    <div className="flex flex-col items-center gap-20 py-8 sm:py-16">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center max-w-4xl gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Badge variant="brand" size="md">
            ✦ AI-Powered 3D Virtual Fitting Room
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-[var(--color-text-primary)]"
        >
          Try on clothes in 3D.{" "}
          <span className="bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-accent-teal)] bg-clip-text text-transparent">
            Fitted to your exact body.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl text-base sm:text-xl text-[var(--color-text-secondary)] leading-relaxed"
        >
          Take 4 guided photos. Get estimated body measurements, generate an interactive
          3D avatar, and experience virtual try-on with fabric intelligence.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-2"
        >
          <Button
            size="lg"
            variant="primary"
            onClick={handleStartScan}
            className="glow-brand text-base px-8 py-4"
          >
            Start Your Fit Scan
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate("/tryon")}
            className="text-base"
          >
            Explore 3D Garments
          </Button>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-[var(--color-text-muted)]"
        >
          <span>✓ Zero photos stored</span>
          <span>✓ Works on any phone or laptop camera</span>
          <span>✓ 24-hour auto-expiring sessions</span>
        </motion.div>
      </section>

      {/* How It Works (3 Steps) */}
      <section className="w-full max-w-5xl flex flex-col gap-10">
        <div className="text-center">
          <Badge variant="teal" size="sm" className="mb-2">Simple Workflow</Badge>
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-[var(--color-text-primary)]">
            How StyleMirror Works
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            From camera viewfinder to accurate 3D try-on in under 90 seconds.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {howItWorksSteps.map((s) => (
            <motion.div key={s.step} variants={itemVariants}>
              <Card interactive className="h-full flex flex-col justify-between p-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{s.icon}</span>
                    <span className="font-mono text-sm font-extrabold text-[var(--color-brand-primary)]">
                      {s.step}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-[var(--color-text-primary)]">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Feature Modules */}
      <section className="w-full max-w-5xl flex flex-col gap-10">
        <div className="text-center">
          <Badge variant="coral" size="sm" className="mb-2">Full Suite</Badge>
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-[var(--color-text-primary)]">
            Every Feature You Need
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Precision fit engineering meets modern digital fashion.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {modules.map((m) => (
            <motion.div key={m.title} variants={itemVariants}>
              <Card className="h-full p-5 flex flex-col justify-between">
                <div>
                  <Badge variant="neutral" size="sm" className="mb-2">
                    {m.tag}
                  </Badge>
                  <h4 className="font-display text-base font-bold text-[var(--color-text-primary)]">
                    {m.title}
                  </h4>
                  <p className="mt-1.5 text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Privacy & Consent Banner */}
      <section className="w-full max-w-5xl">
        <Card variant="bordered" className="p-8 bg-[var(--color-bg-surface-2)]/60">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <span className="text-4xl">🛡️</span>
              <div>
                <h3 className="font-display text-xl font-bold text-[var(--color-text-primary)]">
                  Privacy First. Always.
                </h3>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)] max-w-xl">
                  User photos are processed strictly in browser memory and discarded immediately.
                  Only anonymized derived measurements are retained for 24 hours.
                </p>
              </div>
            </div>
            <Button variant="primary" onClick={handleStartScan} className="whitespace-nowrap">
              Review Consent &amp; Scan
            </Button>
          </div>
        </Card>
      </section>

      {/* Consent Modal Trigger */}
      <ConsentModal
        isOpen={consentOpen}
        onClose={() => setConsentOpen(false)}
        onAccept={handleConsentAccepted}
        isLoading={createSession.isPending}
      />
    </div>
  );
}
