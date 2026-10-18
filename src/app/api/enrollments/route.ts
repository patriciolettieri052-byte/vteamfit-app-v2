import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, planSlug, couponCode } = body;

    if (!userId || !planSlug) {
      return NextResponse.json(
        { error: "Faltan datos de usuario o plan." },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();

    // Fetch target plan from v2.plans supporting both hyphens and underscores
    const normalizedSlug = planSlug.replace(/_/g, "-");
    const underscoreSlug = planSlug.replace(/-/g, "_");
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("*")
      .or(
        `slug.eq.${planSlug},slug.eq.${normalizedSlug},slug.eq.${underscoreSlug},id.eq.${planSlug},id.eq.${underscoreSlug}`
      )
      .maybeSingle();

    if (planError || !plan) {
      return NextResponse.json(
        { error: "El plan solicitado no existe." },
        { status: 404 }
      );
    }

    // Optional coupon validation if provided
    let discountPercent = 0;
    if (couponCode) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.trim().toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (coupon) {
        discountPercent = Number(coupon.discount_percent);
      }
    }

    // Upsert active enrollment in v2.user_enrollments using exact schema columns
    const { data: existingList } = await supabase
      .from("user_enrollments")
      .select("*")
      .eq("user_id", userId)
      .eq("plan_id", plan.id);

    const existing = existingList?.[0] || null;

    let enrollment;
    if (existing) {
      const { data: updated, error: updErr } = await supabase
        .from("user_enrollments")
        .update({
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select("*, plan:plans(*)")
        .single();
      if (updErr) throw updErr;
      enrollment = updated;
    } else {
      const { data: inserted, error: insErr } = await supabase
        .from("user_enrollments")
        .insert({
          user_id: userId,
          plan_id: plan.id,
          start_date: new Date().toISOString().slice(0, 10),
          current_week: 1,
          status: "active",
          onboarding_data: null,
        })
        .select("*, plan:plans(*)")
        .single();
      if (insErr) throw insErr;
      enrollment = inserted;
    }

    const postCheckoutRoute =
      plan.ui_config?.cta?.post_checkout_route ||
      plan.ui_config?.post_checkout_route ||
      "/dashboard";

    return NextResponse.json({
      enrollment: { ...enrollment, plan },
      plan,
      discountPercent,
      redirectTo: postCheckoutRoute,
    });
  } catch (err) {
    console.error("POST /api/enrollments error:", err);
    return NextResponse.json(
      { error: "No se pudo procesar la inscripción al plan." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, planSlug, onboardingData, currentWeek } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const supabase = createServerSupabase();

    let planId: string | undefined;
    if (planSlug) {
      const normalizedSlug = planSlug.replace(/_/g, "-");
      const underscoreSlug = planSlug.replace(/-/g, "_");
      const { data: plan } = await supabase
        .from("plans")
        .select("id")
        .or(
          `slug.eq.${planSlug},slug.eq.${normalizedSlug},slug.eq.${underscoreSlug},id.eq.${planSlug},id.eq.${underscoreSlug}`
        )
        .maybeSingle();
      planId = plan?.id;
    }

    let query = supabase
      .from("user_enrollments")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active");

    if (planId) {
      query = query.eq("plan_id", planId);
    }

    const { data: existingList } = await query;
    const target = existingList?.[0];

    if (!target) {
      return NextResponse.json(
        { error: "No se encontró una inscripción activa para actualizar." },
        { status: 404 }
      );
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (onboardingData !== undefined) updates.onboarding_data = onboardingData;
    if (currentWeek !== undefined) updates.current_week = Number(currentWeek);

    const { data: updated, error } = await supabase
      .from("user_enrollments")
      .update(updates)
      .eq("id", target.id)
      .select("*, plan:plans(*)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ enrollment: updated });
  } catch (err) {
    console.error("PATCH /api/enrollments error:", err);
    return NextResponse.json(
      { error: "Error actualizando inscripción" },
      { status: 500 }
    );
  }
}
