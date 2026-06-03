// Seeds the Lifted demo team into Supabase. Run AFTER applying 0001_init.sql.
//   node --env-file=.env.local scripts/seed.mjs
//
// Creates the 8 team members as real auth users (email-confirmed, with a shared
// demo password), then fills their profiles + Serve Honor System data. Idempotent-ish:
// if a user already exists it reuses them.

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing env. Run with: node --env-file=.env.local scripts/seed.mjs");
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
const PASSWORD = "LiftedDemo1!";
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();
const inDays = (n) => new Date(Date.now() + n * 86400000).toISOString();
const thisMonth = () => new Date().toISOString().slice(0, 7);

const people = [
  { key: "sabian", email: "sabian@lifted.demo", name: "Sabian Lopez", role: "ministry_lead", zone: null, stars: 7, lang: "en" },
  { key: "pastor", email: "mike@lifted.demo", name: "Pastor Mike", role: "pastor", zone: null, stars: 7, lang: "en" },
  { key: "jorge", email: "jorge@lifted.demo", name: "Jorge Ramirez", role: "service_lead", zone: "doors", stars: 7, lang: "es" },
  { key: "maria", email: "maria@lifted.demo", name: "Maria Gonzalez", role: "area_lead", zone: "patio", stars: 5, lang: "es" },
  { key: "david", email: "david@lifted.demo", name: "David Chen", role: "gap_leader", zone: "parking", stars: 3, lang: "en" },
  { key: "ana", email: "ana@lifted.demo", name: "Ana Torres", role: "volunteer", zone: "breezeway", stars: 2, lang: "es" },
  { key: "james", email: "james@lifted.demo", name: "James Carter", role: "volunteer", zone: "doors", stars: 1, lang: "en" },
  { key: "lucia", email: "lucia@lifted.demo", name: "Lucia Flores", role: "volunteer", zone: "parking", stars: 0, lang: "es" },
];

const id = {}; // key -> uuid

async function findUserByEmail(email) {
  // paginate users to find an existing one
  for (let page = 1; page <= 10; page++) {
    const { data } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    const u = data?.users?.find((x) => x.email === email);
    if (u) return u;
    if (!data || data.users.length < 200) break;
  }
  return null;
}

async function upsertUsers() {
  for (const p of people) {
    let user = await findUserByEmail(p.email);
    if (!user) {
      const { data, error } = await admin.auth.admin.createUser({
        email: p.email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { name: p.name },
      });
      if (error) throw new Error(`createUser ${p.email}: ${error.message}`);
      user = data.user;
      console.log("created", p.email);
    } else {
      console.log("exists ", p.email);
    }
    id[p.key] = user.id;
    // Ensure the profile reflects role/zone/stars (trigger created a base row).
    const { error: upErr } = await admin
      .from("profiles")
      .upsert({ id: user.id, name: p.name, role: p.role, zone: p.zone, current_stars: p.stars, language_pref: p.lang });
    if (upErr) throw new Error(`profile ${p.email}: ${upErr.message}`);
  }
}

async function reset(table) {
  await admin.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
}

