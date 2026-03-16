"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { RSPanel } from "@/components/rs/RSPanel";
import { BillingToggle } from "@/components/pricing/BillingToggle";
import { PricingCard } from "@/components/pricing/PricingCard";
import { PLANS, type PlanId } from "@/lib/plans";
import {
  PLAN_CONTENT,
  FAQs,
  PERSONA_CONTENT,
  Persona,
} from "@/lib/marketing/plans-content";
import { getSuggestedPlan } from "@/lib/marketing/plans-intent";
import { trackEvent } from "@/lib/analytics";
import { Loader2, Check } from "lucide-react";

// Split plan order for structured display
const BASIC_PLANS: PlanId[] = ["free", "pro", "team"];
const SCALE_PLANS: PlanId[] = ["agency", "enterprise"];

export default function PlansPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-rs-text-tertiary" />
        </div>
      }
    >
      <PlansContent />
    </Suspense>
  );
}

function PlansContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paramSource = searchParams.get("source") || "direct";
  const paramPlan = searchParams.get("plan") as PlanId | null;
  const paramInterval = searchParams.get("interval") as
    | "monthly"
    | "annual"
    | null;
  const paramPersona = searchParams.get("persona") as Persona | null;

  const suggested = getSuggestedPlan({
    source: paramSource,
    plan: paramPlan || undefined,
    interval: paramInterval || undefined,
    persona: paramPersona || undefined,
  });

  const [interval, setInterval] = useState<"monthly" | "annual">(
    suggested.interval
  );
  const [persona, setPersona] = useState<Persona>(suggested.persona);
  const [error, setError] = useState<string | null>(
    searchParams.get("canceled") ? "Checkout canceled" : null
  );

  // Sync state if URL changes
  useEffect(() => {
    if (paramPersona && paramPersona !== persona) {
      setPersona(paramPersona);
    }
  }, [paramPersona, persona]);

  // Track page view
  useEffect(() => {
    trackEvent('plans_page_viewed', { 
        source: paramSource, 
        default_persona: suggested.persona, 
        default_plan: suggested.plan || 'none' 
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectPlan = async (
    planId: PlanId,
    billingInterval: "monthly" | "annual"
  ) => {
    setError(null);
    trackEvent('checkout_initiated', { planId, interval: billingInterval, persona });

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          interval: billingInterval,
          purchaseType: "subscription",
        }),
      });

      const data = await response.json();

      if (data.error) {
        if (response.status === 401) {
          // Not logged in - redirect to standard register route mapping intent
          router.push(
            `/register?plan=${planId}&interval=${billingInterval}&persona=${persona}`
          );
          return;
        }
        setError(data.error);
        return;
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Failed to start checkout");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const plansToShow =
    persona === "agency" || persona === "enterprise"
      ? SCALE_PLANS
      : BASIC_PLANS;
  const activePersonaContent =
    persona === "agency" || persona === "enterprise"
      ? PERSONA_CONTENT[persona]
      : null;

  return (
    <div className="min-h-screen bg-[var(--rs-bg-base)]">
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
                        radial-gradient(circle at 1px 1px, rgba(0,0,0,0.06) 1px, transparent 0)
                    `,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--rs-bg-secondary)] border border-[var(--rs-border-primary)] rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--rs-signal)] animate-pulse" />
            <span className="rs-type-mono text-[10px] tracking-widest text-[var(--rs-text-secondary)]">
              CLEARANCE_PLANS_V2
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-[var(--rs-text-primary)] uppercase tracking-tighter">
            Choose Your{" "}
            <span className="text-[var(--rs-signal)]">Clearance</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--rs-text-secondary)] max-w-2xl mx-auto">
            Protect your content from AI risk. Start free, upgrade to scale
            enforcement.
          </p>

          {/* Persona Switcher & Billing Toggle Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8">
            <div className="flex items-center p-1 bg-[var(--rs-bg-surface)] border border-[var(--rs-border-primary)] rounded-[var(--rs-radius-container)] shadow-[var(--rs-shadow-l1)]">
              <button
                onClick={() => {
                  trackEvent('plans_persona_selected', { persona: 'default' });
                  setPersona("default");
                }}
                className={`px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition-all rounded-[var(--rs-radius-element)] ${
                  persona === "default"
                    ? "bg-[var(--rs-bg-element)] text-[var(--rs-text-primary)] shadow-sm"
                    : "text-[var(--rs-text-tertiary)] hover:text-[var(--rs-text-primary)]"
                }`}
              >
                Individuals & Teams
              </button>
              <button
                onClick={() => {
                  trackEvent('plans_persona_selected', { persona: 'agency' });
                  setPersona("agency");
                }}
                className={`px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition-all rounded-[var(--rs-radius-element)] ${
                  persona === "agency" || persona === "enterprise"
                    ? "bg-[var(--rs-bg-element)] text-[var(--rs-text-primary)] shadow-sm"
                    : "text-[var(--rs-text-tertiary)] hover:text-[var(--rs-text-primary)]"
                }`}
              >
                Scale Operations
              </button>
            </div>

            <div className="hidden sm:block w-px h-8 bg-[var(--rs-border-primary)]/50" />

            <BillingToggle interval={interval} onChange={setInterval} />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-[var(--rs-signal)]/10 border border-[var(--rs-signal)]/30 rounded-[var(--rs-radius-element)] flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--rs-signal)]">
              {error}
            </span>
          </div>
        )}

        {/* Persona Summary Block (if active) */}
        {activePersonaContent && (
          <div className="mb-12 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <RSPanel className="bg-[var(--rs-bg-element)]/50 border-[var(--rs-border-primary)]">
              <div className="flex flex-col md:flex-row gap-8 items-center p-6 md:p-8">
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <h3 className="text-2xl font-black uppercase tracking-tight text-[var(--rs-text-primary)]">
                    {activePersonaContent.title}
                  </h3>
                  <p className="text-sm text-[var(--rs-text-secondary)] leading-relaxed">
                    {activePersonaContent.description}
                  </p>
                </div>
                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activePersonaContent.benefits.map((b, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 bg-[var(--rs-bg-surface)] p-3 rounded-[var(--rs-radius-element)] border border-[var(--rs-border-primary)]/40 shadow-sm"
                    >
                      <div className="mt-0.5 w-4 h-4 rounded-full bg-[var(--rs-text-primary)] flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-[var(--rs-bg-root)]" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--rs-text-primary)]">
                        {b}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </RSPanel>
          </div>
        )}

        {/* Pricing cards grid */}
        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto ${
            plansToShow.length === 2 ? "md:max-w-4xl md:grid-cols-2" : ""
          }`}
        >
          {plansToShow.map((planId) => (
            <div
              key={planId}
              className={
                planId === (persona === "agency" ? "agency" : "pro")
                  ? "relative z-10"
                  : ""
              }
            >
              <PricingCard
                plan={PLANS[planId]}
                interval={interval}
                isPopular={planId === "pro" || planId === "agency"}
                onSelect={handleSelectPlan}
              />
            </div>
          ))}
        </div>

        {/* Soft & Hard Benefits Section */}
        <div className="mt-32 max-w-6xl mx-auto space-y-24">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-black uppercase tracking-tighter text-[var(--rs-text-primary)]">
                Why Upgrade to Pro?
              </h2>
              <p className="text-[var(--rs-text-secondary)] leading-relaxed">
                Our free tier gives you a taste of the forensic validation
                engine. Pro tier unlocks the real power: custom brand
                guidelines, historical retention, and comprehensive PDF
                mitigation dossiers you can share with legal and compliance
                teams.
              </p>
              <ul className="space-y-4 pt-4">
                {PLAN_CONTENT.pro.softBenefits.map((b, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="w-6 h-6 rounded bg-[var(--rs-signal)]/10 text-[var(--rs-signal)] flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-[var(--rs-text-primary)]">
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative aspect-square md:aspect-video rounded-xl bg-[var(--rs-bg-well)] border border-[var(--rs-border-primary)] overflow-hidden flex items-center justify-center group shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--rs-signal)]/10 to-transparent mix-blend-overlay" />
              {/* Abstract mock element to represent a report or dashboard */}
              <div className="w-3/4 h-3/4 border border-[var(--rs-signal)]/30 bg-[var(--rs-bg-surface)] rounded-lg shadow-2xl p-6 flex flex-col gap-4 transform group-hover:scale-105 transition-transform duration-700">
                <div className="flex items-center justify-between border-b border-[var(--rs-border-primary)] pb-4">
                  <div className="w-24 h-4 bg-[var(--rs-text-primary)] opacity-80 rounded-[2px]" />
                  <div className="w-8 h-4 bg-[var(--rs-safe)] rounded-[2px]" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="w-full h-3 bg-[var(--rs-bg-element)] rounded-[2px]" />
                  <div className="w-5/6 h-3 bg-[var(--rs-bg-element)] rounded-[2px]" />
                  <div className="w-4/6 h-3 bg-[var(--rs-bg-element)] rounded-[2px]" />
                </div>
                <div className="flex gap-2">
                  <div className="w-full h-10 bg-[var(--rs-signal)] rounded-[4px] mt-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-32 max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-[var(--rs-text-primary)]">
              Frequently Asked Questions
            </h2>
          </div>
          <RSPanel className="p-0 border-[var(--rs-border-primary)] overflow-hidden shadow-lg">
            <div className="divide-y divide-[var(--rs-border-primary)]">
              {FAQs.map((faq, i) => (
                <div
                  key={i}
                  className="p-8 hover:bg-[var(--rs-bg-element)]/30 transition-colors"
                >
                  <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--rs-text-primary)] mb-3">
                    {faq.question}
                  </h4>
                  <p className="text-sm text-[var(--rs-text-secondary)] leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </RSPanel>
        </div>
      </div>
    </div>
  );
}
