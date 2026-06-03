"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";

export default function Home() {
  const { t, lang, setLang } = useLang();

  const stages = [
    { key: "see", color: "var(--see)", word: t("common.see"), body: t("landing.see.body") },
    { key: "grow", color: "var(--grow)", word: t("common.grow"), body: t("landing.grow.body") },
    { key: "multiply", color: "var(--multiply)", word: t("common.multiply"), body: t("landing.multiply.body") },
  ];

  const pipeline = [
    t("landing.pipeline.1"),
    t("landing.pipeline.2"),
    t("landing.pipeline.3"),
    t("landing.pipeline.4"),
    t("landing.pipeline.5"),
  ];

  return (
    <div className="flex-1">
      <div className="mx-auto max-w-5xl w-full px-4 py-6 flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-bold" style={{ color: "var(--green-900)" }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, background: "linear-gradient(135deg, var(--green-500), var(--green-900))", display: "inline-block" }} />
            {t("app.name")}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(lang === "en" ? "es" : "en")} className="btn btn-ghost" style={{ padding: "0.35rem 0.7rem", fontSize: "0.8rem" }}>
              {t("nav.language")}
            </button>
            <Link href="/login" className="btn btn-primary" style={{ padding: "0.4rem 0.9rem", fontSize: "0.85rem" }}>
              {t("auth.signIn")}
            </Link>
          </div>
        </div>

        <section className="text-center py-6">
          <p className="chip chip-gold mx-auto mb-4">{t("app.tagline")}</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight" style={{ color: "var(--green-900)" }}>
            {t("landing.title")}
          </h1>
          <p className="mt-3 max-w-xl mx-auto" style={{ color: "var(--muted)" }}>
            {t("landing.subtitle")}
          </p>
          <Link href="/login" className="btn btn-primary mt-6 inline-flex">
            {t("landing.cta")}
          </Link>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {stages.map((s) => (
            <div key={s.key} className="card p-5">
              <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: s.color }}>
                {s.word}
              </div>
              <p className="text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </section>

        <section className="card p-5">
          <div className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "var(--muted)" }}>
            {t("landing.pipeline")}
          </div>
          <ol className="flex flex-wrap items-center gap-2 text-sm">
            {pipeline.map((p, i) => (
              <li key={p} className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg font-medium" style={{ background: "var(--green-100)", color: "var(--green-900)" }}>
                  {i + 1}. {p}
                </span>
                {i < pipeline.length - 1 && <span style={{ color: "var(--muted)" }}>→</span>}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
