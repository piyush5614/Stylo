import { Button, Card } from "@/components/ui";

interface PlaceholderProps {
  title: string;
  module: string;
  description: string;
  icon: string;
}

export function PlaceholderPage({ title, module, description, icon }: PlaceholderProps) {
  return (
    <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-6 py-16">
      <Card className="p-10 flex flex-col items-center gap-4 max-w-lg w-full">
        <span className="text-6xl">{icon}</span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
          {title}
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          {description}
        </p>
        <div className="rounded-lg bg-[var(--color-brand-subtle)] px-3 py-1 text-xs font-semibold text-[var(--color-brand-primary)]">
          Module: {module}
        </div>
        <div className="pt-4">
          <Button variant="secondary" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </Card>
    </div>
  );
}
