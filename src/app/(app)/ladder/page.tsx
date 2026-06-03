"use client";

import { useStore } from "@/lib/store";
import { LADDER } from "@/lib/ministry";
import { PageHeader, StageChip, Stars } from "@/components/ui";

// Render the full ladder including the intentional 4★ and 6★ development gaps.
const SEQUENCE = [1, 2, 3, 4, 5, 6, 7] as const;
const GAPS = new Set([4, 6]);

export default function LadderPage() {
  const { t, viewer } = useStore();
  const current = viewer?.currentStars ?? 0;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={t("ladder.title")} subtitle={t("ladder.subtitle")} />

      <div className="flex flex-col gap-3">
        {SEQUENCE.map((stars) => {
          if (GAPS.has(stars)) {
            return (
              <div
                key={stars}
                className="rounded-xl px-5 py-3 text-sm flex items-center gap-3"
                style={{ background: "#efece2", border: "1px dashed var(--border)" }}
              >
                <Stars n={stars} />
                <div>
                  <span className="font-semibold" style={{ color: "var(--muted)" }}>
                    {t("ladder.gap")}
                  </span>
                  <span className="ml-2" style={{ color: "var(--muted)" }}>{t("ladder.gap.desc")}</span>
                </div>
              </div>
            );
          }

          const level = LADDER.find((l) => l.stars === stars)!;
          const isCurrent = current === stars;
          const isEarned = current >= stars;

          return (
            <section
              key={stars}
              className="card p-5"
              style={
                isCurrent
                  ? { borderColor: "var(--green-500)", boxShadow: "0 0 0 2px var(--green-100)" }
                  : undefined
              }
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <Stars n={stars} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold" style={{ color: "var(--green-900)" }}>
                        {t(level.titleKey)}
                      </h2>
                      <StageChip stage={level.stage} />
                      {isCurrent && <span className="chip chip-gold">{t("ladder.current")}</span>}
                    </div>
                    <div className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                      {t("ladder.approvalRule")}: {t(`rule.${level.approvalRule}`)}
                    </div>
                  </div>
                </div>
                {isEarned && !isCurrent && (
                  <span className="chip chip-grow">✓</span>
                )}
              </div>

              <ul className="mt-3 text-sm flex flex-col gap-1">
                {t(level.criteriaKey).split("\n").map((c, i) => (
                  <li key={i} className="flex gap-2">
                    <span style={{ color: "var(--green-500)" }}>•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
