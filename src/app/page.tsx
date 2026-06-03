"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";

const STAGE_COLORS: Record<string, string> = {
  see: "var(--see, var(--green-700))",
  grow: "var(--grow, var(--gold-600))",
  multiply: "var(--multiply, var(--gold-600))",
};

export default function Home() {
  const { t, lang, setLang } = useLang();

  const pipeline = [
    t("landing.pipeline.1"),
    t("landing.pipeline.2"),
    t("landing.pipeline.3"),
    t("landing.pipeline.4"),
    t("landing.pipeline.5"),
  ];

  const pillars = [
    {
      key: "see",
      chip: t("common.see"),
      quote: t("see.quote"),
      body: t("landing.see.body"),
      note: t("landing.pillar.see.note"),
    },
    {
      key: "grow",
      chip: t("common.grow"),
      quote: t("grow.quote"),
      body: t("landing.grow.body"),
      note: t("landing.pillar.grow.note"),
    },
    {
      key: "multiply",
      chip: t("common.multiply"),
      quote: t("multiply.quote"),
      body: t("landing.multiply.body"),
      note: t("landing.pillar.multiply.note"),
    },
  ];

  const culture = [
    { key: "1", principle: t("landing.culture.1"), desc: t("landing.culture.1.desc") },
    { key: "2", principle: t("landing.culture.2"), desc: t("landing.culture.2.desc") },
    { key: "3", principle: t("landing.culture.3"), desc: t("landing.culture.3.desc") },
  ];

  return (
    <div className="flex-1">
      <div className="mx-auto max-w-5xl w-full px-4 py-6 flex flex-col gap-12">

        {/* Header */}
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "linear-gradient(135deg, var(--green-500), var(--green-900))",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            <div>
              <div className="font-extrabold text-lg leading-tight" style={{ color: "var(--green-900)" }}>
                {t("app.name")}
              </div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>
                {t("landing.hero.sub")}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === "en" ? "es" : "en")}
              className="btn btn-ghost"
              style={{ padding: "0.35rem 0.7rem", fontSize: "0.8rem" }}
            >
              {t("nav.language")}
            </button>
            <Link href="/login" className="btn btn-primary" style={{ padding: "0.4rem 0.9rem", fontSize: "0.85rem" }}>
              {t("auth.signIn")}
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="text-center flex flex-col items-center gap-4 py-4">
          <h1
            className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight"
            style={{ color: "var(--green-900)" }}
          >
            {t("landing.hero")}
          </h1>
          <p className="max-w-lg text-lg" style={{ color: "var(--muted)" }}>
            {t("landing.subtitle")}
          </p>
          <Link href="/login" className="btn btn-primary mt-2" style={{ padding: "0.6rem 1.4rem", fontSize: "1rem" }}>
            {t("landing.cta")}
          </Link>
        </section>

        {/* Ministry Journey */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-bold text-lg" style={{ color: "var(--green-900)" }}>
              {t("landing.journey.title")}
            </h2>
          </div>
          <div className="card p-5">
            <ol className="flex flex-wrap items-center gap-2">
              {pipeline.map((step, i) => (
                <li key={step} className="flex items-center gap-2">
                  <span
                    className="px-3 py-1.5 rounded-lg font-medium text-sm"
                    style={{ background: "var(--green-100)", color: "var(--green-900)" }}
                  >
                    {i + 1}. {step}
                  </span>
                  {i < pipeline.length - 1 && (
                    <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>→</span>
                  )}
                </li>
              ))}
            </ol>
            <p className="text-xs mt-4" style={{ color: "var(--muted)" }}>
              {t("landing.journey.note")}
            </p>
          </div>
        </section>

        {/* Three Pillars */}
        <section className="flex flex-col gap-4">
          <h2 className="font-bold text-lg" style={{ color: "var(--green-900)" }}>
            {t("landing.pillars.title")}
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {pillars.map((p) => (
              <div
                key={p.key}
                className="card p-5 flex flex-col gap-3"
                style={{ borderLeft: `4px solid ${STAGE_COLORS[p.key]}` }}
              >
                <span
                  className="chip self-start text-xs font-bold uppercase tracking-wider"
                  style={{ background: "var(--green-100)", color: "var(--green-900)" }}
                >
                  {p.chip}
                </span>
                <p className="italic text-sm font-medium" style={{ color: "var(--green-900)" }}>
                  "{p.quote}"
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {p.body}
                </p>
                <p
                  className="text-xs pt-2 border-t"
                  style={{ color: "var(--muted)", borderColor: "var(--border)" }}
                >
                  {p.note}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Culture Principles */}
        <section className="flex flex-col gap-4">
          <h2 className="font-bold text-lg" style={{ color: "var(--green-900)" }}>
            {t("landing.culture.title")}
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {culture.map((c) => (
              <div key={c.key} className="card p-4">
                <p className="font-semibold text-sm" style={{ color: "var(--green-900)" }}>
                  {c.principle}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <section className="text-center py-4 flex flex-col items-center gap-3">
          <p style={{ color: "var(--muted)" }}>{t("landing.signin.sub")}</p>
          <Link href="/login" className="btn btn-primary">
            {t("auth.signIn")}
          </Link>
        </section>

      </div>
    </div>
  );
}
