"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/ui";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

export default function CoachPage() {
  const { t, viewer } = useStore();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [configured, setConfigured] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/coach")
      .then((r) => r.json())
      .then((d) => {
        setMessages((d.messages ?? []).map((m: Msg) => ({ role: m.role, content: m.content })));
        setConfigured(d.configured !== false);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setSending(true);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      const reply = data.reply ?? t("coach.error");
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: t("coach.error") }]);
    } finally {
      setSending(false);
    }
  };

  if (!viewer) return null;

  return (
    <div className="flex flex-col gap-4" style={{ minHeight: "70vh" }}>
      <PageHeader title={t("coach.title")} subtitle={t("coach.subtitle")} />

      <div className="flex-1 flex flex-col gap-3">
        {loaded && messages.length === 0 && (
          <div className="card p-5">
            <div className="chip chip-gold mb-2">Lifted Coach</div>
            <p className="text-sm">{t("coach.welcome")}</p>
            {!configured && (
              <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>{t("coach.fallbackNote")}</p>
            )}
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className="flex"
            style={{ justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}
          >
            <div
              className="px-4 py-2.5 rounded-2xl text-sm whitespace-pre-line"
              style={{
                maxWidth: "85%",
                background: m.role === "user" ? "var(--green-700)" : "var(--surface)",
                color: m.role === "user" ? "#fff" : "var(--foreground)",
                border: m.role === "user" ? "none" : "1px solid var(--border)",
                borderBottomRightRadius: m.role === "user" ? 4 : undefined,
                borderBottomLeftRadius: m.role === "assistant" ? 4 : undefined,
              }}
            >
              {m.content}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex" style={{ justifyContent: "flex-start" }}>
            <div className="px-4 py-2.5 rounded-2xl text-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)" }}>
              {t("coach.thinking")}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-0 pt-2" style={{ background: "var(--background)" }}>
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={t("coach.placeholder")}
            rows={1}
            style={{
              flex: 1,
              border: "1px solid var(--border)",
              borderRadius: "1rem",
              padding: "0.7rem 0.9rem",
              background: "var(--surface)",
              fontSize: "0.95rem",
              resize: "none",
              maxHeight: 120,
            }}
          />
          <button className="btn btn-primary" onClick={send} disabled={sending || !input.trim()}>
            {t("coach.send")}
          </button>
        </div>
        <p className="text-[0.7rem] mt-1.5 text-center" style={{ color: "var(--muted)" }}>
          {t("coach.disclaimer")}
        </p>
      </div>
    </div>
  );
}
