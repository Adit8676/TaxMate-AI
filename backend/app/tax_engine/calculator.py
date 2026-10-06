"""Core deterministic Indian Income Tax Calculator.
Calculates tax liabilities, compares regimes, computes capital gains,
and provides transparent line-item traces.
"""
from typing import Dict, Any, List, Tuple
from .models import (
    TaxProfileInput,
    TaxCalculationResult,
    RegimeComparisonResult,
    TaxSlabBreakdown,
    TaxLineItem,
    CapitalGainResult,
    CapitalGainTransaction,
    ValidationResult
)
from .rules_config import get_year_config, CESS_RATE

def validate_tax_inputs(profile: TaxProfileInput) -> ValidationResult:
    warnings = []
    errors = []
    recommendations = []

    if profile.salary_income < 0:
        errors.append("Salary income cannot be negative.")
    if profile.interest_income < 0:
        errors.append("Interest income cannot be negative.")
    if profile.rental_income < 0:
        # Rental loss can be set off up to 2L
        if abs(profile.rental_income) > 200000:
            warnings.append("House property loss set-off against other heads is limited to ₹2,00,000 per financial year.")
    
    if profile.age < 18 or profile.age > 110:
        warnings.append(f"Age {profile.age} seems unusual for standard taxpayer profiles.")
    
    total_deductions = (
        profile.deductions.section_80c +
        profile.deductions.section_80d_self +
        profile.deductions.section_80d_parents +
        profile.deductions.section_80ccd_1b +
        profile.deductions.section_24b_home_loan
    )
    
    gross = profile.salary_income + profile.interest_income + max(0, profile.rental_income) + profile.other_income
    if gross == 0 and total_deductions > 0:
        warnings.append("Deductions are declared, but gross income is ₹0.")
        
    if profile.deductions.section_80c > 150000:
        recommendations.append("Section 80C investments exceed ₹1,50,000 ceiling. Only ₹1,50,000 is eligible for deduction.")

    if profile.deductions.section_80ccd_1b > 50000:
        recommendations.append("Section 80CCD(1B) additional NPS is capped at ₹50,000.")

    if profile.financial_year not in ["2023-24", "2024-25", "2025-26"]:
        warnings.append(f"Tax year {profile.financial_year} is not in official tested list. Using standard 2024-25 rules.")

    return ValidationResult(
        is_valid=(len(errors) == 0),
        warnings=warnings,
        errors=errors,
        recommendations=recommendations
    )

def _compute_surcharge(taxable_income: float, base_tax: float, regime: str) -> float:
    """Calculate surcharge with highest slab cap under New Regime."""
    if taxable_income <= 5000000:
        return 0.0
    elif taxable_income <= 10000000:
        return base_tax * 0.10
    elif taxable_income <= 20000000:
        return base_tax * 0.15
    elif taxable_income <= 50000000:
        return base_tax * 0.25
    else:
        # Above 5 Cr
        if regime.lower() == "new":
            # Capped at 25% under New Regime
            return base_tax * 0.25
        else:
            return base_tax * 0.37

