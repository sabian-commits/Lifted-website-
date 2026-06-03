"use client";

import { useMemo, useState } from "react";
import { canReport, useStore } from "@/lib/store";
import { PageHeader } from "@/components/ui";

const inputStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: "0.6rem",
  padding: "0.5rem 0.7rem",
  background: "var(--surface)",
  fontSize: "0.9rem",
  width: "100%",
};

function fmtDate(iso: string, lang: string) {
  const d = new Date(iso);
  return d.toLocaleString(lang === "es" ? "es-ES" : "en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function EventsPage() {
  const {
    t,
    lang,
    viewer,
    events,
    eventRsvps,
    infoItems,
    createEvent,
    deleteEvent,
    toggleRsvp,
    createInfo,
    deleteInfo,
  } = useStore();

  if (!viewer) return null;
  const isLead = viewer.role === "ministry_lead" || viewer.role === "pastor";
  const canManage = canReport(viewer.role);

  const upcoming = useMemo(
    () => events.filter((e) => new Date(e.startsAt) >= new Date(Date.now() - 3600000)),
    [events],
  );

  const rsvpCount = (eventId: string) => eventRsvps.filter((r) => r.eventId === eventId).length;
  const iAmGoing = (eventId: string) =>
    eventRsvps.some((r) => r.eventId === eventId && r.userId === viewer.id);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={t("events.title")} subtitle={t("events.subtitle")} />

      {canManage && <CreateEventForm onSubmit={createEvent} t={t} />}

      <section className="flex flex-col gap-3">
        <h2 className="font-bold" style={{ color: "var(--green-900)" }}>{t("events.upcoming")}</h2>
        {upcoming.length === 0 && (
          <p className="text-sm" style={{ color: "var(--muted)" }}>{t("events.none")}</p>
        )}
        {upcoming.map((e) => {
          const going = iAmGoing(e.id);
          return (
            <div key={e.id} className="card p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="text-lg font-bold" style={{ color: "var(--green-900)" }}>{e.title}</h3>
                  <div className="text-sm mt-0.5" style={{ color: "var(--grow)" }}>
                    {fmtDate(e.startsAt, lang)}
                    {e.endsAt ? ` – ${fmtDate(e.endsAt, lang)}` : ""}
                  </div>
                  {e.location && (
                    <div className="text-sm" style={{ color: "var(--muted)" }}>📍 {e.location}</div>
                  )}
                </div>
                <span className="chip chip-gold">{rsvpCount(e.id)} {t("events.attendees")}</span>
              </div>
              {e.description && <p className="text-sm mt-2">{e.description}</p>}
              <div className="mt-3 flex items-center gap-2">
                <button
                  className={going ? "btn btn-gold" : "btn btn-primary"}
                  onClick={() => toggleRsvp(e.id)}
                >
                  {going ? t("events.cancelGoing") : t("events.going")}
                </button>
                {isLead && (
                  <button className="btn btn-ghost" style={{ fontSize: "0.8rem" }} onClick={() => deleteEvent(e.id)}>
                    {t("events.delete")}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Info / Service Times */}
      <section className="flex flex-col gap-3">
        <h2 className="font-bold" style={{ color: "var(--green-900)" }}>{t("events.info.title")}</h2>
        {infoItems.length === 0 && (
          <p className="text-sm" style={{ color: "var(--muted)" }}>{t("events.info.none")}</p>
        )}
        {infoItems.map((i) => (
          <div key={i.id} className="card p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold" style={{ color: "var(--green-900)" }}>{i.title}</h3>
              {isLead && (
                <button className="text-xs underline" style={{ color: "var(--muted)" }} onClick={() => deleteInfo(i.id)}>
                  {t("events.delete")}
                </button>
              )}
            </div>
            <p className="text-sm mt-1 whitespace-pre-line">{i.body}</p>
          </div>
        ))}
        {isLead && <CreateInfoForm onSubmit={createInfo} t={t} />}
      </section>
    </div>
  );
}

function CreateEventForm({
  onSubmit,
  t,
}: {
  onSubmit: (i: { title: string; description: string; location: string; startsAt: string; endsAt?: string }) => void;
  t: (k: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [loc, setLoc] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const submit = () => {
    if (!title.trim() || !start) return;
    onSubmit({
      title: title.trim(),
      description: desc.trim(),
      location: loc.trim(),
      startsAt: new Date(start).toISOString(),
      endsAt: end ? new Date(end).toISOString() : undefined,
    });
    setTitle(""); setDesc(""); setLoc(""); setStart(""); setEnd(""); setOpen(false);
  };

  if (!open) {
    return (
      <button className="btn btn-ghost self-start" onClick={() => setOpen(true)}>+ {t("events.create")}</button>
    );
  }
  return (
    <section className="card p-5 flex flex-col gap-3">
      <h2 className="font-bold" style={{ color: "var(--green-900)" }}>{t("events.create")}</h2>
      <input style={inputStyle} placeholder={t("events.field.title")} value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea style={inputStyle} placeholder={t("events.field.description")} rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} />
      <input style={inputStyle} placeholder={t("events.field.location")} value={loc} onChange={(e) => setLoc(e.target.value)} />
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>{t("events.field.start")}</span>
          <input type="datetime-local" style={inputStyle} value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>{t("events.field.end")}</span>
          <input type="datetime-local" style={inputStyle} value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
      </div>
      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={submit}>{t("events.add")}</button>
        <button className="btn btn-ghost" onClick={() => setOpen(false)}>✕</button>
      </div>
    </section>
  );
}

function CreateInfoForm({
  onSubmit,
  t,
}: {
  onSubmit: (i: { title: string; body: string }) => void;
  t: (k: string) => string;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const submit = () => {
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), body: body.trim() });
    setTitle(""); setBody("");
  };
  return (
    <div className="card p-4 flex flex-col gap-2">
      <input style={inputStyle} placeholder={t("events.info.itemTitle")} value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea style={inputStyle} placeholder={t("events.info.body")} rows={2} value={body} onChange={(e) => setBody(e.target.value)} />
      <button className="btn btn-primary self-start" onClick={submit}>{t("events.info.add")}</button>
    </div>
  );
}
