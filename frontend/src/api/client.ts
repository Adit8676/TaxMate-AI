import type {
  TaxProfile,
  TaxCalculationResult,
  RegimeComparisonResult,
  AgentResponse,
  DocumentExtractionResult,
  ReconciliationResult,
  EvaluationSummary
} from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const api = {
  // Chat
  async sendMessage(message: string, overrideProfile?: TaxProfile): Promise<AgentResponse> {
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, override_profile: overrideProfile })
    });
    if (!res.ok) throw new Error(`Chat error: ${res.statusText}`);
    return res.json();
  },

  // Profile
  async getProfile(): Promise<TaxProfile> {
    const res = await fetch(`${API_BASE_URL}/profile`);
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  async updateProfile(profile: TaxProfile): Promise<{ profile: TaxProfile; message: string }> {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  // Tax calculations
  async calculateTax(profile?: TaxProfile, regime: string = 'new'): Promise<TaxCalculationResult> {
    const res = await fetch(`${API_BASE_URL}/tax/calculate?regime=${regime}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    if (!res.ok) throw new Error('Failed to calculate tax');
    return res.json();
  },

  async compareTaxRegimes(profile?: TaxProfile): Promise<RegimeComparisonResult> {
    const res = await fetch(`${API_BASE_URL}/tax/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    if (!res.ok) throw new Error('Failed to compare tax regimes');
    return res.json();
  },

  // Documents
  async listDocuments(): Promise<DocumentExtractionResult[]> {
    const res = await fetch(`${API_BASE_URL}/documents`);
    if (!res.ok) throw new Error('Failed to list documents');
    return res.json();
  },

  async uploadDocument(file: File): Promise<DocumentExtractionResult> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Failed to upload document');
    return res.json();
  },

  async reconcileDocument(docId: string): Promise<ReconciliationResult> {
    const res = await fetch(`${API_BASE_URL}/documents/${docId}/reconcile`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to reconcile document');
    return res.json();
  },

  async seedSampleForm16(): Promise<{ document_id: string; message: string }> {
    const res = await fetch(`${API_BASE_URL}/documents/seed-sample`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to seed sample document');
    return res.json();
  },

  // Evaluations
  async getEvaluationSummary(): Promise<EvaluationSummary> {
    const res = await fetch(`${API_BASE_URL}/evaluations/summary`);
    if (!res.ok) throw new Error('Failed to fetch evaluation summary');
    return res.json();
  },

  async runEvaluationSuite(): Promise<EvaluationSummary> {
    const res = await fetch(`${API_BASE_URL}/evaluations/run`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to run evaluations');
    return res.json();
  }
};
