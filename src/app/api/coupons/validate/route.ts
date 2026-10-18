import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = (body.code || "").trim().toUpperCase();
    const planSlug = (body.planSlug || "").trim();

    if (!code) {
      return NextResponse.json(
        { valid: false, error: "Ingresa un código promocional." },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !coupon) {
      return NextResponse.json(
        { valid: false, error: "Código inválido o expirado" },
        { status: 404 }
      );
    }

    // If coupon.plan_id is set, verify it matches the target plan (comparing normalized hyphen/underscore)
    if (coupon.plan_id && planSlug) {
      const norm = (s: string) => s.toLowerCase().replace(/_/g, "-");
      if (norm(coupon.plan_id) !== norm(planSlug)) {
        return NextResponse.json(
          { valid: false, error: "Este cupón no aplica para el plan seleccionado." },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discount_percent: Number(coupon.discount_percent),
    });
  } catch (err) {
    console.error("Error validating coupon:", err);
    return NextResponse.json(
      { valid: false, error: "Error al validar el código" },
      { status: 500 }
    );
  }
}
