"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/ui";
import { ZONES } from "@/lib/ministry";
import type { RStage } from "@/lib/types";

type RKey = "r1" | "r2" | "r3";

const R_STAGES: RKey[] = ["r1", "r2", "r3"];

const STAGE_ORDER: Record<RStage, number> = { r1: 0, r2: 1, r3: 2, completed: 3 };
const NEXT_STAGE: Record<RKey, RStage> = { r1: "r2", r2: "r3", r3: "completed" };

export default function SeePage() {
  const {
    t,
    viewer,
    volunteers,
    recognitions,
    guests,
    logGuest,
    updateGuestStage,
    updateGuestMilestones,
  } = useStore();

  const [openScript, setOpenScript] = useState<RKey | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);

  if (!viewer) return null;

  const nameOf = (id: string) => volunteers.find((v) => v.id === id)?.name ?? "—";
  const thisMonth = new Date().toISOString().slice(0, 7);

  const monthRecognitions = useMemo(
    () => recognitions.filter((r) => r.month === thisMonth),
    [recognitions, thisMonth],
  );

  const myGuests = useMemo(
    () => guests.filter((g) => g.loggedBy === viewer.id),
    [guests, viewer.id],
  );

  const monthGuests = useMemo(
    () => guests.filter((g) => g.firstVisitDate.slice(0, 7) === thisMonth),
    [guests, thisMonth],
  );

  const handleLogGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setSubmitting(true);
    await logGuest({ name: formName.trim(), firstVisitDate: formDate });
    setFormName("");
    setFormDate(new Date().toISOString().slice(0, 10));
    setShowForm(false);
    setSubmitting(false);
  };

  const stageLabel = (s: RStage) => t(`see.guests.stage.${s}`);

  const stageChipStyle = (s: RStage): React.CSSProperties => {
    if (s === "completed") return { background: "var(--green-100)", color: "var(--green-900)" };
    return {};
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("see.title")} subtitle={t("see.subtitle")} />

      {/* Quote */}
      <div className="card p-5" style={{ borderLeft: "4px solid var(--see, var(--green-700))" }}>
        <p className="italic" style={{ color: "var(--green-900)" }}>"{t("see.quote")}"</p>
      </div>

      {/* Pipeline strip: Guest → R1 → R2 → R3 → Volunteer → Grow → Multiply */}
      <section className="card p-4">
        <p className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: "var(--muted)" }}>
          {t("see.pipeline.label")}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 text-sm">
          {[
            { label: t("see.pipeline.guest"), key: "guest" },
            { label: "R1", key: "r1" },
            { label: "R2", key: "r2" },
            { label: "R3", key: "r3" },
            { label: t("see.pipeline.volunteer"), key: "vol" },
            { label: t("common.grow"), key: "grow" },
            { label: t("common.multiply"), key: "multiply" },
          ].map((item, i, arr) => (
            <span key={item.key} className="flex items-center gap-1.5">
              <span
                className="chip"
                style={
                  ["r1", "r2", "r3", "vol"].includes(item.key)
                    ? { background: "var(--green-100)", color: "var(--green-900)", fontWeight: 600 }
                    : item.key === "guest"
                    ? { background: "var(--surface-2)", color: "var(--muted)" }
                    : { background: "var(--surface-2)", color: "var(--muted)" }
                }
              >
                {item.label}
              </span>
              {i < arr.length - 1 && (
                <span style={{ color: "var(--muted)" }}>→</span>
              )}
            </span>
          ))}
        </div>
      </section>

      {/* Core Philosophy */}
      <section className="card p-5" style={{ borderLeft: "4px solid var(--gold-600)" }}>
        <h2 className="font-bold mb-3" style={{ color: "var(--green-900)" }}>{t("see.philosophy.title")}</h2>
        <div className="flex flex-col gap-2">
          {(["q1", "q2", "q3"] as const).map((q) => (
            <div key={q} className="flex items-center gap-3 text-sm">
              <span className="chip chip-gold" style={{ minWidth: 28, textAlign: "center" }}>?</span>
              <span>{t(`see.philosophy.${q}`)}</span>
            </div>
          ))}
        </div>
        <p className="text-sm mt-4 italic" style={{ color: "var(--muted)" }}>
          {t("see.philosophy.answer")}
        </p>
      </section>

      {/* Everyone starts here */}
      <section className="card p-5">
        <h2 className="font-bold" style={{ color: "var(--green-900)" }}>{t("see.start.title")}</h2>
        <p className="text-sm mt-1">{t("see.start.body")}</p>
      </section>

      {/* The four zones */}
      <section className="flex flex-col gap-3">
        <h2 className="font-bold" style={{ color: "var(--green-900)" }}>{t("see.zones.title")}</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {ZONES.map((z) => {
            const mine = viewer.zone === z.id;
            return (
              <div key={z.id} className="card p-4" style={mine ? { borderColor: "var(--gold-600)" } : undefined}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold" style={{ color: "var(--green-900)" }}>{t(z.nameKey)}</h3>
                  {mine && <span className="chip chip-gold">{t("see.zones.yours")}</span>}
                </div>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{t(z.descKey)}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── THE 3Rs — FULL TRAINING HUB ─── */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-bold text-lg" style={{ color: "var(--green-900)" }}>{t("see.threeRs.title")}</h2>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{t("see.threeRs.body")}</p>
        </div>

        {/* Memory phrase */}
        <div
          className="rounded-xl p-4 text-center font-bold tracking-wide text-base"
          style={{ background: "var(--gold-100)", color: "var(--gold-800)", border: "1.5px solid var(--gold-400)" }}
        >
          {t("see.threeRs.memory")}
        </div>

        {/* Three R-stage cards */}
        <div className="flex flex-col gap-3">
          {R_STAGES.map((r) => {
            const isOpen = openScript === r;
            const scriptLines = t(`see.threeRs.${r}.script`).split("\n");
            return (
              <div key={r} className="card p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="chip font-bold"
                      style={{ background: "var(--green-100)", color: "var(--green-900)" }}
                    >
                      {t(`see.threeRs.${r}.title`)}
                    </span>
                    <span className="text-xs" style={{ color: "var(--muted)" }}>
                      {t(`see.threeRs.${r}.visit`)}
                    </span>
                  </div>
                  <button
                    className="btn btn-ghost text-xs"
                    onClick={() => setOpenScript(isOpen ? null : r)}
                  >
                    {isOpen ? t("see.threeRs.hideScript") : t("see.threeRs.showScript")}
                  </button>
                </div>

                <p className="text-sm font-semibold" style={{ color: "var(--green-900)" }}>
                  {t(`see.threeRs.${r}.goal`)}
                </p>

                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  {t(`see.threeRs.${r}.focus`)}
                </p>

                {isOpen && (
                  <div
                    className="rounded-lg p-4 flex flex-col gap-1.5 text-sm"
                    style={{ background: "var(--surface-2)" }}
                  >
                    {scriptLines.map((line, i) => (
                      <p key={i} style={{ color: line.startsWith("(") ? "var(--muted)" : "var(--foreground)" }}>
                        {line}
                      </p>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                    Standard:
                  </span>
                  <span className="text-sm font-medium" style={{ color: "var(--green-900)" }}>
                    {t(`see.threeRs.${r}.standard`)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick cheat sheet */}
        <div className="card p-4">
          <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--green-900)" }}>
            {t("see.threeRs.cheatSheet.title")}
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {R_STAGES.map((r) => (
              <div key={r} className="rounded-lg p-2" style={{ background: "var(--surface-2)" }}>
                <div className="font-bold mb-1" style={{ color: "var(--green-900)" }}>
                  {t(`see.threeRs.${r}.title`).split(" — ")[0]}
                </div>
                <div style={{ color: "var(--muted)" }}>{t(`see.threeRs.${r}.standard`)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Visitor journey */}
        <div className="card p-4">
          <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--green-900)" }}>
            {t("see.threeRs.visitorJourney.title")}
          </h3>
          <p className="text-sm font-medium" style={{ color: "var(--green-700)" }}>
            {t("see.threeRs.visitorJourney.body")}
          </p>
        </div>

        {/* Role guide */}
        <div className="card p-4">
          <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--green-900)" }}>
            {t("see.threeRs.roleGuide.title")}
          </h3>
          <ul className="flex flex-col gap-2 text-sm">
            {(["doorGreeters", "connectTable", "sanctuaryGreeters", "relational"] as const).map((role) => (
              <li key={role} className="flex gap-2">
                <span style={{ color: "var(--green-500)" }}>•</span>
                <span>{t(`see.threeRs.roleGuide.${role}`)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Culture statement */}
        <div
          className="rounded-xl p-5 text-center italic font-medium"
          style={{ background: "var(--green-100)", color: "var(--green-900)" }}
        >
          "{t("see.threeRs.culture")}"
        </div>
      </section>

      {/* ─── NEW PEOPLE SECTION ─── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-bold" style={{ color: "var(--green-900)" }}>{t("see.guests.title")}</h2>
          <button className="btn btn-gold" onClick={() => setShowForm((s) => !s)}>
            {showForm ? t("see.guests.cancel") : t("see.guests.log")}
          </button>
        </div>

        {/* Log form */}
        {showForm && (
          <form onSubmit={handleLogGuest} className="card p-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                {t("see.guests.field.name")}
              </label>
              <input
                className="input"
                placeholder={t("see.guests.field.name.ph")}
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                {t("see.guests.field.date")}
              </label>
              <input
                className="input"
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-2">
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {t("see.guests.add")}
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => setShowForm(false)}>
                {t("see.guests.cancel")}
              </button>
            </div>
          </form>
        )}

        {/* Monthly summary strip */}
        <div className="grid grid-cols-4 gap-2 text-center text-sm">
          {(["r1", "r2", "r3", "completed"] as RStage[]).map((s) => {
            const count = monthGuests.filter((g) => STAGE_ORDER[g.currentRStage] >= STAGE_ORDER[s]).length;
            return (
              <div key={s} className="card p-3">
                <div className="text-lg font-bold" style={{ color: "var(--green-900)" }}>{count}</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>
                  {s === "completed" ? t("see.guests.connected") : t(`see.guests.atR${s.slice(1)}`)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Guest list */}
        {myGuests.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>{t("see.guests.none")}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {myGuests.map((g) => {
              const visitDate = new Date(g.firstVisitDate + "T00:00:00").toLocaleDateString();
              const isCompleted = g.currentRStage === "completed";
              const nextStage = isCompleted ? null : NEXT_STAGE[g.currentRStage as RKey];
              return (
                <div key={g.id} className="card p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-semibold" style={{ color: "var(--green-900)" }}>{g.name}</span>
                    <span
                      className="chip"
                      style={stageChipStyle(g.currentRStage)}
                    >
                      {stageLabel(g.currentRStage)}
                    </span>
                  </div>

                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    {t("see.guests.firstVisit")}: {visitDate}
                  </p>

                  {/* Milestone toggles */}
                  <div className="flex gap-2 flex-wrap">
                    {([
                      { key: "connectCardDone", label: t("see.guests.milestone.card") },
                      { key: "lifeGroupConnected", label: t("see.guests.milestone.group") },
                      { key: "dnaStarted", label: t("see.guests.milestone.dna") },
                    ] as { key: keyof Pick<typeof g, "connectCardDone" | "lifeGroupConnected" | "dnaStarted">; label: string }[]).map(({ key, label }) => (
                      <button
                        key={key}
                        className={g[key] ? "chip chip-gold" : "chip"}
                        style={g[key] ? undefined : { color: "var(--muted)" }}
                        onClick={() => updateGuestMilestones(g.id, { [key]: !g[key] })}
                      >
                        {g[key] ? `${label} ✓` : label}
                      </button>
                    ))}
                  </div>

                  {/* Advance button */}
                  {!isCompleted && nextStage && (
                    <button
                      className="btn btn-ghost text-sm self-start"
                      onClick={() => updateGuestStage(g.id, nextStage)}
                    >
                      {t("see.guests.advance")} {stageLabel(nextStage)} →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Monthly celebration */}
      <section className="flex flex-col gap-3">
        <h2 className="font-bold" style={{ color: "var(--green-900)" }}>{t("see.celebration.title")}</h2>
        <p className="text-sm" style={{ color: "var(--muted)" }}>{t("see.celebration.body")}</p>
        {monthRecognitions.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>{t("see.celebration.none")}</p>
        ) : (
          monthRecognitions.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="font-semibold" style={{ color: "var(--green-900)" }}>{nameOf(r.volunteerId)}</h3>
                <span className={r.confirmed ? "chip chip-gold" : "chip"} style={r.confirmed ? undefined : { color: "var(--muted)" }}>
                  {r.confirmed ? t("see.celebration.confirmed") : t("see.celebration.nominated")}
                </span>
              </div>
              <p className="text-sm mt-1">{r.behavior}</p>
              {r.value && <p className="text-xs mt-1" style={{ color: "var(--grow)" }}>{r.value}</p>}
            </div>
          ))
        )}
      </section>

      {/* Gap leaders in the SEE stage */}
      <section className="card p-5">
        <h2 className="font-bold" style={{ color: "var(--green-900)" }}>{t("see.gapLeaders.title")}</h2>
        <p className="text-sm mt-1">{t("see.gapLeaders.body")}</p>
      </section>

      {/* Next step */}
      <section className="card p-5" style={{ background: "var(--surface-2, transparent)" }}>
        <h3 className="font-semibold" style={{ color: "var(--green-900)" }}>{t("see.next.title")}</h3>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{t("see.next.body")}</p>
        <div className="flex gap-2 mt-3 flex-wrap">
          <Link href="/trainings" className="btn btn-primary">{t("see.next.training")}</Link>
          <Link href="/dashboard" className="btn btn-ghost">{t("see.next.journey")}</Link>
        </div>
      </section>
    </div>
  );
}