def calculate_tax(profile: TaxProfileInput, regime: str = "new") -> TaxCalculationResult:
    """Calculate tax for a single regime deterministically."""
    regime = regime.lower()
    year_cfg = get_year_config(profile.financial_year)
    reg_cfg = year_cfg["old_regime"] if regime == "old" else year_cfg["new_regime"]
    ay = year_cfg["assessment_year"]
    
    line_items: List[TaxLineItem] = []
    assumptions: List[str] = []
    unsupported_items: List[str] = []
    
    # 1. Gross Income Calculation
    gross_income = profile.salary_income + profile.interest_income + profile.other_income
    
    # Rental income / loss
    if profile.rental_income < 0:
        allowable_loss = max(profile.rental_income, -200000.0)
        gross_income += allowable_loss
        line_items.append(TaxLineItem(
            category="Income",
            description="Rental Loss set-off (capped at ₹2L)",
            amount=allowable_loss,
            note="Section 71(3A) capping applied"
        ))
    else:
        gross_income += profile.rental_income
        if profile.rental_income > 0:
            line_items.append(TaxLineItem(category="Income", description="Rental Income", amount=profile.rental_income))

    line_items.append(TaxLineItem(category="Income", description="Salary Income", amount=profile.salary_income))
    if profile.interest_income > 0:
        line_items.append(TaxLineItem(category="Income", description="Interest Income", amount=profile.interest_income))
    if profile.other_income > 0:
        line_items.append(TaxLineItem(category="Income", description="Other Income", amount=profile.other_income))

    # 2. Standard Deduction
    std_deduction = 0.0
    if profile.is_salaried and profile.salary_income > 0:
        std_deduction = min(profile.salary_income, reg_cfg["standard_deduction_salaried"])
        line_items.append(TaxLineItem(
            category="Deduction",
            description=f"Standard Deduction ({'Section 16(ia)' if regime == 'old' else 'Sec 115BAC'})",
            amount=std_deduction,
            note=f"₹{std_deduction:,.0f} applied for salaried individual"
        ))
    
    # 3. Deductions under Chapter VI-A & Sec 24(b)
    allowed_deductions = 0.0
    if regime == "old":
        # 80C
        val_80c = min(profile.deductions.section_80c, reg_cfg["max_80c"])
        if val_80c > 0:
            allowed_deductions += val_80c
            line_items.append(TaxLineItem(category="Deduction", description="Section 80C (PPF/EPF/ELSS/LIC)", amount=val_80c))
            
        # 80D self
        val_80d_self = min(profile.deductions.section_80d_self, reg_cfg["max_80d_self"])
        if val_80d_self > 0:
            allowed_deductions += val_80d_self
            line_items.append(TaxLineItem(category="Deduction", description="Section 80D (Health Insurance Self)", amount=val_80d_self))
            
        # 80D parents
        max_parents = reg_cfg["max_80d_parents_senior"] if profile.deductions.parents_senior_citizen else reg_cfg["max_80d_parents_non_senior"]
        val_80d_parents = min(profile.deductions.section_80d_parents, max_parents)
        if val_80d_parents > 0:
            allowed_deductions += val_80d_parents
            line_items.append(TaxLineItem(
                category="Deduction",
                description=f"Section 80D (Health Insurance Parents - {'Senior Citizen' if profile.deductions.parents_senior_citizen else 'Non-Senior'})",
                amount=val_80d_parents
            ))
            
        # 80CCD(1B) NPS
        val_nps = min(profile.deductions.section_80ccd_1b, reg_cfg["max_80ccd_1b"])
        if val_nps > 0:
            allowed_deductions += val_nps
            line_items.append(TaxLineItem(category="Deduction", description="Section 80CCD(1B) (NPS Voluntary)", amount=val_nps))
            
        # 24(b) Home loan interest
        val_24b = min(profile.deductions.section_24b_home_loan, reg_cfg["max_24b"])
        if val_24b > 0:
            allowed_deductions += val_24b
            line_items.append(TaxLineItem(category="Deduction", description="Section 24(b) (Home Loan Interest Self-Occupied)", amount=val_24b))

        # 80TTA Savings Interest
        if profile.interest_income > 0:
            val_80tta = min(profile.interest_income, profile.deductions.section_80tta, reg_cfg["max_80tta"])
            if val_80tta > 0:
                allowed_deductions += val_80tta
                line_items.append(TaxLineItem(category="Deduction", description="Section 80TTA (Savings Interest)", amount=val_80tta))

        # HRA Exemption
        if profile.deductions.hra_exemption > 0:
            allowed_deductions += profile.deductions.hra_exemption
            line_items.append(TaxLineItem(category="Deduction", description="HRA Exemption Section 10(13A)", amount=profile.deductions.hra_exemption))
    else:
        # New Regime disallows 80C, 80D, 24(b) self-occupied, 80TTA
        if profile.deductions.section_80c > 0 or profile.deductions.section_80d_self > 0 or profile.deductions.section_24b_home_loan > 0:
            assumptions.append("Deductions under 80C, 80D, 24(b) self-occupied, and 80TTA are not allowed under New Tax Regime (Section 115BAC).")
            
    # Section 80CCD(2) - Employer NPS is allowed in both regimes
    if profile.deductions.section_80ccd_2 > 0:
        # Capped up to 14% of basic salary
        allowed_deductions += profile.deductions.section_80ccd_2
        line_items.append(TaxLineItem(
            category="Deduction",
            description="Section 80CCD(2) (Employer NPS Contribution)",
            amount=profile.deductions.section_80ccd_2,
            note="Allowed in both Old and New Tax Regimes"
        ))

    # 4. Net Taxable Normal Income
    total_deductions = std_deduction + allowed_deductions
    taxable_income = max(0.0, gross_income - total_deductions)

    # 5. Slab Tax Computation
    slabs = reg_cfg["slabs"]
    if regime == "old" and profile.age >= 60 and "senior_citizen_slabs" in reg_cfg:
        slabs = reg_cfg["senior_citizen_slabs"]
        assumptions.append("Senior citizen tax slabs applied for Old Regime (age >= 60).")

    slab_tax = 0.0
    slabs_breakdown: List[TaxSlabBreakdown] = []

    for slab in slabs:
        s_min = slab["min"]
        s_max = slab["max"]
        rate = slab["rate"]
        label = slab["label"]

        if taxable_income > s_min:
            taxable_in_slab = min(taxable_income, s_max) - s_min
            tax_in_slab = taxable_in_slab * rate
            slab_tax += tax_in_slab
            slabs_breakdown.append(TaxSlabBreakdown(
                slab_label=label,
                taxable_amount_in_slab=taxable_in_slab,
                rate_percent=rate * 100,
                tax_amount=tax_in_slab
            ))
        else:
            slabs_breakdown.append(TaxSlabBreakdown(
                slab_label=label,
                taxable_amount_in_slab=0.0,
                rate_percent=rate * 100,
                tax_amount=0.0
            ))

    # 6. Special Rate Tax (Capital Gains)
    cg_cfg = year_cfg.get("capital_gains", {})
    special_rate_tax = 0.0
    special_tax_breakdown: List[Dict[str, Any]] = []

    # STCG 111A
    if profile.capital_gains_stcg_equity > 0:
        stcg_rate = cg_cfg.get("stcg_111a_rate", 0.15)
        stcg_tax = profile.capital_gains_stcg_equity * stcg_rate
        special_rate_tax += stcg_tax
        special_tax_breakdown.append({
            "type": "STCG 111A (Equity/Equity MF)",
            "rate": f"{stcg_rate*100:.1f}%",
            "gains": profile.capital_gains_stcg_equity,
            "tax": stcg_tax
        })

    # LTCG 112A
    if profile.capital_gains_ltcg_equity > 0:
        ltcg_rate = cg_cfg.get("ltcg_112a_rate", 0.10)
        exemption = cg_cfg.get("ltcg_112a_exemption", 100000.0)
        taxable_ltcg = max(0.0, profile.capital_gains_ltcg_equity - exemption)
        ltcg_tax = taxable_ltcg * ltcg_rate
        special_rate_tax += ltcg_tax
        special_tax_breakdown.append({
            "type": "LTCG 112A (Equity/Equity MF)",
            "rate": f"{ltcg_rate*100:.1f}%",
            "exemption": exemption,
            "gains": profile.capital_gains_ltcg_equity,
            "taxable_gains": taxable_ltcg,
            "tax": ltcg_tax
        })

    total_base_tax = slab_tax + special_rate_tax

    # 7. Section 87A Rebate
    rebate_87a = 0.0
    rebate_limit = reg_cfg.get("rebate_87a_limit", 500000.0)
    rebate_max = reg_cfg.get("rebate_87a_max", 12500.0)

    if taxable_income <= rebate_limit:
        # Note: Sec 87A rebate does not apply to LTCG under 112A
        eligible_tax_for_rebate = slab_tax + (profile.capital_gains_stcg_equity * cg_cfg.get("stcg_111a_rate", 0.15))
        rebate_87a = min(eligible_tax_for_rebate, rebate_max)
    elif regime == "new" and taxable_income > 700000 and taxable_income < 727777:
        # Marginal relief under Section 87A in New Regime for income marginally above 7L
        excess_income = taxable_income - 700000
        if slab_tax > excess_income:
            rebate_87a = slab_tax - excess_income
            assumptions.append(f"Section 87A Marginal relief of ₹{rebate_87a:,.0f} applied since taxable income is marginally above ₹7,00,000.")

    tax_after_rebate = max(0.0, total_base_tax - rebate_87a)

    # 8. Surcharge
    surcharge = _compute_surcharge(taxable_income + profile.capital_gains_ltcg_equity + profile.capital_gains_stcg_equity, tax_after_rebate, regime)

    # 9. Health & Education Cess (4%)
    cess = (tax_after_rebate + surcharge) * CESS_RATE
    final_tax = round(tax_after_rebate + surcharge + cess)

    effective_rate = (final_tax / gross_income * 100) if gross_income > 0 else 0.0

    return TaxCalculationResult(
        financial_year=profile.financial_year,
        assessment_year=ay,
        regime=regime,
        gross_income=gross_income,
        standard_deduction=std_deduction,
        allowed_deductions=allowed_deductions,
        taxable_income=taxable_income,
        slab_tax=slab_tax,
        slabs_breakdown=slabs_breakdown,
        special_rate_tax=special_rate_tax,
        special_tax_breakdown=special_tax_breakdown,
        rebate_87a=rebate_87a,
        tax_after_rebate=tax_after_rebate,
        surcharge=surcharge,
        cess=cess,
        final_tax=float(final_tax),
        effective_tax_rate=round(effective_rate, 2),
        line_items=line_items,
        assumptions=assumptions,
        unsupported_items=unsupported_items
    )

