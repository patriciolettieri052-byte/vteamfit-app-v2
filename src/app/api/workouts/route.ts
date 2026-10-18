import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    const planId = req.nextUrl.searchParams.get("planId");
    const planSlug = req.nextUrl.searchParams.get("planSlug");
    const weekNumber = req.nextUrl.searchParams.get("week");
    const dayNumber = req.nextUrl.searchParams.get("day");
    const exerciseSlug = req.nextUrl.searchParams.get("exerciseSlug");

    const supabase = createServerSupabase();

    // If requesting a single exercise catalog item by slug
    if (exerciseSlug) {
      const { data: exercise } = await supabase
        .from("exercises")
        .select("*")
        .eq("slug", exerciseSlug)
        .maybeSingle();

      return NextResponse.json({ exercise: exercise || null });
    }

    let resolvedPlanId = planId;
    if (!resolvedPlanId && planSlug) {
      const { data: plan } = await supabase
        .from("plans")
        .select("id")
        .eq("slug", planSlug)
        .maybeSingle();
      resolvedPlanId = plan?.id || null;
    }

    if (!resolvedPlanId) {
      return NextResponse.json({ workouts: [] });
    }

    let query = supabase
      .from("plan_workouts")
      .select("*")
      .eq("plan_id", resolvedPlanId)
      .order("week_number", { ascending: true })
      .order("day_number", { ascending: true });

    if (weekNumber) {
      query = query.eq("week_number", Number(weekNumber));
    }
    if (dayNumber) {
      query = query.eq("day_number", Number(dayNumber));
    }

    const { data: workouts, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ workouts: workouts || [] });
  } catch (err) {
    console.error("GET /api/workouts error:", err);
    return NextResponse.json(
      { error: "Error cargando sesiones de entrenamiento" },
      { status: 500 }
    );
  }
}
