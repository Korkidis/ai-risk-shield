"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
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
import { RSRiskPanel } from "@/components/rs/RSRiskPanel";
import Link from "next/link";
import { Loader2, ArrowUp } from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";

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

  const dialRef = useRef(null);
  const isDialInView = useInView(dialRef, { once: true, amount: 0.5 });

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
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">


          <h1 className="text-5xl md:text-6xl rs-header-bold-italic text-[var(--rs-text-primary)] uppercase tracking-tighter">
            Clear, Predictable
            <br className="md:hidden" />
            <span className="text-[var(--rs-signal)]"> Pricing</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--rs-text-secondary)] font-medium max-w-2xl mx-auto">
            Consumption-based flexible pricing that scales with you.
          </p>

          {/* Persona Switcher & Billing Toggle Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8 relative z-10">
            <div className="flex items-center p-1 bg-[var(--rs-bg-surface)] border border-[var(--rs-border-primary)]/20 shadow-sm rounded-lg hover:border-[var(--rs-border-primary)] transition-colors">
              <button
                onClick={() => {
                  trackEvent('plans_persona_selected', { persona: 'default' });
                  setPersona("default");
                  router.push('/pricing?persona=default', { scroll: false });
                }}
                className={`px-8 py-3 text-xs font-bold uppercase tracking-widest transition-all border rounded-md ${
                  persona === "default"
                    ? "bg-[var(--rs-bg-element)] text-[var(--rs-text-primary)] border-[var(--rs-border-primary)]/50 shadow-sm"
                    : "text-[var(--rs-text-tertiary)] border-transparent hover:text-[var(--rs-text-primary)]"
                }`}
              >
                Individuals & Teams
              </button>
              <button
                onClick={() => {
                  trackEvent('plans_persona_selected', { persona: 'agency' });
                  setPersona("agency");
                  router.push('/pricing?persona=agency', { scroll: false });
                }}
                className={`px-8 py-3 text-xs font-bold uppercase tracking-widest transition-all border rounded-md ${
                  persona === "agency" || persona === "enterprise"
                    ? "bg-[var(--rs-bg-element)] text-[var(--rs-text-primary)] border-[var(--rs-border-primary)]/50 shadow-sm"
                    : "text-[var(--rs-text-tertiary)] border-transparent hover:text-[var(--rs-text-primary)]"
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

        {/* Pricing cards grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto items-stretch"
        >
          <AnimatePresence mode="popLayout">
          {/* Persona Summary Block (if active) */}
          {activePersonaContent && (
            <motion.div 
               key="scale-persona-block"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               layout
               className="h-full z-0"
            >
               <div className="bg-[var(--rs-bg-surface)] border border-[var(--rs-border-primary)]/20 shadow-sm rounded-xl h-full p-8 flex flex-col justify-center">
                   <h3 className="text-2xl font-black uppercase tracking-tight text-[var(--rs-text-primary)] mb-4">
                     {activePersonaContent.title}
                   </h3>
                   <p className="text-sm text-[var(--rs-text-secondary)] leading-relaxed mb-8">
                     {activePersonaContent.description}
                   </p>
                   <div className="w-full flex flex-col gap-4">
                     {activePersonaContent.benefits.map((b, i) => (
                       <div key={i} className="flex items-start gap-3 bg-[var(--rs-bg-surface)] p-3 border-l-2 border-[var(--rs-text-primary)]">
                         <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--rs-text-primary)] leading-tight">
                           {b}
                         </span>
                       </div>
                     ))}
                   </div>
               </div>
            </motion.div>
          )}
          {plansToShow.map((planId) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={planId}
              className={
                planId === (persona === "agency" ? "agency" : "pro")
                  ? "relative z-10"
                  : "relative z-0"
              }
            >
              <PricingCard
                plan={PLANS[planId]}
                interval={interval}
                isPopular={planId === "pro" || planId === "agency"}
                onSelect={handleSelectPlan}
              />
            </motion.div>
          ))}
          </AnimatePresence>
        </motion.div>

        {/* FULL WIDTH MITIGATION BANNER & VALUE ANCHOR */}
        <div className="mt-32 w-full bg-[#111] text-white py-20 relative px-6 rounded-2xl mx-auto overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--rs-signal)]/10 to-transparent pointer-events-none opacity-50" />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="space-y-6 text-center lg:text-left flex-1 max-w-2xl px-4 lg:px-8">
                    <h3 className="text-3xl lg:text-4xl font-black uppercase text-white tracking-tighter">On-Demand Mitigation</h3>
                    <p className="text-[var(--rs-text-tertiary)] leading-relaxed">
                        Not ready for a subscription? Single Forensic Mitigation Reports are available for <span className="text-white font-bold">$29/ea</span> on demand. Ideal for acute crisis response.
                    </p>
                    <div className="pt-6 border-t border-white/10">
                        <p className="rs-type-mono text-xs uppercase tracking-widest text-white/50 leading-relaxed">
                            Manual content risk assessments range upwards of $3,500. By subscribing, our Pro tier delivers structural compliance infrastructure for an average of <span className="text-[var(--rs-signal)] font-bold">$0.98 per asset</span>.
                        </p>
                    </div>
                </div>
                <div className="shrink-0 w-full lg:w-auto px-4 lg:px-8">
                    <button 
                        className="w-full lg:w-auto px-10 py-5 bg-[var(--rs-signal)] text-white font-black text-sm uppercase tracking-widest hover:bg-[#e64000] transition-colors shadow-2xl"
                        onClick={() => window.location.href='/dashboard'}
                    >
                        Purchase Single Report
                    </button>
                </div>
            </div>
        </div>

        {/* Soft & Hard Benefits Section - Premium Redesign */}
        <div className="mt-32 max-w-6xl mx-auto px-4 xl:px-0 mb-32">
          <div className="text-center mb-16 space-y-6">
            <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter text-[var(--rs-text-primary)]">
              Why Upgrade to Pro?
            </h2>
            <p className="text-lg md:text-xl text-[var(--rs-text-secondary)] leading-relaxed max-w-3xl mx-auto">
              Most teams publishing AI content don&apos;t have the right tools to manage the risk. Pro gives you a structured workflow so you can stay focused on creating.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-1 flex flex-col gap-4">
              {PLAN_CONTENT.pro.softBenefits.map((b, i) => (
                <div key={i} className="flex gap-4 p-5 bg-[var(--rs-bg-surface)] border-2 border-[var(--rs-border-primary)] border-l-[4px] border-l-[var(--rs-signal)] shadow-[4px_4px_0_var(--rs-border-primary)] transition-all duration-300 hover:shadow-[6px_6px_0_var(--rs-signal)]">
                  <span className="text-sm font-bold text-[var(--rs-text-primary)] leading-tight flex items-center">
                    {b}
                  </span>
                </div>
              ))}
            </div>

            <div className="lg:col-span-2 w-full flex items-center justify-center p-0 group mt-8 lg:mt-0">              
              <div ref={dialRef} className="w-full flex items-center justify-center transition-transform duration-700">
                  <RSRiskPanel
                      id="SYS-STD-01"
                      score={isDialInView ? 94 : 0}
                      level={isDialInView ? "critical" : "safe"}
                      ipScore={isDialInView ? 96 : 0}
                      safetyScore={isDialInView ? 38 : 0}
                      provenanceScore={isDialInView ? 8 : 0}
                      status={isDialInView ? "completed" : "scanning"}
                      className="border-2 border-[var(--rs-border-primary)] shadow-[8px_8px_0_var(--rs-border-primary)] bg-[var(--rs-bg-root)] w-full max-w-[700px]"
                  />
              </div>
            </div>
          </div>
        </div>

        {/* FAQ 6-Card Grid Redesign */}
        <div className="mt-32 max-w-6xl mx-auto px-4 xl:px-0 mb-32">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter text-[var(--rs-text-primary)]">
              Frequently Asked Questions
            </h2>
            <p className="text-lg md:text-xl text-[var(--rs-text-secondary)] leading-relaxed max-w-3xl mx-auto">
              Everything you need to know about the product and billing. For deep technical methodology, check our documentation hub.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FAQs.map((faq, i) => (
              <div
                key={i}
                className="bg-[var(--rs-bg-surface)] border-2 border-[var(--rs-border-primary)] p-6 md:p-8 flex flex-col items-start text-left shadow-[8px_8px_0_var(--rs-border-primary)] transition-all duration-300 hover:border-[var(--rs-text-primary)] hover:shadow-[12px_12px_0_var(--rs-signal)] h-full"
              >
                <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--rs-text-primary)] mb-4 leading-snug">
                  {faq.question}
                </h4>
                <p className="text-sm text-[var(--rs-text-secondary)] leading-relaxed border-t border-[var(--rs-border-primary)] pt-4 mt-auto">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
             <Link href="/ai-content-governance" className="inline-flex items-center gap-2 text-[var(--rs-text-tertiary)] hover:text-[var(--rs-text-primary)] text-xs font-bold uppercase tracking-widest transition-colors">
               Read Full Governance Methodology <ArrowUp className="w-3 h-3 rotate-45" />
             </Link>
          </div>
        </div>

        {/* NEW CTA BLOCK */}
        <div className="max-w-6xl mx-auto px-4 xl:px-0 mb-32">
          <div className="w-full bg-[var(--rs-bg-element)] border-y md:border border-[var(--rs-border-primary)] py-24 px-6 text-center shadow-none md:shadow-[8px_8px_0_var(--rs-border-primary)]">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter rs-header-bold-italic leading-[1] text-[var(--rs-text-primary)]">
                READY TO SECURE YOUR <br className="hidden md:block"/>
                <span className="text-[var(--rs-signal)]">CONTENT PIPELINE?</span>
              </h2>
              
              <p className="text-lg text-[var(--rs-text-secondary)] leading-relaxed max-w-2xl mx-auto font-medium">
                Don&apos;t let unverified AI assets expose your brand to IP litigation. Run a free forensic scan today, or upgrade your entire team to establish an ironclad provenance workflow.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button 
                  onClick={() => window.location.href='/dashboard'}
                  className="w-full sm:w-auto px-8 py-4 bg-[var(--rs-signal)] text-white text-xs font-black uppercase tracking-widest hover:bg-[#e64000] transition-colors shadow-[4px_4px_0_#992a00] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none flex items-center justify-center gap-3 rounded-sm"
                >
                  <div className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  Run A Forensic Scan
                </button>
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="w-full sm:w-auto px-8 py-4 bg-[var(--rs-bg-root)] border border-[var(--rs-border-primary)] text-[var(--rs-text-primary)] shadow-[4px_4px_0_var(--rs-text-primary)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none text-xs font-black uppercase tracking-widest transition-all hover:bg-[var(--rs-text-primary)] hover:text-[var(--rs-bg-root)] rounded-sm"
                >
                  View Enterprise Plans
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
