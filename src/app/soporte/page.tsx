import React from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";

export default function SoportePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-10 sm:py-14 space-y-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-[#A08A56] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver</span>
          </Link>
        </div>

        <h1
          className="font-black uppercase tracking-tight text-white border-b border-white/10 pb-4"
          style={{ fontSize: "var(--text-heading-1)" }}
        >
          SOPORTE Y AYUDA
        </h1>

        <section className="rounded-2xl bg-black/80 border border-white/10 p-6 sm:p-8 space-y-3">
          <h2 className="text-sm font-black uppercase tracking-[0.18em] text-[#A08A56]">
            Contacto
          </h2>
          <p className="text-sm text-zinc-300">Para consultas, escríbenos a:</p>
          <a
            href="mailto:soporte@vteamfit.app"
            className="inline-flex items-center gap-2 text-base font-black text-white hover:text-[#A08A56] transition-colors"
          >
            <Mail className="h-4 w-4 text-[#A08A56]" />
            <span>soporte@vteamfit.app</span>
          </a>
        </section>

        <section className="rounded-2xl bg-black/80 border border-white/10 p-6 sm:p-8 space-y-6">
          <h2 className="text-sm font-black uppercase tracking-[0.18em] text-[#A08A56]">
            Preguntas Frecuentes
          </h2>

          <div className="space-y-5 divide-y divide-white/10">
            <div className="pt-4 first:pt-0">
              <h3 className="text-sm font-black text-white mb-1">
                ¿Cómo accedo a mi plan de entrenamiento?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Ingresa con tu usuario y contraseña. Tu plan estará disponible en tu
                dashboard personal.
              </p>
            </div>

            <div className="pt-4">
              <h3 className="text-sm font-black text-white mb-1">
                ¿Puedo pausar mi plan?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Una vez activado el plan, no se realizan reembolsos. Si tienes un
                problema, contáctanos a soporte@vteamfit.app.
              </p>
            </div>

            <div className="pt-4">
              <h3 className="text-sm font-black text-white mb-1">
                ¿Cómo registro mi progreso?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Desde tu dashboard puedes registrar tu peso semanal y marcar los días
                completados.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
