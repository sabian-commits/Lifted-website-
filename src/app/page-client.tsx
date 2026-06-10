"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";

const STAGE_COLORS: Record<string, string> = {
  see: "var(--see, var(--green-700))",
  grow: "var(--grow, var(--gold-600))",
  multiply: "var(--multiply, var(--gold-600))",
};

interface Props {
  isLoggedIn: boolean;
  userName: string | null;
}

export default function HomeClient({ isLoggedIn, userName }: Props) {
  const { t, lang, setLang } = useLang();

  const firstName = userName?.split(" ")[0] ?? null;

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
            {!isLoggedIn && (
              <Link href="/login" className="btn btn-primary" style={{ padding: "0.4rem 0.9rem", fontSize: "0.85rem" }}>
                {t("auth.signIn")}
              </Link>
            )}
            {isLoggedIn && (
              <Link href="/dashboard" className="btn btn-ghost" style={{ padding: "0.4rem 0.9rem", fontSize: "0.85rem" }}>
                {t("nav.dashboard")}
              </Link>
            )}
          </div>
        </header>

        {/* Hero */}
        <section className="text-center flex flex-col items-center gap-3 py-2">
          {isLoggedIn && firstName && (
            <span
              className="chip text-sm font-semibold px-4 py-1.5"
              style={{ background: "var(--green-100)", color: "var(--green-900)" }}
            >
              {t("landing.loggedIn.greeting")}, {firstName} 👋
            </span>
          )}
          <h1
            className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight"
            style={{ color: "var(--green-900)" }}
          >
            {t("landing.hero")}
          </h1>
          <p className="max-w-lg text-lg" style={{ color: "var(--muted)" }}>
            {t("landing.subtitle")}
          </p>
        </section>

        {/* Path cards */}
        {!isLoggedIn ? (
          <section className="grid sm:grid-cols-2 gap-5">
            {/* New to Lifted — logged out */}
            <div
              className="card p-6 flex flex-col gap-4"
              style={{ borderTop: "4px solid var(--green-500)" }}
            >
              <div>
                <h2 className="font-bold text-xl" style={{ color: "var(--green-900)" }}>
                  {t("landing.path.new")}
                </h2>
                <p className="text-sm mt-1.5 leading-relaxed" style={{ color: "var(--muted)" }}>
                  {t("landing.path.new.desc")}
                </p>
              </div>
              <Link
                href="/connect"
                className="btn btn-primary self-start mt-auto"
                style={{ padding: "0.55rem 1.2rem" }}
              >
                {t("landing.path.new.cta")}
              </Link>
            </div>

            {/* Volunteer — logged out */}
            <div
              className="card p-6 flex flex-col gap-4"
              style={{ borderTop: "4px solid var(--gold-600)" }}
            >
              <div>
                <h2 className="font-bold text-xl" style={{ color: "var(--green-900)" }}>
                  {t("landing.path.volunteer")}
                </h2>
                <p className="text-sm mt-1.5 leading-relaxed" style={{ color: "var(--muted)" }}>
                  {t("landing.path.volunteer.desc")}
                </p>
              </div>
              <Link
                href="/login"
                className="btn self-start mt-auto"
                style={{
                  padding: "0.55rem 1.2rem",
                  background: "var(--gold-100, #fef9e7)",
                  color: "var(--gold-600)",
                  border: "1.5px solid var(--gold-600)",
                  fontWeight: 600,
                }}
              >
                {t("landing.path.volunteer.cta")}
              </Link>
            </div>
          </section>
        ) : (
          <section className="max-w-lg">
            {/* Volunteer — logged in */}
            <div
              className="card p-6 flex flex-col gap-4"
              style={{ borderTop: "4px solid var(--gold-600)" }}
            >
              <div>
                <h2 className="font-bold text-xl" style={{ color: "var(--green-900)" }}>
                  {t("landing.loggedIn.path.volunteer")}
                </h2>
                <p className="text-sm mt-1.5 leading-relaxed" style={{ color: "var(--muted)" }}>
                  {t("landing.loggedIn.path.volunteer.desc")}
                </p>
              </div>
              <Link
                href="/see"
                className="btn self-start mt-auto"
                style={{
                  padding: "0.55rem 1.2rem",
                  background: "var(--gold-100, #fef9e7)",
                  color: "var(--gold-600)",
                  border: "1.5px solid var(--gold-600)",
                  fontWeight: 600,
                }}
              >
                {t("landing.loggedIn.path.volunteer.cta")}
              </Link>
            </div>
          </section>
        )}

        {/* Jump back in (logged-in only) */}
        {isLoggedIn && (
          <section className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--muted)" }}>
              {t("landing.loggedIn.jumpBack")}
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { href: "/dashboard", key: "nav.dashboard" },
                { href: "/coach",     key: "nav.coach" },
                { href: "/events",    key: "nav.events" },
                { href: "/trainings", key: "nav.trainings" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="chip text-sm font-medium px-3 py-1.5"
                  style={{
                    background: "var(--surface-alt, var(--green-100))",
                    color: "var(--green-900)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {t(l.key)}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* What is First Impressions */}
        <section className="card p-6 flex flex-col gap-2">
          <h2 className="font-bold text-base" style={{ color: "var(--green-900)" }}>
            {t("landing.what.title")}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            {t("landing.what.body")}
          </p>
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

        {/* Footer CTA (logged-out only) */}
        {!isLoggedIn && (
          <section className="text-center py-4 flex flex-col items-center gap-3">
            <p style={{ color: "var(--muted)" }}>{t("landing.signin.sub")}</p>
            <Link href="/login" className="btn btn-primary">
              {t("auth.signIn")}
            </Link>
          </section>
        )}

      </div>
    </div>
  );
}
