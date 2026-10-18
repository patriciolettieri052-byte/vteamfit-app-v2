"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  UserProfileRow,
  UserEnrollmentRow,
  PlanRow,
  UserWorkoutLogRow,
  UserWeightLogRow,
} from "@/types/sdui";

export interface VTeamClientSession {
  userId: string;
  email: string;
  fullName: string;
  role: "student" | "user" | "coach" | "admin";
  activePlanSlug?: string;
}

const SESSION_STORAGE_KEY = "vteamfit_v2_session";

export function getStoredSession(): VTeamClientSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VTeamClientSession;
  } catch {
    return null;
  }
}

export function setStoredSession(session: VTeamClientSession | null) {
  if (typeof window === "undefined") return;
  if (!session) {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } else {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }
  window.dispatchEvent(new Event("vteamfit-session-change"));
}

function normalizeIdentifier(val: string | undefined | null): string {
  if (!val) return "";
  return val.trim().toLowerCase().replace(/_/g, "-");
}

export interface DashboardHydratedState {
  loading: boolean;
  session: VTeamClientSession | null;
  profile: UserProfileRow | null;
  enrollments: UserEnrollmentRow[];
  allPlans: PlanRow[];
  activePlan: PlanRow | null;
  activeEnrollment: UserEnrollmentRow | null;
  workoutLogs: UserWorkoutLogRow[];
  weightLogs: UserWeightLogRow[];
  refresh: () => Promise<void>;
  switchActivePlan: (planSlug: string) => void;
}

export function useVTeamStore(): DashboardHydratedState {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<VTeamClientSession | null>(null);
  const [profile, setProfile] = useState<UserProfileRow | null>(null);
  const [enrollments, setEnrollments] = useState<UserEnrollmentRow[]>([]);
  const [allPlans, setAllPlans] = useState<PlanRow[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<UserWorkoutLogRow[]>([]);
  const [weightLogs, setWeightLogs] = useState<UserWeightLogRow[]>([]);

  const loadState = useCallback(async () => {
    const currentSession = getStoredSession();
    setSession(currentSession);
    if (!currentSession?.userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `/api/profile?userId=${encodeURIComponent(currentSession.userId)}`,
        { cache: "no-store" }
      );
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      setProfile(data.profile || null);
      setEnrollments(data.enrollments || []);
      setAllPlans(data.plans || []);
      setWorkoutLogs(data.workoutLogs || []);
      setWeightLogs(data.weightLogs || []);

      // Keep role synchronized in local session if updated in DB
      if (data.profile && data.profile.role !== currentSession.role) {
        const updated: VTeamClientSession = {
          ...currentSession,
          role: data.profile.role,
          fullName: data.profile.full_name || currentSession.fullName,
        };
        setStoredSession(updated);
        setSession(updated);
      }
    } catch (err) {
      console.error("Error hydrating VTeam store:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadState();
    const handleStorage = () => loadState();
    window.addEventListener("vteamfit-session-change", handleStorage);
    return () => window.removeEventListener("vteamfit-session-change", handleStorage);
  }, [loadState]);

  const switchActivePlan = useCallback((planSlug: string) => {
    const current = getStoredSession();
    if (!current) return;
    const updated = { ...current, activePlanSlug: planSlug };
    setStoredSession(updated);
    setSession(updated);
  }, []);

  // Determine activeEnrollment and activePlan normalizing hyphens and underscores
  const activeEnrollments = enrollments.filter((e) => e.status === "active");
  const isStaff = profile?.role === "admin" || profile?.role === "coach";

  let activePlan: PlanRow | null = null;
  let activeEnrollment: UserEnrollmentRow | null = null;

  if (session?.activePlanSlug) {
    const targetNorm = normalizeIdentifier(session.activePlanSlug);
    activeEnrollment =
      activeEnrollments.find(
        (e) =>
          normalizeIdentifier(e.plan?.slug) === targetNorm ||
          normalizeIdentifier(e.plan?.id) === targetNorm ||
          normalizeIdentifier(e.plan_id) === targetNorm
      ) || null;

    activePlan =
      activeEnrollment?.plan ||
      allPlans.find(
        (p) =>
          normalizeIdentifier(p.slug) === targetNorm ||
          normalizeIdentifier(p.id) === targetNorm
      ) ||
      null;

    // If user is not staff and not enrolled in activePlanSlug, clear activePlan so fallback picks their real active enrollment
    if (!isStaff && !activeEnrollment) {
      activePlan = null;
    }
  }

  if (!activePlan) {
    if (activeEnrollments.length > 0) {
      activeEnrollment = activeEnrollments[0];
      activePlan =
        activeEnrollment.plan ||
        allPlans.find(
          (p) =>
            normalizeIdentifier(p.id) === normalizeIdentifier(activeEnrollment!.plan_id) ||
            normalizeIdentifier(p.slug) === normalizeIdentifier(activeEnrollment!.plan_id)
        ) ||
        null;
    } else if (isStaff && allPlans.length > 0) {
      activePlan =
        allPlans.find((p) => p.id === "plan_padel" || p.slug === "plan-padel") ||
        allPlans[0] ||
        null;
    }
  }

  return {
    loading,
    session,
    profile,
    enrollments,
    allPlans,
    activePlan,
    activeEnrollment,
    workoutLogs,
    weightLogs,
    refresh: loadState,
    switchActivePlan,
  };
}
