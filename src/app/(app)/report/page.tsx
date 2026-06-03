"use client";

import { useState } from "react";
import { canReport, useStore } from "@/lib/store";
import { ZONES } from "@/lib/ministry";
import { PageHeader } from "@/components/ui";
import type { ZoneId } from "@/lib/types";

export default function ReportPage() {
  const {
    t,
    viewer,
    volunteers,
    submitWeeklyReport,
    nominateRecognition,
  } = useStore();

  if (!viewer) return null;

  if (!canReport(viewer.role)) {
    return (
      <div className="card p-6">
        <p style={{ color: "var(--muted)" }}>{t("report.onlyLeaders")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={t("report.title")} subtitle={t("report.subtitle")} />
      <WeeklyReportForm
        zoneDefault={viewer.zone ?? "parking"}
        onSubmit={(input) => submitWeeklyReport(input, viewer)}
        t={t}
      />
      <NominateForm
        volunteers={volunteers.map((v) => ({ id: v.id, name: v.name }))}
        onSubmit={(input) => nominateRecognition(input, viewer)}
        t={t}
      />
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
        {label}
      </span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: "0.6rem",
  padding: "0.5rem 0.7rem",
  background: "var(--surface)",
  fontSize: "0.9rem",
  width: "100%",
};

function WeeklyReportForm({
  zoneDefault,
  onSubmit,
  t,
}: {
  zoneDefault: ZoneId;
  onSubmit: (i: {
    zone: ZoneId;
    attendanceCount: number;
    starDistribution: string;
    consistencyFlag: string;
    observation: string;
    ask: string;
    weakLink?: string;
  }) => void;
  t: (k: string) => string;
}) {
  const [zone, setZone] = useState<ZoneId>(zoneDefault);
  const [attendance, setAttendance] = useState("");
  const [dist, setDist] = useState("");
  const [flag, setFlag] = useState("");
  const [obs, setObs] = useState("");
  const [ask, setAsk] = useState("");
  const [weak, setWeak] = useState("");
  const [done, setDone] = useState(false);

  const submit = () => {
    onSubmit({
      zone,
      attendanceCount: Number(attendance) || 0,
      starDistribution: dist,
      consistencyFlag: flag,
      observation: obs,
      ask,
      weakLink: weak,
    });
    setDone(true);
    setAttendance(""); setDist(""); setFlag(""); setObs(""); setAsk(""); setWeak("");
    setTimeout(() => setDone(false), 2500);
  };

  return (
    <section className="card p-5 flex flex-col gap-3">
      <h2 className="font-bold" style={{ color: "var(--green-900)" }}>{t("report.weekly.title")}</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label={t("report.zone")}>
          <select value={zone} onChange={(e) => setZone(e.target.value as ZoneId)} style={inputStyle}>
            {ZONES.map((z) => (
              <option key={z.id} value={z.id}>{t(z.nameKey)}</option>
            ))}
          </select>
        </Field>
        <Field label={t("report.attendance")}>
          <input type="number" min={0} value={attendance} onChange={(e) => setAttendance(e.target.value)} style={inputStyle} />
        </Field>
      </div>
      <Field label={t("report.distribution")}>
        <input value={dist} onChange={(e) => setDist(e.target.value)} placeholder={t("report.distribution.ph")} style={inputStyle} />
      </Field>
      <Field label={t("report.flag")}>
        <input value={flag} onChange={(e) => setFlag(e.target.value)} placeholder={t("report.flag.ph")} style={inputStyle} />
      </Field>
      <Field label={t("report.observation")}>
        <textarea value={obs} onChange={(e) => setObs(e.target.value)} placeholder={t("report.observation.ph")} rows={2} style={inputStyle} />
      </Field>
      <Field label={t("report.ask")}>
        <input value={ask} onChange={(e) => setAsk(e.target.value)} placeholder={t("report.ask.ph")} style={inputStyle} />
      </Field>
      <Field label={t("report.weakLink")}>
        <input value={weak} onChange={(e) => setWeak(e.target.value)} placeholder={t("report.weakLink.ph")} style={inputStyle} />
      </Field>
      <div className="flex items-center gap-3">
        <button className="btn btn-primary" onClick={submit}>{t("report.submit")}</button>
        {done && <span className="chip chip-grow">{t("report.submitted")}</span>}
      </div>
    </section>
  );
}

function NominateForm({
  volunteers,
  onSubmit,
  t,
}: {
  volunteers: { id: string; name: string }[];
  onSubmit: (i: { volunteerId: string; behavior: string; value: string }) => void;
  t: (k: string) => string;
}) {
  const [who, setWho] = useState(volunteers[0]?.id ?? "");
  const [behavior, setBehavior] = useState("");
  const [value, setValue] = useState("");
  const [done, setDone] = useState(false);

  const submit = () => {
    if (!behavior.trim()) return;
    onSubmit({ volunteerId: who, behavior: behavior.trim(), value: value.trim() || "Faithfulness" });
    setDone(true);
    setBehavior(""); setValue("");
    setTimeout(() => setDone(false), 2500);
  };

  return (
    <section className="card p-5 flex flex-col gap-3">
      <h2 className="font-bold" style={{ color: "var(--green-900)" }}>{t("report.nominate.title")}</h2>
      <p className="text-sm" style={{ color: "var(--muted)" }}>{t("report.nominate.intro")}</p>
      <Field label={t("report.nominate.who")}>
        <select value={who} onChange={(e) => setWho(e.target.value)} style={inputStyle}>
          {volunteers.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </Field>
      <Field label={t("report.nominate.behavior")}>
        <textarea value={behavior} onChange={(e) => setBehavior(e.target.value)} placeholder={t("report.nominate.behavior.ph")} rows={2} style={inputStyle} />
      </Field>
      <Field label={t("report.nominate.value")}>
        <input value={value} onChange={(e) => setValue(e.target.value)} placeholder={t("report.nominate.value.ph")} style={inputStyle} />
      </Field>
      <div className="flex items-center gap-3">
        <button className="btn btn-gold" onClick={submit}>{t("report.nominate.submit")}</button>
        {done && <span className="chip chip-grow">{t("report.nominate.submitted")}</span>}
      </div>
    </section>
  );
}
