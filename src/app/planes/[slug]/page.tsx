import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase-server";
import type { PlanRow } from "@/types/sdui";
import { TopBar } from "@/components/navigation/TopBar";
import { PlanBadgeSDUI } from "@/components/sdui/PlanBadgeSDUI";
import { PlanCheckoutClient } from "@/components/sdui/PlanCheckoutClient";

export const dynamic = "force-dynamic";

interface PlanDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PlanDetailPage({ params }: PlanDetailPageProps) {
  const { slug } = await params;
  const supabase = createServerSupabase();

  const normalizedSlug = slug.replace(/_/g, "-");
  const underscoreSlug = slug.replace(/-/g, "_");

  const { data: planData } = await supabase
    .from("plans")
    .select("*")
    .or(`slug.eq.${slug},slug.eq.${normalizedSlug},slug.eq.${underscoreSlug},id.eq.${slug},id.eq.${underscoreSlug}`)
    .maybeSingle();

  if (!planData) {
    notFound();
  }

  const plan = planData as PlanRow;
  const ui = plan.ui_config || {};
  const planTitle = plan.name || plan.title || "Plan";
  const planSubtitle = ui.subtitle || plan.tagline;
  const detailTags = Array.isArray(ui.detail_tags) ? ui.detail_tags : [];
  const includesList = Array.isArray(ui.features)
    ? ui.features
    : Array.isArray(ui.includes)
    ? ui.includes
    : [];
  const methodologyList = Array.isArray(ui.methodology) ? ui.methodology : [];
  const methodologyText = typeof ui.methodology === "string" ? ui.methodology : null;
  const systemText = typeof ui.system === "string" ? ui.system : null;
  const durationLabel =
    ui.duration_badge ||
    (plan.total_weeks ? `${plan.total_weeks * 7} DÍAS` : null);

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/#planes"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-[#A08A56] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>← Volver</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Visual & Details */}
          <div className="lg:col-span-7 space-y-8">
            {/* Hero Cover Card */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 h-72 sm:h-80">
              {plan.cover_image_url && (
                <img
                  src={plan.cover_image_url}
                  alt={planTitle}
                  className="h-full w-full object-cover object-center grayscale contrast-125"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />

              {ui.badge && (
                <div className="absolute top-5 left-5">
                  <PlanBadgeSDUI badge={ui.badge} />
                </div>
              )}

              {durationLabel && (
                <div className="absolute top-5 right-5">
                  <span className="inline-block rounded bg-black/75 backdrop-blur-sm border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-300">
                    {durationLabel}
                  </span>
                </div>
              )}

              <div className="absolute bottom-5 left-5 right-5">
                {planSubtitle && (
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A08A56] mb-1">
                    {planSubtitle}
                  </p>
                )}
                <h1
                  className="font-black uppercase tracking-tight text-white leading-none"
                  style={{ fontSize: "var(--text-heading-1)" }}
                >
                  {planTitle}
                </h1>
              </div>
            </div>

            {/* Detail Tags */}
            {detailTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {detailTags.map((tag, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-zinc-900 border border-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[#A08A56]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* About Section */}
            <section className="rounded-2xl bg-black/80 border border-white/10 p-6 sm:p-8 space-y-3">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#A08A56]">
                Acerca de este plan
              </h2>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                {plan.description}
              </p>
            </section>

            {/* Methodology & System Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-black/80 border border-white/10 p-5">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#A08A56] mb-2">
                  METODOLOGÍA
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  {methodologyText ||
                    "Rutinas progresivas enfocadas en resultados reales. Estructuradas para desafiarte durante todo el proceso."}
                </p>
              </div>
              <div className="rounded-2xl bg-black/80 border border-white/10 p-5">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#A08A56] mb-2">
                  SISTEMA
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  {systemText ||
                    "Semanalmente tendrás nuevos retos a desbloquear, seguimiento de pesos e historial."}
                </p>
              </div>
            </div>

            {/* Dynamic Phases / Methodology from v2.plans.ui_config */}
            {methodologyList.length > 0 && (
              <section className="rounded-2xl bg-black/80 border border-white/10 p-6 sm:p-8 space-y-5">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#A08A56]">
                  ESTRUCTURA DEL PROGRAMA
                </h2>
                <div className="space-y-4">
                  {methodologyList.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 border-b border-white/10 pb-4 last:border-b-0 last:pb-0"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#A08A56] text-black text-xs font-black tabular-nums">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-black uppercase text-white">
                          {step.title}
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Includes Checklist */}
            {includesList.length > 0 && (
              <section className="rounded-2xl bg-black/80 border border-white/10 p-6 sm:p-8 space-y-4">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#A08A56]">
                  ¿QUÉ INCLUYE?
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {includesList.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300"
                    >
                      <Check className="h-4 w-4 shrink-0 text-[#A08A56] mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Right Column: Sticky Dual Checkout Box */}
          <div className="lg:col-span-5">
            <div className=" lg:sticky lg:top-28">
              <PlanCheckoutClient plan={plan} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
