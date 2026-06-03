"use client";

import { StoreProvider, useStore } from "@/lib/store";
import { AppShell } from "@/components/AppShell";

function Gate({ children }: { children: React.ReactNode }) {
  const { loading, viewer, t } = useStore();

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
