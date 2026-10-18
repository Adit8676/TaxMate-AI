import React, { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  Receipt,
  MessageSquareCode,
  Check,
  TrendingDown,
  Layers,
  FileCheck2,
  FileSpreadsheet,
  Lock,
  Zap,
  PhoneCall,
  ShieldCheck,
} from 'lucide-react';

interface LandingViewProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onOpenAuth }) => {
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');
  const [activeInteractiveTab, setActiveInteractiveTab] = useState<'regime' | 'form16' | 'crypto'>('regime');

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1D1917] selection:bg-[#6338F1]/20 selection:text-[#6338F1] antialiased font-sans">
      
      {/* ─────────────────── Minimal Clean Top Bar ─────────────────── */}
      <nav className="sticky top-0 z-40 w-full border-b border-[#EAE3D2]/80 bg-[#FDFBF7]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1D1917] text-[#FDFBF7] flex items-center justify-center font-bold text-sm shadow-sm">
              <Sparkles className="w-4 h-4 text-[#FFD666]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#1D1917] font-serif">
              TaxMate<span className="text-[#6338F1]">.AI</span>
            </span>
          </div>

          {/* Center Links (Pill Style from Screenshot) */}
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-[#57534E]">
            <a href="#about" className="px-4 py-2 rounded-full border border-[#E7DFCE] hover:border-[#1D1917] hover:text-[#1D1917] transition-all bg-white/40">
              About Us
            </a>
            <a href="#services" className="px-4 py-2 rounded-full border border-[#E7DFCE] hover:border-[#1D1917] hover:text-[#1D1917] transition-all bg-white/40">
              Capabilities
            </a>
            <a href="#pricing" className="px-4 py-2 rounded-full border border-[#E7DFCE] hover:border-[#1D1917] hover:text-[#1D1917] transition-all bg-white/40">
              Pricing
            </a>
            <a href="#contact" className="px-4 py-2 rounded-full border border-[#E7DFCE] hover:border-[#1D1917] hover:text-[#1D1917] transition-all bg-white/40">
              Contact
            </a>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenAuth('login')}
              className="text-xs font-semibold px-4 py-2 rounded-full text-[#44403C] hover:text-[#1D1917] hover:bg-[#F2ECE0] transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              className="px-5 py-2.5 rounded-full bg-[#6338F1] hover:bg-[#5229DC] text-white text-xs font-semibold shadow-md shadow-[#6338F1]/25 transition-all duration-200 cursor-pointer active:scale-95 flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      <main>
        {/* ─────────────────── Hero Section (Warm Sand Aesthetic) ─────────────────── */}
        <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 bg-gradient-to-b from-[#FDFBF7] via-[#FBF4E6] to-[#F5EAD4]">
          {/* Ambient Warm Sunbeam Flare */}
          <div className="pointer-events-none absolute top-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-[#FCE5B8]/60 blur-3xl" />
          <div className="pointer-events-none absolute top-40 left-10 -z-10 h-72 w-72 rounded-full bg-[#EADCC0]/40 blur-3xl" />

          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Bold Typography & Action */}
              <div className="lg:col-span-7 flex flex-col items-start text-left">
                {/* Micro Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EDE3D0] border border-[#DDD0B7] text-[#6338F1] text-xs font-semibold mb-6">
                  <span className="w-2 h-2 rounded-full bg-[#6338F1] animate-ping" />
                  <span>FY 2024-25 & Budget 2024 Compliant</span>
                </div>

                {/* Massive Bold Headline (Screenshot typography style) */}
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#1D1917] leading-[1.04] uppercase font-sans">
                  When Taxes <br />
                  Meet Clarity.
                </h1>

                <p className="mt-6 text-base sm:text-lg text-[#57534E] max-w-xl leading-relaxed">
                  Your income is complex. Your taxes shouldn’t be. Speak with India’s most precise AI tax copilot that turns financial chaos into confident, audited filings.
                </p>

                {/* Primary CTA button (Purple Pill like screenshot) */}
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => onOpenAuth('signup')}
                    className="px-7 py-3.5 rounded-2xl bg-[#6338F1] hover:bg-[#5229DC] text-white font-semibold text-sm shadow-xl shadow-[#6338F1]/30 transition-all duration-200 cursor-pointer active:scale-95 flex items-center gap-2"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Book an AI Session</span>
                  </button>

                  <button
                    onClick={() => onOpenAuth('login')}
                    className="px-6 py-3.5 rounded-2xl border border-[#D6C7AA] bg-[#F7F0E2]/80 hover:bg-[#EFE4CF] text-[#292524] text-sm font-semibold transition-all cursor-pointer"
                  >
                    View Live Demo
                  </button>
                </div>

                {/* 3 Metric Pills (Directly mimicking the screenshot metrics) */}
                <div className="mt-12 grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-lg">
                  <div className="p-4 rounded-2xl border border-[#D8CAAe] bg-white/70 shadow-sm backdrop-blur-sm">
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#1D1917] tracking-tight">
                      ₹12Cr+
                    </div>
                    <div className="text-[11px] text-[#78716C] mt-1 font-medium">
                      Tax savings identified
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-[#D8CAAe] bg-white/70 shadow-sm backdrop-blur-sm">
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#6338F1] tracking-tight">
                      15<span className="text-sm font-medium">sec</span>
                    </div>
                    <div className="text-[11px] text-[#78716C] mt-1 font-medium">
                      To get clear answers
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-[#D8CAAe] bg-white/70 shadow-sm backdrop-blur-sm">
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#1D1917] tracking-tight">
                      99.8%
                    </div>
                    <div className="text-[11px] text-[#78716C] mt-1 font-medium">
                      Statutory accuracy rate
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Isometric 3D Graphic Mockup (Echoing the Screenshot Hero) */}
              <div className="lg:col-span-5 w-full">
                <div className="relative mx-auto max-w-md rounded-3xl border-2 border-[#D8CCA9] bg-[#FAF5E9] p-6 shadow-2xl shadow-[#5C451D]/15 overflow-hidden">
                  
                  {/* Decorative Hand / Phone Isometric Illustration Placeholder */}
                  <div className="relative h-64 w-full rounded-2xl bg-gradient-to-tr from-[#E6D4B5] via-[#F4E9D4] to-[#FAF5E9] border border-[#DBCDA9] p-5 flex flex-col justify-between overflow-hidden">
                    {/* Isometric Rail & Golden Coins Visual */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-[#EAB308] border-2 border-white shadow-md flex items-center justify-center text-[10px] font-bold text-white">
                        ₹
                      </span>
                      <span className="h-6 w-6 rounded-full bg-[#EAB308] border-2 border-white shadow-md flex items-center justify-center text-[10px] font-bold text-white">
                        ₹
                      </span>
                    </div>

                    {/* Isometric Floating Device */}
                    <div className="relative mt-4 z-10 w-4/5 mx-auto rounded-xl bg-white p-4 shadow-lg border border-[#E3D6B8] transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                      <div className="flex items-center justify-between pb-2 border-b border-[#F2ECE0] text-xs">
                        <span className="font-bold text-[#1D1917]">Tax Optimization</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#6338F1]/10 text-[#6338F1]">
                          Active
                        </span>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#78716C]">Old Regime Tax</span>
                          <span className="line-through text-red-500 font-mono">₹2,10,600</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-[#1D1917]">New Regime Tax</span>
                          <span className="text-[#059669] font-mono">₹1,40,400</span>
                        </div>
                        <div className="pt-2 border-t border-[#F2ECE0] flex justify-between items-center text-xs">
                          <span className="text-[#78716C]">You Save</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold font-mono">
                            ₹70,200
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#78716C] pt-2">
                      <span className="font-mono">CBDT Circular No. 12/2024</span>
                      <span className="text-[#6338F1] font-semibold flex items-center gap-1">
                        Audited <Check className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>

                  {/* Interactive Tab Switcher below Graphic */}
                  <div className="mt-5 space-y-3">
                    <div className="flex rounded-xl bg-[#EFE5CE] p-1 text-xs font-semibold text-[#57534E]">
                      <button
                        onClick={() => setActiveInteractiveTab('regime')}
                        className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                          activeInteractiveTab === 'regime'
                            ? 'bg-white text-[#1D1917] shadow-sm'
                            : 'hover:text-[#1D1917]'
                        }`}
                      >
                        Salary & Slabs
                      </button>
                      <button
                        onClick={() => setActiveInteractiveTab('form16')}
                        className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                          activeInteractiveTab === 'form16'
                            ? 'bg-white text-[#1D1917] shadow-sm'
                            : 'hover:text-[#1D1917]'
                        }`}
                      >
                        Form 16 Recon
                      </button>
                      <button
                        onClick={() => setActiveInteractiveTab('crypto')}
                        className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                          activeInteractiveTab === 'crypto'
                            ? 'bg-white text-[#1D1917] shadow-sm'
                            : 'hover:text-[#1D1917]'
                        }`}
                      >
                        Section 115BBH
                      </button>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-[#E7DECB] text-xs text-[#57534E] leading-relaxed">
                      {activeInteractiveTab === 'regime' && (
                        <p>
                          <strong>Automatic Breakeven Engine:</strong> Computes the exact point where Section 80C, 80D, and home loan deductions beat the New Tax Regime&apos;s ₹75,000 standard deduction.
                        </p>
                      )}
                      {activeInteractiveTab === 'form16' && (
                        <p>
                          <strong>Instant Reconciliation:</strong> Compares employer Part A TDS with TRACES Form 26AS to flag mismatch credits before you file.
                        </p>
                      )}
                      {activeInteractiveTab === 'crypto' && (
                        <p>
                          <strong>Virtual Digital Assets (VDA):</strong> Calculates 30% flat tax under Section 115BBH with strict loss set-off prohibition compliance.
                        </p>
                      )}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ─────────────────── Bento Grid Features (Warm Tone) ─────────────────── */}
        <section id="services" className="py-24 border-t border-[#E8DFC9] bg-[#FAF6EE]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            
            <div className="max-w-2xl">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#6338F1]">
                End-to-End Capabilities
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1917] font-serif">
                Built for High-Stakes Tax Decisions.
              </h2>
              <p className="mt-4 text-[#57534E] leading-relaxed text-sm sm:text-base">
                TaxMate AI never hallucinates numbers. Financial math is executed by a strictly deterministic calculation engine, backed by statutory citation search.
              </p>
            </div>

            {/* 4 Asymmetric Cards */}
            <div className="mt-14 grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Card 1: Form 16 & Document Scanner */}
              <div className="md:col-span-7 rounded-3xl border border-[#E3D9C3] bg-[#FCF9F2] p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-[#EFE5CE] text-[#6338F1] flex items-center justify-center mb-6">
                  <Receipt className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#1D1917]">
                  1. Form 16 Extraction with Zero-Trust Review
                </h3>
                <p className="mt-2.5 text-sm text-[#57534E] leading-relaxed max-w-lg">
                  Drop your Form 16 PDF or tax slips. All salary allowances, Chapter VI-A deductions, and TDS receipts are extracted and mapped to an auditable schema.
                </p>

                <div className="mt-6 rounded-2xl bg-white border border-[#E5DBCA] p-4 text-xs font-mono text-[#44403C] space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b border-[#F0E8D8]">
                    <span className="font-semibold">Form16_FY2425_PartB.pdf</span>
                    <span className="text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full text-[10px]">
                      Validated
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#78716C]">Gross Salary (17(1))</span>
                    <span className="font-bold">₹18,50,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#78716C]">Standard Deduction</span>
                    <span className="font-bold text-[#6338F1]">₹75,000 (New)</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Real-time Deductions */}
              <div className="md:col-span-5 rounded-3xl border border-[#E3D9C3] bg-[#FCF9F2] p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#EFE5CE] text-[#059669] flex items-center justify-center mb-6">
                    <TrendingDown className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1D1917]">
                    2. Dynamic Old vs. New Regime Arb
                  </h3>
                  <p className="mt-2.5 text-sm text-[#57534E] leading-relaxed">
                    Live slider simulation for salaries, 80C, 80D, NPS, and home loan interest with instant breakeven curve calculation.
                  </p>
                </div>

                <div className="mt-6 p-4 rounded-2xl bg-white border border-[#E5DBCA] text-xs">
                  <div className="text-[#78716C]">Breakeven Deduction Threshold</div>
                  <div className="text-lg font-extrabold text-[#6338F1] mt-0.5">₹3,75,000</div>
                  <div className="text-[11px] text-[#A8A29E] mt-1">If deductions exceed ₹3.75L, Old Regime wins.</div>
                </div>
              </div>

              {/* Card 3: Grounded Legal Chatbot */}
              <div className="md:col-span-5 rounded-3xl border border-[#E3D9C3] bg-[#FCF9F2] p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#EFE5CE] text-[#6338F1] flex items-center justify-center mb-6">
                    <MessageSquareCode className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1D1917]">
                    3. Statutory Law RAG Assistant
                  </h3>
                  <p className="mt-2.5 text-sm text-[#57534E] leading-relaxed">
                    Ask in plain English. Responses cite exact clauses of the Income Tax Act 1961, Finance Acts, and CBDT notifications.
                  </p>
                </div>

                <div className="mt-6 p-3.5 rounded-2xl bg-white border border-[#E5DBCA] text-xs space-y-1">
                  <span className="text-[#78716C] block">Query: Section 87A rebate for ₹7.2 Lakhs?</span>
                  <p className="text-[#1D1917] font-semibold text-[11px]">
                    Marginal relief applies under Budget 2024 to cap tax strictly to excess income over ₹7,00,000.
                  </p>
                </div>
              </div>

              {/* Card 4: Automated Export */}
              <div className="md:col-span-7 rounded-3xl border border-[#E3D9C3] bg-[#FCF9F2] p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-[#EFE5CE] text-[#059669] flex items-center justify-center mb-6">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#1D1917]">
                  4. Automated Excel & PDF Computation Sheets
                </h3>
                <p className="mt-2.5 text-sm text-[#57534E] leading-relaxed max-w-lg">
                  Generate professional computation reports ready for your CA or e-filing portal review, complete with step-by-step marginal relief audit notes.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-2xl bg-white border border-[#E5DBCA] flex items-center gap-3">
                    <FileCheck2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="font-bold text-xs text-[#1D1917]">ITR-1 Summary.pdf</div>
                      <div className="text-[10px] text-[#78716C]">Ready to file schedule</div>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white border border-[#E5DBCA] flex items-center gap-3">
                    <Layers className="w-5 h-5 text-[#6338F1]" />
                    <div>
                      <div className="font-bold text-xs text-[#1D1917]">TaxAudit.xlsx</div>
                      <div className="text-[10px] text-[#78716C]">Formula verified</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ─────────────────── Pricing Section (Clean & Warm) ─────────────────── */}
        <section id="pricing" className="py-24 border-t border-[#E8DFC9] bg-[#FDFBF7]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
            
            <div className="max-w-2xl mx-auto">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#6338F1]">
                Simple & Honest
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1917] font-serif">
                Plans for Taxpayers & Advisors.
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[#57534E]">
                Get started for free. Upgrade when you need advanced capital gains, ESOPs, or multi-client filing.
              </p>

              {/* Billing Cycle Pill */}
              <div className="mt-8 inline-flex items-center rounded-full bg-[#EFE5CE] p-1 text-xs font-semibold">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-[#1D1917] shadow-sm'
                      : 'text-[#78716C] hover:text-[#1D1917]'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-4 py-2 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                    billingCycle === 'annual'
                      ? 'bg-[#6338F1] text-white shadow-sm'
                      : 'text-[#78716C] hover:text-[#1D1917]'
                  }`}
                >
                  <span>Annual Billing</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/20">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            {/* 3 Tier Cards */}
            <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8 text-left items-stretch">
              
              {/* Free Tier */}
              <div className="rounded-3xl border border-[#E3D9C3] bg-[#FAF5E9] p-8 flex flex-col justify-between">
                <div>
                  <div className="text-base font-bold text-[#1D1917]">Starter Salaried</div>
                  <p className="mt-1 text-xs text-[#78716C]">
                    For salaried employees with single Form 16 and interest income.
                  </p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-[#1D1917]">₹0</span>
                    <span className="text-xs text-[#78716C]">/ forever</span>
                  </div>

                  <ul className="mt-8 space-y-3 text-xs text-[#44403C]">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Full FY 2024-25 Old vs. New Regime Comparison</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>1 Form 16 Automated PDF Extraction</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Standard Slabs & Deductions Simulator</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => onOpenAuth('signup')}
                  className="mt-8 w-full py-3 rounded-2xl border border-[#D6C7AA] bg-white text-xs font-bold text-[#1D1917] hover:bg-[#F2ECE0] transition-colors cursor-pointer"
                >
                  Get Started Free
                </button>
              </div>

              {/* Pro Tier (Highlighted) */}
              <div className="rounded-3xl border-2 border-[#6338F1] bg-white p-8 flex flex-col justify-between shadow-xl shadow-[#6338F1]/10 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#6338F1] text-white text-[10px] font-extrabold uppercase tracking-wider">
                  Most Popular
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-[#1D1917]">Pro Investor</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      ITR-2 Ready
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#78716C]">
                    For stock traders, crypto portfolios, and multiple Form 16s.
                  </p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-[#6338F1]">
                      {billingCycle === 'annual' ? '₹1,499' : '₹199'}
                    </span>
                    <span className="text-xs text-[#78716C]">
                      {billingCycle === 'annual' ? '/ year' : '/ month'}
                    </span>
                  </div>

                  <ul className="mt-8 space-y-3 text-xs text-[#44403C]">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Unlimited Form 16 & Capital Gains parsing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Section 112A (12.5% LTCG) & STCG Netting</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Virtual Digital Assets (VDA) Section 115BBH rules</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Downloadable Excel & PDF Schedules</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => onOpenAuth('signup')}
                  className="mt-8 w-full py-3 rounded-2xl bg-[#6338F1] hover:bg-[#5229DC] text-white text-xs font-bold shadow-md shadow-[#6338F1]/25 transition-all cursor-pointer active:scale-95"
                >
                  Start Pro Trial
                </button>
              </div>

              {/* Enterprise / CA Advisory Tier */}
              <div className="rounded-3xl border border-[#E3D9C3] bg-[#FAF5E9] p-8 flex flex-col justify-between">
                <div>
                  <div className="text-base font-bold text-[#1D1917]">Chartered Accountant</div>
                  <p className="mt-1 text-xs text-[#78716C]">
                    For CA firms managing multi-client tax computation schedules.
                  </p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-[#1D1917]">
                      {billingCycle === 'annual' ? '₹7,999' : '₹899'}
                    </span>
                    <span className="text-xs text-[#78716C]">
                      {billingCycle === 'annual' ? '/ year' : '/ month'}
                    </span>
                  </div>

                  <ul className="mt-8 space-y-3 text-xs text-[#44403C]">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Up to 100 Client Profiles with bulk exports</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>MCP Server Custom Connectors</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Zero Data Retention air-gapped guarantee</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => onOpenAuth('signup')}
                  className="mt-8 w-full py-3 rounded-2xl border border-[#D6C7AA] bg-white text-xs font-bold text-[#1D1917] hover:bg-[#F2ECE0] transition-colors cursor-pointer"
                >
                  Contact CA Sales
                </button>
              </div>

            </div>
          </div>
        </section>

        {/* ─────────────────── Final High-Converting Banner ─────────────────── */}
        <section className="py-24 border-t border-[#E8DFC9] bg-gradient-to-b from-[#F5EAD4] to-[#EDE0C4]">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl sm:text-5xl font-black text-[#1D1917] tracking-tight uppercase font-sans">
              Turn Tax Chaos into Confident Decisions.
            </h2>
            <p className="mt-4 text-base text-[#57534E] max-w-xl mx-auto">
              Ready to see exactly how much you can save under the FY 2024-25 Budget? Create your free account in 30 seconds.
            </p>

            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-8 py-4 rounded-2xl bg-[#6338F1] hover:bg-[#5229DC] text-white font-semibold text-sm shadow-xl shadow-[#6338F1]/30 transition-all cursor-pointer active:scale-95 flex items-center gap-2"
              >
                <span>Launch TaxMate AI</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-[#78716C]">
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#6338F1]" />
                Zero Bank Password Required
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Local PII Redaction
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#6338F1]" />
                Instant Calculation Speed
              </span>
            </div>
          </div>
        </section>

      </main>

      {/* ─────────────────── Clean Warm Footer ─────────────────── */}
      <footer className="border-t border-[#E8DFC9] bg-[#EFE6D4] py-12 text-[#78716C] text-xs">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1D1917] font-serif">TaxMate AI</span>
            <span>— Indian Income Tax & Finance Copilot</span>
          </div>
          <p className="text-center sm:text-right">
            © {new Date().getFullYear()} TaxMate AI. Calculations are informational. Consult a Chartered Accountant for final filings.
          </p>
        </div>
      </footer>

    </div>
  );
};
