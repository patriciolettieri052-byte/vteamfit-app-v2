"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useVTeamStore } from "@/lib/store";
import type { PlanWorkoutRow } from "@/types/sdui";
import { TopBar } from "@/components/navigation/TopBar";
import { BottomNav } from "@/components/navigation/BottomNav";
import { DayCardSDUI } from "@/components/sdui/DayCardSDUI";

interface WeekPageProps {
  params: Promise<{ week: string }>;
}

export default function WeekViewPage({ params }: WeekPageProps) {
  const { week } = use(params);
  const weekNumber = Number(week) || 1;
  const router = useRouter();

  const {
    loading,
    session,
    activePlan,
    activeEnrollment,
    workoutLogs,
  } = useVTeamStore();

  const [days, setDays] = useState<PlanWorkoutRow[]>([]);
  const [loadingDays, setLoadingDays] = useState(true);

  useEffect(() => {
    if (!loading && !session?.userId) {
      router.replace("/login");
    }
  }, [loading, session, router]);

  useEffect(() => {
    async function loadWeekDays() {
      if (!activePlan?.id) {
        setLoadingDays(false);
        return;
      }
      setLoadingDays(true);
      try {
        const res = await fetch(
          `/api/workouts?planId=${encodeURIComponent(
            activePlan.id
          )}&week=${weekNumber}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          setDays(data.workouts || []);
        }
      } catch (err) {
        console.error("Error loading week days:", err);
      } finally {
        setLoadingDays(false);
      }
    }
    loadWeekDays();
  }, [activePlan?.id, weekNumber]);

  const completedWorkoutIds = new Set(
    workoutLogs
      .filter((log) => Boolean(log.completed_at))
      .map((log) => log.workout_id)
  );

  return (
    <div className="min-h-screen pb-24 flex flex-col">
      <TopBar />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 py-8 space-y-6">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-[#A08A56] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al Dashboard</span>
          </Link>
        </div>

        <header className="border-b border-white/10 pb-5">
          {activePlan && (
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#A08A56] mb-1">
              {activePlan.name || activePlan.title}
            </p>
          )}
          <h1
            className="font-black italic uppercase tracking-tight text-white"
            style={{ fontSize: "var(--text-heading-1)" }}
          >
            Semana {weekNumber}
          </h1>
        </header>

        {loading || loadingDays ? (
          <div className="rounded-2xl bg-black/80 border border-white/10 p-10 text-center text-xs font-bold uppercase tracking-widest text-zinc-400">
            CARGANDO...
          </div>
        ) : days.length === 0 ? (
          <div className="rounded-2xl bg-black/80 border border-white/10 p-10 text-center text-sm text-zinc-400">
            No hay sesiones registradas para esta semana.
          </div>
        ) : (
          <div className="space-y-3.5">
            {days.map((workout) => {
              const isCompleted = completedWorkoutIds.has(workout.id);
              const isCurrent =
                activeEnrollment?.current_week === workout.week_number &&
                activeEnrollment?.current_day === workout.day_number;

              return (
                <DayCardSDUI
                  key={workout.id}
                  workout={workout}
                  isCompleted={isCompleted}
                  isCurrent={isCurrent}
                />
              );
            })}
          </div>
        )}
      </main>

      <BottomNav currentWeek={weekNumber} />
    </div>
  );
}
