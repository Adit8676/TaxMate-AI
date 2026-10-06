import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  TrendingDown, 
  CheckCircle, 
  ArrowRight, 
  Info,
  ShieldCheck,
  Zap
} from 'lucide-react';
import type { TaxProfile, RegimeComparisonResult } from '../types';
import { api } from '../api/client';

interface CompareViewProps {
  profile: TaxProfile;
  onNavigateToTab: (tab: string) => void;
}

export const CompareView: React.FC<CompareViewProps> = ({ profile, onNavigateToTab }) => {
  const [comparison, setComparison] = useState<RegimeComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulatedSalary, setSimulatedSalary] = useState<number>(profile.salary_income || 1500000);

  const fetchComparison = async (salary: number) => {
    setLoading(true);
    try {
      const simProfile = { ...profile, salary_income: salary };
      const res = await api.compareTaxRegimes(simProfile);
      setComparison(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison(simulatedSalary);
  }, [simulatedSalary]);

  if (!comparison && loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center space-x-3 text-emerald-400">
          <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold">Running deterministic regime comparison...</span>
        </div>
      </div>
    );
  }

  const isNewWinner = comparison?.recommended_regime === 'new';
  const isEqual = comparison?.recommended_regime === 'equal';
  const savings = comparison?.savings_amount || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Scale className="w-6 h-6 text-emerald-400" />
            <span>Regime Comparison & Simulator</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Old Tax Regime vs New Concessional Regime (Section 115BAC) under official CBDT slabs.
          </p>
        </div>

        <button
          onClick={() => onNavigateToTab('profile')}
          className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-white/10 flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
        >
          <span>Edit Financial Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Salary Simulation Slider */}
      <div className="glass-panel p-5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Interactive Salary Simulator</span>
          </label>
          <span className="font-mono text-base font-bold text-emerald-400">
            ₹{simulatedSalary.toLocaleString('en-IN')}
          </span>
        </div>

        <input
          type="range"
          min="400000"
          max="5000000"
          step="50000"
          value={simulatedSalary}
          onChange={(e) => setSimulatedSalary(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
        />

        <div className="flex justify-between text-[11px] text-slate-500 font-mono">
          <span>₹4,00,000</span>
          <span>₹15,00,000</span>
          <span>₹30,00,000</span>
          <span>₹50,00,000</span>
        </div>
      </div>

      {/* Hero Recommendation Card */}
      {comparison && (
        <div className={`p-6 rounded-2xl border transition-all duration-300 ${
          isEqual
            ? 'bg-slate-900 border-white/10'
            : isNewWinner
              ? 'bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/60 border-emerald-500/40 shadow-xl shadow-emerald-950/40'
              : 'bg-gradient-to-r from-cyan-950/70 via-slate-900 to-blue-950/60 border-cyan-500/40 shadow-xl shadow-cyan-950/40'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {isEqual ? 'Neutral Choice' : isNewWinner ? '⭐ Recommended: New Regime' : '⭐ Recommended: Old Regime'}
                </span>
                <span className="text-xs text-slate-400 font-mono">FY {comparison.financial_year}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {comparison.recommendation_summary}
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl">
                Verified through deterministic execution of CBDT income tax slabs and Chapter VI-A rules.
              </p>
            </div>

            <div className="flex items-center space-x-4 bg-slate-950/60 p-4 rounded-xl border border-white/10">
              <div className="text-right">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                  Annual Tax Savings
                </span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  ₹{savings.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <TrendingDown className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Table */}
      {comparison && (
        <div className="glass-panel overflow-hidden border-white/10 shadow-2xl">
          <div className="grid grid-cols-3 bg-slate-950/80 p-4 border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-400">
            <div>Tax Component</div>
            <div className="text-right font-mono">Old Tax Regime</div>
            <div className="text-right font-mono text-emerald-400">New Regime (Sec 115BAC)</div>
          </div>

          <div className="divide-y divide-white/5 text-xs">
            {/* Gross Salary */}
            <div className="grid grid-cols-3 p-3.5 hover:bg-white/5 transition-colors">
              <span className="font-medium text-slate-200">Gross Salary Income</span>
              <span className="text-right font-mono text-slate-300">
                ₹{comparison.old_regime.gross_income.toLocaleString('en-IN')}
              </span>
              <span className="text-right font-mono text-slate-300 font-semibold">
                ₹{comparison.new_regime.gross_income.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Standard Deduction */}
            <div className="grid grid-cols-3 p-3.5 hover:bg-white/5 transition-colors">
              <div>
                <span className="font-medium text-slate-200">Standard Deduction (Sec 16(ia))</span>
                <span className="text-[10px] text-slate-500 block">Enhanced to ₹75k in Budget 2024</span>
              </div>
              <span className="text-right font-mono text-emerald-400">
                -₹{comparison.old_regime.standard_deduction.toLocaleString('en-IN')}
              </span>
              <span className="text-right font-mono text-emerald-400 font-bold">
                -₹{comparison.new_regime.standard_deduction.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Allowed Deductions (80C, 80D, 24b) */}
            <div className="grid grid-cols-3 p-3.5 hover:bg-white/5 transition-colors">
              <div>
                <span className="font-medium text-slate-200">Chapter VI-A & Sec 24(b) Deductions</span>
                <span className="text-[10px] text-slate-500 block">80C, 80D, Home loan interest</span>
              </div>
              <span className="text-right font-mono text-cyan-400 font-semibold">
                -₹{comparison.old_regime.allowed_deductions.toLocaleString('en-IN')}
              </span>
              <span className="text-right font-mono text-slate-500">
                {comparison.new_regime.allowed_deductions > 0 
                  ? `-₹${comparison.new_regime.allowed_deductions.toLocaleString('en-IN')}` 
                  : '₹0 (Disallowed)'}
              </span>
            </div>

            {/* Net Taxable Income */}
            <div className="grid grid-cols-3 p-3.5 bg-slate-900/60 font-semibold">
              <span className="text-white">Net Taxable Income</span>
              <span className="text-right font-mono text-amber-300">
                ₹{comparison.old_regime.taxable_income.toLocaleString('en-IN')}
              </span>
              <span className="text-right font-mono text-emerald-300 font-bold">
                ₹{comparison.new_regime.taxable_income.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Slab Tax */}
            <div className="grid grid-cols-3 p-3.5 hover:bg-white/5 transition-colors">
              <span className="text-slate-300">Base Slab Tax</span>
              <span className="text-right font-mono text-slate-300">
                ₹{comparison.old_regime.slab_tax.toLocaleString('en-IN')}
              </span>
              <span className="text-right font-mono text-slate-300">
                ₹{comparison.new_regime.slab_tax.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Rebate 87A */}
            <div className="grid grid-cols-3 p-3.5 hover:bg-white/5 transition-colors">
              <div>
                <span className="text-slate-300">Section 87A Tax Rebate</span>
                <span className="text-[10px] text-slate-500 block">Up to 7L in New, Up to 5L in Old</span>
              </div>
              <span className="text-right font-mono text-emerald-400">
                -₹{comparison.old_regime.rebate_87a.toLocaleString('en-IN')}
              </span>
              <span className="text-right font-mono text-emerald-400 font-bold">
                -₹{comparison.new_regime.rebate_87a.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Cess 4% */}
            <div className="grid grid-cols-3 p-3.5 hover:bg-white/5 transition-colors">
              <span className="text-slate-300">Health & Education Cess (4%)</span>
              <span className="text-right font-mono text-slate-400">
                ₹{comparison.old_regime.cess.toLocaleString('en-IN')}
              </span>
              <span className="text-right font-mono text-slate-400">
                ₹{comparison.new_regime.cess.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Final Tax Liability */}
            <div className="grid grid-cols-3 p-4 bg-slate-950 font-bold text-sm">
              <span className="text-white flex items-center space-x-1.5">
                <span>Final Total Tax Liability</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </span>
              <span className="text-right font-mono text-slate-200">
                ₹{comparison.old_regime.final_tax.toLocaleString('en-IN')}
              </span>
              <span className="text-right font-mono text-emerald-400 text-base">
                ₹{comparison.new_regime.final_tax.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Effective Tax Rate */}
            <div className="grid grid-cols-3 p-3 text-[11px] text-slate-400 font-mono">
              <span>Effective Tax Rate</span>
              <span className="text-right">{comparison.old_regime.effective_tax_rate}%</span>
              <span className="text-right text-emerald-400 font-bold">{comparison.new_regime.effective_tax_rate}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Why? Explanation & Key Drivers */}
      {comparison?.key_drivers && comparison.key_drivers.length > 0 && (
        <div className="glass-panel p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>Financial Drivers Behind This Recommendation</span>
          </h3>

          <ul className="space-y-2 text-xs text-slate-300">
            {comparison.key_drivers.map((driver, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{driver}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
};
