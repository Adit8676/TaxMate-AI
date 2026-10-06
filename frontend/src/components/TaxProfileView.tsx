import React, { useState } from 'react';
import { 
  Calculator, 
  Save, 
  CheckCircle2, 
  Sparkles,
  Info
} from 'lucide-react';
import type { TaxProfile } from '../types';
import { api } from '../api/client';

interface TaxProfileViewProps {
  profile: TaxProfile;
  onProfileUpdated: (updated: TaxProfile) => void;
  onNavigateToTab: (tab: string) => void;
}

export const TaxProfileView: React.FC<TaxProfileViewProps> = ({ 
  profile, 
  onProfileUpdated,
  onNavigateToTab 
}) => {
  const [formData, setFormData] = useState<TaxProfile>(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleIncomeChange = (field: keyof TaxProfile, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeductionChange = (field: keyof TaxProfile['deductions'], value: any) => {
    setFormData((prev) => ({
      ...prev,
      deductions: {
        ...prev.deductions,
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const res = await api.updateProfile(formData);
      onProfileUpdated(res.profile);
      setSaveMessage('Profile saved and synced with Tax Copilot!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      alert(`Error saving profile: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Calculations for live summary
  const grossIncome = 
    Number(formData.salary_income || 0) + 
    Number(formData.interest_income || 0) + 
    Number(formData.rental_income || 0) + 
    Number(formData.other_income || 0);

  const total80C = Math.min(150000, Number(formData.deductions.section_80c || 0));
  const maxParents = formData.deductions.parents_senior_citizen ? 50000 : 25000;
  const total80D = Math.min(25000, Number(formData.deductions.section_80d_self || 0)) +
                   Math.min(maxParents, Number(formData.deductions.section_80d_parents || 0));
  const totalNps = Math.min(50000, Number(formData.deductions.section_80ccd_1b || 0));
  const total24b = Math.min(200000, Number(formData.deductions.section_24b_home_loan || 0));

  const totalDeductionsOld = total80C + total80D + totalNps + total24b;
  const stdDeduction = formData.is_salaried ? (formData.financial_year === '2023-24' ? 50000 : 75000) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Calculator className="w-6 h-6 text-emerald-400" />
            <span>Taxpayer Financial Profile</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure your financial incomes, Chapter VI-A investments, and assess liabilities deterministically.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {saveMessage && (
            <span className="text-xs text-emerald-400 font-medium flex items-center space-x-1 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>{saveMessage}</span>
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save & Sync Profile'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Inputs (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* General Parameters */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
              1. Assessment Context
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Financial Year
                </label>
                <select
                  value={formData.financial_year}
                  onChange={(e) => handleIncomeChange('financial_year', e.target.value as any)}
                  className="w-full glass-input text-xs"
                >
                  <option value="2024-25">FY 2024-25 (AY 2025-26 - Budget 2024)</option>
                  <option value="2025-26">FY 2025-26 (AY 2026-27)</option>
                  <option value="2023-24">FY 2023-24 (AY 2024-25)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Taxpayer Age
                </label>
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={formData.age}
                  onChange={(e) => handleIncomeChange('age', parseInt(e.target.value) || 30)}
                  className="w-full glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Employment Status
                </label>
                <div className="flex items-center space-x-2 mt-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_salaried}
                      onChange={(e) => handleIncomeChange('is_salaried', e.target.checked as any)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                  <span className="text-xs font-semibold text-slate-200">
                    {formData.is_salaried ? 'Salaried (Std Ded. applies)' : 'Self-Employed / Business'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Income Details */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
              2. Annual Incomes (in ₹ INR)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Gross Annual Salary (CTC before deductions)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    value={formData.salary_income}
                    onChange={(e) => handleIncomeChange('salary_income', parseFloat(e.target.value) || 0)}
                    className="w-full glass-input pl-8 text-xs font-mono"
                    placeholder="15,00,000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Interest Income (Savings / FD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    value={formData.interest_income}
                    onChange={(e) => handleIncomeChange('interest_income', parseFloat(e.target.value) || 0)}
                    className="w-full glass-input pl-8 text-xs font-mono"
                    placeholder="40,000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Net Rental Income (or Loss)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    value={formData.rental_income}
                    onChange={(e) => handleIncomeChange('rental_income', parseFloat(e.target.value) || 0)}
                    className="w-full glass-input pl-8 text-xs font-mono"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Other Sources Income
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    value={formData.other_income}
                    onChange={(e) => handleIncomeChange('other_income', parseFloat(e.target.value) || 0)}
                    className="w-full glass-input pl-8 text-xs font-mono"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
                3. Chapter VI-A Deductions & Section 24(b)
              </h3>
              <span className="text-[11px] text-amber-400 font-medium flex items-center space-x-1">
                <Info className="w-3.5 h-3.5" />
                <span>Primary benefit in Old Tax Regime</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Section 80C (PPF, EPF, ELSS, LIC, Home Loan Principal)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    value={formData.deductions.section_80c}
                    onChange={(e) => handleDeductionChange('section_80c', parseFloat(e.target.value) || 0)}
                    className="w-full glass-input pl-8 text-xs font-mono"
                    placeholder="1,50,000"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Capped at ₹1,50,000</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Section 80CCD(1B) (Voluntary NPS)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    value={formData.deductions.section_80ccd_1b}
                    onChange={(e) => handleDeductionChange('section_80ccd_1b', parseFloat(e.target.value) || 0)}
                    className="w-full glass-input pl-8 text-xs font-mono"
                    placeholder="50,000"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Capped at ₹50,000 over 80C</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Section 80D Health Insurance (Self & Family)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    value={formData.deductions.section_80d_self}
                    onChange={(e) => handleDeductionChange('section_80d_self', parseFloat(e.target.value) || 0)}
                    className="w-full glass-input pl-8 text-xs font-mono"
                    placeholder="25,000"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Max ₹25,000</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-400">
                    Section 80D (Parents Mediclaim)
                  </label>
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.deductions.parents_senior_citizen}
                      onChange={(e) => handleDeductionChange('parents_senior_citizen', e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-emerald-500 w-3.5 h-3.5"
                    />
                    <span className="text-[10px] text-emerald-400 font-semibold">Senior Citizen?</span>
                  </label>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    value={formData.deductions.section_80d_parents}
                    onChange={(e) => handleDeductionChange('section_80d_parents', parseFloat(e.target.value) || 0)}
                    className="w-full glass-input pl-8 text-xs font-mono"
                    placeholder="50,000"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Max {formData.deductions.parents_senior_citizen ? '₹50,000 (Senior Citizen)' : '₹25,000 (Non-senior)'}
                </span>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Section 24(b) Home Loan Interest (Self-Occupied Property)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    value={formData.deductions.section_24b_home_loan}
                    onChange={(e) => handleDeductionChange('section_24b_home_loan', parseFloat(e.target.value) || 0)}
                    className="w-full glass-input pl-8 text-xs font-mono"
                    placeholder="2,00,000"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Max ₹2,00,000 (Allowed only under Old Regime)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Summary Sidebar (Right col) */}
        <div className="space-y-4">
          <div className="glass-panel p-5 border-emerald-500/20 shadow-xl space-y-4 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Live Computation Summary
              </span>
              <span className="text-[11px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
                FY {formData.financial_year}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Gross Income:</span>
                <span className="font-mono font-bold text-white text-sm">
                  ₹{grossIncome.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Standard Deduction:</span>
                <span className="font-mono text-emerald-400">
                  ₹{stdDeduction.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Eligible 80C + 80D + 24(b):</span>
                <span className="font-mono text-cyan-400 font-semibold">
                  ₹{totalDeductionsOld.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-between items-center text-slate-200">
                <span className="font-semibold">Old Regime Net Taxable:</span>
                <span className="font-mono font-bold text-amber-400">
                  ₹{Math.max(0, grossIncome - 50000 - totalDeductionsOld).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-200">
                <span className="font-semibold">New Regime Net Taxable:</span>
                <span className="font-mono font-bold text-emerald-300">
                  ₹{Math.max(0, grossIncome - stdDeduction).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2">
              <button
                onClick={() => onNavigateToTab('compare')}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-bold text-white flex items-center justify-center space-x-2 transition-colors"
              >
                <span>Compare Regimes Side-by-Side</span>
                <span>→</span>
              </button>

              <button
                onClick={() => onNavigateToTab('chat')}
                className="w-full py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-bold text-emerald-300 flex items-center justify-center space-x-2 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask Copilot About This Profile</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
