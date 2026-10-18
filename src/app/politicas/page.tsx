import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";

export default function PoliticasPage() {
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
          className="font-black italic uppercase tracking-tight text-white border-b border-white/10 pb-4"
          style={{ fontSize: "var(--text-heading-1)" }}
        >
          POLÍTICAS LEGALES
        </h1>

        <div className="space-y-6">
          <section className="rounded-2xl bg-black/80 border border-white/10 p-6 space-y-3">
            <h2 className="text-sm font-black uppercase tracking-[0.18em] text-[#A08A56]">
              Términos de Uso
            </h2>
            <ul className="space-y-2 text-sm text-zinc-300 leading-relaxed list-disc pl-5">
              <li>Al acceder y usar VTeamFit aceptás los presentes términos.</li>
              <li>
                Los planes de entrenamiento son de uso personal e intransferible.
              </li>
              <li>
                El contenido de los planes (videos, rutinas, guías) es propiedad de
                VTeamFit y no puede ser reproducido ni distribuido sin autorización.
              </li>
            </ul>
          </section>

          <section className="rounded-2xl bg-black/80 border border-white/10 p-6 space-y-3">
            <h2 className="text-sm font-black uppercase tracking-[0.18em] text-[#A08A56]">
              Política de Privacidad
            </h2>
            <ul className="space-y-2 text-sm text-zinc-300 leading-relaxed list-disc pl-5">
              <li>
                Los datos que recopilamos (nombre, email, métricas físicas) se usan
                exclusivamente para personalizar tu experiencia en la plataforma.
              </li>
              <li>No compartimos tu información con terceros.</li>
              <li>
                Para solicitar la eliminación de tus datos, escribinos a{" "}
                <a
                  href="mailto:soporte@vteamfit.app"
                  className="text-[#A08A56] font-bold hover:underline"
                >
                  soporte@vteamfit.app
                </a>
                .
              </li>
            </ul>
          </section>

          <section className="rounded-2xl bg-black/80 border border-white/10 p-6 space-y-3">
            <h2 className="text-sm font-black uppercase tracking-[0.18em] text-[#A08A56]">
              Responsabilidad y Salud
            </h2>
            <ul className="space-y-2 text-sm text-zinc-300 leading-relaxed list-disc pl-5">
              <li>
                VTeamFit no se hace responsable de ninguna lesión que pueda sufrir el
                cliente durante la realización de los entrenamientos.
              </li>
              <li>
                No nos hacemos responsables si el cliente no percibe cambios físicos o
                mejoras; cada usuario es responsable de su propio progreso y de la
                correcta ejecución de los ejercicios.
              </li>
              <li>
                Recomendamos consultar con un profesional de la salud antes de
                comenzar cualquier programa de ejercicio intenso.
              </li>
            </ul>
          </section>

          <section className="rounded-2xl bg-black/80 border border-white/10 p-6 space-y-3">
            <h2 className="text-sm font-black uppercase tracking-[0.18em] text-[#A08A56]">
              Pagos y Reembolsos
            </h2>
            <ul className="space-y-2 text-sm text-zinc-300 leading-relaxed list-disc pl-5">
              <li>Los pagos se procesan de forma segura a través de PayPal.</li>
              <li>
                Una vez activado el plan, no se realizan reembolsos. Si tienes un
                problema, contáctanos a{" "}
                <a
                  href="mailto:soporte@vteamfit.app"
                  className="text-[#A08A56] font-bold hover:underline"
                >
                  soporte@vteamfit.app
                </a>
                .
              </li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
