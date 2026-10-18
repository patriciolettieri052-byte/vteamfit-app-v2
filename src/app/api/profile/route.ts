import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const supabase = createServerSupabase();

    const [profileRes, enrollmentsRes, plansRes, workoutLogsRes, weightLogsRes] =
      await Promise.all([
        supabase.from("user_profiles").select("*").eq("id", userId).maybeSingle(),
        supabase
          .from("user_enrollments")
          .select("*, plan:plans(*)")
          .eq("user_id", userId)
          .order("started_at", { ascending: false }),
        supabase
          .from("plans")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true }),
        supabase
          .from("user_workout_logs")
          .select("*")
          .eq("user_id", userId)
          .order("completed_at", { ascending: false }),
        supabase
          .from("user_weight_logs")
          .select("*")
          .eq("user_id", userId)
          .order("logged_at", { ascending: false }),
      ]);

    return NextResponse.json({
      profile: profileRes.data || null,
      enrollments: enrollmentsRes.data || [],
      plans: plansRes.data || [],
      workoutLogs: workoutLogsRes.data || [],
      weightLogs: weightLogsRes.data || [],
    });
  } catch (err) {
    console.error("GET /api/profile error:", err);
    return NextResponse.json(
      { error: "Error fetching profile state" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      full_name,
      gender,
      age,
      weight_kg,
      height_cm,
      onboarding_completed,
      log_new_weight,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const supabase = createServerSupabase();

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (full_name !== undefined) updatePayload.full_name = full_name;
    if (gender !== undefined) updatePayload.gender = gender;
    if (age !== undefined) updatePayload.age = Number(age);
    if (weight_kg !== undefined) updatePayload.weight_kg = Number(weight_kg);
    if (height_cm !== undefined) updatePayload.height_cm = Number(height_cm);
    if (onboarding_completed !== undefined) {
      updatePayload.onboarding_completed = Boolean(onboarding_completed);
    }

    const { data: profile, error: updateError } = await supabase
      .from("user_profiles")
      .update(updatePayload)
      .eq("id", userId)
      .select("*")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // If weight was provided during onboarding or explicit weight update, record in v2.user_weight_logs
    if (weight_kg !== undefined && Number(weight_kg) > 0 && log_new_weight !== false) {
      await supabase.from("user_weight_logs").insert({
        user_id: userId,
        weight_kg: Number(weight_kg),
        notes: onboarding_completed ? "Peso inicial de onboarding" : "Actualización de perfil",
      });
    }

    return NextResponse.json({ profile });
  } catch (err) {
    console.error("PATCH /api/profile error:", err);
    return NextResponse.json(
      { error: "Error updating profile" },
      { status: 500 }
    );
  }
}
