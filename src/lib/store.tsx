"use client";

// Supabase-backed store. Replaces the in-memory demo. Keeps the same useStore()
// surface the pages already consume, but data now comes from Postgres under RLS,
// and `viewer` is the authenticated user's profile.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import React from "react";
import { useLang } from "./i18n";
import { createClient } from "./supabase/client";
import type {
  ChurchEvent,
  Escalation,
  EscalationResponse,
  EventRsvp,
  Guest,
  InfoItem,
  MultiplyRelationship,
  MultiplyStatus,
  Recognition,
  River,
  Role,
  RStage,
  StarAward,
  StarLevel,
  TrainingCompletion,
  TrainingId,
  Volunteer,
  WeeklyReport,
  WeakLinkFlag,
  ZoneId,
} from "./types";
import { levelByStars, nextLevel } from "./ministry";
import { canApprove, checkEligibility, resolveStatus } from "./approval-engine";

export interface WeeklyReportInput {
  zone: ZoneId;
  attendanceCount: number;
  starDistribution: string;
  consistencyFlag: string;
  observation: string;
  ask: string;
  weakLink?: string;
}

interface StoreValue {
  lang: "en" | "es";
  setLang: (l: "en" | "es") => void;
  t: (key: string) => string;

  loading: boolean;
  viewer: Volunteer | null;
  profileMissing: boolean;

  volunteers: Volunteer[];
  completions: TrainingCompletion[];
  awards: StarAward[];
  recognitions: Recognition[];
  reports: WeeklyReport[];
  weakLinks: WeakLinkFlag[];
  escalations: Escalation[];
  events: ChurchEvent[];
  eventRsvps: EventRsvp[];
  infoItems: InfoItem[];
  multiplyRelationships: MultiplyRelationship[];
  guests: Guest[];
  resolvedAwards: StarAward[];

  hasCompleted: (volunteerId: string, trainingId: TrainingId) => boolean;
  eligibility: (volunteerId: string) => ReturnType<typeof checkEligibility>;

  completeTraining: (volunteerId: string, trainingId: TrainingId, facilitator: string) => Promise<void>;
  requestAdvancement: (volunteerId: string) => Promise<void>;
  decideAward: (awardId: string, approve: boolean, actor: Volunteer, conversationHeld: boolean) => Promise<{ ok: boolean; reasonKey?: string }>;
  confirmRecognition: (id: string) => Promise<void>;
  nominateRecognition: (input: { volunteerId: string; behavior: string; value: string }, by: Volunteer) => Promise<void>;
  submitWeeklyReport: (input: WeeklyReportInput, by: Volunteer) => Promise<void>;
  resolveWeakLink: (id: string) => Promise<void>;
  addEscalation: (input: { volunteerId: string; response: EscalationResponse; situation: string; followUp: string }) => Promise<void>;
  createEvent: (input: { title: string; description: string; location: string; startsAt: string; endsAt?: string }) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  toggleRsvp: (eventId: string) => Promise<void>;
  createInfo: (input: { title: string; body: string }) => Promise<void>;
  deleteInfo: (id: string) => Promise<void>;
  addRelationship: (input: { discipleId: string; river: River; focus: string }) => Promise<void>;
  updateRelationship: (id: string, patch: { status?: MultiplyStatus; notes?: string }) => Promise<void>;
  removeRelationship: (id: string) => Promise<void>;
  logGuest: (input: { name: string; firstVisitDate: string }) => Promise<void>;
  updateGuestStage: (id: string, stage: RStage) => Promise<void>;
  updateGuestMilestones: (id: string, patch: Partial<Pick<Guest, "connectCardDone" | "lifeGroupConnected" | "dnaStarted">>) => Promise<void>;
  updateVolunteer: (id: string, patch: { name?: string; zone?: ZoneId | null; role?: Role }) => Promise<void>;
  signOut: () => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);

