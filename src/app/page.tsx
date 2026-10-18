import React from "react";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase-server";
import type { PlanRow } from "@/types/sdui";
import { TopBar } from "@/components/navigation/TopBar";
import { PlanCardSDUI } from "@/components/sdui/PlanCardSDUI";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createServerSupabase();

  // Fetch published plans ordered by display_order
  const { data: plansData } = await supabase
    .from("plans")
    .select("*")
    .eq("is_published", true)
    .order("display_order", { ascending: true });

  let plans = (plansData || []) as PlanRow[];
  if (plans.length === 0) {
    const { data: fallbackPlans } = await supabase
      .from("plans")
      .select("*")
      .order("display_order", { ascending: true });
    plans = (fallbackPlans || []) as PlanRow[];
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />

      {/* 1. HERO PRINCIPAL */}
      <section className="relative min-h-[82vh] w-full flex items-center justify-center overflow-hidden border-b border-white/10">
        {/* Background Image + Gradient Vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/fotos/inicio.webp"
            alt="Victoria Torres — VTeamFit"
            className="h-full w-full object-cover object-[50%_35%] grayscale contrast-125 opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/55 to-black/75" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20 text-center">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#A08A56] mb-3">
            Planes de entrenamiento para ti
          </p>

          <h1
            className="font-black uppercase tracking-tight text-white leading-[0.95] mb-6"
            style={{ fontSize: "var(--text-display-hero)" }}
          >
            TU MEJOR VERSIÓN
          </h1>

          <p className="mx-auto max-w-2xl text-sm sm:text-base text-zinc-300 leading-relaxed mb-10">
            VTeamFit es una aplicación de fitness creada por Victoria Torres junto a
            Tito Allemandi, bicampeón de pádel mundial con más de 20 años de
            experiencia en el mundo de la competición. Construida desde la constancia y
            conocimiento real.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#planes"
              className="min-h-[52px] px-8 py-4 rounded-lg bg-[#A08A56] hover:bg-[#B59E68] text-black text-xs sm:text-sm font-black uppercase tracking-[0.2em] transition-all shadow-[0_0_25px_-5px_rgba(160,138,86,0.4)] flex items-center justify-center"
            >
              VER PLANES
            </a>
            <Link
              href="/login"
              className="min-h-[52px] px-8 py-4 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-[#D4D4D8] border border-[#3F3F46] text-xs sm:text-sm font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center"
            >
              INICIA SESIÓN
            </Link>
          </div>
        </div>
      </section>

      {/* 2. SECCIÓN: ELIGE TU PLAN (#planes) - 100% SDUI */}
      <section id="planes" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-14">
            <h2
              className="font-black uppercase tracking-tight text-white mb-4"
              style={{ fontSize: "var(--text-heading-1)" }}
            >
              ELIGE TU PLAN
            </h2>
            <div className="mx-auto h-1 w-20 rounded-full bg-[#A08A56]" />
          </div>

          {/* Grid of 5 Plans injected from v2.plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {plans.map((plan) => (
              <PlanCardSDUI key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      </section>

      {/* 3. SECCIÓN: BIOGRAFÍA Y TESTIMONIAL DE VICKY TORRES */}
      <section
        id="sobre-mi"
        className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-black/50"
      >
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center rounded-3xl bg-black/80 border border-white/10 p-6 sm:p-10 lg:p-12 backdrop-blur-md">
            <div className="md:col-span-5 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
              <img
                src="/images/fotos/vicky-torres2.webp"
                alt="Vicky Torres"
                className="h-80 sm:h-96 w-full object-cover object-[30%_center] grayscale contrast-125 hover:grayscale-0 transition-all duration-700"
              />
            </div>

            <div className="md:col-span-7 space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#A08A56] block mb-2">
                  HEAD COACH & FOUNDER
                </span>
                <h2
                  className="font-black uppercase tracking-tight text-white"
                  style={{ fontSize: "var(--text-heading-1)" }}
                >
                  Vicky Torres
                </h2>
                <div className="mt-3 h-1 w-16 rounded-full bg-[#A08A56]" />
              </div>

              <blockquote className="text-base sm:text-lg italic text-zinc-200 leading-relaxed border-l-2 border-[#A08A56] pl-5">
                «“Con VTeamFit quiero que logres tus objetivos, llegando al éxito. Y te
                aseguro, que ese éxito, ¡es la mayor satisfacción que puedes sentir!
                Solo cree en ti.”»
              </blockquote>

              <p className="text-sm text-zinc-400 leading-relaxed">
                Cada programa está estructurado con progresiones reales de fuerza,
                acondicionamiento y prevención de lesiones para que entrenes con un
                sistema claro semana a semana.
              </p>

              <div className="pt-2">
                <a
                  href="#planes"
                  className="inline-flex items-center justify-center min-h-[46px] px-6 py-3 rounded-lg bg-[#A08A56] hover:bg-[#B59E68] text-black text-xs font-black uppercase tracking-[0.18em] transition-colors"
                >
                  EMPEZAR MI CAMBIO
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="mt-auto border-t border-white/10 bg-black/95 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo.svg"
              alt="VTeamFit"
              className="h-7 w-auto object-contain"
            />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              © {new Date().getFullYear()} VTeamFit. Todos los derechos reservados.
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-zinc-400">
            <Link href="/politicas" className="hover:text-[#A08A56] transition-colors">
              Políticas Legales
            </Link>
            <Link href="/soporte" className="hover:text-[#A08A56] transition-colors">
              Soporte y Ayuda
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
