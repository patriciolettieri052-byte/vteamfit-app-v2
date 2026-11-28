"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Flame } from "lucide-react";
import { useVTeamStore } from "@/lib/store";
import { resolveMediaUrl } from "@/lib/supabase";
import type { ExerciseCatalogRow } from "@/types/sdui";
import { TopBar } from "@/components/navigation/TopBar";
import { BottomNav } from "@/components/navigation/BottomNav";

const DEFAULT_PRE_PARTIDO_DESCRIPTION =
  "Este es el calentamiento ideal para realizar justo antes de entrar a pista en un partido de pádel. Activa progresivamente hombros, cadera, rodillas y musculatura estabilizadora, mejora la movilidad articular y prepara el sistema neuromuscular para reaccionar con rapidez desde el primer punto, reduciendo al mínimo el riesgo de lesiones.";

export default function PrePartidoPage() {
  const router = useRouter();
  const { loading, session, activeEnrollment } = useVTeamStore();

  const [exercise, setExercise] = useState<ExerciseCatalogRow | null>(null);
  const [loadingExercise, setLoadingExercise] = useState(true);
  const [isVerticalVideo, setIsVerticalVideo] = useState(false);

  useEffect(() => {
    if (!loading && !session?.userId) {
      router.replace("/login");
    }
  }, [loading, session, router]);

  useEffect(() => {
    async function loadPrePartido() {
      setLoadingExercise(true);
      try {
        const res = await fetch(
          "/api/workouts?exerciseSlug=calentamiento-pre-partido-padel",
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          setExercise(data.exercise || null);
        }
      } catch (err) {
        console.error("Error loading pre-partido exercise:", err);
      } finally {
        setLoadingExercise(false);
      }
    }
    loadPrePartido();
  }, []);

  const videoUrl = resolveMediaUrl(
    exercise?.video_path || exercise?.video_url
  );

  useEffect(() => {
    setIsVerticalVideo(
      Boolean(videoUrl && /(calentamiento|activacion-padel|circuito[1-5])/i.test(videoUrl))
    );
  }, [videoUrl]);
  const displayName =
    exercise?.name || "Calentamiento Pre-Partido de Padel";
  const descriptionText =
    (Array.isArray(exercise?.instructions)
      ? exercise.instructions.join(" ")
      : exercise?.instructions) || DEFAULT_PRE_PARTIDO_DESCRIPTION;

  return (
    <div className="min-h-screen pb-24 flex flex-col">
      <TopBar />

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-8 space-y-6">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-[#A08A56] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al Dashboard</span>
          </Link>
        </div>

        <header className="space-y-1">
          <span className="inline-block rounded bg-[#A08A56] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-black">
            PRE-PARTIDO
          </span>
          <h1
            className="font-black uppercase italic tracking-tight text-white"
            style={{ fontSize: "var(--text-heading-1)" }}
          >
            {displayName}
          </h1>
        </header>

        {/* Video Player Container */}
        <div
          className={`relative overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl transition-all duration-300 ${
            isVerticalVideo ? "aspect-[4/5] sm:aspect-video" : "aspect-video"
          }`}
        >
          {loadingExercise ? (
            <div className="h-full w-full flex items-center justify-center text-xs font-bold uppercase tracking-widest text-zinc-500">
              CARGANDO VIDEO...
            </div>
          ) : videoUrl ? (
            isVerticalVideo ? (
              <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-black">
                <video
                  src={videoUrl}
                  aria-hidden="true"
                  playsInline
                  loop
                  muted
                  autoPlay
                  className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-35 pointer-events-none"
                />
                <video
                  key={videoUrl}
                  src={videoUrl}
                  poster={resolveMediaUrl(exercise?.thumbnail_url) || undefined}
                  playsInline
                  loop
                  muted
                  autoPlay
                  controls
                  onLoadedMetadata={(e) => {
                    const v = e.currentTarget;
                    if (v.videoHeight > v.videoWidth) {
                      setIsVerticalVideo(true);
                    }
                  }}
                  className="relative z-10 max-h-full max-w-full object-contain"
                />
              </div>
            ) : (
              <video
                key={videoUrl}
                src={videoUrl}
                poster={resolveMediaUrl(exercise?.thumbnail_url) || undefined}
                playsInline
                loop
                muted
                autoPlay
                controls
                onLoadedMetadata={(e) => {
                  const v = e.currentTarget;
                  if (v.videoHeight > v.videoWidth) {
                    setIsVerticalVideo(true);
                  }
                }}
                className="h-full w-full object-cover bg-zinc-950"
              />
            )
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center bg-zinc-950 p-6 text-center space-y-2">
              <Flame className="h-8 w-8 text-[#A08A56]" />
              <p className="text-xs font-bold uppercase tracking-widest text-[#A08A56]">
                PRE-PARTIDO
              </p>
              <p className="text-sm font-black uppercase text-white">
                {displayName}
              </p>
              <p className="text-xs text-zinc-400 max-w-sm">
                Video pendiente de vinculación en Bunny CDN.
              </p>
            </div>
          )}
        </div>

        {/* AI Description Box */}
        <div className="rounded-2xl bg-black/80 border border-[#A08A56]/40 p-5 sm:p-6 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A08A56] block">
            CALENTAMIENTO IDEAL PRE-PARTIDO
          </span>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {descriptionText}
          </p>
        </div>
      </main>

      <BottomNav currentWeek={activeEnrollment?.current_week || 1} />
    </div>
  );
}
