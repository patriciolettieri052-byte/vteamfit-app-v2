"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { setStoredSession } from "@/lib/store";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planSlug = searchParams.get("plan");
  const expired = searchParams.get("expired");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Email o contraseña incorrectos");
        setSubmitting(false);
        return;
      }

      const activeEnrollments = data.activeEnrollments || [];
      const firstActivePlanSlug = activeEnrollments[0]?.plan?.slug;

      setStoredSession({
        userId: data.user.userId,
        email: data.user.email,
        fullName: data.user.fullName,
        role: data.user.role,
        activePlanSlug: planSlug || firstActivePlanSlug,
      });

      // PRD Section 4.1 & 4.2 Routing Decision
      if (planSlug) {
        // User came from /planes/[slug] -> return to /planes/[slug] to complete COMPRAR PLAN
        router.push(`/planes/${encodeURIComponent(planSlug)}`);
        return;
      }

      const isStaff = data.user.role === "admin" || data.user.role === "coach";
      if (activeEnrollments.length > 0 || isStaff) {
        router.push("/dashboard");
      } else {
        // Authenticated user without active plan -> redirect to /#planes
        router.push("/#planes");
      }
    } catch {
      setError("Email o contraseña incorrectos");
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
          className="font-black uppercase tracking-tight text-white"
          style={{ fontSize: "var(--text-heading-1)" }}
        >
          BIENVENIDA
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Iniciá sesión para continuar tu entrenamiento
        </p>
      </div>

      {expired && (
        <div className="mb-6 rounded-xl bg-zinc-900 border border-[#A08A56]/50 p-4 text-xs text-zinc-200 text-center">
          Tu plan ha vencido o aún no tienes un plan activo.{" "}
          <Link href="/#planes" className="text-[#A08A56] font-bold underline">
            Ver planes disponibles
          </Link>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-950/30 border border-red-500/40 p-3.5 text-xs font-bold text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full min-h-[48px] rounded-lg bg-zinc-900 border border-white/15 px-4 text-sm text-white placeholder:text-zinc-600 focus:border-[#A08A56] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full min-h-[50px] rounded-lg bg-[#A08A56] hover:bg-[#B59E68] text-black text-xs font-black uppercase tracking-[0.2em] transition-colors cursor-pointer disabled:opacity-60"
        >
          {submitting ? "Iniciando..." : "INICIAR SESIÓN"}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-white/10 space-y-3 text-center text-xs">
        <div>
          <Link
            href="/recuperar"
            className="text-zinc-400 hover:text-[#A08A56] transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <div>
          <span className="text-zinc-500">¿No tienes cuenta? </span>
          <Link
            href={
              planSlug
                ? `/registro?plan=${encodeURIComponent(planSlug)}`
                : "/registro"
            }
            className="text-[#A08A56] font-bold hover:underline"
          >
            Crear cuenta
          </Link>
        </div>
        <div>
          <Link
            href="/#planes"
            className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white font-bold uppercase tracking-widest text-[10px] pt-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Ver planes disponibles</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-xs uppercase tracking-widest text-zinc-400">CARGANDO...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
