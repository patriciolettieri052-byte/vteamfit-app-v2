import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Ingresa tu correo electrónico y contraseña." },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();

    // Authenticate with Supabase Auth
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError || !signInData?.user) {
      return NextResponse.json(
        { error: "Credenciales inválidas. Verifica tu email y contraseña." },
        { status: 401 }
      );
    }

    const userId = signInData.user.id;

    // Ensure profile exists in v2.user_profiles
    let { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (!profile) {
      const { data: createdProfile } = await supabase
        .from("user_profiles")
        .upsert(
          {
            id: userId,
            email,
            full_name:
              signInData.user.user_metadata?.full_name || email.split("@")[0],
            role: "user",
            onboarding_completed: false,
          },
          { onConflict: "id" }
        )
        .select("*")
        .single();
      profile = createdProfile;
    }

    // Check active enrollments in v2.user_enrollments
    const { data: enrollments } = await supabase
      .from("user_enrollments")
      .select("*, plan:plans(*)")
      .eq("user_id", userId)
      .eq("status", "active");

    return NextResponse.json({
      user: {
        userId: profile.id,
        email: profile.email,
        fullName: profile.full_name || "",
        role: profile.role || "user",
      },
      profile,
      activeEnrollments: enrollments || [],
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Error interno al iniciar sesión." },
      { status: 500 }
    );
  }
}
