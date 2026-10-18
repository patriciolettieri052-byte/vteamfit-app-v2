import React from "react";
import Link from "next/link";
import { Play, CheckCircle2, Dumbbell } from "lucide-react";
import { getExerciseSlug, type WorkoutExerciseItem } from "@/types/sdui";

interface ExerciseCardSDUIProps {
  exercise: WorkoutExerciseItem;
  weekNumber: number;
  dayNumber: number;
  isCompleted?: boolean;
}

export function ExerciseCardSDUI({
  exercise,
  weekNumber,
  dayNumber,
  isCompleted = false,
}: ExerciseCardSDUIProps) {
  const slug = getExerciseSlug(exercise);
  const displayName =
    exercise.name ||
    exercise.name_override ||
    slug.replace(/_/g, " ").replace(/-/g, " ");
  const setsValue = exercise.series ?? exercise.sets ?? "3";
  const repsValue = exercise.reps ?? "10";

  return (
    <Link
      href={`/dashboard/semana/${weekNumber}/dia/${dayNumber}/ejercicio/${encodeURIComponent(
        slug
      )}`}
      data-state={isCompleted ? "completed" : "idle"}
      className={`group flex items-center justify-between gap-4 rounded-xl p-4 bg-black/80 backdrop-blur-md border transition-all duration-200 min-h-[72px] ${
        isCompleted
          ? "border-emerald-500/45 bg-emerald-950/10"
          : "border-white/10 hover:border-[#A08A56]"
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border text-xs font-black tabular-nums transition-colors ${
            isCompleted
              ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
              : "border-white/10 bg-zinc-900 text-[#A08A56] group-hover:bg-[#A08A56] group-hover:text-black"
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <span>#{exercise.order}</span>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#A08A56]">
              {exercise.category || "EJERCICIO"}
            </span>
            {isCompleted && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                · GUARDADO
              </span>
            )}
          </div>
          <h4 className="text-sm sm:text-base font-black uppercase tracking-tight text-white truncate">
            {displayName}
          </h4>
          {exercise.notes && (
            <p className="text-xs text-zinc-400 truncate mt-0.5">{exercise.notes}</p>
          )}
        </div>
      </div>

      {/* Prescription Pills + Play Icon */}
      <div className="flex items-center gap-3 shrink-0 tabular-nums">
        <div className="hidden sm:flex items-center gap-2">
          <div className="rounded bg-zinc-900/90 border border-white/10 px-2.5 py-1 text-center">
            <span className="block text-[9px] font-bold uppercase tracking-widest text-zinc-500">
              SERIES
            </span>
            <span className="text-xs font-black text-white">{setsValue}</span>
          </div>
          <div className="rounded bg-zinc-900/90 border border-white/10 px-2.5 py-1 text-center">
            <span className="block text-[9px] font-bold uppercase tracking-widest text-zinc-500">
              REPS
            </span>
            <span className="text-xs font-black text-white">{repsValue}</span>
          </div>
        </div>

        {/* Compact mobile prescription */}
        <div className="flex sm:hidden flex-col items-end text-right">
          <span className="text-xs font-black text-white">
            {setsValue} × {repsValue}
          </span>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 border border-white/10 text-zinc-300 group-hover:border-[#A08A56] group-hover:text-[#A08A56] transition-colors">
          {isCompleted ? (
            <Dumbbell className="h-4 w-4 text-emerald-400" />
          ) : (
            <Play className="h-4 w-4 fill-current ml-0.5" />
          )}
        </div>
      </div>
    </Link>
  );
}
