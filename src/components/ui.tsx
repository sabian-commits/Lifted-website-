"use client";

import type { Stage } from "@/lib/types";

// Visual marker for the "stars → stems" metaphor from the playbook.
// Filled stems are earned; empty stems are the remaining rungs.
export function StemMeter({
  current,
  max = 7,
}: {
  current: number;
  max?: number;
}) {
  // The ladder is 1,2,3,(4 gap),5,(6 gap),7 — render 7 slots, gaps dimmed.
  const slots = Array.from({ length: max }, (_, i) => i + 1);
  const gaps = new Set([4, 6]);
  return (
    <div className="flex items-end gap-1" aria-label={`${current} of ${max}`}>
      {slots.map((n) => {
        const filled = n <= current;
        const isGap = gaps.has(n);
        return (
          <span
            key={n}
            title={isGap ? "Development gap" : `Level ${n}`}
            style={{
              display: "inline-block",
              width: isGap ? 6 : 12,
              height: filled ? 16 + n : 12,
              borderRadius: 4,
              background: filled
                ? "linear-gradient(180deg, var(--green-500), var(--green-900))"
                : isGap
                  ? "#e0ddd2"
                  : "#dfe7e2",
              opacity: isGap ? 0.5 : 1,
            }}
          />
        );
      })}
    </div>
  );
}

export function StageChip({ stage }: { stage: Stage }) {
  const label =
    stage === "see" ? "See" : stage === "grow" ? "Grow" : "Multiply";
  return <span className={`chip chip-${stage}`}>{label}</span>;
}

export function Stars({ n }: { n: number }) {
  return (
    <span style={{ color: "var(--gold-600)", letterSpacing: "1px" }}>
      {"★".repeat(n)}
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--green-900)" }}>
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1 text-sm max-w-2xl" style={{ color: "var(--muted)" }}>
          {subtitle}
        </p>
      )}
    </header>
  );
}
