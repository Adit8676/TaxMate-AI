export interface TaxProfile {
  profile_id?: string;
  financial_year: string;
  assessment_year?: string;
  age: number;
  is_salaried: boolean;
  salary_income: number;
  interest_income: number;
  rental_income: number;
  other_income: number;
  capital_gains_stcg_equity?: number;
  capital_gains_ltcg_equity?: number;
  capital_gains_other?: number;
  deductions: {
    section_80c: number;
    section_80d_self: number;
    section_80d_parents: number;
    parents_senior_citizen: boolean;
    section_80ccd_1b: number;
    section_80ccd_2: number;
    section_24b_home_loan: number;
    section_80tta: number;
    hra_exemption: number;
    other_exemptions: number;
  };
}

export interface TaxSlabBreakdown {
  slab_label: string;
  taxable_amount_in_slab: number;
  rate_percent: number;
  tax_amount: number;
}

export interface TaxLineItem {
  category: string;
  description: string;
  amount: number;
  note?: string;
}

export interface TaxCalculationResult {
  financial_year: string;
  assessment_year: string;
  regime: string;
  gross_income: number;
  standard_deduction: number;
  allowed_deductions: number;
  taxable_income: number;
  slab_tax: number;
  slabs_breakdown: TaxSlabBreakdown[];
  special_rate_tax: number;
  special_tax_breakdown: any[];
  rebate_87a: number;
  tax_after_rebate: number;
  surcharge: number;
  cess: number;
  final_tax: number;
  effective_tax_rate: number;
  line_items: TaxLineItem[];
  assumptions: string[];
  unsupported_items: string[];
}

export interface RegimeComparisonResult {
  financial_year: string;
  assessment_year: string;
  old_regime: TaxCalculationResult;
  new_regime: TaxCalculationResult;
  tax_difference: number;
  recommended_regime: string;
  savings_amount: number;
  key_drivers: string[];
  recommendation_summary: string;
  assumptions: string[];
}

export interface Citation {
  citation_id: string;
  document_title: string;
  organization: string;
  section_id?: string;
  assessment_year?: string;
  snippet: string;
  source_url?: string;
  confidence_score: number;
}

export interface AgentResponse {
  answer: string;
  summary?: string;
  calculation?: RegimeComparisonResult | TaxCalculationResult;
  sources: Citation[];
  assumptions: string[];
  uncertainties: string[];
  tools_used: string[];
  requires_user_confirmation: boolean;
  request_id: string;
}

export interface ExtractedField {
  field_key: string;
  label: string;
  extracted_value: any;
  confidence: number;
  source_snippet?: string;
  page_number: number;
  is_low_confidence: boolean;
}

export interface DocumentExtractionResult {
  document_id: string;
  filename: string;
  document_type: string;
  assessment_year?: string;
  employer_name?: string;
  employee_pan_masked?: string;
  fields: Record<string, ExtractedField>;
  overall_confidence: number;
  upload_timestamp: string;
}

export interface DiscrepancyItem {
  field_name: string;
  label: string;
  document_value: number;
  profile_value: number;
  difference: number;
  severity: string;
  recommendation: string;
}

export interface ReconciliationResult {
  document_id: string;
  exact_matches: string[];
  discrepancies: DiscrepancyItem[];
  missing_in_profile: Array<{
    field_key: string;
    label: string;
    extracted_value: number;
    note: string;
  }>;
  low_confidence_fields: string[];
  is_fully_reconciled: boolean;
  summary: string;
}

export interface TestCaseResult {
  test_id: string;
  category: string;
  query: string;
  expected_tool?: string;
  actual_tools: string[];
  tool_matched: boolean;
  retrieval_hit: boolean;
  answer_correct: boolean;
  safety_passed: boolean;
  latency_ms: number;
  status: string;
}

export interface EvaluationSummary {
  total_cases: number;
  passed_cases: number;
  pass_rate_percent: number;
  retrieval_hit_rate_percent: number;
  tool_selection_accuracy_percent: number;
  answer_correctness_percent: number;
  safety_pass_rate_percent: number;
  latency_avg_ms: number;
  latency_p95_ms: number;
  token_cost_proxy: number;
  executed_at: string;
  category_breakdown: Record<string, { total: number; passed: number }>;
  test_case_results: TestCaseResult[];
}
