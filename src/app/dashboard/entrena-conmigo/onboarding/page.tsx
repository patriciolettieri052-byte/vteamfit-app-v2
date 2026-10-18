"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredSession } from "@/lib/store";

export default function EntrenaConmigoOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [goal, setGoal] = useState("Perder peso");
  const [daysPerWeek, setDaysPerWeek] = useState("4 días");
  const [equipment, setEquipment] = useState("Gimnasio completo");
  const [injuries, setInjuries] = useState("");
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyEnrollment() {
      const session = getStoredSession();
      if (!session?.userId) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(
          `/api/profile?userId=${encodeURIComponent(session.userId)}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          const entrenaEnrollment = (data.enrollments || []).find(
            (e: {
              status: string;
              plan_id?: string;
              plan?: { slug?: string; id?: string };
              onboarding_data?: Record<string, unknown> | null;
            }) =>
              e.status === "active" &&
              (e.plan_id === "entrena_conmigo" ||
                e.plan?.id === "entrena_conmigo" ||
                e.plan?.slug === "entrena-conmigo" ||
                e.plan?.slug === "entrena_conmigo")
          );

          // If onboarding_data already exists in v2.user_enrollments, skip straight to /espera
          if (
            entrenaEnrollment?.onboarding_data &&
            Object.keys(entrenaEnrollment.onboarding_data).length > 0
          ) {
            router.replace("/dashboard/entrena-conmigo/espera");
            return;
          }
        }
      } catch {
        // Proceed with wizard
      } finally {
        setCheckingExisting(false);
      }
    }
    verifyEnrollment();
  }, [router]);

  const handleSubmit = async () => {
    setError(null);
    const session = getStoredSession();
    if (!session?.userId) {
      router.push("/login");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/enrollments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.userId,
          planSlug: "entrena_conmigo",
          onboardingData: {
            goal,
            days_per_week: daysPerWeek,
            equipment,
            injuries: injuries.trim() || "Ninguna",
            completed_at: new Date().toISOString(),
          },
        }),
      });

      if (!res.ok) {
        setError("Ocurrió un error. Intentá de nuevo.");
        setSubmitting(false);
        return;
      }

      router.push("/dashboard/entrena-conmigo/espera");
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
      setSubmitting(false);
    }
  };

  if (checkingExisting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          CARGANDO...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl bg-black/85 border border-white/15 p-8 backdrop-blur-md shadow-2xl space-y-6">
        <div className="text-center">
          <span className="text-[10px] font-black italic uppercase tracking-[0.25em] text-[#A08A56] block mb-2">
            ENTRENA CONMIGO
          </span>
          <h1
            className="font-black italic uppercase tracking-tight text-white"
            style={{ fontSize: "var(--text-heading-1)" }}
          >
            CUÉNTANOS SOBRE TI
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Vicky diseñará tu plan según estas respuestas
          </p>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#A08A56] mt-4 tabular-nums">
            Paso {step} de 4
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-colors ${
                idx <= step ? "bg-[#A08A56]" : "bg-zinc-800"
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="rounded-xl bg-red-950/30 border border-red-500/40 p-3 text-xs font-bold text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Step 1: Objetivo */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wide text-white">
              ¿Cuál es tu objetivo principal?
            </h2>
            <div className="space-y-2.5">
              {["Perder peso", "Ganar músculo", "Mejorar rendimiento", "Otro"].map(
                (opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setGoal(opt)}
                    className={`w-full min-h-[50px] rounded-xl px-4 text-left text-sm font-bold border transition-all cursor-pointer ${
                      goal === opt
                        ? "border-[#A08A56] bg-[#A08A56]/15 text-white"
                        : "border-white/10 bg-zinc-900 text-zinc-300 hover:border-white/25"
                    }`}
                  >
                    {opt}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Step 2: Frecuencia */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wide text-white">
              ¿Cuántos días por semana puedes entrenar?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {["2 días", "3 días", "4 días", "5 días", "6 días"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setDaysPerWeek(opt)}
                  className={`min-h-[50px] rounded-xl px-4 text-center text-sm font-bold border transition-all cursor-pointer ${
                    daysPerWeek === opt
                      ? "border-[#A08A56] bg-[#A08A56]/15 text-white"
                      : "border-white/10 bg-zinc-900 text-zinc-300 hover:border-white/25"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Material */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wide text-white">
              ¿Qué equipamiento tienes disponible?
            </h2>
            <div className="space-y-2.5">
              {[
                "Gimnasio completo",
                "Equipamiento en casa",
                "Solo peso corporal",
              ].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setEquipment(opt)}
                  className={`w-full min-h-[50px] rounded-xl px-4 text-left text-sm font-bold border transition-all cursor-pointer ${
                    equipment === opt
                      ? "border-[#A08A56] bg-[#A08A56]/15 text-white"
                      : "border-white/10 bg-zinc-900 text-zinc-300 hover:border-white/25"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Lesiones */}
        {step === 4 && (
          <div className="space-y-3">
            <h2 className="text-sm font-black uppercase tracking-wide text-white">
              ¿Tienes alguna lesión, dolor o limitación física?
            </h2>
            <p className="text-xs text-zinc-400">
              Opcional. Vicky lo tendrá en cuenta al armar tu rutina.
            </p>
            <textarea
              rows={4}
              value={injuries}
              onChange={(e) => setInjuries(e.target.value)}
              placeholder="Ej: Molestia en rodilla derecha al hacer sentadillas, lumbalgia ocasional..."
              className="w-full rounded-xl bg-zinc-900 border border-white/15 p-4 text-sm text-white placeholder:text-zinc-600 focus:border-[#A08A56] focus:outline-none"
            />
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center gap-3 pt-4">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)}
              className="flex-1 min-h-[50px] rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-[#D4D4D8] border border-[#3F3F46] text-xs font-bold uppercase tracking-[0.18em] transition-colors cursor-pointer"
            >
              ATRÁS
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4)}
              className="flex-1 min-h-[50px] rounded-lg bg-[#A08A56] hover:bg-[#B59E68] text-black text-xs font-black uppercase tracking-[0.18em] transition-colors cursor-pointer"
            >
              CONTINUAR
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="flex-1 min-h-[50px] rounded-lg bg-[#A08A56] hover:bg-[#B59E68] text-black text-xs font-black uppercase tracking-[0.18em] transition-colors cursor-pointer disabled:opacity-60"
            >
              {submitting ? "Enviando..." : "ENVIAR RESPUESTAS"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
