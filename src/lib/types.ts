// Domain model for the Lifted Church platform — Phase 1 (Volunteer Portal).
// Encodes the Serve Honor System from the lifted_ministry_playbook.

export type Role =
  | "volunteer"
  | "gap_leader"
  | "area_lead"
  | "service_lead"
  | "ministry_lead"
  | "pastor";

export type Stage = "see" | "grow" | "multiply";

export type ZoneId = "parking" | "breezeway" | "patio" | "doors";

export type TrainingId =
  | "inauguration"
  | "leader_foundations"
  | "zone_leadership"
  | "service_operations";

// Star levels in the ladder. The 4★ and 6★ gaps are intentional development
// periods, so the awardable levels are 1, 2, 3, 5, 7.
export type StarLevel = 1 | 2 | 3 | 5 | 7;

// How an award is approved once requested.
export type ApprovalRule =
  | "active" // Ministry Lead must actively approve; no time default (1★)
  | "default_7" // 7-day window, silence = approval (2★, 3★)
  | "explicit_14" // 14-day window, explicit confirmation required, no default (5★)
  | "joint"; // joint Ministry Lead + Pastor, personal conversation, no default (7★)

export type AwardStatus =
  | "pending"
  | "approved"
  | "auto_approved"
  | "denied";

export interface LadderLevel {
  stars: StarLevel;
  title: string; // English title; localized label handled in UI dictionary
  titleKey: string;
  stage: Stage;
  requiredTraining: TrainingId;
  approverRole: Role; // who signs off (pastor = senior pastor)
  approvalRule: ApprovalRule;
  criteriaKey: string; // i18n key for the bullet list of criteria
}

export interface Training {
  id: TrainingId;
  titleKey: string;
  durationKey: string;
  unlocks: StarLevel[];
  formatKey: string;
  outlineKeys: string[]; // i18n keys for core content bullets
  deliverableByAnyLeader: boolean; // e.g. Inauguration can be run by gap leaders
}

export interface Zone {
  id: ZoneId;
  nameKey: string;
  descKey: string;
}

export interface Volunteer {
  id: string;
  name: string;
  role: Role;
  zone: ZoneId | null;
  currentStars: 0 | StarLevel;
  languagePref: "en" | "es";
}

export interface TrainingCompletion {
  id: string;
  volunteerId: string;
  trainingId: TrainingId;
  date: string; // ISO
  facilitator: string;
  notes?: string;
}

export interface StarAward {
  id: string;
  volunteerId: string;
  stars: StarLevel;
  status: AwardStatus;
  requestedDate: string; // ISO
  decidedDate?: string; // ISO
  approver?: string;
  conversationHeld?: boolean; // required true for 7★
}

export interface Recognition {
  id: string;
  volunteerId: string;
  month: string; // YYYY-MM
  behavior: string; // the specific observed behavior
  value: string; // which ministry value it embodies
  confirmed: boolean; // Ministry Lead confirmed (vs. gap-leader nomination)
  nominatedBy: string;
}

export interface WeeklyReport {
  id: string;
  reporterId: string;
  zone: ZoneId;
  weekOf: string; // ISO date (Sunday)
  attendanceCount: number;
  starDistribution: string; // free text summary, e.g. "3×1★, 1×3★"
  consistencyFlag: string;
  observation: string;
  ask: string;
}

export interface WeakLinkFlag {
  id: string;
  zone: ZoneId;
  weekOf: string;
  description: string;
  resolved: boolean;
  flaggedBy: string;
}

export type EscalationResponse = "keep" | "move" | "remove";

export interface Escalation {
  id: string;
  volunteerId: string;
  response: EscalationResponse; // Success→Keep / Boundaries→Move / Escalate→Remove
  situation: string;
  followUp: string;
  date: string;
}

// ---------- Events / Info hub ----------
export interface ChurchEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  startsAt: string; // ISO
  endsAt?: string; // ISO
  createdBy?: string;
}

export interface EventRsvp {
  id: string;
  eventId: string;
  userId: string;
  createdAt: string;
}

export interface InfoItem {
  id: string;
  title: string;
  body: string;
  sort: number;
}

// ---------- MULTIPLY: 5 Into 1 + The Rivers ----------
// The three multiplication channels (playbook §5, "The Rivers"). The map itself
// is flagged in the playbook as still needing dedicated unpacking, so these are
// the established channels — not the final, fully-built river map.
export type River = "small_group" | "see_team" | "gap_network";

// shaping → transferred → multiplying. Multiplication has only happened once the
// disciple can teach it without the leader in the room.
export type MultiplyStatus = "shaping" | "transferred" | "multiplying";

export interface MultiplyRelationship {
  id: string;
  leaderId: string;
  discipleId: string;
  river: River;
  focus: string; // what is being transferred
  status: MultiplyStatus;
  notes: string;
  createdAt: string;
}

// ---------- First Impressions: Guest Pipeline ----------
// Tracks new people through R1 (Recognition) → R2 (Relationship) → R3 (Responsibility) → Connected
export type RStage = "r1" | "r2" | "r3" | "completed";

export interface Guest {
  id: string;
  loggedBy: string;
  name: string;
  firstVisitDate: string;       // "YYYY-MM-DD"
  currentRStage: RStage;
  connectCardDone: boolean;
  lifeGroupConnected: boolean;
  dnaStarted: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
