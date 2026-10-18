import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";
    const fullName = (body.fullName || "").trim();

    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Ingresa un email válido y una contraseña de al menos 6 caracteres." },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();

    // Check if user already exists in v2.user_profiles
    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json(
        { error: "Este correo ya está registrado. Por favor inicia sesión." },
        { status: 409 }
      );
    }

    // Create user in Supabase Auth via Admin API (auto-confirmed for smooth MVP onboarding)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    let userId = authData?.user?.id;

    // If user existed in auth.users but not in v2.user_profiles, retrieve from listUsers
    if (authError || !userId) {
      const { data: listData } = await supabase.auth.admin.listUsers();
      const found = listData?.users?.find(
        (u) => u.email?.toLowerCase() === email
      );
      if (found) {
        userId = found.id;
      } else {
        return NextResponse.json(
          { error: authError?.message || "No se pudo crear la cuenta." },
          { status: 400 }
        );
      }
    }

    // Upsert row in v2.user_profiles using exact schema columns
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .upsert(
        {
          id: userId,
          email,
          full_name: fullName || email.split("@")[0],
          role: "student",
        },
        { onConflict: "id" }
      )
      .select("*")
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: {
        userId: profile.id,
        email: profile.email,
        fullName: profile.full_name || "",
        role: profile.role || "student",
      },
      profile,
    });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor al registrar usuario." },
      { status: 500 }
    );
  }
}
