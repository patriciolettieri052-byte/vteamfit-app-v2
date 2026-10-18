"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Trophy } from "lucide-react";
import { useVTeamStore } from "@/lib/store";
import type { PlanWorkoutRow, WorkoutExerciseItem } from "@/types/sdui";
import { TopBar } from "@/components/navigation/TopBar";
import { BottomNav } from "@/components/navigation/BottomNav";
import { CategoryExerciseGroup } from "@/components/sdui/CategoryExerciseGroup";

interface DayPageProps {
  params: Promise<{ week: string; day: string }>;
}

export default function DayRoutinePage({ params }: DayPageProps) {
  const { week, day } = use(params);
  const weekNumber = Number(week) || 1;
  const dayNumber = Number(day) || 1;
  const router = useRouter();

  const {
    loading,
    session,
    activePlan,
    activeEnrollment,
    workoutLogs,
    refresh,
  } = useVTeamStore();

  const [workout, setWorkout] = useState<PlanWorkoutRow | null>(null);
  const [loadingWorkout, setLoadingWorkout] = useState(true);
  const [completingDay, setCompletingDay] = useState(false);

  useEffect(() => {
    if (!loading && !session?.userId) {
      router.replace("/login");
    }
  }, [loading, session, router]);

  useEffect(() => {
    async function loadDayWorkout() {
      if (!activePlan?.id) {
        setLoadingWorkout(false);
        return;
      }
      setLoadingWorkout(true);
      try {
        const res = await fetch(
          `/api/workouts?planId=${encodeURIComponent(
            activePlan.id
          )}&week=${weekNumber}&day=${dayNumber}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          setWorkout(data.workouts?.[0] || null);
        }
      } catch (err) {
        console.error("Error loading day workout:", err);
      } finally {
        setLoadingWorkout(false);
      }
    }
    loadDayWorkout();
  }, [activePlan?.id, weekNumber, dayNumber]);

  const exercises: WorkoutExerciseItem[] = Array.isArray(workout?.exercises)
    ? [...workout!.exercises].sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  // Find current workout log for this workout.id (whether progressive or completed)
  const matchingLog = workout
    ? workoutLogs.find((l) => l.workout_id === workout.id)
    : undefined;

  const completedSlugs = new Set<string>(
    (matchingLog?.exercise_logs || []).map((entry) => entry.exercise_slug)
  );

  const isDayAlreadySealed = Boolean(matchingLog?.completed_at);

  // Group exercises by category preserving order of appearance
  const categoryGroups: Array<{ category: string; items: WorkoutExerciseItem[] }> = [];
  for (const ex of exercises) {
    const cat = (ex.category || "GENERAL").toUpperCase();
    const existingGroup = categoryGroups.find((g) => g.category === cat);
    if (existingGroup) {
      existingGroup.items.push(ex);
    } else {
      categoryGroups.push({ category: cat, items: [ex] });
    }
  }

  const handleCompleteDay = async () => {
    if (!session?.userId || !workout) return;
    setCompletingDay(true);
    try {
      const nextWeek = dayNumber >= 6 ? weekNumber + 1 : weekNumber;

      const res = await fetch("/api/workout-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.userId,
          planId: workout.plan_id,
          workoutId: workout.id,
          weekNumber,
          dayName: workout.day_name || `DÍA ${dayNumber}`,
          enrollmentId: activeEnrollment?.id || null,
          action: "complete_day",
          durationSeconds: (workout.estimated_duration_min || 45) * 60,
          rpeRating: 8,
          nextWeek,
        }),
      });

      if (res.ok) {
        await refresh();
        router.push(
          `/dashboard/semana/${weekNumber}/dia/${dayNumber}/exito?exercises=${
            exercises.length
          }&minutes=${workout.estimated_duration_min || 45}`
        );
      } else {
        setCompletingDay(false);
      }
    } catch {
      setCompletingDay(false);
    }
  };

  const dayHeaderTitle =
    workout?.day_name || workout?.title || `Día ${dayNumber}`;
  const dayHeaderSubtitle =
    workout?.focus || workout?.description || workout?.warmup_instructions;

  return (
    <div className="min-h-screen pb-32 flex flex-col">
      <TopBar />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 py-8 space-y-8">
        <div>
          <Link
            href={`/dashboard/semana/${weekNumber}`}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-[#A08A56] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a la semana</span>
          </Link>
        </div>

        <header className="border-b border-white/10 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A08A56] mb-1">
              Semana {weekNumber} · Día {dayNumber}
            </p>
            <h1
              className="font-black uppercase tracking-tight text-white"
              style={{ fontSize: "var(--text-heading-1)" }}
            >
              {dayHeaderTitle}
            </h1>
            {dayHeaderSubtitle && (
              <p className="text-xs sm:text-sm text-zinc-400 mt-2">
                {dayHeaderSubtitle}
              </p>
            )}
          </div>

          {isDayAlreadySealed && (
            <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40 px-3.5 py-2 text-xs font-black uppercase tracking-widest text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>JORNADA COMPLETADA</span>
            </div>
          )}
        </header>

        {loading || loadingWorkout ? (
          <div className="rounded-2xl bg-black/80 border border-white/10 p-10 text-center text-xs font-bold uppercase tracking-widest text-zinc-400">
            CARGANDO...
          </div>
        ) : !workout || exercises.length === 0 ? (
          <div className="rounded-2xl bg-black/80 border border-white/10 p-10 text-center text-sm text-zinc-400">
            No se encontraron ejercicios para este día.
          </div>
        ) : (
          <div className="space-y-8">
            {categoryGroups.map((group) => (
              <CategoryExerciseGroup
                key={group.category}
                category={group.category}
                exercises={group.items}
                weekNumber={weekNumber}
                dayNumber={dayNumber}
                completedSlugs={completedSlugs}
              />
            ))}

            {/* Complete Day Button Bar */}
            <div className="pt-4">
              <button
                type="button"
                disabled={completingDay}
                onClick={handleCompleteDay}
                className="w-full min-h-[56px] rounded-xl bg-[#A08A56] hover:bg-[#B59E68] text-black text-xs sm:text-sm font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2.5 shadow-[0_0_25px_-5px_rgba(160,138,86,0.4)] cursor-pointer disabled:opacity-60"
              >
                <Trophy className="h-5 w-5" />
                <span>
                  {completingDay ? "PROCESANDO..." : "COMPLETAR DÍA"}
                </span>
              </button>
              <p className="text-center text-[11px] text-zinc-500 mt-2 tabular-nums">
                Ejercicios registrados hoy: {completedSlugs.size} de {exercises.length}
              </p>
            </div>
          </div>
        )}
      </main>

      <BottomNav currentWeek={weekNumber} />
    </div>
  );
}
