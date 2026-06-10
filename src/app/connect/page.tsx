"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";

export default function ConnectPage() {
  const { t, lang, setLang } = useLang();

  const steps = t("connect.pathway.steps").split(" → ");

  return (
    <div className="flex-1">
      <div className="mx-auto max-w-2xl w-full px-4 py-6 flex flex-col gap-10">

        {/* Header */}
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <Link href="/" className="flex items-center gap-3">
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "linear-gradient(135deg, var(--green-500), var(--green-900))",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            <span className="font-extrabold text-base" style={{ color: "var(--green-900)" }}>
              {t("app.name")}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === "en" ? "es" : "en")}
              className="btn btn-ghost"
              style={{ padding: "0.35rem 0.7rem", fontSize: "0.8rem" }}
            >
              {t("nav.language")}
            </button>
          </div>
        </header>

        {/* Hero */}
        <section className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: "var(--green-900)" }}>
            {t("connect.title")}
          </h1>
          <p className="text-lg" style={{ color: "var(--muted)" }}>
            {t("connect.subtitle")}
          </p>
        </section>

        {/* Pathway strip */}
        <section className="card p-5 flex flex-col gap-3">
          <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--muted)" }}>
            {t("connect.pathway.title")}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {steps.map((step, i) => (
              <span key={step} className="flex items-center gap-2">
                <span
                  className="px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{ background: "var(--green-100)", color: "var(--green-900)" }}
                >
                  {step}
                </span>
                {i < steps.length - 1 && (
                  <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>→</span>
                )}
              </span>
            ))}
          </div>
        </section>

        {/* DNA card */}
        <section
          className="card p-6 flex flex-col gap-3"
          style={{ borderLeft: "4px solid var(--green-500)" }}
        >
          <h2 className="font-bold text-xl" style={{ color: "var(--green-900)" }}>
            {t("connect.dna.title")}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            {t("connect.dna.body")}
          </p>
        </section>

        {/* Life Groups card */}
        <section
          className="card p-6 flex flex-col gap-3"
          style={{ borderLeft: "4px solid var(--gold-600)" }}
        >
          <h2 className="font-bold text-xl" style={{ color: "var(--green-900)" }}>
            {t("connect.lifeGroup.title")}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            {t("connect.lifeGroup.body")}
          </p>
        </section>

        {/* Volunteer CTA */}
        <section className="text-center py-2">
          <Link
            href="/login"
            className="btn btn-ghost text-sm"
            style={{ color: "var(--muted)" }}
          >
            {t("connect.volunteer.cta")}
          </Link>
        </section>

      </div>
    </div>
  );
}
