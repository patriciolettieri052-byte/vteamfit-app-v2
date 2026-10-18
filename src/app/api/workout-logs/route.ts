import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import type { ExerciseLogEntry } from "@/types/sdui";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      planId,
      workoutId,
      weekNumber,
      dayName,
      enrollmentId,
      action, // 'save_exercise' | 'complete_day'
      exerciseLog, // ExerciseLogEntry when action === 'save_exercise'
      durationSeconds,
      rpeRating,
      notes,
      nextWeek,
    } = body;

    if (!userId || !workoutId) {
      return NextResponse.json(
        { error: "userId and workoutId are required" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();

    // Check if an open or existing workout log already exists for this user + workout
    const { data: existingLogs } = await supabase
      .from("user_workout_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("workout_id", workoutId)
      .order("id", { ascending: false })
      .limit(1);

    const existing = existingLogs?.[0] || null;

    if (action === "save_exercise" && exerciseLog) {
      const incoming = exerciseLog as ExerciseLogEntry;
      let mergedLogs: ExerciseLogEntry[] = [];

      if (existing && Array.isArray(existing.exercise_logs)) {
        const filtered = (existing.exercise_logs as ExerciseLogEntry[]).filter(
          (item) => item.exercise_slug !== incoming.exercise_slug
        );
        mergedLogs = [...filtered, incoming];
      } else {
        mergedLogs = [incoming];
      }

      if (existing) {
        const { data: updated, error } = await supabase
          .from("user_workout_logs")
          .update({
            exercise_logs: mergedLogs,
          })
          .eq("id", existing.id)
          .select("*")
          .single();

        if (error) throw error;
        return NextResponse.json({ workoutLog: updated });
      } else {
        // Progressive save in v2.user_workout_logs: completed_at remains NULL until 'complete_day'
        const { data: inserted, error } = await supabase
          .from("user_workout_logs")
          .insert({
            user_id: userId,
            plan_id: planId || "plan_padel",
            workout_id: workoutId,
            week_number: weekNumber ? Number(weekNumber) : 1,
            day_name: dayName || "DÍA",
            completed_at: null,
            exercise_logs: mergedLogs,
          })
          .select("*")
          .single();

        if (error) throw error;
        return NextResponse.json({ workoutLog: inserted });
      }
    }

    if (action === "complete_day") {
      const nowIso = new Date().toISOString();
      let finalLog;

      if (existing) {
        const { data: updated, error } = await supabase
          .from("user_workout_logs")
          .update({
            completed_at: nowIso,
            duration_seconds: durationSeconds ?? existing.duration_seconds ?? 2700,
            perceived_effort: rpeRating ?? existing.perceived_effort ?? 8,
            notes: notes ?? existing.notes ?? null,
          })
          .eq("id", existing.id)
          .select("*")
          .single();

        if (error) throw error;
        finalLog = updated;
      } else {
        const { data: inserted, error } = await supabase
          .from("user_workout_logs")
          .insert({
            user_id: userId,
            plan_id: planId || "plan_padel",
            workout_id: workoutId,
            week_number: weekNumber ? Number(weekNumber) : 1,
            day_name: dayName || "DÍA",
            completed_at: nowIso,
            duration_seconds: durationSeconds ?? 2700,
            perceived_effort: rpeRating ?? 8,
            notes: notes ?? null,
            exercise_logs: [],
          })
          .select("*")
          .single();

        if (error) throw error;
        finalLog = inserted;
      }

      // Advance enrollment current_week if provided
      if (enrollmentId && nextWeek) {
        await supabase
          .from("user_enrollments")
          .update({
            current_week: Number(nextWeek),
            updated_at: new Date().toISOString(),
          })
          .eq("id", enrollmentId);
      }

      return NextResponse.json({ workoutLog: finalLog });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("POST /api/workout-logs error:", err);
    return NextResponse.json(
      { error: "Error registrando progreso de entrenamiento" },
      { status: 500 }
    );
  }
}
