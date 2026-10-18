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
          .order("created_at", { ascending: false }),
        supabase
          .from("plans")
          .select("*")
          .eq("is_published", true)
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
          .order("recorded_date", { ascending: false }),
      ]);

    // Attach plan object from plansRes if PostgREST relation join didn't populate it
    const plansList = plansRes.data || [];
    const enrollmentsList = (enrollmentsRes.data || []).map((enr) => {
      if (!enr.plan && enr.plan_id) {
        const matchedPlan = plansList.find(
          (p) => p.id === enr.plan_id || p.slug === enr.plan_id
        );
        return { ...enr, plan: matchedPlan || null };
      }
      return enr;
    });

    return NextResponse.json({
      profile: profileRes.data || null,
      enrollments: enrollmentsList,
      plans: plansList,
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
      log_new_weight,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const supabase = createServerSupabase();

    // Only update columns that exist in v2.user_profiles
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (full_name !== undefined) updatePayload.full_name = full_name;
    if (gender !== undefined) updatePayload.gender = gender;
    if (age !== undefined && age !== null) updatePayload.age = Number(age);
    if (weight_kg !== undefined && weight_kg !== null) {
      updatePayload.weight_kg = Number(weight_kg);
    }
    if (height_cm !== undefined && height_cm !== null) {
      updatePayload.height_cm = Number(height_cm);
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

    // Record weight in v2.user_weight_logs using exact columns (user_id, weight_kg, recorded_date)
    if (weight_kg !== undefined && Number(weight_kg) > 0 && log_new_weight !== false) {
      await supabase.from("user_weight_logs").insert({
        user_id: userId,
        weight_kg: Number(weight_kg),
        recorded_date: new Date().toISOString().slice(0, 10),
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
