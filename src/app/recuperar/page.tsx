"use client";

import React, { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    try {
      await supabase.auth.resetPasswordForEmail(email.trim());
    } catch {
      // Proceed to confirmation screen regardless to avoid email enumeration
    } finally {
      setSending(false);
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-black/85 border border-white/15 p-8 backdrop-blur-md shadow-2xl text-center">
        <Link href="/" className="inline-block mb-6">
          <img
            src="/images/logo.svg"
            alt="VTeamFit"
            className="h-10 w-auto mx-auto"
          />
        </Link>

        {sent ? (
          <div className="space-y-4">
            <div className="text-4xl">📧</div>
            <h1
              className="font-black uppercase tracking-tight text-white"
              style={{ fontSize: "var(--text-heading-1)" }}
            >
              REVISÁ TU EMAIL
            </h1>
            <p className="text-sm text-zinc-400">
              Te enviamos un link para recuperar tu contraseña
            </p>
            <div className="pt-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-lg bg-[#A08A56] hover:bg-[#B59E68] text-black text-xs font-black uppercase tracking-[0.2em] transition-colors"
              >
                Volver al login
              </Link>
            </div>
          </div>
        ) : (
          <>
            <h1
              className="font-black uppercase tracking-tight text-white"
              style={{ fontSize: "var(--text-heading-2)" }}
            >
              RECUPERAR CONTRASEÑA
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 mb-6">
              Te enviamos un link a tu email para resetear tu contraseña
            </p>

            <form onSubmit={handleSubmit} className="space-y-5 text-left">
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

              <button
                type="submit"
                disabled={sending}
                className="w-full min-h-[50px] rounded-lg bg-[#A08A56] hover:bg-[#B59E68] text-black text-xs font-black uppercase tracking-[0.2em] transition-colors cursor-pointer disabled:opacity-60"
              >
                {sending ? "Enviando..." : "ENVIAR LINK"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10">
              <Link
                href="/login"
                className="text-xs font-bold text-zinc-400 hover:text-[#A08A56] transition-colors"
              >
                Volver al login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
