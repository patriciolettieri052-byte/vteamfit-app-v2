"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Play, Pause, RotateCcw, Check } from "lucide-react";
import { useVTeamStore } from "@/lib/store";
import { resolveMediaUrl } from "@/lib/supabase";
import {
  getExerciseSlug,
  type PlanWorkoutRow,
  type WorkoutExerciseItem,
  type ExerciseCatalogRow,
} from "@/types/sdui";
import { TopBar } from "@/components/navigation/TopBar";

interface ExercisePageProps {
  params: Promise<{ week: string; day: string; slug: string }>;
}

export default function ExercisePlayerPage({ params }: ExercisePageProps) {
  const { week, day, slug } = use(params);
  const weekNumber = Number(week) || 1;
  const dayNumber = Number(day) || 1;
  const decodedSlug = decodeURIComponent(slug);
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
  const [catalogExercise, setCatalogExercise] =
    useState<ExerciseCatalogRow | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [isVerticalVideo, setIsVerticalVideo] = useState(false);

  // Stopwatch state
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // Telemetry Form state
  const [seriesInput, setSeriesInput] = useState("0");
  const [repsInput, setRepsInput] = useState("0");
  const [weightInput, setWeightInput] = useState("0");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const formatNumericChange = (val: string, allowDecimal = false) => {
    if (val === "") return "";
    if (allowDecimal && /^0\.\d*$/.test(val)) return val;
    return val.replace(/^0+(?=\d)/, "");
  };

  useEffect(() => {
    if (!loading && !session?.userId) {
      router.replace("/login");
    }
  }, [loading, session, router]);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    async function fetchExerciseContext() {
      if (!activePlan?.id) {
        setLoadingData(false);
        return;
      }
      setLoadingData(true);
      try {
        const [workoutRes, exRes] = await Promise.all([
          fetch(
            `/api/workouts?planId=${encodeURIComponent(
              activePlan.id
            )}&week=${weekNumber}&day=${dayNumber}`,
            { cache: "no-store" }
          ),
          fetch(
            `/api/workouts?exerciseSlug=${encodeURIComponent(decodedSlug)}`,
            { cache: "no-store" }
          ),
        ]);

        if (workoutRes.ok) {
          const wData = await workoutRes.json();
          const foundWorkout = (wData.workouts?.[0] || null) as PlanWorkoutRow | null;
          setWorkout(foundWorkout);
        }

        if (exRes.ok) {
          const eData = await exRes.json();
          setCatalogExercise(eData.exercise || null);
        }
      } catch (err) {
        console.error("Error loading exercise player:", err);
      } finally {
        setLoadingData(false);
      }
    }
    fetchExerciseContext();
  }, [activePlan?.id, weekNumber, dayNumber, decodedSlug]);

  // If user already logged this exercise today, hydrate existing values; otherwise start at 0
  useEffect(() => {
    if (!workout) return;
    const existingLog = workoutLogs.find((l) => l.workout_id === workout.id);
    const existingEx = existingLog?.exercise_logs?.find(
      (e) => e.exercise_slug === decodedSlug
    );
    if (existingEx && existingEx.sets && existingEx.sets.length > 0) {
      setSeriesInput(String(existingEx.sets.length));
      setRepsInput(String(existingEx.sets[0].reps_completed ?? 0));
      setWeightInput(String(existingEx.sets[0].weight_kg ?? 0));
    } else {
      setSeriesInput("0");
      setRepsInput("0");
      setWeightInput("0");
    }
  }, [workout, workoutLogs, decodedSlug]);

  const prescription: WorkoutExerciseItem | undefined =
    workout?.exercises?.find((e) => getExerciseSlug(e) === decodedSlug);

  const isPadel =
    workout?.plan_id === "plan_padel" ||
    activePlan?.id === "plan_padel" ||
    activePlan?.slug === "plan-padel" ||
    activePlan?.slug === "plan_padel";

  const noteModuleTitle = isPadel
    ? "EXPLICACIÓN DEL EJERCICIO"
    : prescription?.notes
    ? "NOTA DE VICKY"
    : "RECOMENDACIÓN DEL MES";

  const displayName =
    prescription?.name ||
    prescription?.name_override ||
    catalogExercise?.name ||
    decodedSlug.replace(/_/g, " ").toUpperCase();

  const videoUrl = resolveMediaUrl(
    catalogExercise?.video_path ||
      catalogExercise?.video_url ||
      prescription?.video_path
  );

  useEffect(() => {
    setIsVerticalVideo(
      Boolean(videoUrl && /(calentamiento|activacion-padel|circuito[1-5])/i.test(videoUrl))
    );
  }, [videoUrl]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleSaveExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const numSets = parseInt(seriesInput, 10);
    const numReps = parseInt(repsInput, 10);
    // PESO (KG) is optional and defaults to 0 per PRD Section 4.6
    const numWeight = weightInput.trim() === "" ? 0 : parseFloat(weightInput);

    if (isNaN(numSets) || numSets <= 0 || isNaN(numReps) || numReps <= 0) {
      setValidationError(
        "⚠️ Por favor, ingresa las series y repeticiones realizadas antes de guardar el ejercicio."
      );
      return;
    }

    if (!session?.userId || !workout) return;

    setSaving(true);
    try {
      const setsArray = Array.from({ length: numSets }, (_, i) => ({
        set_number: i + 1,
        weight_kg: isNaN(numWeight) ? 0 : numWeight,
        reps_completed: numReps,
        completed: true,
      }));

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
          action: "save_exercise",
          exerciseLog: {
            exercise_slug: decodedSlug,
            name: displayName,
            sets: setsArray,
            completed_at: new Date().toISOString(),
          },
        }),
      });

      if (res.ok) {
        await refresh();
        router.push(`/dashboard/semana/${weekNumber}/dia/${dayNumber}`);
      } else {
        setSaving(false);
      }
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pb-16 flex flex-col">
      <TopBar />

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-8 space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href={`/dashboard/semana/${weekNumber}/dia/${dayNumber}`}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-[#A08A56] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a la rutina</span>
          </Link>
        </div>

        {/* Header */}
        <header className="space-y-1">
          {prescription?.category && (
            <span className="inline-block rounded bg-[#A08A56] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-black">
              {prescription.category}
            </span>
          )}
          <h1
            className="font-black uppercase italic tracking-tight text-white"
            style={{ fontSize: "var(--text-heading-1)" }}
          >
            {displayName}
          </h1>
        </header>

        {/* Video Player Container */}
        <div
          className={`relative overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl transition-all duration-300 ${
            isVerticalVideo ? "aspect-[4/5] sm:aspect-video" : "aspect-video"
          }`}
        >
          {loadingData ? (
            <div className="h-full w-full flex items-center justify-center text-xs font-bold uppercase tracking-widest text-zinc-500">
              CARGANDO VIDEO...
            </div>
          ) : videoUrl ? (
            isVerticalVideo ? (
              <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-black">
                {/* Ambient Blurred Background Layer */}
                <video
                  src={videoUrl}
                  aria-hidden="true"
                  playsInline
                  loop
                  muted
                  autoPlay
                  className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-35 pointer-events-none"
                />
                {/* Crisp Foreground Vertical Video */}
                <video
                  key={videoUrl}
                  src={videoUrl}
                  poster={resolveMediaUrl(catalogExercise?.thumbnail_url) || undefined}
                  playsInline
                  loop
                  muted
                  autoPlay
                  onLoadedMetadata={(e) => {
                    const v = e.currentTarget;
                    if (v.videoHeight > v.videoWidth) {
                      setIsVerticalVideo(true);
                    }
                  }}
                  className="relative z-10 max-h-full max-w-full object-contain pointer-events-none"
                />
              </div>
            ) : (
              <video
                key={videoUrl}
                src={videoUrl}
                poster={resolveMediaUrl(catalogExercise?.thumbnail_url) || undefined}
                playsInline
                loop
                muted
                autoPlay
                onLoadedMetadata={(e) => {
                  const v = e.currentTarget;
                  if (v.videoHeight > v.videoWidth) {
                    setIsVerticalVideo(true);
                  }
                }}
                className="h-full w-full object-cover bg-zinc-950 pointer-events-none"
              />
            )
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center bg-zinc-950 p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-[#A08A56] mb-1">
                EJECUCIÓN TÉCNICA
              </p>
              <p className="text-sm font-black uppercase text-white">
                {displayName}
              </p>
            </div>
          )}
        </div>

        {/* Stopwatch & Suggested Target Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 tabular-nums">
          {/* Session Timer */}
          <div className="rounded-2xl bg-black/85 border border-white/10 p-5 flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                CRONÓMETRO DE SESIÓN
              </span>
              <button
                type="button"
                onClick={() => {
                  setTimerRunning(false);
                  setSecondsElapsed(0);
                }}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                title="Reiniciar"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="text-3xl font-black text-white tracking-tight">
              {formatTime(secondsElapsed)}
            </div>

            <button
              type="button"
              onClick={() => setTimerRunning((prev) => !prev)}
              className={`w-full min-h-[42px] rounded-lg text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                timerRunning
                  ? "bg-[#27272A] text-white border border-[#A08A56]"
                  : "bg-[#A08A56] text-black hover:bg-[#B59E68]"
              }`}
            >
              {timerRunning ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  <span>PAUSAR</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>INICIAR EJERCICIO</span>
                </>
              )}
            </button>
          </div>

          {/* Suggested Target */}
          <div className="rounded-2xl bg-black/85 border border-white/10 p-5 flex flex-col justify-between gap-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A08A56]">
              OBJETIVO SUGERIDO
            </span>

            <div className="grid grid-cols-3 gap-2 text-center my-auto">
              <div className="rounded-xl bg-zinc-900/90 border border-white/10 p-3">
                <span className="block text-xl font-black text-white">
                  {prescription?.series ?? prescription?.sets ?? "3"}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                  SERIES
                </span>
              </div>
              <div className="rounded-xl bg-zinc-900/90 border border-white/10 p-3">
                <span className="block text-xl font-black text-white">
                  {prescription?.reps ?? "10"}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                  REPS
                </span>
              </div>
              <div className="rounded-xl bg-zinc-900/90 border border-white/10 p-3">
                <span className="block text-xl font-black text-[#A08A56]">
                  {prescription?.rest ?? "60s"}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                  DESC
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Exercise Explanation / Vicky's Note Box */}
        <div className="rounded-2xl bg-black/80 border border-[#A08A56]/40 p-5 space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A08A56] block">
            {noteModuleTitle}
          </span>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {prescription?.notes ||
              (Array.isArray(catalogExercise?.instructions)
                ? catalogExercise.instructions.join(" ")
                : catalogExercise?.instructions) ||
              "Priorizá la técnica y el control de la fase excéntrica antes de subir de carga."}
          </p>
        </div>

        {/* Exercise Telemetry Form */}
        <form
          onSubmit={handleSaveExercise}
          className="rounded-2xl bg-black/90 border border-white/15 p-6 sm:p-8 space-y-5 tabular-nums"
        >
          <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white">
            REGISTRA TU ENTRENAMIENTO
          </h2>

          {validationError && (
            <div className="rounded-xl bg-red-950/30 border border-red-500/40 p-3.5 text-xs font-bold text-red-400">
              {validationError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">
                SERIES
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={seriesInput}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setSeriesInput(formatNumericChange(e.target.value))}
                onBlur={() => {
                  if (seriesInput.trim() === "") setSeriesInput("0");
                }}
                placeholder="0"
                className="w-full min-h-[48px] rounded-lg bg-zinc-900 border border-white/15 px-4 text-sm font-bold text-white focus:border-[#A08A56] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">
                REPS
              </label>
              <input
                type="number"
                min="0"
                max="200"
                value={repsInput}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setRepsInput(formatNumericChange(e.target.value))}
                onBlur={() => {
                  if (repsInput.trim() === "") setRepsInput("0");
                }}
                placeholder="0"
                className="w-full min-h-[48px] rounded-lg bg-zinc-900 border border-white/15 px-4 text-sm font-bold text-white focus:border-[#A08A56] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">
                PESO (KG) <span className="text-zinc-500 font-normal">(OPCIONAL)</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="500"
                value={weightInput}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setWeightInput(formatNumericChange(e.target.value, true))}
                onBlur={() => {
                  if (weightInput.trim() === "") setWeightInput("0");
                }}
                placeholder="0"
                className="w-full min-h-[48px] rounded-lg bg-zinc-900 border border-white/15 px-4 text-sm font-bold text-white focus:border-[#A08A56] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full min-h-[52px] rounded-xl bg-[#A08A56] hover:bg-[#B59E68] text-black text-xs sm:text-sm font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Check className="h-4 w-4" />
            <span>{saving ? "GUARDANDO..." : "GUARDAR Y CONTINUAR"}</span>
          </button>
        </form>
      </main>
    </div>
  );
}
