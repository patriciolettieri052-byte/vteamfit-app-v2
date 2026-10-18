import React from "react";
import type { WorkoutExerciseItem } from "@/types/sdui";
import { ExerciseCardSDUI } from "./ExerciseCardSDUI";

interface CategoryExerciseGroupProps {
  category: string;
  exercises: WorkoutExerciseItem[];
  weekNumber: number;
  dayNumber: number;
  completedSlugs: Set<string>;
}

export function CategoryExerciseGroup({
  category,
  exercises,
  weekNumber,
  dayNumber,
  completedSlugs,
}: CategoryExerciseGroupProps) {
  const completedCount = exercises.filter((ex) =>
    completedSlugs.has(ex.exercise_slug)
  ).length;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-[#A08A56]" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#A08A56]">
            BLOQUE: {category}
          </h3>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 tabular-nums">
          {completedCount} / {exercises.length} COMPLETADOS
        </span>
      </div>

      <div className="space-y-2.5">
        {exercises.map((ex) => (
          <ExerciseCardSDUI
            key={`${ex.order}-${ex.exercise_slug}`}
            exercise={ex}
            weekNumber={weekNumber}
            dayNumber={dayNumber}
            isCompleted={completedSlugs.has(ex.exercise_slug)}
          />
        ))}
      </div>
    </section>
  );
}
