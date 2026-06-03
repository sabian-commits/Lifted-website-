// The approval engine — the single source of truth for Serve Honor System rules.
// Kept isolated and pure so the rules stay testable and in one place.
//
// Rules encoded from the playbook (Sections 6 & 7):
//   - HARD GATE: no star is awarded without the matching training completion on file.
//   - 1★  : Ministry Lead approves actively. No time default.
//   - 2★/3★: Ministry Lead approves. 7-day window — silence = approval.
//   - 5★  : Senior Pastor approves. 14-day window — explicit only, no default.
//   - 7★  : Joint Ministry Lead + Pastor. No default. Personal conversation required.

import type {
  LadderLevel,
  StarAward,
  TrainingCompletion,
  Volunteer,
} from "./types";
import { levelByStars, nextLevel } from "./ministry";

const DAY_MS = 24 * 60 * 60 * 1000;

export function daysBetween(a: string, b: string): number {
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / DAY_MS);
}

/** True if the volunteer has the training required for the given level on file. */
export function hasRequiredTraining(
  level: LadderLevel,
  completions: TrainingCompletion[],
  volunteerId: string,
): boolean {
  return completions.some(
    (c) => c.volunteerId === volunteerId && c.trainingId === level.requiredTraining,
  );
}

export type EligibilityResult =
  | { eligible: true; level: LadderLevel }
  | { eligible: false; reasonKey: string; level?: LadderLevel };

/**
 * Can this volunteer request the next star up? Enforces the training gate and
 * sequencing. Does NOT itself grant anything — only gates the request.
 */
export function checkEligibility(
  volunteer: Volunteer,
  completions: TrainingCompletion[],
  pendingAwards: StarAward[],
): EligibilityResult {
  const next = nextLevel(volunteer.currentStars);
  if (!next) {
    return { eligible: false, reasonKey: "eligibility.max" };
  }
  const alreadyPending = pendingAwards.some(
    (a) =>
      a.volunteerId === volunteer.id &&
      a.stars === next.stars &&
      a.status === "pending",
  );
  if (alreadyPending) {
    return { eligible: false, reasonKey: "eligibility.pending", level: next };
  }
  if (!hasRequiredTraining(next, completions, volunteer.id)) {
    return { eligible: false, reasonKey: "eligibility.training", level: next };
  }
  return { eligible: true, level: next };
}

/**
 * Resolve the current effective status of an award given the rules and "now".
 * This is what powers the time-default behavior: a pending 2★/3★ becomes
 * auto-approved once its 7-day window elapses; 5★/7★ never auto-approve.
 */
export function resolveStatus(award: StarAward, now: string): StarAward {
  if (award.status !== "pending") return award;
  const level = levelByStars(award.stars);
  if (!level) return award;

  if (level.approvalRule === "default_7") {
    if (daysBetween(award.requestedDate, now) >= 7) {
      return {
        ...award,
        status: "auto_approved",
        decidedDate: now,
        approver: "system:7-day-default",
      };
    }
  }
  // active / explicit_14 / joint never auto-approve.
  return award;
}

/** Days remaining in a time-default window, or null if the rule has no window. */
export function windowRemaining(award: StarAward, now: string): number | null {
  const level = levelByStars(award.stars);
  if (!level) return null;
  if (level.approvalRule === "default_7") {
    return Math.max(0, 7 - daysBetween(award.requestedDate, now));
  }
  if (level.approvalRule === "explicit_14") {
    return Math.max(0, 14 - daysBetween(award.requestedDate, now));
  }
  return null;
}

export type ApprovalCheck =
  | { ok: true }
  | { ok: false; reasonKey: string };

/**
 * Validate an explicit approval action by an actor before it is recorded.
 * Guards the 7★ personal-conversation requirement and approver authority.
 */
export function canApprove(
  award: StarAward,
  actorRole: Volunteer["role"],
  conversationHeld: boolean,
): ApprovalCheck {
  const level = levelByStars(award.stars);
  if (!level) return { ok: false, reasonKey: "approve.unknown_level" };

  if (level.approvalRule === "joint") {
    // 7★ — requires pastor sign-off AND a recorded personal conversation.
    if (actorRole !== "pastor" && actorRole !== "ministry_lead") {
      return { ok: false, reasonKey: "approve.authority" };
    }
    if (!conversationHeld) {
      return { ok: false, reasonKey: "approve.conversation" };
    }
    return { ok: true };
  }

  if (level.approverRole === "pastor" && actorRole !== "pastor") {
    return { ok: false, reasonKey: "approve.authority" };
  }
  if (
    level.approverRole === "ministry_lead" &&
    actorRole !== "ministry_lead"
  ) {
    return { ok: false, reasonKey: "approve.authority" };
  }
  return { ok: true };
}
