"""Unit tests for the Deterministic Indian Tax Engine."""
import pytest
from app.tax_engine import (
    TaxProfileInput,
    DeductionsInput,
    calculate_tax,
    compare_tax_regimes,
    calculate_capital_gains,
    validate_tax_inputs
)

def test_new_regime_nil_tax_under_7_lakhs():
    """Under New Regime for FY 2024-25, salary of 7.5L with 75k std deduction results in taxable income 6.75L, eligible for 87A rebate -> final tax 0."""
    profile = TaxProfileInput(
        financial_year="2024-25",
        salary_income=775000.0,  # 7.75L - 75k = 7.00L taxable income
        is_salaried=True
    )
    result = calculate_tax(profile, regime="new")
    assert result.standard_deduction == 75000.0
    assert result.taxable_income == 700000.0
    # Under slabs:
    # 0-3L: 0
    # 3-7L: 4L * 5% = 20,000
    assert result.slab_tax == 20000.0
    # Rebate 87A covers up to 25k for income <= 7L
    assert result.rebate_87a == 20000.0
    assert result.final_tax == 0.0

def test_old_regime_deductions_applied():
    """In Old Regime, 80C, 80D, 24b and standard deduction are deducted from gross."""
    profile = TaxProfileInput(
        financial_year="2024-25",
        salary_income=1200000.0,
        is_salaried=True,
        deductions=DeductionsInput(
            section_80c=150000.0,
            section_80d_self=25000.0,
            section_24b_home_loan=200000.0,
            section_80ccd_1b=50000.0
        )
    )
    result = calculate_tax(profile, regime="old")
    assert result.standard_deduction == 50000.0
    # 12L - 50k - (1.5L + 25k + 2L + 50k) = 12L - 50k - 4.25L = 7.25L
    assert result.allowed_deductions == 425000.0
    assert result.taxable_income == 725000.0
    assert result.final_tax > 0

def test_regime_comparison_recommends_old_when_high_deductions():
    """When deductions are high (e.g. 80C + Home loan), Old Regime should save money."""
    profile = TaxProfileInput(
        financial_year="2024-25",
        salary_income=1500000.0,
        is_salaried=True,
        deductions=DeductionsInput(
            section_80c=150000.0,
            section_80d_self=25000.0,
            section_80d_parents=50000.0,
            parents_senior_citizen=True,
            section_24b_home_loan=200000.0,
            section_80ccd_1b=50000.0
        )
    )
    comparison = compare_tax_regimes(profile)
    assert comparison.recommended_regime == "old"
    assert comparison.savings_amount > 0
    assert len(comparison.key_drivers) > 0

def test_regime_comparison_recommends_new_when_zero_deductions():
    """With zero deductions, New Regime concessional slabs always beat Old Regime."""
    profile = TaxProfileInput(
        financial_year="2024-25",
        salary_income=1500000.0,
        is_salaried=True,
        deductions=DeductionsInput()
    )
    comparison = compare_tax_regimes(profile)
    assert comparison.recommended_regime == "new"
    assert comparison.new_regime.final_tax < comparison.old_regime.final_tax

def test_capital_gains_budget_2024_rates():
    """Test STCG (20%) and LTCG (12.5% with 1.25L exemption) for FY 2024-25."""
    from app.tax_engine.models import CapitalGainTransaction
    transactions = [
        CapitalGainTransaction(
            asset_type="equity_listed",
            purchase_date="2024-01-01",
            sale_date="2024-08-01",
            purchase_price=100000.0,
            sale_price=150000.0,  # 50k STCG
            is_post_budget_2024=True
        ),
        CapitalGainTransaction(
            asset_type="equity_listed",
            purchase_date="2022-01-01",
            sale_date="2024-08-01",
            purchase_price=200000.0,
            sale_price=425000.0,  # 225k LTCG
            is_post_budget_2024=True
        )
    ]
    cg_result = calculate_capital_gains(transactions, financial_year="2024-25")
    assert cg_result.total_stcg == 50000.0
    assert cg_result.total_ltcg == 225000.0
    # 225k - 125k exemption = 100k taxable LTCG
    assert cg_result.exempt_ltcg == 125000.0
    assert cg_result.taxable_ltcg == 100000.0
    # STCG tax: 50,000 * 20% = 10,000
    assert cg_result.stcg_tax == 10000.0
    # LTCG tax: 100,000 * 12.5% = 12,500
    assert cg_result.ltcg_tax == 12500.0
    assert cg_result.total_capital_gains_tax == 22500.0

def test_input_validation():
    """Verify negative income is flagged as error and excessive 80C generates recommendation."""
    bad_profile = TaxProfileInput(
        salary_income=-50000.0,
        deductions=DeductionsInput(section_80c=200000.0)
    )
    val = validate_tax_inputs(bad_profile)
    assert not val.is_valid
    assert any("negative" in err.lower() for err in val.errors)
    assert any("1,50,000" in rec for rec in val.recommendations)
