import React from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import type { PlanRow } from "@/types/sdui";
import { PlanBadgeSDUI } from "./PlanBadgeSDUI";

interface PlanCardSDUIProps {
  plan: PlanRow;
}

export function PlanCardSDUI({ plan }: PlanCardSDUIProps) {
  const ui = plan.ui_config || {};
  const isFeatured = Boolean(ui.is_featured || ui.card_variant === "featured");
  const features = Array.isArray(ui.features)
    ? ui.features
    : Array.isArray(ui.card_features)
    ? ui.card_features
    : [];
  const ctaLabel = ui.cta?.label || ui.cta_label || "EMPEZAR AHORA";
  const planTitle = plan.name || plan.title || "PLAN";
  const planSubtitle = ui.subtitle || plan.tagline;
  const durationLabel =
    ui.duration_badge ||
    (plan.total_weeks ? `${plan.total_weeks} SEMANAS` : plan.duration_weeks ? `${plan.duration_weeks} SEMANAS` : null);

  const billingLabel =
    plan.billing_type === "mensual" || plan.billing_type === "monthly"
      ? " / MES"
      : plan.billing_type === "trimestral"
      ? " / TRIMESTRAL"
      : " · PAGO ÚNICO";

  const imagePosition = ui.image_position || "center";

  return (
    <article
      data-featured={isFeatured ? "true" : "false"}
      className={`group relative flex flex-col justify-between rounded-2xl bg-black/85 backdrop-blur-md transition-all duration-300 overflow-hidden ${
        isFeatured
          ? "border-2 border-[#A08A56] shadow-[0_0_25px_-5px_rgba(160,138,86,0.25)]"
          : "border border-white/10 hover:border-white/25"
      }`}
    >
      {/* Top Section: Cover Image + Badge */}
      <div>
        <div className="relative h-56 w-full overflow-hidden bg-zinc-950">
          {plan.cover_image_url ? (
            <img
              src={plan.cover_image_url}
              alt={planTitle}
              style={{ objectPosition: imagePosition }}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="h-full w-full bg-zinc-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />

          {/* Badge */}
          {ui.badge && (
            <div className="absolute top-4 left-4 z-10">
              <PlanBadgeSDUI badge={ui.badge} />
            </div>
          )}

          {/* Duration / Level Tag */}
          {durationLabel && (
            <div className="absolute top-4 right-4 z-10">
              <span className="inline-block rounded bg-black/75 backdrop-blur-sm border border-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-300">
                {durationLabel}
              </span>
            </div>
          )}

          {/* Title & Subtitle Overlay at bottom of image */}
          <div className="absolute bottom-3 left-5 right-5 z-10">
            {planSubtitle && (
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A08A56] mb-1">
                {planSubtitle}
              </p>
            )}
            <h3 className="text-2xl font-black italic uppercase tracking-tight text-white leading-tight">
              {planTitle}
            </h3>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 pb-4">
          {plan.description && (
            <p className="text-sm text-zinc-400 leading-relaxed mb-5 line-clamp-3">
              {plan.description}
            </p>
          )}

          {/* Price Block */}
          <div className="mb-6 pb-5 border-b border-white/10 flex items-baseline gap-2.5 tabular-nums">
            {plan.compare_at_price && Number(plan.compare_at_price) > Number(plan.price_amount) && (
              <span className="text-sm font-bold text-zinc-500 line-through">
                ${Number(plan.compare_at_price).toFixed(2)}
              </span>
            )}
            <span className="text-3xl font-black text-white tracking-tight">
              ${Number(plan.price_amount).toFixed(2)}
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              {plan.currency || "USD"}
              {billingLabel}
            </span>
          </div>

          {/* Checklist Features */}
          {features.length > 0 && (
            <ul className="space-y-2.5 mb-6">
              {features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                  <Check className="h-4 w-4 shrink-0 text-[#A08A56] mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="p-6 pt-0">
        <Link
          href={`/planes/${plan.slug}`}
          className={`w-full min-h-[48px] px-5 py-3.5 rounded-lg flex items-center justify-center gap-2 text-xs uppercase tracking-[0.15em] transition-all duration-200 ${
            isFeatured
              ? "bg-[#A08A56] hover:bg-[#B59E68] text-black font-black shadow-lg"
              : "bg-[#27272A] hover:bg-[#3F3F46] text-[#D4D4D8] border border-[#3F3F46] font-bold"
          }`}
        >
          <span>{ctaLabel}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}
