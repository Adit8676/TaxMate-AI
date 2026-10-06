"""Tax Engine Pydantic models for deterministic Indian Tax computations."""
from typing import List, Optional, Dict, Any
# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field

class CapitalGainTransaction(BaseModel):
    asset_type: str = Field(..., description="equity_listed, mutual_fund_equity, real_estate, unlisted_shares, debt_fund")
    sale_date: str = Field(..., description="YYYY-MM-DD")
    purchase_date: str = Field(..., description="YYYY-MM-DD")
    sale_price: float = Field(ge=0, description="Total sale consideration in INR")
    purchase_price: float = Field(ge=0, description="Cost of acquisition in INR")
    expenses: float = Field(default=0.0, ge=0, description="Transfer expenses in INR")
    is_post_budget_2024: Optional[bool] = Field(default=None, description="Whether transaction occurred on or after 23-July-2024")

class DeductionsInput(BaseModel):
    section_80c: float = Field(default=0.0, ge=0, description="EPF, PPF, ELSS, LIC, Home Loan Principal (max 1.5L)")
    section_80d_self: float = Field(default=0.0, ge=0, description="Health Insurance - Self, Spouse, Children")
    section_80d_parents: float = Field(default=0.0, ge=0, description="Health Insurance - Parents")
    parents_senior_citizen: bool = Field(default=False, description="Whether parents are senior citizens (>= 60)")
    section_80ccd_1b: float = Field(default=0.0, ge=0, description="Additional NPS contribution (max 50,000)")
    section_80ccd_2: float = Field(default=0.0, ge=0, description="Employer NPS contribution (allowed in both regimes)")
    section_24b_home_loan: float = Field(default=0.0, ge=0, description="Home loan interest (Self occupied max 2L in Old)")
    section_80tta: float = Field(default=0.0, ge=0, description="Savings account interest (max 10,000 in Old)")
    hra_exemption: float = Field(default=0.0, ge=0, description="HRA exemption under Section 10(13A)")
    other_exemptions: float = Field(default=0.0, ge=0, description="Other Chapter VI-A or Section 10 exemptions")

class TaxProfileInput(BaseModel):
    profile_id: Optional[str] = "default"
    financial_year: str = Field(default="2024-25", description="e.g. 2023-24, 2024-25, 2025-26")
    assessment_year: Optional[str] = None
    age: int = Field(default=30, ge=18, le=120, description="Age of the taxpayer")
    is_salaried: bool = Field(default=True, description="True for salaried, False for self-employed/business")
    
    # Incomes
    salary_income: float = Field(default=0.0, description="Gross salary before standard deduction")
    interest_income: float = Field(default=0.0, description="Savings bank, FD, and other interest income")
    rental_income: float = Field(default=0.0, description="Net rental income from house property")
    other_income: float = Field(default=0.0, description="Other sources of income")
    
    # Capital Gains
    capital_gains_stcg_equity: float = Field(default=0.0, ge=0, description="Short term capital gains under 111A")
    capital_gains_ltcg_equity: float = Field(default=0.0, ge=0, description="Long term capital gains under 112A")
    capital_gains_other: float = Field(default=0.0, ge=0, description="Other capital gains (real estate, debt, etc.)")
    transactions: Optional[List[CapitalGainTransaction]] = None

    # Deductions
    deductions: DeductionsInput = Field(default_factory=DeductionsInput)

class TaxSlabBreakdown(BaseModel):
    slab_label: str
    taxable_amount_in_slab: float
    rate_percent: float
    tax_amount: float

class TaxLineItem(BaseModel):
    category: str
    description: str
    amount: float
    note: Optional[str] = None

class TaxCalculationResult(BaseModel):
    financial_year: str
    assessment_year: str
    regime: str  # "new" or "old"
    gross_income: float
    standard_deduction: float
    allowed_deductions: float
    taxable_income: float
    
    slab_tax: float
    slabs_breakdown: List[TaxSlabBreakdown]
    
    special_rate_tax: float  # Capital gains specific tax
    special_tax_breakdown: List[Dict[str, Any]]
    
    rebate_87a: float
    tax_after_rebate: float
    surcharge: float
    cess: float  # 4% Health and Education Cess
    final_tax: float
    effective_tax_rate: float
    
    line_items: List[TaxLineItem]
    assumptions: List[str]
    unsupported_items: List[str]

class RegimeComparisonResult(BaseModel):
    financial_year: str
    assessment_year: str
    old_regime: TaxCalculationResult
    new_regime: TaxCalculationResult
    tax_difference: float  # old - new (positive means new regime saves money)
    recommended_regime: str  # "new" or "old" or "equal"
    savings_amount: float
    key_drivers: List[str]
    recommendation_summary: str
    assumptions: List[str]

class CapitalGainResult(BaseModel):
    financial_year: str
    total_stcg: float
    total_ltcg: float
    exempt_ltcg: float
    taxable_stcg: float
    taxable_ltcg: float
    stcg_tax: float
    ltcg_tax: float
    total_capital_gains_tax: float
    rule_applied: str
    breakdown: List[Dict[str, Any]]

class ValidationResult(BaseModel):
    is_valid: bool
    warnings: List[str]
    errors: List[str]
    recommendations: List[str]
