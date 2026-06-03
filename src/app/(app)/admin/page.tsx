"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { ZONES, levelByStars } from "@/lib/ministry";
import { windowRemaining } from "@/lib/approval-engine";
import { PageHeader, StageChip, Stars } from "@/components/ui";
import type { EscalationResponse, ZoneId } from "@/lib/types";

type Tab = "approvals" | "roster" | "recognition" | "reports" | "escalations" | "metrics";

export default function AdminPage() {
  const {
    t,
    viewer,
    volunteers,
    resolvedAwards,
    recognitions,
    reports,
    weakLinks,
    escalations,
    decideAward,
    confirmRecognition,
    addEscalation,
    resolveWeakLink,
  } = useStore();
  const [tab, setTab] = useState<Tab>("approvals");
  const [convo, setConvo] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string>("");

  const isLead = !!viewer && (viewer.role === "ministry_lead" || viewer.role === "pastor");
  const now = new Date().toISOString();

  const pending = resolvedAwards.filter((a) => a.status === "pending");
  const nameOf = (id: string) => volunteers.find((v) => v.id === id)?.name ?? id;

  const stageCounts = useMemo(() => {
    const counts = { see: 0, grow: 0, multiply: 0 };
    for (const v of volunteers) {
      if (v.currentStars === 0) counts.see++;
      else {
        const lvl = levelByStars(v.currentStars);
        if (lvl) counts[lvl.stage]++;
      }
    }
    return counts;
  }, [volunteers]);

  if (!isLead) {
    return (
      <div className="card p-6">
        <p style={{ color: "var(--muted)" }}>
          This area is for the Ministry Lead and Pastors.
        </p>
      </div>
    );
  }

  const tabs: { id: Tab; key: string }[] = [
    { id: "approvals", key: "admin.tab.approvals" },
    { id: "roster", key: "admin.tab.roster" },
    { id: "recognition", key: "admin.tab.recognition" },
    { id: "reports", key: "admin.tab.reports" },
    { id: "escalations", key: "admin.tab.escalations" },
    { id: "metrics", key: "admin.tab.metrics" },
  ];

  const handleDecide = async (awardId: string, approve: boolean) => {
    if (!viewer) return;
    setError("");
    const res = await decideAward(awardId, approve, viewer, !!convo[awardId]);
    if (!res.ok && res.reasonKey) setError(t(res.reasonKey));
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={t("admin.title")} subtitle={t("admin.subtitle")} />

      <div className="flex gap-1 flex-wrap">
        {tabs.map((x) => (
          <button
            key={x.id}
            onClick={() => setTab(x.id)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium"
            style={{
              background: tab === x.id ? "var(--green-700)" : "var(--surface)",
              color: tab === x.id ? "#fff" : "var(--muted)",
              border: "1px solid var(--border)",
            }}
          >
            {t(x.key)}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg px-4 py-2 text-sm" style={{ background: "#fde2e2", color: "#9b2226" }}>
          {error}
        </div>
      )}

      {/* APPROVALS */}
      {tab === "approvals" && (
        <section className="flex flex-col gap-3">
          <h2 className="font-bold" style={{ color: "var(--green-900)" }}>{t("admin.approvals.title")}</h2>
          {pending.length === 0 && (
            <p className="text-sm" style={{ color: "var(--muted)" }}>{t("admin.approvals.none")}</p>
          )}
          {pending.map((a) => {
            const level = levelByStars(a.stars)!;
            const remaining = windowRemaining(a, now);
            const isJoint = level.approvalRule === "joint";
            return (
              <div key={a.id} className="card p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="font-semibold flex items-center gap-2" style={{ color: "var(--green-900)" }}>
                      {nameOf(a.volunteerId)} <Stars n={a.stars} /> {t(level.titleKey)}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                      {t("admin.approvals.requested")}: {new Date(a.requestedDate).toLocaleDateString()} · {t(`rule.${level.approvalRule}`)}
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    {remaining !== null && level.approvalRule === "default_7" ? (
                      <span className="chip chip-muted">
                        {remaining} {t("admin.approvals.window")} · {t("admin.approvals.willAuto")}
                      </span>
                    ) : (
                      <span className="chip chip-gold">{t("admin.approvals.noAuto")}</span>
                    )}
                  </div>
                </div>

                {isJoint && (
                  <label className="mt-3 flex items-center gap-2 text-sm" style={{ color: "var(--foreground)" }}>
                    <input
                      type="checkbox"
                      checked={!!convo[a.id]}
                      onChange={(e) => setConvo((p) => ({ ...p, [a.id]: e.target.checked }))}
                    />
                    {t("admin.approvals.conversation")}
                  </label>
                )}

                <div className="mt-3 flex gap-2">
                  <button className="btn btn-primary" onClick={() => handleDecide(a.id, true)}>
                    {t("admin.approvals.approve")}
                  </button>
                  <button className="btn btn-ghost" onClick={() => handleDecide(a.id, false)}>
                    {t("admin.approvals.deny")}
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* ROSTER */}
      {tab === "roster" && (
        <section className="flex flex-col gap-4">
          <h2 className="font-bold" style={{ color: "var(--green-900)" }}>{t("admin.roster.title")}</h2>
          {([...ZONES.map((z) => z.id), null] as (ZoneId | null)[]).map((zoneId) => {
            const members = volunteers.filter((v) => v.zone === zoneId);
            if (members.length === 0) return null;
            return (
              <div key={zoneId ?? "none"} className="card p-4">
                <div className="text-sm font-semibold mb-2" style={{ color: "var(--green-700)" }}>
                  {zoneId ? t(`zone.${zoneId}.name`) : t("admin.roster.noZone")}
                </div>
                <ul className="flex flex-col gap-2">
                  {members.map((v) => {
                    const lvl = v.currentStars > 0 ? levelByStars(v.currentStars) : undefined;
                    return (
                      <li key={v.id} className="flex items-center justify-between text-sm">
                        <span>{v.name}</span>
                        <span className="flex items-center gap-2">
                          {v.currentStars > 0 && <Stars n={v.currentStars} />}
                          {lvl && <StageChip stage={lvl.stage} />}
                          <span style={{ color: "var(--muted)" }} className="text-xs">
                            {v.role.replace("_", " ")}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </section>
      )}

      {/* RECOGNITION */}
      {tab === "recognition" && (
        <section className="flex flex-col gap-3">
          <h2 className="font-bold" style={{ color: "var(--green-900)" }}>{t("admin.recognition.title")}</h2>
          <p className="text-sm" style={{ color: "var(--muted)" }}>{t("admin.recognition.intro")}</p>
          {recognitions.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="font-semibold" style={{ color: "var(--green-900)" }}>{nameOf(r.volunteerId)}</div>
                <span className="chip chip-gold">{r.value}</span>
              </div>
              <p className="text-sm mt-1">{r.behavior}</p>
              <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
                <span>{t("admin.recognition.nominated")}: {r.nominatedBy}</span>
                {r.confirmed ? (
                  <span className="chip chip-grow">{t("admin.recognition.confirmed")}</span>
                ) : (
                  <button className="btn btn-gold" style={{ padding: "0.3rem 0.7rem", fontSize: "0.78rem" }} onClick={() => confirmRecognition(r.id)}>
                    {t("admin.recognition.confirm")}
                  </button>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* REPORTS */}
      {tab === "reports" && (
        <section className="flex flex-col gap-3">
          <h2 className="font-bold" style={{ color: "var(--green-900)" }}>{t("admin.reports.title")}</h2>
          {reports.length === 0 && (
            <p className="text-sm" style={{ color: "var(--muted)" }}>{t("admin.reports.none")}</p>
          )}
          {reports.map((r) => (
            <div key={r.id} className="card p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold" style={{ color: "var(--green-900)" }}>
                  {nameOf(r.reporterId)} · {t(`zone.${r.zone}.name`)}
                </span>
                <span className="text-xs" style={{ color: "var(--muted)" }}>
                  {new Date(r.weekOf).toLocaleDateString()}
                </span>
              </div>
              <div className="mt-2 grid sm:grid-cols-3 gap-2 text-xs">
                <Metric label={t("admin.reports.attendance")} value={String(r.attendanceCount)} />
                <Metric label={t("admin.reports.distribution")} value={r.starDistribution} />
                <Metric label={t("admin.reports.flag")} value={r.consistencyFlag} />
              </div>
              <p className="mt-2"><strong>{t("admin.reports.observation")}:</strong> {r.observation}</p>
              <p className="mt-1"><strong>{t("admin.reports.ask")}:</strong> {r.ask}</p>
            </div>
          ))}
        </section>
      )}

      {/* ESCALATIONS — Form C / 3-response framework */}
      {tab === "escalations" && (
        <EscalationsTab
          t={t}
          volunteers={volunteers.map((v) => ({ id: v.id, name: v.name }))}
          escalations={escalations}
          nameOf={nameOf}
          onAdd={addEscalation}
        />
      )}

      {/* METRICS */}
      {tab === "metrics" && (
        <section className="flex flex-col gap-3">
          <h2 className="font-bold" style={{ color: "var(--green-900)" }}>{t("admin.metrics.title")}</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <Stat label={t("admin.metrics.volunteers")} value={volunteers.length} />
            <Stat label={t("admin.metrics.pending")} value={pending.length} />
            <Stat
              label={t("admin.metrics.recognitionDone")}
              value={recognitions.some((r) => r.confirmed) ? "✓" : "—"}
            />
          </div>
          <div className="card p-4">
            <div className="text-xs font-semibold mb-2" style={{ color: "var(--muted)" }}>
              {t("admin.metrics.byStage")}
            </div>
            <div className="flex gap-4 text-sm">
              <span><span className="chip chip-see">{t("stage.see")}</span> {stageCounts.see}</span>
              <span><span className="chip chip-grow">{t("stage.grow")}</span> {stageCounts.grow}</span>
              <span><span className="chip chip-multiply">{t("stage.multiply")}</span> {stageCounts.multiply}</span>
            </div>
          </div>
          <div className="card p-4">
            <div className="text-xs font-semibold mb-2" style={{ color: "var(--muted)" }}>
              {t("admin.weakLinks.title")}
            </div>
            {weakLinks.filter((w) => !w.resolved).length === 0 ? (
              <p className="text-sm" style={{ color: "var(--muted)" }}>{t("admin.weakLinks.none")}</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {weakLinks.filter((w) => !w.resolved).map((w) => (
                  <li key={w.id} className="flex items-center justify-between gap-3 text-sm">
                    <span>
                      <span className="chip chip-gold mr-2">{t(`zone.${w.zone}.name`)}</span>
                      {w.description}
                      <span className="text-xs ml-1" style={{ color: "var(--muted)" }}>· {w.flaggedBy}</span>
                    </span>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "0.3rem 0.7rem", fontSize: "0.78rem" }}
                      onClick={() => resolveWeakLink(w.id)}
                    >
                      {t("admin.weakLinks.resolve")}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="text-xs italic" style={{ color: "var(--muted)" }}>{t("admin.metrics.note")}</p>
        </section>
      )}
    </div>
  );
}

function EscalationsTab({
  t,
  volunteers,
  escalations,
  nameOf,
  onAdd,
}: {
  t: (k: string) => string;
  volunteers: { id: string; name: string }[];
  escalations: import("@/lib/types").Escalation[];
  nameOf: (id: string) => string;
  onAdd: (i: { volunteerId: string; response: EscalationResponse; situation: string; followUp: string }) => void;
}) {
  const [who, setWho] = useState(volunteers[0]?.id ?? "");
  const [response, setResponse] = useState<EscalationResponse>("keep");
  const [situation, setSituation] = useState("");
  const [followUp, setFollowUp] = useState("");

  const inputStyle: React.CSSProperties = {
    border: "1px solid var(--border)",
    borderRadius: "0.6rem",
    padding: "0.5rem 0.7rem",
    background: "var(--surface)",
    fontSize: "0.9rem",
    width: "100%",
  };

  const responses: EscalationResponse[] = ["keep", "move", "remove"];

  const submit = () => {
    if (!situation.trim()) return;
    onAdd({ volunteerId: who, response, situation: situation.trim(), followUp: followUp.trim() });
    setSituation(""); setFollowUp("");
  };

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-bold" style={{ color: "var(--green-900)" }}>{t("admin.escalations.title")}</h2>
      <p className="text-sm" style={{ color: "var(--muted)" }}>{t("admin.escalations.intro")}</p>

      <div className="card p-5 flex flex-col gap-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>{t("admin.escalations.who")}</span>
            <select value={who} onChange={(e) => setWho(e.target.value)} style={inputStyle}>
              {volunteers.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>{t("admin.escalations.response")}</span>
            <select value={response} onChange={(e) => setResponse(e.target.value as EscalationResponse)} style={inputStyle}>
              {responses.map((r) => <option key={r} value={r}>{t(`escalation.${r}`)}</option>)}
            </select>
          </label>
        </div>
        <p className="text-xs" style={{ color: "var(--muted)" }}>{t(`escalation.${response}.desc`)}</p>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>{t("admin.escalations.situation")}</span>
          <textarea value={situation} onChange={(e) => setSituation(e.target.value)} placeholder={t("admin.escalations.situation.ph")} rows={2} style={inputStyle} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>{t("admin.escalations.followUp")}</span>
          <input value={followUp} onChange={(e) => setFollowUp(e.target.value)} placeholder={t("admin.escalations.followUp.ph")} style={inputStyle} />
        </label>
        <div>
          <button className="btn btn-primary" onClick={submit}>{t("admin.escalations.add")}</button>
        </div>
      </div>

      {escalations.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--muted)" }}>{t("admin.escalations.none")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {escalations.map((e) => (
            <li key={e.id} className="card p-4 text-sm">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-semibold" style={{ color: "var(--green-900)" }}>{nameOf(e.volunteerId)}</span>
                <span className="chip chip-gold">{t(`escalation.${e.response}`)}</span>
              </div>
              <p className="mt-1">{e.situation}</p>
              {e.followUp && <p className="mt-1" style={{ color: "var(--muted)" }}>↳ {e.followUp}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-2" style={{ background: "var(--green-100)" }}>
      <div className="text-[0.65rem] uppercase tracking-wide" style={{ color: "var(--muted)" }}>{label}</div>
      <div style={{ color: "var(--green-900)" }}>{value}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-4 text-center">
      <div className="text-2xl font-bold" style={{ color: "var(--green-700)" }}>{value}</div>
      <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>{label}</div>
    </div>
  );
}