// ---------- row → app-type mappers ----------
type Row = Record<string, unknown>;
const mapProfile = (r: Row): Volunteer => ({
  id: r.id as string,
  name: r.name as string,
  role: r.role as Role,
  zone: (r.zone as ZoneId) ?? null,
  currentStars: (r.current_stars as Volunteer["currentStars"]) ?? 0,
  languagePref: (r.language_pref as "en" | "es") ?? "en",
});
const mapCompletion = (r: Row): TrainingCompletion => ({
  id: r.id as string,
  volunteerId: r.volunteer_id as string,
  trainingId: r.training as TrainingId,
  date: r.date as string,
  facilitator: r.facilitator as string,
  notes: (r.notes as string) ?? undefined,
});
const mapAward = (r: Row): StarAward => ({
  id: r.id as string,
  volunteerId: r.volunteer_id as string,
  stars: r.stars as StarLevel,
  status: r.status as StarAward["status"],
  requestedDate: r.requested_date as string,
  decidedDate: (r.decided_date as string) ?? undefined,
  approver: (r.approver as string) ?? undefined,
  conversationHeld: (r.conversation_held as boolean) ?? undefined,
});
const mapRecognition = (r: Row): Recognition => ({
  id: r.id as string,
  volunteerId: r.volunteer_id as string,
  month: r.month as string,
  behavior: r.behavior as string,
  value: r.value as string,
  confirmed: r.confirmed as boolean,
  nominatedBy: r.nominated_by as string,
});
const mapReport = (r: Row): WeeklyReport => ({
  id: r.id as string,
  reporterId: r.reporter_id as string,
  zone: r.zone as ZoneId,
  weekOf: r.week_of as string,
  attendanceCount: r.attendance_count as number,
  starDistribution: r.star_distribution as string,
  consistencyFlag: r.consistency_flag as string,
  observation: r.observation as string,
  ask: r.ask as string,
});
const mapWeakLink = (r: Row): WeakLinkFlag => ({
  id: r.id as string,
  zone: r.zone as ZoneId,
  weekOf: r.week_of as string,
  description: r.description as string,
  resolved: r.resolved as boolean,
  flaggedBy: r.flagged_by as string,
});
const mapEscalation = (r: Row): Escalation => ({
  id: r.id as string,
  volunteerId: r.volunteer_id as string,
  response: r.response as EscalationResponse,
  situation: r.situation as string,
  followUp: r.follow_up as string,
  date: r.created_at as string,
});
const mapEvent = (r: Row): ChurchEvent => ({
  id: r.id as string,
  title: r.title as string,
  description: r.description as string,
  location: r.location as string,
  startsAt: r.starts_at as string,
  endsAt: (r.ends_at as string) ?? undefined,
  createdBy: (r.created_by as string) ?? undefined,
});
const mapRsvp = (r: Row): EventRsvp => ({
  id: r.id as string,
  eventId: r.event_id as string,
  userId: r.user_id as string,
  createdAt: r.created_at as string,
});
const mapInfo = (r: Row): InfoItem => ({
  id: r.id as string,
  title: r.title as string,
  body: r.body as string,
  sort: r.sort as number,
});
const mapRelationship = (r: Row): MultiplyRelationship => ({
  id: r.id as string,
  leaderId: r.leader_id as string,
  discipleId: r.disciple_id as string,
  river: r.river as River,
  focus: (r.focus as string) ?? "",
  status: r.status as MultiplyStatus,
  notes: (r.notes as string) ?? "",
  createdAt: r.created_at as string,
});
const mapGuest = (r: Row): Guest => ({
  id: r.id as string,
  loggedBy: r.logged_by as string,
  name: r.name as string,
  firstVisitDate: r.first_visit_date as string,
  currentRStage: r.current_r_stage as RStage,
  connectCardDone: r.connect_card_done as boolean,
  lifeGroupConnected: r.life_group_connected as boolean,
  dnaStarted: r.dna_started as boolean,
  notes: (r.notes as string) ?? "",
  createdAt: r.created_at as string,
  updatedAt: r.updated_at as string,
});

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { lang, setLang, t } = useLang();
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [viewer, setViewer] = useState<Volunteer | null>(null);
  const [profileMissing, setProfileMissing] = useState(false);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [completions, setCompletions] = useState<TrainingCompletion[]>([]);
  const [awards, setAwards] = useState<StarAward[]>([]);
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [weakLinks, setWeakLinks] = useState<WeakLinkFlag[]>([]);
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [eventRsvps, setEventRsvps] = useState<EventRsvp[]>([]);
  const [infoItems, setInfoItems] = useState<InfoItem[]>([]);
  const [multiplyRelationships, setMultiplyRelationships] = useState<MultiplyRelationship[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setViewer(null);
      setLoading(false);
      return;
    }
    // RLS scopes every query to what this user may see.
    const [pf, profiles, comps, aw, recs, reps, wls, escs, evs, rsvps, infos, rels, gsts] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("profiles").select("*"),
      supabase.from("training_completions").select("*"),
      supabase.from("star_awards").select("*"),
      supabase.from("recognitions").select("*"),
      supabase.from("weekly_reports").select("*").order("week_of", { ascending: false }),
      supabase.from("weak_link_flags").select("*").order("week_of", { ascending: false }),
      supabase.from("escalations").select("*").order("created_at", { ascending: false }),
      supabase.from("events").select("*").order("starts_at", { ascending: true }),
      supabase.from("event_rsvps").select("*"),
      supabase.from("info_items").select("*").order("sort", { ascending: true }),
      supabase.from("multiply_relationships").select("*").order("created_at", { ascending: true }),
      supabase.from("guests").select("*").order("created_at", { ascending: false }),
    ]);
    const mappedViewer = pf.data ? mapProfile(pf.data) : null;
    setViewer(mappedViewer);
    // user is authenticated (user != null) but has no profile row — orphaned account
    setProfileMissing(!!user && !mappedViewer);
    setVolunteers((profiles.data ?? []).map(mapProfile));
    setCompletions((comps.data ?? []).map(mapCompletion));
    setAwards((aw.data ?? []).map(mapAward));
    setRecognitions((recs.data ?? []).map(mapRecognition));
    setReports((reps.data ?? []).map(mapReport));
    setWeakLinks((wls.data ?? []).map(mapWeakLink));
    setEscalations((escs.data ?? []).map(mapEscalation));
    setEvents((evs.data ?? []).map(mapEvent));
    setEventRsvps((rsvps.data ?? []).map(mapRsvp));
    setInfoItems((infos.data ?? []).map(mapInfo));
    setMultiplyRelationships((rels.data ?? []).map(mapRelationship));
    setGuests((gsts.data ?? []).map(mapGuest));
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      load();
    });
    return () => sub.subscription.unsubscribe();
  }, [load, supabase]);

  const now = new Date().toISOString();
  const resolvedAwards = useMemo(
    () => awards.map((a) => resolveStatus(a, now)),
    [awards, now],
  );

  const hasCompleted = (volunteerId: string, trainingId: TrainingId) =>
    completions.some((c) => c.volunteerId === volunteerId && c.trainingId === trainingId);

  const eligibility = (volunteerId: string) => {
    const v = volunteers.find((x) => x.id === volunteerId);
    if (!v) return { eligible: false as const, reasonKey: "eligibility.max" };
    return checkEligibility(v, completions, resolvedAwards);
  };

  const completeTraining = async (volunteerId: string, trainingId: TrainingId, facilitator: string) => {
    if (hasCompleted(volunteerId, trainingId)) return;
    await supabase.from("training_completions").insert({ volunteer_id: volunteerId, training: trainingId, facilitator });
    await load();
  };

  const requestAdvancement = async (volunteerId: string) => {
    const result = eligibility(volunteerId);
    if (!result.eligible || !result.level) return;
    await supabase.from("star_awards").insert({ volunteer_id: volunteerId, stars: result.level.stars, status: "pending" });
    await load();
  };

  const decideAward = async (
    awardId: string,
    approve: boolean,
    actor: Volunteer,
    conversationHeld: boolean,
  ): Promise<{ ok: boolean; reasonKey?: string }> => {
    const award = awards.find((a) => a.id === awardId);
    if (!award) return { ok: false, reasonKey: "approve.unknown_level" };
    if (approve) {
      const check = canApprove(award, actor.role, conversationHeld);
      if (!check.ok) return check;
    }
    await supabase
      .from("star_awards")
      .update({
        status: approve ? "approved" : "denied",
        decided_date: new Date().toISOString(),
        approver: actor.name,
        conversation_held: conversationHeld,
      })
      .eq("id", awardId);
    if (approve) {
      await supabase.from("profiles").update({ current_stars: award.stars }).eq("id", award.volunteerId);
    }
    await load();
    return { ok: true };
  };

  const confirmRecognition = async (id: string) => {
    await supabase.from("recognitions").update({ confirmed: true }).eq("id", id);
    await load();
  };

  const nominateRecognition = async (
    input: { volunteerId: string; behavior: string; value: string },
    by: Volunteer,
  ) => {
    await supabase.from("recognitions").insert({
      volunteer_id: input.volunteerId,
      month: new Date().toISOString().slice(0, 7),
      behavior: input.behavior,
      value: input.value,
      confirmed: false,
      nominated_by: by.name,
    });
    await load();
  };

  const submitWeeklyReport = async (input: WeeklyReportInput, by: Volunteer) => {
    const weekOf = new Date().toISOString();
    await supabase.from("weekly_reports").insert({
      reporter_id: by.id,
      zone: input.zone,
      week_of: weekOf,
      attendance_count: input.attendanceCount,
      star_distribution: input.starDistribution,
      consistency_flag: input.consistencyFlag,
      observation: input.observation,
      ask: input.ask,
    });
    if (input.weakLink && input.weakLink.trim()) {
      await supabase.from("weak_link_flags").insert({
        zone: input.zone,
        week_of: weekOf,
        description: input.weakLink.trim(),
        flagged_by: by.name,
      });
    }
    await load();
  };

  const resolveWeakLink = async (id: string) => {
    await supabase.from("weak_link_flags").update({ resolved: true }).eq("id", id);
    await load();
  };

  const addEscalation = async (input: {
    volunteerId: string;
    response: EscalationResponse;
    situation: string;
    followUp: string;
  }) => {
    await supabase.from("escalations").insert({
      volunteer_id: input.volunteerId,
      response: input.response,
      situation: input.situation,
      follow_up: input.followUp,
    });
    await load();
  };

  const createEvent = async (input: {
    title: string;
    description: string;
    location: string;
    startsAt: string;
    endsAt?: string;
  }) => {
    await supabase.from("events").insert({
      title: input.title,
      description: input.description,
      location: input.location,
      starts_at: input.startsAt,
      ends_at: input.endsAt || null,
      created_by: viewer?.id ?? null,
    });
    await load();
  };

  const deleteEvent = async (id: string) => {
    await supabase.from("events").delete().eq("id", id);
    await load();
  };

  const toggleRsvp = async (eventId: string) => {
    if (!viewer) return;
    const existing = eventRsvps.find((r) => r.eventId === eventId && r.userId === viewer.id);
    if (existing) {
      await supabase.from("event_rsvps").delete().eq("id", existing.id);
    } else {
      await supabase.from("event_rsvps").insert({ event_id: eventId, user_id: viewer.id });
    }
    await load();
  };

  const createInfo = async (input: { title: string; body: string }) => {
    await supabase.from("info_items").insert({ title: input.title, body: input.body, sort: infoItems.length });
    await load();
  };

  const deleteInfo = async (id: string) => {
    await supabase.from("info_items").delete().eq("id", id);
    await load();
  };

  // ---------- MULTIPLY: 5 Into 1 ----------
  const addRelationship = async (input: { discipleId: string; river: River; focus: string }) => {
    if (!viewer) return;
    await supabase.from("multiply_relationships").insert({
      leader_id: viewer.id,
      disciple_id: input.discipleId,
      river: input.river,
      focus: input.focus.trim(),
      status: "shaping",
    });
    await load();
  };

  const updateRelationship = async (id: string, patch: { status?: MultiplyStatus; notes?: string }) => {
    const update: Record<string, unknown> = {};
    if (patch.status !== undefined) update.status = patch.status;
    if (patch.notes !== undefined) update.notes = patch.notes.trim();
    await supabase.from("multiply_relationships").update(update).eq("id", id);
    await load();
  };

  const removeRelationship = async (id: string) => {
    await supabase.from("multiply_relationships").delete().eq("id", id);
    await load();
  };

  // ---------- Guest Pipeline ----------
  const logGuest = async (input: { name: string; firstVisitDate: string }) => {
    if (!viewer) return;
    await supabase.from("guests").insert({
      logged_by: viewer.id,
      name: input.name.trim(),
      first_visit_date: input.firstVisitDate,
    });
    await load();
  };

  const updateGuestStage = async (id: string, stage: RStage) => {
    await supabase.from("guests").update({ current_r_stage: stage }).eq("id", id);
    await load();
  };

  const updateGuestMilestones = async (
    id: string,
    patch: Partial<Pick<Guest, "connectCardDone" | "lifeGroupConnected" | "dnaStarted">>,
  ) => {
    const update: Record<string, unknown> = {};
    if (patch.connectCardDone !== undefined) update.connect_card_done = patch.connectCardDone;
    if (patch.lifeGroupConnected !== undefined) update.life_group_connected = patch.lifeGroupConnected;
    if (patch.dnaStarted !== undefined) update.dna_started = patch.dnaStarted;
    await supabase.from("guests").update(update).eq("id", id);
    await load();
  };

  const updateVolunteer = async (id: string, patch: { name?: string; zone?: ZoneId | null; role?: Role }) => {
    const update: Record<string, unknown> = {};
    if (patch.name !== undefined) update.name = patch.name.trim();
    if ("zone" in patch) update.zone = patch.zone ?? null;
    if (patch.role !== undefined) update.role = patch.role;
    await supabase.from("profiles").update(update).eq("id", id);
    await load();
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const value: StoreValue = {
    lang,
    setLang,
    t,
    loading,
    viewer,
    profileMissing,
    volunteers,
    completions,
    awards,
    recognitions,
    reports,
    weakLinks,
    escalations,
    events,
    eventRsvps,
    infoItems,
    multiplyRelationships,
    guests,
    resolvedAwards,
    hasCompleted,
    eligibility,
    completeTraining,
    requestAdvancement,
    decideAward,
    confirmRecognition,
    nominateRecognition,
    submitWeeklyReport,
    resolveWeakLink,
    addEscalation,
    createEvent,
    deleteEvent,
    toggleRsvp,
    createInfo,
    deleteInfo,
    addRelationship,
    updateRelationship,
    removeRelationship,
    logGuest,
    updateGuestStage,
    updateGuestMilestones,
    updateVolunteer,
    signOut,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function canReport(role: Role): boolean {
  return ["gap_leader", "area_lead", "service_lead", "ministry_lead"].includes(role);
}

export { levelByStars, nextLevel };
