"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Trophy, ArrowRight } from "lucide-react";

function CelebrationContent() {
  const searchParams = useSearchParams();
  const exercisesCount = searchParams.get("exercises") || "6";
  const minutesCount = searchParams.get("minutes") || "45";

  return (
    <div className="w-full max-w-md rounded-3xl bg-black/90 border-2 border-[#A08A56] p-8 sm:p-10 backdrop-blur-md shadow-[0_0_35px_-5px_rgba(160,138,86,0.35)] text-center space-y-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#A08A56] text-black shadow-lg">
        <Trophy className="h-8 w-8" />
      </div>

      <div className="space-y-2">
        <h2
          className="font-black italic uppercase tracking-tight text-white"
          style={{ fontSize: "var(--text-heading-1)" }}
        >
          ¡MISIÓN CUMPLIDA!
        </h2>
        <p className="text-sm text-zinc-300">
          Has dado un paso más hacia tu mejor versión.
        </p>
      </div>

      {/* Metrics Box */}
      <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/10 tabular-nums">
        <div className="rounded-xl bg-zinc-900/90 border border-white/10 p-4">
          <span className="block text-3xl font-black text-[#A08A56]">
            {exercisesCount}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            EJERCICIOS
          </span>
        </div>
        <div className="rounded-xl bg-zinc-900/90 border border-white/10 p-4">
          <span className="block text-3xl font-black text-white">
            {minutesCount} <span className="text-sm font-bold text-[#A08A56]">min</span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            TIEMPO TOTAL
          </span>
        </div>
      </div>

      <blockquote className="text-xs sm:text-sm italic text-zinc-400">
        «“La disciplina es el puente entre tus metas y tus logros.”»
      </blockquote>

      <Link
        href="/dashboard"
        className="w-full min-h-[52px] rounded-xl bg-[#A08A56] hover:bg-[#B59E68] text-black text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg"
      >
        <span>VOLVER AL DASHBOARD</span>
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default function CelebrationSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-xs uppercase tracking-widest text-zinc-400">CARGANDO...</div>}>
        <CelebrationContent />
      </Suspense>
    </div>
  );
}