async function seedData() {
  // clear dynamic tables (keep profiles)
  for (const tb of ["training_completions", "star_awards", "recognitions", "weekly_reports", "weak_link_flags", "escalations", "event_rsvps", "events", "info_items"]) {
    await reset(tb);
  }

  await admin.from("training_completions").insert([
    { volunteer_id: id.james, training: "inauguration", date: daysAgo(40), facilitator: "David Chen" },
    { volunteer_id: id.ana, training: "inauguration", date: daysAgo(70), facilitator: "David Chen" },
    { volunteer_id: id.david, training: "inauguration", date: daysAgo(160), facilitator: "Sabian Lopez" },
    { volunteer_id: id.david, training: "leader_foundations", date: daysAgo(90), facilitator: "Sabian Lopez" },
    { volunteer_id: id.maria, training: "inauguration", date: daysAgo(300), facilitator: "Sabian Lopez" },
    { volunteer_id: id.maria, training: "leader_foundations", date: daysAgo(240), facilitator: "Sabian Lopez" },
    { volunteer_id: id.maria, training: "zone_leadership", date: daysAgo(120), facilitator: "Sabian Lopez" },
    { volunteer_id: id.lucia, training: "inauguration", date: daysAgo(8), facilitator: "Ana Torres" },
  ]);

  await admin.from("star_awards").insert([
    { volunteer_id: id.lucia, stars: 1, status: "pending", requested_date: daysAgo(2) },
    { volunteer_id: id.james, stars: 2, status: "pending", requested_date: daysAgo(3) },
    { volunteer_id: id.david, stars: 5, status: "pending", requested_date: daysAgo(5) },
  ]);

  await admin.from("recognitions").insert([
    { volunteer_id: id.ana, month: thisMonth(), behavior: "Stayed 20 minutes after the 1pm service to pray with a first-time guest, and told no one.", value: "Ready to Rescue", confirmed: true, nominated_by: "David Chen" },
    { volunteer_id: id.james, month: thisMonth(), behavior: "Showed up early every Sunday this month to set up the Doors zone without being asked.", value: "Faithfulness in the gaps", confirmed: false, nominated_by: "Jorge Ramirez" },
  ]);

  await admin.from("weekly_reports").insert([
    { reporter_id: id.david, zone: "parking", week_of: daysAgo(4), attendance_count: 6, star_distribution: "1x0, 3x1, 1x2, 1x3", consistency_flag: "Lucia missed last Sunday - checking in.", observation: "James informally training two new parkers - 3-star behavior emerging.", ask: "Need one more volunteer for the 1pm rush." },
    { reporter_id: id.maria, zone: "patio", week_of: daysAgo(4), attendance_count: 5, star_distribution: "2x1, 2x2, 1x5", consistency_flag: "Full coverage this week.", observation: "Strong repeat-guest engagement on the patio after the 11am.", ask: "Approval on David's 5-star when you can." },
  ]);

  await admin.from("weak_link_flags").insert([
    { zone: "breezeway", week_of: daysAgo(4), description: "Only one trained volunteer scheduled for the 9am - single point of failure.", resolved: false, flagged_by: "Ana Torres" },
  ]);

  const { data: evs } = await admin.from("events").insert([
    { title: "First Impressions Huddle", description: "Pre-service team huddle. Vision, zone assignments, and prayer before doors open.", location: "Breezeway", starts_at: inDays(2), created_by: id.sabian },
    { title: "Volunteer Training Night", description: "Inauguration Training for new volunteers + Leader Foundations cohort. Light dinner provided.", location: "Main Auditorium", starts_at: inDays(5), ends_at: inDays(5), created_by: id.sabian },
    { title: "Baptism Sunday", description: "Celebrating those taking the next step. Invite someone who's been on the journey with you.", location: "Lifted Church", starts_at: inDays(12), created_by: id.pastor },
  ]).select();

  // A couple of RSVPs on the first event so the count is non-zero.
  if (evs && evs[0]) {
    await admin.from("event_rsvps").insert([
      { event_id: evs[0].id, user_id: id.david },
      { event_id: evs[0].id, user_id: id.ana },
      { event_id: evs[0].id, user_id: id.james },
    ]);
  }

  await admin.from("info_items").insert([
    { title: "Sunday Services", body: "9:00 AM · 11:00 AM · 1:00 PM (Español)\nKids ministry at every service.", sort: 0 },
    { title: "New Here?", body: "Stop by the patio after service and ask about DNA — our first step for getting connected and growing.", sort: 1 },
    { title: "Where to Serve", body: "Everyone starts in First Impressions. Talk to a team lead about joining the See team.", sort: 2 },
  ]);
}

(async () => {
  await upsertUsers();
  await seedData();
  console.log("\nSeed complete. Demo logins (password for all): " + PASSWORD);
  for (const p of people) console.log(`  ${p.email}  (${p.role})`);
})().catch((e) => { console.error(e); process.exit(1); });
