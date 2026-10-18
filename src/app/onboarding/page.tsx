"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getStoredSession } from "@/lib/store";

function OnboardingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planSlug = searchParams.get("plan");

  const [step, setStep] = useState<1 | 2>(1);
  const [gender, setGender] = useState<"Mujer" | "Hombre" | "Otro">("Mujer");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [age, setAge] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const session = getStoredSession();
    if (!session?.userId) {
      router.push("/login");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.userId,
          gender,
          weight_kg: weightKg ? Number(weightKg) : null,
          height_cm: heightCm ? Number(heightCm) : null,
          age: age ? Number(age) : null,
          onboarding_completed: true,
        }),
      });

      if (!res.ok) {
        setError("Error al guardar tus datos. Intentá de nuevo.");
        setSaving(false);
        return;
      }

      // Per PRD Section 4.2:
      // If ?plan=[slug] was passed, return to /planes/[slug] to complete COMPRAR PLAN
      // Otherwise redirect to /#planes with active session
      if (planSlug) {
        router.push(`/planes/${encodeURIComponent(planSlug)}`);
      } else {
        router.push("/#planes");
      }
    } catch {
      setError("Error al guardar tus datos. Intentá de nuevo.");
      setSaving(false);
    }
  };

  const genderOptions: Array<{ label: string; value: "Mujer" | "Hombre" | "Otro" }> = [
    { label: "Mujer", value: "Mujer" },
    { label: "Hombre", value: "Hombre" },
    { label: "Prefiero no decir", value: "Otro" },
  ];

  return (
    <div className="w-full max-w-md rounded-2xl bg-black/85 border border-white/15 p-8 backdrop-blur-md shadow-2xl">
      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <span
          className={`h-1.5 w-10 rounded-full transition-colors ${
            step === 1 ? "bg-[#A08A56]" : "bg-zinc-700"
          }`}
        />
        <span
          className={`h-1.5 w-10 rounded-full transition-colors ${
            step === 2 ? "bg-[#A08A56]" : "bg-zinc-700"
          }`}
        />
      </div>

      {step === 1 ? (
        <div className="space-y-6">
          <div className="text-center">
            <h1
              className="font-black italic uppercase tracking-tight text-white"
              style={{ fontSize: "var(--text-heading-1)" }}
            >
              HOLA 👋
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              Cuéntanos un poco sobre ti para personalizar tu experiencia
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#A08A56] text-center">
              ¿CON QUÉ GÉNERO TE IDENTIFICÁS?
            </label>

            <div className="space-y-2.5 pt-2">
              {genderOptions.map((opt) => {
                const selected = gender === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setGender(opt.value)}
                    data-state={selected ? "active" : "idle"}
                    className={`w-full min-h-[52px] rounded-xl px-5 text-left text-sm font-bold transition-all cursor-pointer flex items-center justify-between border ${
                      selected
                        ? "border-[#A08A56] bg-[#A08A56]/15 text-white"
                        : "border-white/10 bg-zinc-900/80 text-zinc-300 hover:border-white/25"
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span
                      className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        selected ? "border-[#A08A56]" : "border-zinc-600"
                      }`}
                    >
                      {selected && (
                        <span className="h-2 w-2 rounded-full bg-[#A08A56]" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full min-h-[50px] rounded-lg bg-[#A08A56] hover:bg-[#B59E68] text-black text-xs font-black uppercase tracking-[0.2em] transition-colors cursor-pointer"
          >
            CONTINUAR
          </button>
        </div>
      ) : (
        <form onSubmit={handleFinish} className="space-y-6">
          <div className="text-center">
            <h1
              className="font-black italic uppercase tracking-tight text-white"
              style={{ fontSize: "var(--text-heading-1)" }}
            >
              TUS MÉTRICAS
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              Estos datos nos ayudan a personalizar tu plan. Puedes actualizarlos
              después.
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-950/30 border border-red-500/40 p-3 text-xs font-bold text-red-400 text-center">
              {error}
            </div>
          )}

          <div className="space-y-4 tabular-nums">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1.5">
                PESO (KG)
              </label>
              <input
                type="number"
                step="0.1"
                min="25"
                max="250"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="Ej: 65"
                className="w-full min-h-[48px] rounded-lg bg-zinc-900 border border-white/15 px-4 text-sm text-white placeholder:text-zinc-600 focus:border-[#A08A56] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1.5">
                ALTURA (CM)
              </label>
              <input
                type="number"
                min="100"
                max="240"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="Ej: 165"
                className="w-full min-h-[48px] rounded-lg bg-zinc-900 border border-white/15 px-4 text-sm text-white placeholder:text-zinc-600 focus:border-[#A08A56] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1.5">
                EDAD
              </label>
              <input
                type="number"
                min="12"
                max="100"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Ej: 28"
                className="w-full min-h-[48px] rounded-lg bg-zinc-900 border border-white/15 px-4 text-sm text-white placeholder:text-zinc-600 focus:border-[#A08A56] focus:outline-none"
              />
            </div>
          </div>

          <p className="text-[11px] text-zinc-500 text-center">
            Todos los campos son opcionales — puedes completarlos después
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="min-h-[50px] rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-[#D4D4D8] border border-[#3F3F46] text-xs font-bold uppercase tracking-[0.18em] transition-colors cursor-pointer"
            >
              ATRÁS
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-[50px] rounded-lg bg-[#A08A56] hover:bg-[#B59E68] text-black text-xs font-black uppercase tracking-[0.18em] transition-colors cursor-pointer disabled:opacity-60"
            >
              {saving ? "Guardando..." : "¡EMPEZAR!"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-xs uppercase tracking-widest text-zinc-400">CARGANDO...</div>}>
        <OnboardingWizard />
      </Suspense>
    </div>
  );
}
