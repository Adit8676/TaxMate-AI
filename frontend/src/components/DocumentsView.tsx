import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  RefreshCw,
  Lock
} from 'lucide-react';
import { api } from '../api/client';
import type { 
  DocumentExtractionResult, 
  ReconciliationResult, 
  TaxProfile 
} from '../types';

interface DocumentsViewProps {
  profile: TaxProfile;
  onProfileUpdated: (updated: TaxProfile) => void;
  onNavigateToTab: (tab: string) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ 
  profile, 
  onProfileUpdated,
  onNavigateToTab 
}) => {
  const [documents, setDocuments] = useState<DocumentExtractionResult[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentExtractionResult | null>(null);
  const [reconciliation, setReconciliation] = useState<ReconciliationResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvedFields, setApprovedFields] = useState<Record<string, boolean>>({
    salary_income: true,
    section_80c: true,
    section_80d: true,
    section_80ccd_1b: true
  });

  const loadDocuments = async () => {
    try {
      const list = await api.listDocuments();
      setDocuments(list);
      if (list.length > 0 && !selectedDoc) {
        setSelectedDoc(list[0]);
        loadReconciliation(list[0].document_id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadReconciliation = async (docId: string) => {
    try {
      const recon = await api.reconcileDocument(docId);
      setReconciliation(recon);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const doc = await api.uploadDocument(file);
      setDocuments((prev) => [doc, ...prev]);
      setSelectedDoc(doc);
      await loadReconciliation(doc.document_id);
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSeedDemo = async () => {
    setIsUploading(true);
    try {
      await api.seedSampleForm16();
      await loadDocuments();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplyApprovedMerge = async () => {
    if (!selectedDoc) return;
    
    const updated = { ...profile };
    if (approvedFields.salary_income && selectedDoc.fields.salary_income) {
      updated.salary_income = Number(selectedDoc.fields.salary_income.extracted_value);
    }
    if (approvedFields.section_80c && selectedDoc.fields.section_80c) {
      updated.deductions.section_80c = Number(selectedDoc.fields.section_80c.extracted_value);
    }
    if (approvedFields.section_80d && selectedDoc.fields.section_80d) {
      updated.deductions.section_80d_self = Number(selectedDoc.fields.section_80d.extracted_value);
    }
    if (approvedFields.section_80ccd_1b && selectedDoc.fields.section_80ccd_1b) {
      updated.deductions.section_80ccd_1b = Number(selectedDoc.fields.section_80ccd_1b.extracted_value);
    }

    try {
      const res = await api.updateProfile(updated);
      onProfileUpdated(res.profile);
      setShowApprovalModal(false);
      await loadReconciliation(selectedDoc.document_id);
      alert('Tax Profile updated with verified Form 16 values!');
    } catch (err: any) {
      alert(`Error updating profile: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <FileText className="w-6 h-6 text-emerald-400" />
            <span>Document Intelligence & Reconciliation</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Extract Part A & Part B values from Form 16 and reconcile against active tax profile with human-in-the-loop approval.
          </p>
        </div>

        <button
          onClick={handleSeedDemo}
          disabled={isUploading}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-semibold text-white flex items-center space-x-1.5 transition-colors self-start sm:self-auto shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Load Official Sample Form 16</span>
        </button>
      </div>

      {/* Upload Dropzone */}
      <div className="glass-panel p-6 border-dashed border-2 border-white/15 hover:border-emerald-500/40 transition-colors text-center">
        <UploadCloud className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
        <h3 className="text-sm font-bold text-white">
          Upload Form 16 or Salary Certificate (PDF or TXT)
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Parses Employer TAN, masked PAN, Gross Salary under 17(1), Standard Deduction 16(ia), Chapter VI-A deductions, and TDS.
        </p>

        <label className="mt-4 inline-flex items-center px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer shadow-lg shadow-emerald-500/20 transition-all">
          <span>{isUploading ? 'Extracting text & tables...' : 'Choose File to Analyze'}</span>
          <input
            type="file"
            accept=".pdf,.txt,.docx"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Document Selector if multiple exist */}
      {documents.length > 0 && (
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center space-x-2 overflow-x-auto py-1">
            <span className="text-xs font-semibold text-slate-400">Available Documents ({documents.length}):</span>
            {documents.map((doc) => (
              <button
                key={doc.document_id}
                onClick={() => {
                  setSelectedDoc(doc);
                  loadReconciliation(doc.document_id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center space-x-1.5 ${
                  selectedDoc?.document_id === doc.document_id
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-slate-900 text-slate-400 border-white/5 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{doc.filename}</span>
              </button>
            ))}
          </div>
          <button
            onClick={loadDocuments}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            title="Refresh documents list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid: Document Metadata & Extractions */}
      {selectedDoc && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Extracted Fields Table (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-panel p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {selectedDoc.filename}
                  </h3>
                  <span className="text-xs text-slate-400">
                    Employer: <strong className="text-slate-200">{selectedDoc.employer_name}</strong> | AY {selectedDoc.assessment_year}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    PAN: {selectedDoc.employee_pan_masked}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Confidence: {(selectedDoc.overall_confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Fields List */}
              <div className="divide-y divide-white/5 text-xs">
                {Object.values(selectedDoc.fields).map((f) => (
                  <div key={f.field_key} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-200">{f.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                          f.confidence >= 0.90 
                            ? 'bg-emerald-500/15 text-emerald-300' 
                            : 'bg-amber-500/15 text-amber-300'
                        }`}>
                          {(f.confidence * 100).toFixed(0)}% conf
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {f.source_snippet}
                      </p>
                    </div>

                    <span className="font-mono text-sm font-bold text-emerald-400 shrink-0">
                      ₹{Number(f.extracted_value || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reconciliation Report (Right col) */}
          <div className="space-y-4">
            <div className="glass-panel p-5 border-emerald-500/20 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Profile Reconciliation
                </span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  reconciliation?.is_fully_reconciled
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {reconciliation?.is_fully_reconciled ? 'Verified' : 'Action Required'}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {reconciliation?.summary}
              </p>

              {/* Exact matches */}
              {reconciliation?.exact_matches && reconciliation.exact_matches.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-emerald-400 block mb-1.5 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Exact Matches ({reconciliation.exact_matches.length}):</span>
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {reconciliation.exact_matches.map((m, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px]">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Discrepancies */}
              {reconciliation?.discrepancies && reconciliation.discrepancies.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-amber-400 block flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Discrepancies ({reconciliation.discrepancies.length}):</span>
                  </span>
                  {reconciliation.discrepancies.map((d, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-950/60 border border-amber-500/20 text-[11px] space-y-1">
                      <div className="flex justify-between font-semibold text-slate-200">
                        <span>{d.label}</span>
                        <span className="text-amber-400 font-mono">Diff: ₹{d.difference.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[10px] font-mono">
                        <span>Doc: ₹{d.document_value.toLocaleString('en-IN')}</span>
                        <span>Profile: ₹{d.profile_value.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Human Approval Gate Action */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <button
                  onClick={() => setShowApprovalModal(true)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Review & Merge Form 16 Values</span>
                </button>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => onNavigateToTab('compare')}
                    className="flex-1 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <span>Simulate in Compare</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                  <button
                    onClick={() => onNavigateToTab('profile')}
                    className="flex-1 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <span>Check Tax Profile</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Human Approval Modal */}
      {showApprovalModal && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-lg p-6 bg-slate-900 border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">
                Human-in-the-Loop Confirmation
              </h3>
            </div>
            
            <p className="text-xs text-slate-300">
              Select which verified fields extracted from <strong>{selectedDoc.filename}</strong> you wish to merge into your active Tax Profile:
            </p>

            <div className="space-y-2 py-2">
              {['salary_income', 'section_80c', 'section_80d', 'section_80ccd_1b'].map((key) => {
                const f = selectedDoc.fields[key];
                if (!f) return null;
                return (
                  <label key={key} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-white/5 cursor-pointer hover:bg-slate-950">
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="checkbox"
                        checked={!!approvedFields[key]}
                        onChange={(e) => setApprovedFields((prev) => ({ ...prev, [key]: e.target.checked }))}
                        className="rounded border-slate-700 bg-slate-900 text-emerald-500 w-4 h-4"
                      />
                      <span className="text-xs font-medium text-slate-200">{f.label}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      ₹{Number(f.extracted_value || 0).toLocaleString('en-IN')}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyApprovedMerge}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-slate-950"
              >
                Approve & Merge into Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
