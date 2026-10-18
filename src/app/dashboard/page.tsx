"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Calendar,
} from "lucide-react";
import { useVTeamStore } from "@/lib/store";
import type { PlanWorkoutRow } from "@/types/sdui";
import { TopBar } from "@/components/navigation/TopBar";
import { BottomNav } from "@/components/navigation/BottomNav";

export default function DashboardPage() {
  const router = useRouter();
  const {
    loading,
    session,
    profile,
    enrollments,
    allPlans,
    activePlan,
    activeEnrollment,
    workoutLogs,
    switchActivePlan,
  } = useVTeamStore();

  const [workouts, setWorkouts] = useState<PlanWorkoutRow[]>([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);

  // Route Guard per PRD Section 4.1:
  // 1) Unauthenticated -> /login
  // 2) Authenticated with 0 active enrollments (and not admin/coach) -> /#planes
  useEffect(() => {
    if (loading) return;
    if (!session?.userId) {
      router.replace("/login");
      return;
    }

    const activeEnrollments = enrollments.filter((e) => e.status === "active");
    const isStaff = profile?.role === "admin" || profile?.role === "coach";

    if (activeEnrollments.length === 0 && !isStaff) {
      router.replace("/#planes");
    }
  }, [loading, session, enrollments, profile, router]);

  // Load workouts for the currently selected activePlan
  useEffect(() => {
    async function fetchPlanWorkouts() {
      if (!activePlan?.id) {
        setWorkouts([]);
        return;
      }
      setLoadingWorkouts(true);
      try {
        const res = await fetch(
          `/api/workouts?planId=${encodeURIComponent(activePlan.id)}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          setWorkouts(data.workouts || []);
        }
      } catch (err) {
        console.error("Failed loading workouts:", err);
      } finally {
        setLoadingWorkouts(false);
      }
    }
    fetchPlanWorkouts();
  }, [activePlan?.id]);

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          CARGANDO...
        </span>
      </div>
    );
  }

  const activeEnrollments = enrollments.filter((e) => e.status === "active");
  const isStaff = profile?.role === "admin" || profile?.role === "coach";
  const selectablePlans = isStaff
    ? allPlans
    : activeEnrollments
        .map((e) => e.plan)
        .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const showPlanSelector = selectablePlans.length > 1;

  // Group workouts by week_number
  const weeksMap = new Map<number, PlanWorkoutRow[]>();
  for (const w of workouts) {
    const list = weeksMap.get(w.week_number) || [];
    list.push(w);
    weeksMap.set(w.week_number, list);
  }
  const weekNumbers = Array.from(weeksMap.keys()).sort((a, b) => a - b);

  // Completed workout IDs (strictly where completed_at IS NOT NULL)
  const completedWorkoutIds = new Set(
    workoutLogs
      .filter((log) => Boolean(log.completed_at))
      .map((log) => log.workout_id)
  );

  // Determine current week
  let currentWeek = activeEnrollment?.current_week || 1;
  if (weekNumbers.length > 0 && !weekNumbers.includes(currentWeek)) {
    const firstIncomplete = weekNumbers.find((wk) => {
      const days = weeksMap.get(wk) || [];
      return days.some((d) => !completedWorkoutIds.has(d.id));
    });
    currentWeek = firstIncomplete || weekNumbers[0];
  }

  const greetingReady =
    profile?.gender === "Hombre" ? "Listo para entrenar" : "Lista para entrenar";

  const isEntrenaConmigo =
    activePlan?.id === "entrena_conmigo" ||
    activePlan?.slug === "entrena-conmigo" ||
    activePlan?.slug === "entrena_conmigo";

  return (
    <div className="min-h-screen pb-24 flex flex-col">
      <TopBar />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 py-8 space-y-8">
        {/* 1. CABECERA DE PERFIL */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A08A56]">
              {greetingReady}
            </p>
            <h1
              className="font-black uppercase tracking-tight text-white"
              style={{ fontSize: "var(--text-heading-1)" }}
            >
              Hola, {profile?.full_name || session.fullName || "Atleta"}
            </h1>
          </div>

          {/* Plan Selector (Visible for multi-plan users or coach/admin testers) */}
          {showPlanSelector && activePlan && (
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                CAMBIAR PLAN ACTIVO
              </label>
              <div className="relative">
                <select
                  value={activePlan.slug}
                  onChange={(e) => switchActivePlan(e.target.value)}
                  className="appearance-none min-h-[42px] rounded-lg bg-zinc-900 border border-[#A08A56] pl-3.5 pr-9 text-xs font-black uppercase tracking-wider text-white focus:outline-none cursor-pointer"
                >
                  {selectablePlans.map((p) => (
                    <option key={p.id} value={p.slug} className="bg-zinc-950 text-white">
                      {p.name || p.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A08A56]" />
              </div>
            </div>
          )}
        </header>

        {/* 2. TARJETA SPOTLIGHT DE PLAN ACTIVO */}
        {activePlan ? (
          <section
            data-state="active"
            className="relative overflow-hidden rounded-2xl bg-black/85 border-2 border-[#A08A56] p-6 sm:p-8 backdrop-blur-md"
          >
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-[#A08A56]">
                  ● PLAN ACTIVO
                </span>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                  {activePlan.name || activePlan.title}
                </h2>
                {(activePlan.ui_config?.subtitle || activePlan.tagline) && (
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                    {activePlan.ui_config?.subtitle || activePlan.tagline}
                  </p>
                )}
              </div>

              {isEntrenaConmigo && (
                <Link
                  href={
                    activeEnrollment?.onboarding_data
                      ? "/dashboard/entrena-conmigo/espera"
                      : "/dashboard/entrena-conmigo/onboarding"
                  }
                  className="inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-2.5 rounded-lg bg-[#A08A56] hover:bg-[#B59E68] text-black text-xs font-black uppercase tracking-widest transition-colors shrink-0"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>
                    {activeEnrollment?.onboarding_data
                      ? "ESTADO DE MI PLAN"
                      : "COMPLETAR CUESTIONARIO"}
                  </span>
                </Link>
              )}
            </div>
          </section>
        ) : (
          <section className="rounded-2xl bg-black/85 border border-white/15 p-6 text-center space-y-3">
            <p className="text-sm font-bold text-white">
              ¿Quieres empezar a entrenar?
            </p>
            <Link
              href="/#planes"
              className="inline-block text-xs font-black uppercase tracking-widest text-[#A08A56] hover:underline"
            >
              Ver planes →
            </Link>
          </section>
        )}

        {/* 3. SECCIÓN DE PROGRESO SEMANAL */}
        <section className="space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2
              className="font-black uppercase tracking-tight text-white"
              style={{ fontSize: "var(--text-heading-2)" }}
            >
              TU PROGRESO
            </h2>
            {weekNumbers.length > 0 && (
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 tabular-nums">
                {weekNumbers.length} SEMANAS
              </span>
            )}
          </div>

          {loadingWorkouts ? (
            <div className="rounded-2xl bg-black/80 border border-white/10 p-10 text-center text-xs font-bold uppercase tracking-widest text-zinc-400">
              CARGANDO...
            </div>
          ) : weekNumbers.length === 0 ? (
            <div className="rounded-2xl bg-black/80 border border-white/10 p-10 text-center space-y-4">
              <Calendar className="h-8 w-8 text-[#A08A56] mx-auto opacity-80" />
              <p className="text-sm font-bold text-zinc-300">
                No hay semanas disponibles aún.
              </p>
              {isEntrenaConmigo && (
                <div>
                  <Link
                    href={
                      activeEnrollment?.onboarding_data
                        ? "/dashboard/entrena-conmigo/espera"
                        : "/dashboard/entrena-conmigo/onboarding"
                    }
                    className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2 rounded-lg bg-[#A08A56] text-black text-xs font-black uppercase tracking-widest"
                  >
                    <span>VER ESTADO DE PREPARACIÓN</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Highlight Current Week Card */}
              {weeksMap.has(currentWeek) && (
                <div
                  data-state="active"
                  className="rounded-2xl bg-black/90 border-2 border-[#A08A56] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#A08A56]">
                      SEMANA ACTUAL
                    </span>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                      Semana {currentWeek}
                    </h3>
                    <p className="text-xs font-bold text-zinc-400 tabular-nums">
                      {
                        (weeksMap.get(currentWeek) || []).filter((d) =>
                          completedWorkoutIds.has(d.id)
                        ).length
                      }
                      /{(weeksMap.get(currentWeek) || []).length} Días
                    </p>
                  </div>

                  <Link
                    href={`/dashboard/semana/${currentWeek}`}
                    className="min-h-[48px] px-6 py-3 rounded-lg bg-[#A08A56] hover:bg-[#B59E68] text-black text-xs font-black uppercase tracking-[0.2em] transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <span>CONTINUAR</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              )}

              {/* Grid of All Weeks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {weekNumbers.map((wk) => {
                  const days = weeksMap.get(wk) || [];
                  const completedDays = days.filter((d) =>
                    completedWorkoutIds.has(d.id)
                  ).length;
                  const allCompleted =
                    days.length > 0 && completedDays === days.length;
                  const isCurrent = wk === currentWeek;

                  return (
                    <Link
                      key={wk}
                      href={`/dashboard/semana/${wk}`}
                      data-state={
                        allCompleted
                          ? "completed"
                          : isCurrent
                          ? "active"
                          : "idle"
                      }
                      className={`group flex items-center justify-between rounded-xl p-4 bg-black/80 border transition-all ${
                        allCompleted
                          ? "border-emerald-500/45 bg-emerald-950/10"
                          : isCurrent
                          ? "border-[#A08A56]"
                          : "border-white/10 hover:border-white/25"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black uppercase text-white">
                            Semana {wk}
                          </h4>
                          {allCompleted && (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" />✓ COMPLETADA
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-zinc-400 tabular-nums mt-0.5">
                          {completedDays}/{days.length} Días
                        </p>
                      </div>

                      <ChevronRight className="h-5 w-5 text-zinc-500 group-hover:text-[#A08A56] transition-colors" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </main>

      <BottomNav currentWeek={currentWeek} />
    </div>
  );
}