def compare_tax_regimes(profile: TaxProfileInput) -> RegimeComparisonResult:
    """Compare Old Regime and New Regime side-by-side with explainability."""
    old_res = calculate_tax(profile, regime="old")
    new_res = calculate_tax(profile, regime="new")
    
    diff = old_res.final_tax - new_res.final_tax  # positive: new regime is cheaper
    savings = abs(diff)
    
    key_drivers: List[str] = []
    
    # Analyze why one regime won
    if diff > 0:
        recommended = "new"
        summary = f"New Tax Regime saves ₹{savings:,.0f} compared to Old Regime."
        
        # Explain drivers
        if new_res.standard_deduction > old_res.standard_deduction:
            key_drivers.append(f"Higher Standard Deduction of ₹{new_res.standard_deduction:,.0f} in New Regime (vs ₹{old_res.standard_deduction:,.0f} in Old Regime).")
        key_drivers.append("Lower concessional slab rates across income bands in New Regime (Sec 115BAC).")
        if old_res.allowed_deductions < 250000:
            key_drivers.append(f"Declared Chapter VI-A deductions (₹{old_res.allowed_deductions:,.0f}) are not sufficient to overcome the lower slab rates of the New Regime.")
        if new_res.rebate_87a > 0 and old_res.rebate_87a == 0:
            key_drivers.append("Full Section 87A rebate makes tax zero up to ₹7,00,000 taxable income in New Regime.")
    elif diff < 0:
        recommended = "old"
        summary = f"Old Tax Regime saves ₹{savings:,.0f} due to high deductions."
        key_drivers.append(f"High itemized deductions total ₹{old_res.allowed_deductions:,.0f} (80C, 80D, 24(b) Home loan), bringing Old Regime taxable income down significantly.")
        if profile.deductions.section_24b_home_loan > 0:
            key_drivers.append(f"Home loan interest deduction of ₹{profile.deductions.section_24b_home_loan:,.0f} under Section 24(b) is only available in Old Regime.")
        if profile.deductions.section_80c >= 150000:
            key_drivers.append("Maxed out Section 80C investments (₹1,50,000).")
    else:
        recommended = "equal"
        summary = "Both tax regimes yield the exact same tax liability."
        key_drivers.append("Taxable income and slabs result in identical net tax.")

    assumptions = list(set(old_res.assumptions + new_res.assumptions))

    return RegimeComparisonResult(
        financial_year=profile.financial_year,
        assessment_year=new_res.assessment_year,
        old_regime=old_res,
        new_regime=new_res,
        tax_difference=diff,
        recommended_regime=recommended,
        savings_amount=savings,
        key_drivers=key_drivers,
        recommendation_summary=summary,
        assumptions=assumptions
    )

