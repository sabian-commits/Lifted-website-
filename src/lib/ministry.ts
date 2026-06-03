// Static definitions of the Serve Honor System — the ladder, trainings, and zones.
// Sourced directly from the lifted_ministry_playbook (Sections 6 & 7).
// These are the rules of the ministry; they do not change at runtime.

import type { LadderLevel, River, Training, Zone } from "./types";

// ---------- MULTIPLY stage config (playbook §5) ----------
// "The Rivers" — the natural channels through which multiplication flows. The
// playbook flags this map as still needing dedicated unpacking, so these are the
// three established channels; the per-river detail is intentionally light.
export const RIVERS: { id: River; nameKey: string; descKey: string }[] = [
  { id: "small_group", nameKey: "river.small_group.name", descKey: "river.small_group.desc" },
  { id: "see_team", nameKey: "river.see_team.name", descKey: "river.see_team.desc" },
  { id: "gap_network", nameKey: "river.gap_network.name", descKey: "river.gap_network.desc" },
];

// "5 Into 1" — every leader intentionally shapes up to five people.
export const FIVE_INTO_ONE_CAP = 5;

// Roles named in the framework (§1) but not yet defined in the playbook. Surfaced
// as pending so the app does not invent rules the ministry has not decided.
export const PENDING_MULTIPLY_ROLES = ["galvanizer", "enabler"] as const;

export const ZONES: Zone[] = [
  { id: "parking", nameKey: "zone.parking.name", descKey: "zone.parking.desc" },
  { id: "breezeway", nameKey: "zone.breezeway.name", descKey: "zone.breezeway.desc" },
  { id: "patio", nameKey: "zone.patio.name", descKey: "zone.patio.desc" },
  { id: "doors", nameKey: "zone.doors.name", descKey: "zone.doors.desc" },
];

export const TRAININGS: Training[] = [
  {
    id: "inauguration",
    titleKey: "training.inauguration.title",
    durationKey: "training.inauguration.duration",
    unlocks: [1, 2],
    formatKey: "training.inauguration.format",
    deliverableByAnyLeader: true,
    outlineKeys: [
      "training.inauguration.o1",
      "training.inauguration.o2",
      "training.inauguration.o3",
      "training.inauguration.o4",
      "training.inauguration.o5",
      "training.inauguration.o6",
    ],
  },
  {
    id: "leader_foundations",
    titleKey: "training.leader_foundations.title",
    durationKey: "training.leader_foundations.duration",
    unlocks: [3],
    formatKey: "training.leader_foundations.format",
    deliverableByAnyLeader: false,
    outlineKeys: [
      "training.leader_foundations.o1",
      "training.leader_foundations.o2",
      "training.leader_foundations.o3",
      "training.leader_foundations.o4",
      "training.leader_foundations.o5",
    ],
  },
  {
    id: "zone_leadership",
    titleKey: "training.zone_leadership.title",
    durationKey: "training.zone_leadership.duration",
    unlocks: [5],
    formatKey: "training.zone_leadership.format",
    deliverableByAnyLeader: false,
    outlineKeys: [
      "training.zone_leadership.o1",
      "training.zone_leadership.o2",
      "training.zone_leadership.o3",
      "training.zone_leadership.o4",
      "training.zone_leadership.o5",
    ],
  },
  {
    id: "service_operations",
    titleKey: "training.service_operations.title",
    durationKey: "training.service_operations.duration",
    unlocks: [7],
    formatKey: "training.service_operations.format",
    deliverableByAnyLeader: false,
    outlineKeys: [
      "training.service_operations.o1",
      "training.service_operations.o2",
      "training.service_operations.o3",
      "training.service_operations.o4",
      "training.service_operations.o5",
    ],
  },
];

export const LADDER: LadderLevel[] = [
  {
    stars: 1,
    title: "Faithful Server",
    titleKey: "ladder.1.title",
    stage: "grow",
    requiredTraining: "inauguration",
    approverRole: "ministry_lead",
    approvalRule: "active",
    criteriaKey: "ladder.1.criteria",
  },
  {
    stars: 2,
    title: "Reliable Team Member",
    titleKey: "ladder.2.title",
    stage: "grow",
    requiredTraining: "inauguration",
    approverRole: "ministry_lead",
    approvalRule: "default_7",
    criteriaKey: "ladder.2.criteria",
  },
  {
    stars: 3,
    title: "Team Leader Candidate",
    titleKey: "ladder.3.title",
    stage: "grow",
    requiredTraining: "leader_foundations",
    approverRole: "ministry_lead",
    approvalRule: "default_7",
    criteriaKey: "ladder.3.criteria",
  },
  {
    stars: 5,
    title: "Area Lead",
    titleKey: "ladder.5.title",
    stage: "multiply",
    requiredTraining: "zone_leadership",
    approverRole: "pastor",
    approvalRule: "explicit_14",
    criteriaKey: "ladder.5.criteria",
  },
  {
    stars: 7,
    title: "Service Lead",
    titleKey: "ladder.7.title",
    stage: "multiply",
    requiredTraining: "service_operations",
    approverRole: "pastor",
    approvalRule: "joint",
    criteriaKey: "ladder.7.criteria",
  },
];

export function levelByStars(stars: number): LadderLevel | undefined {
  return LADDER.find((l) => l.stars === stars);
}

export function trainingById(id: string): Training | undefined {
  return TRAININGS.find((t) => t.id === id);
}

// Returns the next awardable level above a volunteer's current stars.
export function nextLevel(currentStars: number): LadderLevel | undefined {
  return LADDER.find((l) => l.stars > currentStars);
}
