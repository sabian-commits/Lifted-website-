"use client";

import Link from "next/link";
import { useStore, canReport } from "@/lib/store";
import { PageHeader, Stars } from "@/components/ui";
import { GROWTH_LADDER, READINESS_MARKERS, TO_RESCUE_SIGNS, levelByStars, nextLevel } from "@/lib/ministry";

export default function GrowPage() {
  const { t, viewer } = useStore();
  const isLeader = viewer ? canReport(viewer.role) : false;

  if (!viewer) return null;

  const stars = viewer.currentStars;
  const current = stars > 0 ? levelByStars(stars) : undefined;
  const next = nextLevel(stars);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("grow.title")} subtitle={t("grow.subtitle")} />

      <div className="card p-5" style={{ borderLeft: "4px solid var(--grow, var(--gold-600))" }}>
        <p className="italic" style={{ color: "var(--green-900)" }}>“{t("grow.quote")}”</p>
      </div>

      {/* The two movements of Ready to Rescue */}
      <section className="flex flex-col gap-3">
        <h2 className="font-bold" style={{ color: "var(--green-900)" }}>{t("grow.movements.title")}</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="card p-4">
            <h3 className="font-semibold" style={{ color: "var(--green-900)" }}>{t("grow.becomeReady.title")}</h3>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{t("grow.becomeReady.body")}</p>
            <ul className="mt-2 flex flex-col gap-1">
              {READINESS_MARKERS.map((m) => (
                <li key={m} className="text-sm flex items-start gap-2">
                  <span style={{ color: "var(--grow)" }}>•</span>
                  <span>{t(`grow.marker.${m}`)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-4">
            <h3 className="font-semibold" style={{ color: "var(--green-900)" }}>{t("grow.toRescue.title")}</h3>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{t("grow.toRescue.body")}</p>
            <ul className="mt-2 flex flex-col gap-1">
              {TO_RESCUE_SIGNS.map((s) => (
                <li key={s} className="text-sm flex items-start gap-2">
                  <span style={{ color: "var(--grow)" }}>•</span>
                  <span>{t(`grow.rescue.${s}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* The Growth Ladder */}
      <section className="flex flex-col gap-3">
        <h2 className="font-bold" style={{ color: "var(--green-900)" }}>{t("grow.ladder.title")}</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {GROWTH_LADDER.map((rung, i) => (
            <div key={rung.id} className="card p-4">
              <div className="flex items-center gap-2">
                <span className="chip chip-grow">{i + 1}</span>
                <h3 className="font-semibold" style={{ color: "var(--green-900)" }}>{t(rung.nameKey)}</h3>
              </div>
              <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{t(rung.descKey)}</p>
            </div>
          ))}
        </div>
        <p className="text-xs" style={{ color: "var(--muted)" }}>{t("grow.ladder.note")}</p>
      </section>

      {/* Your progress — live from the viewer's profile */}
      <section className="card p-5">
        <h2 className="font-bold" style={{ color: "var(--green-900)" }}>{t("grow.progress.title")}</h2>
        <div className="mt-2 flex items-center gap-3 flex-wrap">
          {stars > 0 ? (
            <>
              <Stars n={stars} />
              <span className="text-sm font-semibold" style={{ color: "var(--green-900)" }}>
                {current ? t(current.titleKey) : ""}
              </span>
            </>
          ) : (
            <span className="text-sm" style={{ color: "var(--muted)" }}>{t("grow.progress.none")}</span>
          )}
        </div>
        {next && (
          <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>
            {t("grow.progress.next")} <span className="font-semibold" style={{ color: "var(--grow)" }}>{t(next.titleKey)}</span>
          </p>
        )}
        <div className="flex gap-2 mt-3 flex-wrap">
          <Link href="/dashboard" className="btn btn-primary">{t("grow.progress.journey")}</Link>
          <Link href="/ladder" className="btn btn-ghost">{t("grow.progress.ladder")}</Link>
        </div>
      </section>

      {/* Monthly Rhythm — visible to gap leaders and above */}
      {isLeader && (
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="font-bold" style={{ color: "var(--green-900)" }}>{t("grow.monthly.title")}</h2>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{t("grow.monthly.body")}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {([1, 2, 3, 4, 5, 6] as const).map((n) => (
              <div key={n} className="card p-4 flex gap-3">
                <span
                  className="chip chip-grow flex-shrink-0"
                  style={{ minWidth: 28, textAlign: "center", fontWeight: 700 }}
                >
                  {n}
                </span>
                <div>
                  <div className="font-semibold text-sm" style={{ color: "var(--green-900)" }}>
                    {t(`grow.monthly.${n}.title`)}
                  </div>
                  <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
                    {t(`grow.monthly.${n}.desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs italic" style={{ color: "var(--muted)" }}>{t("grow.monthly.note")}</p>
        </section>
      )}

      {/* Annual recertification */}
      <section className="card p-5" style={{ background: "var(--surface-2, transparent)" }}>
        <h3 className="font-semibold" style={{ color: "var(--green-900)" }}>{t("grow.recert.title")}</h3>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{t("grow.recert.body")}</p>
      </section>
    </div>
  );
}
