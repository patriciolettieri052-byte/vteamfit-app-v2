"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Tag, CheckCircle2, AlertCircle, ShieldCheck, ArrowRight } from "lucide-react";
import type { PlanRow } from "@/types/sdui";
import { getStoredSession, setStoredSession } from "@/lib/store";

interface PlanCheckoutClientProps {
  plan: PlanRow;
}

export function PlanCheckoutClient({ plan }: PlanCheckoutClientProps) {
  const router = useRouter();
  const [showCouponBox, setShowCouponBox] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount_percent: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [isEnrolledInThisPlan, setIsEnrolledInThisPlan] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [processingPurchase, setProcessingPurchase] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  useEffect(() => {
    async function checkStatus() {
      const session = getStoredSession();
      if (!session?.userId) {
        setCheckingEnrollment(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/profile?userId=${encodeURIComponent(session.userId)}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          const activeMatch = (data.enrollments || []).find(
            (e: { status: string; plan_id: string }) =>
              e.status === "active" && e.plan_id === plan.id
          );
          if (activeMatch) {
            setIsEnrolledInThisPlan(true);
          }
        }
      } catch {
        // Ignore network error on check
      } finally {
        setCheckingEnrollment(false);
      }
    }
    checkStatus();
  }, [plan.id]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    if (!couponInput.trim()) return;

    setValidatingCoupon(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponInput.trim(),
          planSlug: plan.slug,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setAppliedCoupon(null);
        setCouponError(data.error || "Código inválido o expirado");
      } else {
        setAppliedCoupon({
          code: data.code,
          discount_percent: data.discount_percent,
        });
      }
    } catch {
      setCouponError("Error al validar el código");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const basePrice = Number(plan.price_amount);
  const discountPercent = appliedCoupon?.discount_percent || 0;
  const finalPrice = Math.max(0, basePrice * (1 - discountPercent / 100));
  const isFreeWithCoupon = discountPercent >= 100 || finalPrice === 0;

  const handleCheckout = async () => {
    setPurchaseError(null);
    const session = getStoredSession();

    // If user is not authenticated, redirect to /registro?plan=[slug] per PRD
    if (!session?.userId) {
      router.push(`/registro?plan=${encodeURIComponent(plan.slug)}`);
      return;
    }

    // If user already owns this plan, go straight to its target route
    if (isEnrolledInThisPlan) {
      setStoredSession({
        ...session,
        activePlanSlug: plan.slug,
      });
      const targetRoute =
        plan.ui_config?.cta?.post_checkout_route ||
        plan.ui_config?.post_checkout_route ||
        "/dashboard";
      router.push(targetRoute);
      return;
    }

    setProcessingPurchase(true);
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.userId,
          planSlug: plan.slug,
          couponCode: appliedCoupon?.code || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPurchaseError(
          isFreeWithCoupon
            ? "No se pudo asignar el plan gratuito"
            : data.error || "No se pudo asignar el plan"
        );
        setProcessingPurchase(false);
        return;
      }

      // Update activePlanSlug in client session
      setStoredSession({
        ...session,
        activePlanSlug: plan.slug,
      });

      router.push(data.redirectTo || "/dashboard");
    } catch {
      setPurchaseError("No se pudo asignar el plan");
      setProcessingPurchase(false);
    }
  };

  return (
    <div className="rounded-2xl bg-black/90 border border-white/15 p-6 sm:p-8 backdrop-blur-md space-y-6">
      {/* Price Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 block mb-1">
            INVERSIÓN DEL PROGRAMA
          </span>
          <div className="flex items-baseline gap-3 tabular-nums">
            {plan.compare_at_price &&
              Number(plan.compare_at_price) > basePrice &&
              !appliedCoupon && (
                <span className="text-base font-bold text-zinc-500 line-through">
                  ${Number(plan.compare_at_price).toFixed(2)}
                </span>
              )}
            {appliedCoupon && discountPercent > 0 && (
              <span className="text-base font-bold text-zinc-500 line-through">
                ${basePrice.toFixed(2)}
              </span>
            )}
            <span className="text-4xl font-black text-white tracking-tight">
              {isFreeWithCoupon ? "GRATIS" : `$${finalPrice.toFixed(2)}`}
            </span>
            {!isFreeWithCoupon && (
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                {plan.currency || "USD"}{" "}
                {plan.billing_type === "monthly" ? "mensual" : "pago único"}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <ShieldCheck className="h-4 w-4 text-[#A08A56]" />
          <span>Acceso inmediato tras confirmación</span>
        </div>
      </div>

      {/* Coupon Accordion Module */}
      <div>
        <button
          type="button"
          onClick={() => setShowCouponBox((prev) => !prev)}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#A08A56] hover:underline cursor-pointer"
        >
          <Tag className="h-3.5 w-3.5" />
          <span>¿Tienes un código de descuento?</span>
        </button>

        {showCouponBox && (
          <form onSubmit={handleApplyCoupon} className="mt-3 flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              placeholder="CÓDIGO"
              className="flex-1 min-h-[44px] rounded-lg bg-zinc-900 border border-white/15 px-3.5 text-xs font-bold uppercase tracking-widest text-white placeholder:text-zinc-600 focus:border-[#A08A56] focus:outline-none"
            />
            <button
              type="submit"
              disabled={validatingCoupon}
              className="min-h-[44px] px-5 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-[#D4D4D8] border border-[#3F3F46] text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50"
            >
              {validatingCoupon ? "..." : "Aplicar"}
            </button>
          </form>
        )}

        {appliedCoupon && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-950/30 border border-emerald-500/40 px-3.5 py-2.5 text-xs font-bold text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>
              {appliedCoupon.discount_percent >= 100
                ? "Acceso gratuito concedido: 100% OFF"
                : `Descuento aplicado: ${appliedCoupon.discount_percent}% OFF`}
            </span>
          </div>
        )}

        {couponError && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-950/30 border border-red-500/40 px-3.5 py-2.5 text-xs font-bold text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{couponError}</span>
          </div>
        )}
      </div>

      {/* Purchase Error */}
      {purchaseError && (
        <div className="flex items-center gap-2 rounded-lg bg-red-950/30 border border-red-500/40 px-4 py-3 text-xs font-bold text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{purchaseError}</span>
        </div>
      )}

      {/* Primary Action Button */}
      <button
        type="button"
        onClick={handleCheckout}
        disabled={checkingEnrollment || processingPurchase}
        className="w-full min-h-[54px] px-6 py-4 rounded-xl bg-[#A08A56] hover:bg-[#B59E68] text-black text-xs sm:text-sm font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_-5px_rgba(160,138,86,0.4)] cursor-pointer disabled:opacity-60"
      >
        <span>
          {checkingEnrollment
            ? "CARGANDO..."
            : processingPurchase
            ? "PROCESANDO..."
            : isEnrolledInThisPlan
            ? "CONTINUAR"
            : "COMPRAR PLAN"}
        </span>
        <ArrowRight className="h-4 w-4" />
      </button>

      <div className="text-center">
        <p className="text-[11px] text-zinc-500">
          ¿Ya tienes una cuenta activa?{" "}
          <Link
            href={`/login?plan=${encodeURIComponent(plan.slug)}`}
            className="text-[#A08A56] font-bold hover:underline"
          >
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