def calculate_capital_gains(transactions: List[CapitalGainTransaction], financial_year: str = "2024-25") -> CapitalGainResult:
    """Calculate STCG and LTCG across equity, mutual funds, and real estate."""
    year_cfg = get_year_config(financial_year)
    cg_cfg = year_cfg.get("capital_gains", {})
    
    total_stcg = 0.0
    total_ltcg = 0.0
    breakdown = []

    for tx in transactions:
        gain = (tx.sale_price - tx.purchase_price) - tx.expenses
        asset = tx.asset_type.lower()
        
        # Determine holding period from dates if provided, or use asset convention
        is_ltcg = False
        try:
            from datetime import datetime
            p_dt = datetime.strptime(tx.purchase_date, "%Y-%m-%d")
            s_dt = datetime.strptime(tx.sale_date, "%Y-%m-%d")
            days = (s_dt - p_dt).days
            if "equity" in asset or "mutual_fund" in asset:
                is_ltcg = days > 365
            elif "real_estate" in asset:
                is_ltcg = days > 730
            else:
                is_ltcg = days > 730
        except Exception:
            # Fallback
            is_ltcg = "ltcg" in asset

        if gain > 0:
            if is_ltcg:
                total_ltcg += gain
                breakdown.append({"asset": tx.asset_type, "type": "LTCG", "gain": gain, "holding_days": days if 'days' in locals() else None})
            else:
                total_stcg += gain
                breakdown.append({"asset": tx.asset_type, "type": "STCG", "gain": gain, "holding_days": days if 'days' in locals() else None})
        else:
            breakdown.append({"asset": tx.asset_type, "type": "LOSS", "loss": gain})

    exemption = cg_cfg.get("ltcg_112a_exemption", 125000.0 if "2024" in financial_year or "2025" in financial_year else 100000.0)
    exempt_ltcg = min(total_ltcg, exemption)
    taxable_ltcg = max(0.0, total_ltcg - exempt_ltcg)
    taxable_stcg = total_stcg

    stcg_rate = cg_cfg.get("stcg_111a_rate", 0.20 if "2024" in financial_year else 0.15)
    ltcg_rate = cg_cfg.get("ltcg_112a_rate", 0.125 if "2024" in financial_year else 0.10)

    stcg_tax = taxable_stcg * stcg_rate
    ltcg_tax = taxable_ltcg * ltcg_rate
    total_tax = stcg_tax + ltcg_tax

    rule_applied = f"Sec 111A ({stcg_rate*100}%) and Sec 112A ({ltcg_rate*100}% above ₹{exemption:,.0f} exemption)"

    return CapitalGainResult(
        financial_year=financial_year,
        total_stcg=total_stcg,
        total_ltcg=total_ltcg,
        exempt_ltcg=exempt_ltcg,
        taxable_stcg=taxable_stcg,
        taxable_ltcg=taxable_ltcg,
        stcg_tax=stcg_tax,
        ltcg_tax=ltcg_tax,
        total_capital_gains_tax=total_tax,
        rule_applied=rule_applied,
        breakdown=breakdown
    )
