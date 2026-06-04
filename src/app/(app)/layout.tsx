// Server Component — exports dynamic so Turbopack/Next.js actually respects it.
// All client-side logic (StoreProvider, Gate, AppShell) lives in layout-client.tsx.
export const dynamic = 'force-dynamic';

import ClientAppLayout from "./layout-client";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <ClientAppLayout>{children}</ClientAppLayout>;
}
