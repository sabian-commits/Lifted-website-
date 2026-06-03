"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { levelByStars, nextLevel } from "@/lib/ministry";
import { trainingById } from "@/lib/ministry";
import { PageHeader, StageChip, StemMeter, Stars } from "@/components/ui";

export default function DashboardPage() {
  const {
    t,
    viewer,
    hasCompleted,
    eligibility,
    requestAdvancement,
    recognitions,
    resolvedAwards,
  } = useStore();

  if (!viewer) return null;

  const current = viewer.currentStars;
  const currentLevel = current > 0 ? levelByStars(current) : undefined;
  const next = nextLevel(current);
  const elig = eligibility(viewer.id);
  const myRecognitions = recognitions.filter(
    (r) => r.volunteerId === viewer.id && r.confirmed,
  );
  const pending = resolvedAwards.find(
    (a) => a.volunteerId === viewer.id && a.status === "pending",
  );

  const nextTraining = next ? trainingById(next.requiredTraining) : undefined;
  const trainingDone = next ? hasCompleted(viewer.id, next.requiredTraining) : false;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={`${t("dash.hello")}, ${viewer.name.split(" ")[0]}`} />

      {/* Current standing */}
      <section className="card p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--muted)" }}>
              {t("dash.currentLevel")}
            </div>
            <div className="mt-1 text-xl font-bold" style={{ color: "var(--green-900)" }}>
              {currentLevel ? t(currentLevel.titleKey) : t("common.unranked")}
            </div>
            <div className="mt-1 flex items-center gap-2">
              {current > 0 && <Stars n={current} />}
              {currentLevel && <StageChip stage={currentLevel.stage} />}
            </div>
          </div>
          <StemMeter current={current} />
        </div>
        {viewer.zone && (
          <div className="mt-4 text-sm" style={{ color: "var(--muted)" }}>
            {t("dash.zone")}: <span className="font-medium" style={{ color: "var(--foreground)" }}>
              {t(`zone.${viewer.zone}.name`)}
            </span>
          </div>
        )}
      </section>

      {/* Next step */}
      {next ? (
        <section className="card p-5">
          <div className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: "var(--muted)" }}>
            {t("dash.nextStep")}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold" style={{ color: "var(--green-900)" }}>
              {t(next.titleKey)}
            </span>
            <Stars n={next.stars} />
          </div>

          <div className="mt-3">
            <div className="text-xs font-semibold mb-1" style={{ color: "var(--muted)" }}>
              {t("dash.nextCriteria")}
            </div>
            <ul className="text-sm flex flex-col gap-1">
              {t(next.criteriaKey).split("\n").map((c, i) => (
                <li key={i} className="flex gap-2">
                  <span style={{ color: "var(--green-500)" }}>•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Training gate */}
          <div
            className="mt-4 rounded-xl p-3 text-sm flex items-center justify-between gap-3 flex-wrap"
            style={{ background: trainingDone ? "var(--green-100)" : "var(--gold-100)" }}
          >
            <div>
              <div className="font-semibold" style={{ color: "var(--green-900)" }}>
                {t("dash.trainingNeeded")}: {nextTraining ? t(nextTraining.titleKey) : ""}
              </div>
              <div style={{ color: "var(--muted)" }}>
                {trainingDone ? t("dash.trainingOnFile") : t("dash.trainingMissing")}
              </div>
            </div>
            {!trainingDone && (
              <Link href="/trainings" className="btn btn-ghost">
                {t("dash.goToTraining")}
              </Link>
            )}
          </div>

          {/* Advancement request */}
          <div className="mt-4">
            {pending ? (
              <div className="chip chip-muted">{t("dash.pendingRequest")} — {t(next.titleKey)}</div>
            ) : (
              <button
                className="btn btn-gold"
                disabled={!elig.eligible}
                onClick={() => requestAdvancement(viewer.id)}
                title={!elig.eligible ? t(elig.reasonKey) : ""}
              >
                {t("dash.requestAdvance")} → {t(next.titleKey)}
              </button>
            )}
            {!elig.eligible && !pending && (
              <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
                {t(elig.reasonKey)}
              </p>
            )}
          </div>
        </section>
      ) : (
        <section className="card p-5">
          <p className="font-medium" style={{ color: "var(--green-900)" }}>{t("dash.atTop")}</p>
        </section>
      )}

      {/* Recognition */}
      <section className="card p-5">
        <div className="text-xs uppercase tracking-wider font-semibold mb-2" style={{ color: "var(--muted)" }}>
          {t("dash.recognition")}
        </div>
        {myRecognitions.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>{t("dash.noRecognition")}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {myRecognitions.map((r) => (
              <li key={r.id} className="text-sm">
                <span className="chip chip-gold mb-1">{r.value}</span>
                <p>{r.behavior}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
