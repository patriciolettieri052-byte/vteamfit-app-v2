"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Scale, Plus } from "lucide-react";
import { useVTeamStore } from "@/lib/store";
import { TopBar } from "@/components/navigation/TopBar";
import { BottomNav } from "@/components/navigation/BottomNav";

export default function StatsPage() {
  const router = useRouter();
  const {
    loading,
    session,
    profile,
    activePlan,
    activeEnrollment,
    workoutLogs,
    weightLogs,
    refresh,
  } = useVTeamStore();

  const [totalWorkoutsCount, setTotalWorkoutsCount] = useState(0);
  const [newWeight, setNewWeight] = useState("");
  const [savingWeight, setSavingWeight] = useState(false);

  useEffect(() => {
    if (!loading && !session?.userId) {
      router.replace("/login");
    }
  }, [loading, session, router]);

  useEffect(() => {
    async function loadTotalCount() {
      if (!activePlan?.id) return;
      try {
        const res = await fetch(
          `/api/workouts?planId=${encodeURIComponent(activePlan.id)}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          setTotalWorkoutsCount((data.workouts || []).length);
        }
      } catch {
        // ignore
      }
    }
    loadTotalCount();
  }, [activePlan?.id]);

  // Only count logs where completed_at IS NOT NULL per PRD Section 4.6
  const completedLogs = workoutLogs.filter((l) => Boolean(l.completed_at));
  const completedDistinctWorkouts = new Set(completedLogs.map((l) => l.workout_id)).size;

  const completionPercent =
    totalWorkoutsCount > 0
      ? Math.min(100, Math.round((completedDistinctWorkouts / totalWorkoutsCount) * 100))
      : 0;

  // Compute distinct active days streak
  const completedDates = Array.from(
    new Set(
      completedLogs
        .map((l) => (l.completed_at ? l.completed_at.slice(0, 10) : ""))
        .filter(Boolean)
    )
  ).sort((a, b) => (a > b ? -1 : 1));

  const streakDays = completedDates.length;

  const handleSaveWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.userId || !newWeight) return;
    const val = parseFloat(newWeight);
    if (isNaN(val) || val <= 20 || val > 300) return;

    setSavingWeight(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.userId,
          weight_kg: val,
          log_new_weight: true,
        }),
      });
      if (res.ok) {
        setNewWeight("");
        await refresh();
      }
    } finally {
      setSavingWeight(false);
    }
  };

  // Prepare chronological weight points for display
  const chronologicalWeights = [...weightLogs]
    .slice(0, 8)
    .reverse();

  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (completionPercent / 100) * circumference;

  return (
    <div className="min-h-screen pb-24 flex flex-col">
      <TopBar />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 py-8 space-y-8">
        <header className="space-y-2 border-b border-white/10 pb-5">
          <h1
            className="font-black italic uppercase tracking-tight text-white"
            style={{ fontSize: "var(--text-heading-1)" }}
          >
            TUS NÚMEROS
          </h1>
          <p className="text-xs sm:text-sm italic text-zinc-400">
            &ldquo;El progreso es la suma de pequeños esfuerzos repetidos día tras
            día.&rdquo;
          </p>
        </header>

        {/* Top Row: Progress Ring & Streak Counter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 tabular-nums">
          {/* Progress Ring */}
          <div className="rounded-2xl bg-black/85 border border-white/10 p-6 flex flex-col items-center justify-center text-center">
            <div className="relative flex items-center justify-center h-36 w-36">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 140 140">
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  stroke="#A08A56"
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">
                  {completionPercent}%
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                  COMPLETADO
                </span>
              </div>
            </div>
            <p className="text-xs text-zinc-400 mt-3">
              {completedDistinctWorkouts} de {totalWorkoutsCount || "—"} sesiones
              completadas
            </p>
          </div>

          {/* Streak Counter */}
          <div className="rounded-2xl bg-black/85 border border-white/10 p-6 flex flex-col items-center justify-center text-center space-y-2">
            <div className="text-4xl">🔥</div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
              RACHA ACTUAL
            </span>
            <div className="text-4xl font-black text-[#A08A56]">
              {streakDays} DÍAS
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-white">
              ¡VAS CON TODO!
            </span>
          </div>
        </div>

        {/* Weight Evolution Chart */}
        <section className="rounded-2xl bg-black/85 border border-white/10 p-6 sm:p-8 space-y-6 tabular-nums">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-white">
                EVOLUCIÓN DE PESO
              </h3>
              <p className="text-xs text-zinc-400">Últimos registros</p>
            </div>
            {profile?.weight_kg && (
              <div className="rounded-lg bg-zinc-900 border border-[#A08A56]/50 px-3.5 py-1.5 text-right">
                <span className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                  PESO ACTUAL
                </span>
                <span className="text-sm font-black text-[#A08A56]">
                  {profile.weight_kg} kg
                </span>
              </div>
            )}
          </div>

          {chronologicalWeights.length === 0 ? (
            <div className="rounded-xl bg-zinc-950 border border-white/10 p-8 text-center text-xs text-zinc-500">
              Aún no hay registros de peso. Registra tu peso abajo para visualizar tu
              evolución.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {chronologicalWeights.map((item) => {
                const rawDate = item.recorded_date || item.created_at || new Date().toISOString();
                const dateFormatted = new Date(rawDate).toLocaleDateString(
                  "es-ES",
                  { day: "2-digit", month: "short" }
                );
                return (
                  <div
                    key={item.id}
                    className="rounded-xl bg-zinc-900/90 border border-white/10 p-3.5 text-center"
                  >
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      {dateFormatted}
                    </span>
                    <span className="text-lg font-black text-white mt-1 block">
                      {Number(item.weight_kg).toFixed(1)}{" "}
                      <span className="text-xs text-[#A08A56]">kg</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Weight Update Prompt Card */}
        <section className="rounded-2xl bg-black/90 border border-white/15 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#A08A56]/15 border border-[#A08A56] text-[#A08A56]">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                ACTUALIZA TU PESO
              </h2>
              <p className="text-xs text-zinc-400">
                Registra tu peso para hacer seguimiento a tu evolución.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSaveWeight}
            className="flex flex-col sm:flex-row gap-3 pt-2 tabular-nums"
          >
            <input
              type="number"
              step="0.1"
              min="25"
              max="250"
              required
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="Ej: 64.5 (kg)"
              className="flex-1 min-h-[48px] rounded-lg bg-zinc-900 border border-white/15 px-4 text-sm font-bold text-white placeholder:text-zinc-600 focus:border-[#A08A56] focus:outline-none"
            />
            <button
              type="submit"
              disabled={savingWeight}
              className="min-h-[48px] px-6 rounded-lg bg-[#A08A56] hover:bg-[#B59E68] text-black text-xs font-black uppercase tracking-[0.2em] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              <span>{savingWeight ? "GUARDANDO..." : "GUARDAR PESO"}</span>
            </button>
          </form>
        </section>
      </main>

      <BottomNav currentWeek={activeEnrollment?.current_week || 1} />
    </div>
  );
}
