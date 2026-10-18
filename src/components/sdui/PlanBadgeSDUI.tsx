import React from "react";
import type { PlanBadgeConfig } from "@/types/sdui";

interface PlanBadgeSDUIProps {
  badge?: PlanBadgeConfig | null;
  className?: string;
}

export function PlanBadgeSDUI({ badge, className = "" }: PlanBadgeSDUIProps) {
  if (!badge || !badge.text) return null;

  const variantClasses =
    badge.variant === "outline"
      ? "border border-[#A08A56] text-[#A08A56] bg-black/80"
      : badge.variant === "dark"
      ? "bg-zinc-900 text-white border border-white/15"
      : "bg-[#A08A56] text-black shadow-md";

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded text-[10px] font-black uppercase tracking-[0.2em] leading-none ${variantClasses} ${className}`}
    >
      {badge.text}
    </span>
  );
}
