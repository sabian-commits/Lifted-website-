"use client";

import { useStore } from "@/lib/store";
import { TRAININGS } from "@/lib/ministry";
import { PageHeader, Stars } from "@/components/ui";

export default function TrainingsPage() {
  const { t, viewer, hasCompleted, completeTraining, completions } = useStore();

  if (!viewer) return null;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={t("trainings.title")} subtitle={t("trainings.subtitle")} />

      <div className="flex flex-col gap-4">
        {TRAININGS.map((tr) => {
          const done = hasCompleted(viewer.id, tr.id);
          const completion = completions.find(
            (c) => c.volunteerId === viewer.id && c.trainingId === tr.id,
          );
          return (
            <section key={tr.id} className="card p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="text-lg font-bold" style={{ color: "var(--green-900)" }}>
                    {t(tr.titleKey)}
                  </h2>
                  <div className="mt-1 flex items-center gap-3 text-xs" style={{ color: "var(--muted)" }}>
                    <span>{t("trainings.duration")}: {t(tr.durationKey)}</span>
                    <span>·</span>
                    <span>{t("trainings.format")}: {t(tr.formatKey)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: "var(--muted)" }}>{t("trainings.unlocks")}</span>
                  {tr.unlocks.map((s) => <Stars key={s} n={s} />)}
                </div>
              </div>

              {tr.deliverableByAnyLeader && (
                <div className="mt-2 chip chip-see">{t("trainings.anyLeader")}</div>
              )}

              <div className="mt-4">
                <div className="text-xs font-semibold mb-1" style={{ color: "var(--muted)" }}>
                  {t("trainings.outline")}
                </div>
                <ul className="text-sm flex flex-col gap-1">
                  {tr.outlineKeys.map((k) => (
                    <li key={k} className="flex gap-2">
                      <span style={{ color: "var(--green-500)" }}>•</span>
                      <span>{t(k)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex items-center gap-3 flex-wrap">
                {done ? (
                  <span className="chip chip-grow">
                    {t("trainings.completed")}
                    {completion && (
                      <> · {t("trainings.completedOn")} {new Date(completion.date).toLocaleDateString()}</>
                    )}
                  </span>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={() => completeTraining(viewer.id, tr.id, viewer.name)}
                  >
                    {t("trainings.markComplete")}
                  </button>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <p className="text-xs" style={{ color: "var(--muted)" }}>{t("trainings.completeBody")}</p>
    </div>
  );
}
