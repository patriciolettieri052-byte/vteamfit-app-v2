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
        { valid: false, error: "Cupón inválido o inexistente." },
        { status: 404 }
      );
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json(
        { valid: false, error: "Este cupón ha expirado." },
        { status: 400 }
      );
    }

    if (
      coupon.applicable_plans &&
      Array.isArray(coupon.applicable_plans) &&
      coupon.applicable_plans.length > 0 &&
      planSlug &&
      !coupon.applicable_plans.includes(planSlug)
    ) {
      return NextResponse.json(
        { valid: false, error: "Este cupón no aplica para el plan seleccionado." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discount_percent: Number(coupon.discount_percent),
    });
  } catch (err) {
    console.error("Error validating coupon:", err);
    return NextResponse.json(
      { valid: false, error: "Error interno al validar cupón." },
      { status: 500 }
    );
  }
}
