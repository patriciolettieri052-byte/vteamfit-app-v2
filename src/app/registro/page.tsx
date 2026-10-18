"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { setStoredSession } from "@/lib/store";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planSlug = searchParams.get("plan");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setError("Este email ya está registrado. ¿Quieres iniciar sesión?");
        } else {
          setError(data.error || "No se pudo crear la cuenta. Intentá de nuevo.");
        }
        setSubmitting(false);
        return;
      }

      setStoredSession({
        userId: data.user.userId,
        email: data.user.email,
        fullName: data.user.fullName,
        role: data.user.role || "user",
        activePlanSlug: planSlug || undefined,
      });

      // Continue to general biometric onboarding, preserving ?plan=[slug] if present
      if (planSlug) {
        router.push(`/onboarding?plan=${encodeURIComponent(planSlug)}`);
      } else {
        router.push("/onboarding");
      }
    } catch {
      setError("No se pudo crear la cuenta. Intentá de nuevo.");
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl bg-black/85 border border-white/15 p-8 backdrop-blur-md shadow-2xl">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block mb-6">
          <img
            src="/images/logo.svg"
            alt="VTeamFit"
            className="h-10 w-auto mx-auto"
          />
        </Link>
        <h1
          className="font-black italic uppercase tracking-tight text-white"
          style={{ fontSize: "var(--text-heading-1)" }}
        >
          CREAR CUENTA
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Último paso para empezar tu transformación
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-950/30 border border-red-500/40 p-3.5 text-xs font-bold text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">
            NOMBRE
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Tu nombre"
            className="w-full min-h-[48px] rounded-lg bg-zinc-900 border border-white/15 px-4 text-sm text-white placeholder:text-zinc-600 focus:border-[#A08A56] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">
            EMAIL
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="w-full min-h-[48px] rounded-lg bg-zinc-900 border border-white/15 px-4 text-sm text-white placeholder:text-zinc-600 focus:border-[#A08A56] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">
            CONTRASEÑA
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className="w-full min-h-[48px] rounded-lg bg-zinc-900 border border-white/15 px-4 text-sm text-white placeholder:text-zinc-600 focus:border-[#A08A56] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full min-h-[50px] rounded-lg bg-[#A08A56] hover:bg-[#B59E68] text-black text-xs font-black uppercase tracking-[0.2em] transition-colors cursor-pointer disabled:opacity-60"
        >
          {submitting ? "Creando cuenta..." : "CREAR CUENTA"}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-white/10 space-y-3 text-center text-xs">
        <div>
          <Link
            href={
              planSlug
                ? `/login?plan=${encodeURIComponent(planSlug)}`
                : "/login"
            }
            className="text-zinc-300 hover:text-[#A08A56] font-bold transition-colors"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
        <p className="text-[11px] text-zinc-500">
          Al registrarte aceptás nuestros{" "}
          <Link href="/politicas" className="underline hover:text-zinc-300">
            términos y condiciones
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-xs uppercase tracking-widest text-zinc-400">CARGANDO...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
