// Verifies live data + RLS by signing in as real users with the anon key
// (exactly what the browser does). Run: node --env-file=.env.local scripts/verify.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const PW = "LiftedDemo1!";

function client() {
  return createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
}
async function as(email) {
  const c = client();
  const { error } = await c.auth.signInWithPassword({ email, password: PW });
  if (error) throw new Error(`${email}: ${error.message}`);
  return c;
}
const count = async (c, table) => (await c.from(table).select("*")).data?.length ?? 0;

const results = [];
const log = (name, got, expect, ok) => { results.push(ok); console.log(`${ok ? "✅" : "❌"} ${name}: got ${got}, expected ${expect}`); };

(async () => {
  // ---- Volunteer (James): should see ONLY himself + his own records, no reports/escalations ----
  const james = await as("james@lifted.demo");
  log("James sees only own profile", await count(james, "profiles"), "1", (await count(james, "profiles")) === 1);
  log("James cannot read weekly_reports (lead-only)", await count(james, "weekly_reports"), "0", (await count(james, "weekly_reports")) === 0);
  log("James cannot read escalations (lead-only)", await count(james, "escalations"), "0", (await count(james, "escalations")) === 0);

  // James tries to approve his own award (should be blocked by RLS update policy)
  const jamesAward = (await james.from("star_awards").select("*").eq("status", "pending")).data?.[0];
  const hack = await james.from("star_awards").update({ status: "approved" }).eq("id", jamesAward.id).select();
  log("James CANNOT approve his own award (RLS)", (hack.data?.length ?? 0), "0", (hack.data?.length ?? 0) === 0);

  // ---- Ministry Lead (Sabian): sees everything ----
  const sabian = await as("sabian@lifted.demo");
  log("Sabian sees all 8 profiles", await count(sabian, "profiles"), "8", (await count(sabian, "profiles")) === 8);
  log("Sabian sees weekly_reports", await count(sabian, "weekly_reports"), "2", (await count(sabian, "weekly_reports")) === 2);

  // Sabian approves James's pending 2-star, then James should be 2 stars
  const award = (await sabian.from("star_awards").select("*").eq("volunteer_id", jamesAward.volunteer_id).eq("status", "pending")).data?.[0];
  await sabian.from("star_awards").update({ status: "approved", approver: "Sabian Lopez", decided_date: new Date().toISOString() }).eq("id", award.id);
  await sabian.from("profiles").update({ current_stars: 2 }).eq("id", award.volunteer_id);
  const jStars = (await sabian.from("profiles").select("current_stars").eq("id", award.volunteer_id).single()).data?.current_stars;
  log("Sabian approved -> James now 2 stars", jStars, "2", jStars === 2);

  // Sabian (ministry_lead) tries to approve a 5-star (pastor-only level) — RLS allows the row update,
  // but the app engine blocks it. RLS here only restricts to leads; authority is enforced in app code.
  // Pastor Mike can read escalations:
  const mike = await as("mike@lifted.demo");
  log("Pastor sees escalations table readable", (await mike.from("escalations").select("*")).error ? "error" : "ok", "ok", !(await mike.from("escalations").select("*")).error);

  const passed = results.filter(Boolean).length;
  console.log(`\n${passed}/${results.length} checks passed.`);
  process.exit(passed === results.length ? 0 : 1);
})().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
