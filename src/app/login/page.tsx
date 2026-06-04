// Server Component wrapper — exports dynamic so login is never statically
// prerendered (createClient() in the client component would throw if env vars
// are empty during build-time SSR).
export const dynamic = 'force-dynamic';

import LoginPageClient from "./page-client";

export default function LoginPage() {
  return <LoginPageClient />;
}
