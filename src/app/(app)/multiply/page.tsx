"use client";

import { useMemo, useState } from "react";
import { canReport, useStore } from "@/lib/store";
import { PageHeader } from "@/components/ui";
import { FIVE_INTO_ONE_CAP, PENDING_MULTIPLY_ROLES, RIVERS } from "@/lib/ministry";
import type { MultiplyRelationship, MultiplyStatus, River } from "@/lib/types";

const inputStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: "0.6rem",
  padding: "0.5rem 0.7rem",
  background: "var(--surface)",
  fontSize: "0.9rem",
  width: "100%",
};

const STATUSES: MultiplyStatus[] = ["shaping", "transferred", "multiplying"];

export default function MultiplyPage() {
  const {
    t,
    viewer,
    volunteers,
    multiplyRelationships,
    addRelationship,
    updateRelationship,
    removeRelationship,
  } = useStore();

  if (!viewer) return null;

  const isLead = viewer.role === "ministry_lead" || viewer.role === "pastor";
  // 5 Into 1 is introduced at Leader Foundations (3★) and carried by every leader.
  const canDevelop = canReport(viewer.role) || viewer.currentStars >= 3;

  const nameOf = (id: string) => volunteers.find((v) => v.id === id)?.name ?? "—";

  const mine = useMemo(
    () => multiplyRelationships.filter((r) => r.leaderId === viewer.id),
    [multiplyRelationships, viewer.id],
  );
  const shapingMe = useMemo(
    () => multiplyRelationships.filter((r) => r.discipleId === viewer.id),
    [multiplyRelationships, viewer.id],
  );

  const riverLabel = (id: River) => t(RIVERS.find((r) => r.id === id)!.nameKey);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("multiply.title")} subtitle={t("multiply.subtitle")} />

      <div className="card p-5" style={{ borderLeft: "4px solid var(--multiply, var(--gold-600))" }}>
        <p className="italic" style={{ color: "var(--green-900)" }}>“{t("multiply.quote")}”</p>
      </div>

      {/* 5 Into 1 */}
      {canDevelop ? (
        <FiveIntoOne
          mine={mine}
          volunteers={volunteers}
          viewerId={viewer.id}
          nameOf={nameOf}
          riverLabel={riverLabel}
          t={t}
          addRelationship={addRelationship}
          updateRelationship={updateRelationship}
          removeRelationship={removeRelationship}
        />
      ) : (
        <section className="card p-5">
          <h2 className="font-bold" style={{ color: "var(--green-900)" }}>{t("multiply.locked.title")}</h2>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{t("multiply.locked.desc")}</p>
        </section>
      )}

      {/* Who is shaping me */}
      <section className="flex flex-col gap-3">
        <h2 className="font-bold" style={{ color: "var(--green-900)" }}>{t("multiply.beingShaped.title")}</h2>
        {shapingMe.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>{t("multiply.beingShaped.none")}</p>
        ) : (
          shapingMe.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="text-sm">
                <span style={{ color: "var(--muted)" }}>{t("multiply.beingShaped.by")} </span>
                <span className="font-semibold" style={{ color: "var(--green-900)" }}>{nameOf(r.leaderId)}</span>
                <span className="chip chip-grow ml-2">{riverLabel(r.river)}</span>
              </div>
              {r.focus && <p className="text-sm mt-1">{r.focus}</p>}
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{t(`multiply.status.${r.status}`)}</p>
            </div>
          ))
        )}
      </section>

      {/* The Rivers */}
      <section className="flex flex-col gap-3">
        <h2 className="font-bold" style={{ color: "var(--green-900)" }}>{t("multiply.rivers.title")}</h2>
        <p className="text-sm" style={{ color: "var(--muted)" }}>{t("multiply.rivers.note")}</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {RIVERS.map((r) => {
            const count = mine.filter((m) => m.river === r.id).length;
            return (
              <div key={r.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold" style={{ color: "var(--green-900)" }}>{t(r.nameKey)}</h3>
                  {canDevelop && count > 0 && <span className="chip chip-gold">{count}</span>}
                </div>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{t(r.descKey)}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pending roles — named in the framework, not yet defined */}
      <section className="card p-4" style={{ background: "var(--surface-2, transparent)" }}>
        <h3 className="font-semibold" style={{ color: "var(--green-900)" }}>{t("multiply.pending.title")}</h3>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          {t("multiply.pending.desc")} {PENDING_MULTIPLY_ROLES.map((r) => t(`multiply.role.${r}`)).join(" · ")}
        </p>
      </section>

      {/* Guide the Ship — lead-only multiplication map */}
      {isLead && (
        <section className="flex flex-col gap-3">
          <h2 className="font-bold" style={{ color: "var(--green-900)" }}>{t("multiply.overview.title")}</h2>
          <p className="text-sm" style={{ color: "var(--muted)" }}>{t("multiply.overview.desc")}</p>
          {multiplyRelationships.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--muted)" }}>{t("multiply.none")}</p>
          ) : (
            <div className="card p-4 flex flex-col gap-2">
              {multiplyRelationships.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-2 text-sm flex-wrap">
                  <span>
                    <span className="font-semibold" style={{ color: "var(--green-900)" }}>{nameOf(r.leaderId)}</span>
                    <span style={{ color: "var(--muted)" }}> → {nameOf(r.discipleId)}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="chip chip-grow">{riverLabel(r.river)}</span>
                    <span className="chip" style={{ color: "var(--muted)" }}>{t(`multiply.status.${r.status}`)}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function FiveIntoOne({
  mine,
  volunteers,
  viewerId,
  nameOf,
  riverLabel,
  t,
  addRelationship,
  updateRelationship,
  removeRelationship,
}: {
  mine: MultiplyRelationship[];
  volunteers: { id: string; name: string }[];
  viewerId: string;
  nameOf: (id: string) => string;
  riverLabel: (id: River) => string;
  t: (k: string) => string;
  addRelationship: (i: { discipleId: string; river: River; focus: string }) => Promise<void>;
  updateRelationship: (id: string, patch: { status?: MultiplyStatus; notes?: string }) => Promise<void>;
  removeRelationship: (id: string) => Promise<void>;
}) {
  const atCap = mine.length >= FIVE_INTO_ONE_CAP;
  const taken = new Set(mine.map((r) => r.discipleId));
  const candidates = volunteers.filter((v) => v.id !== viewerId && !taken.has(v.id));

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-bold" style={{ color: "var(--green-900)" }}>{t("multiply.fiveIntoOne.title")}</h2>
        <span className="chip chip-gold">{mine.length}/{FIVE_INTO_ONE_CAP}</span>
      </div>
      <p className="text-sm" style={{ color: "var(--muted)" }}>{t("multiply.fiveIntoOne.desc")}</p>

      {mine.length === 0 && (
        <p className="text-sm" style={{ color: "var(--muted)" }}>{t("multiply.none")}</p>
      )}

      {mine.map((r) => (
        <RelationshipCard
          key={r.id}
          r={r}
          name={nameOf(r.discipleId)}
          riverLabel={riverLabel}
          t={t}
          updateRelationship={updateRelationship}
          removeRelationship={removeRelationship}
        />
      ))}

      {atCap ? (
        <p className="text-sm" style={{ color: "var(--muted)" }}>{t("multiply.atCap")}</p>
      ) : (
        <AddForm candidates={candidates} t={t} onSubmit={addRelationship} />
      )}
    </section>
  );
}

function RelationshipCard({
  r,
  name,
  riverLabel,
  t,
  updateRelationship,
  removeRelationship,
}: {
  r: MultiplyRelationship;
  name: string;
  riverLabel: (id: River) => string;
  t: (k: string) => string;
  updateRelationship: (id: string, patch: { status?: MultiplyStatus; notes?: string }) => Promise<void>;
  removeRelationship: (id: string) => Promise<void>;
}) {
  const [notes, setNotes] = useState(r.notes);
  const dirty = notes.trim() !== r.notes;

  return (
    <div className="card p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <h3 className="font-semibold" style={{ color: "var(--green-900)" }}>{name}</h3>
          <span className="chip chip-grow mt-1 inline-block">{riverLabel(r.river)}</span>
        </div>
        <button className="text-xs underline" style={{ color: "var(--muted)" }} onClick={() => removeRelationship(r.id)}>
          {t("multiply.remove")}
        </button>
      </div>

      {r.focus && <p className="text-sm">{r.focus}</p>}

      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>
          {t("multiply.status.label")}
        </span>
        <div className="flex gap-1 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s}
              className={s === r.status ? "btn btn-gold" : "btn btn-ghost"}
              style={{ fontSize: "0.78rem", padding: "0.3rem 0.6rem" }}
              onClick={() => updateRelationship(r.id, { status: s })}
            >
              {t(`multiply.status.${s}`)}
            </button>
          ))}
        </div>
        <p className="text-xs mt-1" style={{ color: "var(--grow)" }}>
          {r.status === "multiplying" ? `✓ ${t("multiply.teachTest")}` : t("multiply.teachTest")}
        </p>
      </div>

      <textarea
        style={inputStyle}
        rows={2}
        placeholder={t("multiply.notesPlaceholder")}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      {dirty && (
        <button className="btn btn-primary self-start" style={{ fontSize: "0.8rem" }} onClick={() => updateRelationship(r.id, { notes })}>
          {t("multiply.save")}
        </button>
      )}
    </div>
  );
}

function AddForm({
  candidates,
  t,
  onSubmit,
}: {
  candidates: { id: string; name: string }[];
  t: (k: string) => string;
  onSubmit: (i: { discipleId: string; river: River; focus: string }) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [discipleId, setDiscipleId] = useState("");
  const [river, setRiver] = useState<River>("see_team");
  const [focus, setFocus] = useState("");

  const submit = () => {
    if (!discipleId) return;
    onSubmit({ discipleId, river, focus });
    setDiscipleId(""); setRiver("see_team"); setFocus(""); setOpen(false);
  };

  if (!open) {
    return (
      <button className="btn btn-ghost self-start" onClick={() => setOpen(true)}>+ {t("multiply.add")}</button>
    );
  }
  return (
    <section className="card p-5 flex flex-col gap-3">
      <h3 className="font-bold" style={{ color: "var(--green-900)" }}>{t("multiply.addTitle")}</h3>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>{t("multiply.field.disciple")}</span>
        <select style={inputStyle} value={discipleId} onChange={(e) => setDiscipleId(e.target.value)}>
          <option value="">—</option>
          {candidates.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>{t("multiply.field.river")}</span>
        <select style={inputStyle} value={river} onChange={(e) => setRiver(e.target.value as River)}>
          {RIVERS.map((r) => (
            <option key={r.id} value={r.id}>{t(r.nameKey)}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>{t("multiply.field.focus")}</span>
        <textarea style={inputStyle} rows={2} placeholder={t("multiply.field.focusPlaceholder")} value={focus} onChange={(e) => setFocus(e.target.value)} />
      </label>
      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={submit}>{t("multiply.add")}</button>
        <button className="btn btn-ghost" onClick={() => setOpen(false)}>✕</button>
      </div>
    </section>
  );
}
