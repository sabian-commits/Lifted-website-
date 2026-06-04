import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Verify caller is a lead
  const { data: caller } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!caller || !["ministry_lead", "pastor"].includes(caller.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const name: string = (body.name ?? "").toString().trim();
  const email: string = (body.email ?? "").toString().trim().toLowerCase();
  const zone: string | null = (body.zone ?? "").toString().trim() || null;
  const role: string = (body.role ?? "volunteer").toString().trim();

  if (!name || !email) {
    return NextResponse.json({ error: "name and email are required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Invite via Supabase Auth (sends a signup/magic link email to the volunteer)
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email);
  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 400 });
  }

  // Create the profile row (no RLS insert policy — requires service role)
  const { error: profileError } = await admin.from("profiles").insert({
    id: invited.user.id,
    name,
    role,
    zone: zone || null,
    current_stars: 0,
    language_pref: "en",
  });

  if (profileError) {
    // Profile creation failed — clean up the auth user to avoid orphaned accounts
    await admin.auth.admin.deleteUser(invited.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
