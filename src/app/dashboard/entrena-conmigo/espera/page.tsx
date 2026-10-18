import React from "react";
import Link from "next/link";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function EntrenaConmigoEsperaPage() {
  const supabase = createServerSupabase();

  // Read whatsapp_phone dynamically from v2.plans.ui_config (SDUI)
  const { data: planData } = await supabase
    .from("plans")
    .select("ui_config")
    .eq("slug", "entrena_conmigo")
    .maybeSingle();

  const rawPhone =
    planData?.ui_config?.whatsapp_phone || "+34600000000";
  const cleanPhone = rawPhone.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    "Hola Vicky, acabo de completar mi formulario del plan Entrena Conmigo en VTeamFit."
  )}`;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl bg-black/85 border border-[#A08A56] p-8 sm:p-10 backdrop-blur-md shadow-[0_0_25px_-5px_rgba(160,138,86,0.25)] text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#A08A56]/15 border border-[#A08A56] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#A08A56]">
          <span>● EN PREPARACIÓN ●</span>
        </div>

        <div className="space-y-2">
          <h1
            className="font-black uppercase tracking-tight text-white"
            style={{ fontSize: "var(--text-heading-1)" }}
          >
            ¡GRACIAS!
          </h1>
          <p className="text-base font-bold text-[#A08A56]">
            Tu plan está en preparación.
          </p>
        </div>

        <p className="text-sm text-zinc-300 leading-relaxed">
          Vicky está revisando tus respuestas y diseñando tu entrenamiento
          personalizado. Te contactará en las próximas 24-48hs por WhatsApp.
        </p>

        <div className="pt-2 space-y-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[52px] rounded-xl bg-[#A08A56] hover:bg-[#B59E68] text-black text-xs font-black uppercase tracking-[0.18em] transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <MessageCircle className="h-4 w-4" />
            <span>ESCRIBIR A VICKY POR WHATSAPP</span>
          </a>

          <Link
            href="/dashboard"
            className="w-full min-h-[46px] rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-[#D4D4D8] border border-[#3F3F46] text-xs font-bold uppercase tracking-[0.18em] transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>VOLVER AL DASHBOARD</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
