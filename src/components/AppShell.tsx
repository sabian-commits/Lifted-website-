"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { canReport, useStore } from "@/lib/store";

const NAV = [
  { href: "/dashboard", key: "nav.dashboard" },
  { href: "/trainings", key: "nav.trainings" },
  { href: "/ladder", key: "nav.ladder" },
  { href: "/multiply", key: "nav.multiply" },
  { href: "/coach", key: "nav.coach" },
  { href: "/events", key: "nav.events" },
  { href: "/report", key: "nav.report", reportOnly: true },
  { href: "/admin", key: "nav.admin", leadOnly: true },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t, lang, setLang, viewer, signOut } = useStore();
  const pathname = usePathname();

  if (!viewer) return null;

  const isLead = viewer.role === "ministry_lead" || viewer.role === "pastor";
  const canRep = canReport(viewer.role);
  const visible = (n: { leadOnly?: boolean; reportOnly?: boolean }) =>
    (!n.leadOnly || isLead) && (!n.reportOnly || canRep);

  return (
    <div className="flex flex-col min-h-full">
      <header
        className="sticky top-0 z-20"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold" style={{ color: "var(--green-900)" }}>
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                background: "linear-gradient(135deg, var(--green-500), var(--green-900))",
                display: "inline-block",
              }}
            />
            {t("app.name")}
          </Link>

          <nav className="hidden sm:flex items-center gap-1 ml-2">
            {NAV.filter(visible).map((n) => {
              const active = pathname === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{
                    background: active ? "var(--green-100)" : "transparent",
                    color: active ? "var(--green-900)" : "var(--muted)",
                  }}
                >
                  {t(n.key)}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setLang(lang === "en" ? "es" : "en")}
              className="btn btn-ghost"
              style={{ padding: "0.35rem 0.7rem", fontSize: "0.8rem" }}
            >
              {t("nav.language")}
            </button>
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm font-semibold" style={{ color: "var(--green-900)" }}>
                {viewer.name}
              </span>
              <span className="text-[0.7rem]" style={{ color: "var(--muted)" }}>
                {viewer.role.replace("_", " ")}
              </span>
            </div>
            <button
              onClick={signOut}
              className="btn btn-ghost"
              style={{ padding: "0.35rem 0.7rem", fontSize: "0.8rem" }}
              title={t("auth.signOut")}
            >
              {t("auth.signOut")}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-6">{children}</main>

      {/* Bottom nav for mobile */}
      <nav
        className="sm:hidden sticky bottom-0 z-20 flex"
        style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}
      >
        {NAV.filter(visible).map((n) => {
          const active = pathname === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              className="flex-1 text-center py-2.5 text-xs font-medium"
              style={{ color: active ? "var(--green-700)" : "var(--muted)" }}
            >
              {t(n.key)}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
