"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, LogOut, HelpCircle, FileText, Check } from "lucide-react";
import { useVTeamStore, setStoredSession } from "@/lib/store";
import { TopBar } from "@/components/navigation/TopBar";
import { BottomNav } from "@/components/navigation/BottomNav";

export default function ProfilePage() {
  const router = useRouter();
  const {
    loading,
    session,
    profile,
    activeEnrollment,
    refresh,
  } = useVTeamStore();

  const [editing, setEditing] = useState(false);
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"Mujer" | "Hombre" | "Otro">("Mujer");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !session?.userId) {
      router.replace("/login");
    }
  }, [loading, session, router]);

  useEffect(() => {
    if (profile) {
      setWeightKg(profile.weight_kg ? String(profile.weight_kg) : "");
      setHeightCm(profile.height_cm ? String(profile.height_cm) : "");
      setAge(profile.age ? String(profile.age) : "");
      setGender((profile.gender as "Mujer" | "Hombre" | "Otro") || "Mujer");
    }
  }, [profile]);

  const handleSaveMetrics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.userId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.userId,
          weight_kg: weightKg ? Number(weightKg) : null,
          height_cm: heightCm ? Number(heightCm) : null,
          age: age ? Number(age) : null,
          gender,
        }),
      });
      if (res.ok) {
        await refresh();
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("¿Quieres cerrar sesión?")) {
      setStoredSession(null);
      router.push("/");
    }
  };

  const displayName = profile?.full_name || session?.fullName || "Usuario";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen pb-24 flex flex-col">
      <TopBar />

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-8 space-y-8">
        {/* Avatar & Header */}
        <section className="flex items-center gap-5 rounded-2xl bg-black/85 border border-white/10 p-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#A08A56] text-black text-2xl font-black">
            {initial}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white truncate">
              {displayName}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 truncate">
              {profile?.email || session?.email}
            </p>
            {profile?.role && profile.role !== "user" && (
              <span className="mt-1.5 inline-block rounded bg-[#A08A56]/20 border border-[#A08A56] px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#A08A56]">
                ROL: {profile.role.toUpperCase()}
              </span>
            )}
          </div>
        </section>

        {/* MIS DATOS */}
        <section className="rounded-2xl bg-black/85 border border-white/10 p-6 space-y-5 tabular-nums">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#A08A56]">
              MIS DATOS
            </h2>
            <button
              type="button"
              onClick={() => setEditing((prev) => !prev)}
              className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white cursor-pointer"
            >
              {editing ? "Cancelar" : "Editar"}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleSaveMetrics} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                    PESO (KG)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full min-h-[44px] rounded-lg bg-zinc-900 border border-white/15 px-3.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                    ALTURA (CM)
                  </label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="w-full min-h-[44px] rounded-lg bg-zinc-900 border border-white/15 px-3.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                    EDAD
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full min-h-[44px] rounded-lg bg-zinc-900 border border-white/15 px-3.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                    GÉNERO
                  </label>
                  <select
                    value={gender}
                    onChange={(e) =>
                      setGender(e.target.value as "Mujer" | "Hombre" | "Otro")
                    }
                    className="w-full min-h-[44px] rounded-lg bg-zinc-900 border border-white/15 px-3.5 text-sm text-white"
                  >
                    <option value="Mujer">Mujer</option>
                    <option value="Hombre">Hombre</option>
                    <option value="Otro">Prefiero no decir</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="min-h-[44px] px-6 rounded-lg bg-[#A08A56] text-black text-xs font-black uppercase tracking-widest inline-flex items-center gap-2 cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>{saving ? "Guardando..." : "Guardar cambios"}</span>
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl bg-zinc-900/90 border border-white/10 p-4">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  PESO
                </span>
                <span className="text-base font-black text-white mt-1 block">
                  {profile?.weight_kg ? `${profile.weight_kg} kg` : "—"}
                </span>
              </div>
              <div className="rounded-xl bg-zinc-900/90 border border-white/10 p-4">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  ALTURA
                </span>
                <span className="text-base font-black text-white mt-1 block">
                  {profile?.height_cm ? `${profile.height_cm} cm` : "—"}
                </span>
              </div>
              <div className="rounded-xl bg-zinc-900/90 border border-white/10 p-4">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  EDAD
                </span>
                <span className="text-base font-black text-white mt-1 block">
                  {profile?.age ? `${profile.age} años` : "—"}
                </span>
              </div>
              <div className="rounded-xl bg-zinc-900/90 border border-white/10 p-4">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  GÉNERO
                </span>
                <span className="text-base font-black text-white mt-1 block">
                  {profile?.gender === "Otro"
                    ? "Prefiero no decir"
                    : profile?.gender || "—"}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* CUENTA Y PREFERENCIAS */}
        <section className="rounded-2xl bg-black/85 border border-white/10 p-6 space-y-4">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#A08A56]">
            CUENTA Y PREFERENCIAS
          </h2>

          <div className="divide-y divide-white/10">
            <Link
              href="/soporte"
              className="flex items-center justify-between py-3.5 text-sm font-bold text-zinc-200 hover:text-[#A08A56] transition-colors"
            >
              <span className="flex items-center gap-3">
                <HelpCircle className="h-4 w-4 text-[#A08A56]" />
                Soporte y Ayuda
              </span>
              <ChevronRight className="h-4 w-4 text-zinc-500" />
            </Link>

            <Link
              href="/politicas"
              className="flex items-center justify-between py-3.5 text-sm font-bold text-zinc-200 hover:text-[#A08A56] transition-colors"
            >
              <span className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-[#A08A56]" />
                Políticas Legales
              </span>
              <ChevronRight className="h-4 w-4 text-zinc-500" />
            </Link>
          </div>
        </section>

        {/* CERRAR SESIÓN */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full min-h-[50px] rounded-xl bg-[#27272A] hover:bg-red-950/50 text-[#D4D4D8] hover:text-red-300 border border-[#3F3F46] hover:border-red-500/40 text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>CERRAR SESIÓN</span>
        </button>
      </main>

      <BottomNav currentWeek={activeEnrollment?.current_week || 1} />
    </div>
  );
}
