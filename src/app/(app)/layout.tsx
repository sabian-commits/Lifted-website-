"use client";

import { StoreProvider, useStore } from "@/lib/store";
import { AppShell } from "@/components/AppShell";

function Gate({ children }: { children: React.ReactNode }) {
  const { loading, viewer, profileMissing, t, signOut } = useStore();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="flex flex-col items-center gap-3">
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: "3px solid var(--green-100)",
              borderTopColor: "var(--green-700)",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    );
  }

  // Authenticated but no profile row — invite flow creates the profile before
  // the user first signs in, but as a safety net show a clear message rather
  // than a confusing redirect loop.
  if (profileMissing) {
    return (
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="card p-8 max-w-sm text-center flex flex-col gap-4">
          <div className="text-2xl font-bold" style={{ color: "var(--green-900)" }}>
            {t("app.name")}
          </div>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {t("gate.noProfile")}
          </p>
          <button className="btn btn-ghost" onClick={signOut}>
            {t("auth.signOut")}
          </button>
        </div>
      </div>
    );
  }

  if (!viewer) {
    // Proxy normally redirects unauthenticated users; this is a fallback.
    return (
      <div className="flex-1 flex items-center justify-center p-10">
        <a href="/login" className="btn btn-primary">{t("auth.signIn")}</a>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <Gate>{children}</Gate>
    </StoreProvider>
  );
}
