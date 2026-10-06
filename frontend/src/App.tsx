import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ChatView } from './components/ChatView';
import { TaxProfileView } from './components/TaxProfileView';
import { CompareView } from './components/CompareView';
import { DocumentsView } from './components/DocumentsView';
import { EvaluationView } from './components/EvaluationView';
import type { TaxProfile } from './types';
import { api } from './api/client';
import { Info } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [profile, setProfile] = useState<TaxProfile>({
    profile_id: 'default-user',
    financial_year: '2024-25',
    age: 30,
    is_salaried: true,
    salary_income: 1450000,
    interest_income: 30000,
    rental_income: 0,
    other_income: 0,
    deductions: {
      section_80c: 150000,
      section_80d_self: 25000,
      section_80d_parents: 50000,
      parents_senior_citizen: true,
      section_80ccd_1b: 50000,
      section_80ccd_2: 0,
      section_24b_home_loan: 200000,
      section_80tta: 0,
      hra_exemption: 0,
      other_exemptions: 0
    }
  });

  useEffect(() => {
    const fetchActiveProfile = async () => {
      try {
        const prof = await api.getProfile();
        setProfile(prof);
      } catch (err) {
        console.warn('Could not fetch backend profile on load, using default state.');
      }
    };
    fetchActiveProfile();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        financialYear={profile.financial_year} 
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {activeTab === 'chat' && (
          <ChatView 
            profile={profile} 
            onNavigateToTab={setActiveTab} 
          />
        )}
        {activeTab === 'profile' && (
          <TaxProfileView 
            profile={profile} 
            onProfileUpdated={setProfile} 
            onNavigateToTab={setActiveTab} 
          />
        )}
        {activeTab === 'compare' && (
          <CompareView 
            profile={profile} 
            onNavigateToTab={setActiveTab} 
          />
        )}
        {activeTab === 'documents' && (
          <DocumentsView 
            profile={profile} 
            onProfileUpdated={setProfile} 
            onNavigateToTab={setActiveTab} 
          />
        )}
        {activeTab === 'evaluation' && (
          <EvaluationView />
        )}
      </main>

      {/* Statutory Disclaimer & Footer */}
      <footer className="border-t border-white/5 bg-slate-950/90 py-3 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <div className="flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>
              <strong>Disclaimer:</strong> TaxMate AI provides informational and calculation assistance. Consult a Chartered Accountant for filing decisions.
            </span>
          </div>
          <div className="flex items-center space-x-3 text-slate-400 font-mono">
            <span>FastAPI + Python</span>
            <span>•</span>
            <span>Official MCP Protocols</span>
            <span>•</span>
            <span>Hybrid RRF RAG</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
