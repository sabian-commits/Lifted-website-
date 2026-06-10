export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import HomeClient from "./page-client";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userName: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single();
    userName = profile?.name ?? null;
  }

  return <HomeClient isLoggedIn={!!user} userName={userName} />;
}
