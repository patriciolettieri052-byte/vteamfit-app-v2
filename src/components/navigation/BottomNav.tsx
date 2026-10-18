"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, BarChart3, User, Home } from "lucide-react";

interface BottomNavProps {
  currentWeek?: number;
}

export function BottomNav({ currentWeek = 1 }: BottomNavProps) {
  const pathname = usePathname();

  const items = [
    {
      label: "INICIO",
      href: "/dashboard",
      icon: Home,
      active: pathname === "/dashboard",
    },
    {
      label: "RUTINA",
      href: `/dashboard/semana/${currentWeek}`,
      icon: Dumbbell,
      active: pathname.startsWith("/dashboard/semana"),
    },
    {
      label: "PROGRESO",
      href: "/dashboard/stats",
      icon: BarChart3,
      active: pathname.startsWith("/dashboard/stats"),
    },
    {
      label: "PERFIL",
      href: "/dashboard/perfil",
      icon: User,
      active: pathname.startsWith("/dashboard/perfil"),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-black/95 backdrop-blur-lg border-t border-white/10">
      <div className="mx-auto grid h-full max-w-lg grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 text-[10px] font-black uppercase tracking-[0.15em] transition-colors ${
                item.active
                  ? "text-[#A08A56]"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
