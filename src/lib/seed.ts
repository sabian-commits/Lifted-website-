// Seed data for the demo. Represents a small but realistic First Impressions
// team mid-season. Replaced by Supabase queries when the backend is wired up.

import type {
  Escalation,
  Recognition,
  StarAward,
  TrainingCompletion,
  Volunteer,
  WeakLinkFlag,
  WeeklyReport,
} from "./types";

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86400000).toISOString();
}

function thisMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export const SEED_VOLUNTEERS: Volunteer[] = [
  { id: "v-sabian", name: "Sabian Lopez", role: "ministry_lead", zone: null, currentStars: 7, languagePref: "en" },
  { id: "v-pastor", name: "Pastor Mike", role: "pastor", zone: null, currentStars: 7, languagePref: "en" },
  { id: "v-jorge", name: "Jorge Ramirez", role: "service_lead", zone: "doors", currentStars: 7, languagePref: "es" },
  { id: "v-maria", name: "María Gonzalez", role: "area_lead", zone: "patio", currentStars: 5, languagePref: "es" },
  { id: "v-david", name: "David Chen", role: "gap_leader", zone: "parking", currentStars: 3, languagePref: "en" },
  { id: "v-ana", name: "Ana Torres", role: "volunteer", zone: "breezeway", currentStars: 2, languagePref: "es" },
  { id: "v-james", name: "James Carter", role: "volunteer", zone: "doors", currentStars: 1, languagePref: "en" },
  { id: "v-lucia", name: "Lucía Flores", role: "volunteer", zone: "parking", currentStars: 0, languagePref: "es" },
];

export const SEED_COMPLETIONS: TrainingCompletion[] = [
  { id: "c1", volunteerId: "v-james", trainingId: "inauguration", date: daysAgo(40), facilitator: "David Chen" },
  { id: "c2", volunteerId: "v-ana", trainingId: "inauguration", date: daysAgo(70), facilitator: "David Chen" },
  { id: "c3", volunteerId: "v-david", trainingId: "inauguration", date: daysAgo(160), facilitator: "Sabian Lopez" },
  { id: "c4", volunteerId: "v-david", trainingId: "leader_foundations", date: daysAgo(90), facilitator: "Sabian Lopez" },
  { id: "c5", volunteerId: "v-maria", trainingId: "inauguration", date: daysAgo(300), facilitator: "Sabian Lopez" },
  { id: "c6", volunteerId: "v-maria", trainingId: "leader_foundations", date: daysAgo(240), facilitator: "Sabian Lopez" },
  { id: "c7", volunteerId: "v-maria", trainingId: "zone_leadership", date: daysAgo(120), facilitator: "Sabian Lopez" },
  // Lucía has completed Inauguration but has not yet been awarded 1★ — a realistic pending case.
  { id: "c8", volunteerId: "v-lucia", trainingId: "inauguration", date: daysAgo(8), facilitator: "Ana Torres" },
];

export const SEED_AWARDS: StarAward[] = [
  { id: "a1", volunteerId: "v-lucia", stars: 1, status: "pending", requestedDate: daysAgo(2) },
  { id: "a2", volunteerId: "v-james", stars: 2, status: "pending", requestedDate: daysAgo(3) },
  { id: "a3", volunteerId: "v-david", stars: 5, status: "pending", requestedDate: daysAgo(5) },
];

export const SEED_RECOGNITIONS: Recognition[] = [
  {
    id: "r1",
    volunteerId: "v-ana",
    month: thisMonth(),
    behavior:
      "Stayed 20 minutes after the 1pm service to pray with a first-time guest, and told no one.",
    value: "Ready to Rescue",
    confirmed: true,
    nominatedBy: "David Chen",
  },
  {
    id: "r2",
    volunteerId: "v-james",
    month: thisMonth(),
    behavior: "Showed up early every Sunday this month to set up the Doors zone without being asked.",
    value: "Faithfulness in the gaps",
    confirmed: false,
    nominatedBy: "Jorge Ramirez",
  },
];

export const SEED_REPORTS: WeeklyReport[] = [
  {
    id: "w1",
    reporterId: "v-david",
    zone: "parking",
    weekOf: daysAgo(4),
    attendanceCount: 6,
    starDistribution: "1×0★, 3×1★, 1×2★, 1×3★",
    consistencyFlag: "Lucía missed last Sunday — checking in this week.",
    observation: "James is informally training the two newest parkers — 3★ behavior emerging.",
    ask: "Need one more volunteer for the 1pm rush.",
  },
  {
    id: "w2",
    reporterId: "v-maria",
    zone: "patio",
    weekOf: daysAgo(4),
    attendanceCount: 5,
    starDistribution: "2×1★, 2×2★, 1×5★",
    consistencyFlag: "Full coverage this week.",
    observation: "Strong repeat-guest engagement on the patio after the 11am.",
    ask: "Approval on David's 5★ when you get a chance.",
  },
];

export const SEED_WEAK_LINKS: WeakLinkFlag[] = [
  {
    id: "wl1",
    zone: "breezeway",
    weekOf: daysAgo(4),
    description: "Only one trained volunteer scheduled for the 9am — single point of failure.",
    resolved: false,
    flaggedBy: "Ana Torres",
  },
];

export const SEED_ESCALATIONS: Escalation[] = [];
