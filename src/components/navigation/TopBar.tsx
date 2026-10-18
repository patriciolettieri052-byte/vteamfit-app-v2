"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, LayoutDashboard } from "lucide-react";
import { getStoredSession, setStoredSession, type VTeamClientSession } from "@/lib/store";

export function TopBar() {
  const router = useRouter();
  const [session, setSession] = useState<VTeamClientSession | null>(null);

  useEffect(() => {
    setSession(getStoredSession());
    const sync = () => setSession(getStoredSession());
    window.addEventListener("vteamfit-session-change", sync);
    return () => window.removeEventListener("vteamfit-session-change", sync);
  }, []);

  const handleLogout = () => {
    setStoredSession(null);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 h-20 w-full bg-black/90 backdrop-blur-md border-b border-white/10">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/images/logo.svg"
            alt="VTeamFit Logo"
            className="h-9 w-auto object-contain"
          />
          <span className="hidden sm:inline-block text-xs font-black uppercase tracking-[0.25em] text-white">
            VTEAM<span className="text-[#A08A56]">FIT</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/#planes"
            className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-300 hover:text-[#A08A56] transition-colors"
          >
            PLANES
          </Link>
          <Link
            href="/#sobre-mi"
            className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-300 hover:text-[#A08A56] transition-colors"
          >
            SOBRE MÍ
          </Link>
          <Link
            href="/soporte"
            className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-300 hover:text-[#A08A56] transition-colors"
          >
            SOPORTE
          </Link>
        </nav>

        {/* Auth / Session Controls */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 rounded-lg bg-[#A08A56] hover:bg-[#B59E68] text-black text-xs font-black uppercase tracking-widest transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>MI PANEL</span>
              </Link>
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="inline-flex items-center justify-center h-[42px] w-[42px] rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-[#D4D4D8] border border-[#3F3F46] transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-[#D4D4D8] border border-[#3F3F46] text-xs font-bold uppercase tracking-widest transition-colors"
            >
              <User className="h-4 w-4 text-[#A08A56]" />
              <span>ACCESO ALUMNOS</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
