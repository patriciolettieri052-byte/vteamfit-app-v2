import React from "react";
import Link from "next/link";
import { CheckCircle2, Clock, ChevronRight, Dumbbell } from "lucide-react";
import type { PlanWorkoutRow } from "@/types/sdui";

interface DayCardSDUIProps {
  workout: PlanWorkoutRow;
  isCompleted: boolean;
  isCurrent: boolean;
}

export function DayCardSDUI({ workout, isCompleted, isCurrent }: DayCardSDUIProps) {
  const exercisesCount = Array.isArray(workout.exercises)
    ? workout.exercises.length
    : 0;

  const dayTitle =
    workout.day_name || workout.title || `Día ${workout.day_number}`;
  const daySubtitle =
    workout.focus || workout.description || workout.warmup_instructions || null;

  // Extract unique categories in this session
  const categories = Array.from(
    new Set(
      (workout.exercises || [])
        .map((e) => e.category)
        .filter((c): c is string => Boolean(c))
    )
  );

  return (
    <Link
      href={`/dashboard/semana/${workout.week_number}/dia/${workout.day_number}`}
      data-state={isCompleted ? "completed" : isCurrent ? "active" : "idle"}
      className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl p-5 bg-black/85 backdrop-blur-md border transition-all duration-200 ${
        isCompleted
          ? "border-emerald-500/45 bg-emerald-950/10"
          : isCurrent
          ? "border-[#A08A56] shadow-[0_0_25px_-5px_rgba(160,138,86,0.25)]"
          : "border-white/10 hover:border-white/25"
      }`}
    >
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-[0.2em] bg-[#A08A56] text-black tabular-nums">
            DÍA {workout.day_number}
          </span>
          {workout.is_rest_day && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-[#A08A56]/60 text-[#A08A56]">
              DESCANSO
            </span>
          )}
          {isCompleted && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              COMPLETADO
            </span>
          )}
          {isCurrent && !isCompleted && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-[#A08A56] text-[#A08A56]">
              SESIÓN ACTUAL
            </span>
          )}
        </div>

        <h3 className="text-lg font-black uppercase tracking-tight text-white">
          {dayTitle}
        </h3>

        {daySubtitle && (
          <p className="text-xs text-zinc-400 line-clamp-2 max-w-xl">
            {daySubtitle}
          </p>
        )}

        {categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {categories.map((cat) => (
              <span
                key={cat}
                className="rounded bg-zinc-900 border border-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-300"
              >
                {cat}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10 shrink-0 tabular-nums">
        <div className="flex items-center gap-4 text-xs text-zinc-400">
          <span className="inline-flex items-center gap-1.5 font-bold">
            <Dumbbell className="h-3.5 w-3.5 text-[#A08A56]" />
            {exercisesCount} EJERCICIOS
          </span>
          {workout.estimated_duration_min && (
            <span className="inline-flex items-center gap-1.5 font-bold">
              <Clock className="h-3.5 w-3.5 text-[#A08A56]" />
              {workout.estimated_duration_min} MIN
            </span>
          )}
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 border border-white/10 text-white group-hover:border-[#A08A56] group-hover:text-[#A08A56] transition-colors">
          <ChevronRight className="h-5 w-5" />
        </div>
      </div>
    </Link>
  );
}
