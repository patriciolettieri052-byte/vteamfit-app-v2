import React from "react";
import Link from "next/link";
import { Play, CheckCircle2, Dumbbell } from "lucide-react";
import { getExerciseSlug, getExerciseThumbnail, type WorkoutExerciseItem } from "@/types/sdui";

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
  const thumbnailUrl = getExerciseThumbnail(exercise);

  return (
    <Link
      href={`/dashboard/semana/${weekNumber}/dia/${dayNumber}/ejercicio/${encodeURIComponent(
        slug
      )}`}
      data-state={isCompleted ? "completed" : "idle"}
      className={`group flex items-center justify-between gap-4 rounded-xl p-3 sm:p-3.5 bg-black/80 backdrop-blur-md border transition-all duration-200 min-h-[76px] ${
        isCompleted
          ? "border-emerald-500/45 bg-emerald-950/10"
          : "border-white/10 hover:border-[#A08A56]"
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Left: Video Preview Thumbnail */}
        <div className="relative h-16 w-24 sm:w-28 shrink-0 overflow-hidden rounded-lg bg-zinc-950 border border-white/10 group-hover:border-[#A08A56]/60 transition-colors">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={displayName}
              className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-500">
              <Dumbbell className="h-5 w-5 mb-0.5 text-[#A08A56]/60" />
            </div>
          )}

          {/* Micro order badge */}
          <span className="absolute bottom-1 left-1.5 rounded bg-black/75 px-1 py-0.5 text-[9px] font-black tabular-nums text-white/90 backdrop-blur-xs">
            #{exercise.order}
          </span>

          {/* Completion state overlay */}
          {isCompleted && (
            <div className="absolute inset-0 bg-emerald-950/70 backdrop-blur-[1px] flex items-center justify-center border border-emerald-500/40 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
            </div>
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
          <h4 className="text-sm sm:text-base font-black italic uppercase tracking-tight text-white truncate">
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
