"""Declarative configuration of Indian Income Tax rules by Financial Year.
Ensures calculations are 100% data-driven, version-aware, and auditable.
"""

TAX_RULES_BY_YEAR = {
    "2023-24": {
        "assessment_year": "2024-25",
        "old_regime": {
            "standard_deduction_salaried": 50000.0,
            "slabs": [
                {"min": 0, "max": 250000, "rate": 0.0, "label": "Up to ₹2,50,000"},
                {"min": 250000, "max": 500000, "rate": 0.05, "label": "₹2,50,001 to ₹5,00,000"},
                {"min": 500000, "max": 1000000, "rate": 0.20, "label": "₹5,00,001 to ₹10,00,000"},
                {"min": 1000000, "max": float("inf"), "rate": 0.30, "label": "Above ₹10,00,000"},
            ],
            "senior_citizen_slabs": [
                {"min": 0, "max": 300000, "rate": 0.0, "label": "Up to ₹3,00,000 (Senior Citizen)"},
                {"min": 300000, "max": 500000, "rate": 0.05, "label": "₹3,00,001 to ₹5,00,000"},
                {"min": 500000, "max": 1000000, "rate": 0.20, "label": "₹5,00,001 to ₹10,00,000"},
                {"min": 1000000, "max": float("inf"), "rate": 0.30, "label": "Above ₹10,00,000"},
            ],
            "rebate_87a_limit": 500000.0,
            "rebate_87a_max": 12500.0,
            "max_80c": 150000.0,
            "max_80d_self": 25000.0,
            "max_80d_parents_non_senior": 25000.0,
            "max_80d_parents_senior": 50000.0,
            "max_80ccd_1b": 50000.0,
            "max_24b": 200000.0,
            "max_80tta": 10000.0,
        },
        "new_regime": {
            "standard_deduction_salaried": 50000.0,
            "slabs": [
                {"min": 0, "max": 300000, "rate": 0.0, "label": "Up to ₹3,00,000"},
                {"min": 300000, "max": 600000, "rate": 0.05, "label": "₹3,00,001 to ₹6,00,000"},
                {"min": 600000, "max": 900000, "rate": 0.10, "label": "₹6,00,001 to ₹9,00,000"},
                {"min": 900000, "max": 1200000, "rate": 0.15, "label": "₹9,00,001 to ₹12,00,000"},
                {"min": 1200000, "max": 1500000, "rate": 0.20, "label": "₹12,00,001 to ₹15,00,000"},
                {"min": 1500000, "max": float("inf"), "rate": 0.30, "label": "Above ₹15,00,000"},
            ],
            "rebate_87a_limit": 700000.0,
            "rebate_87a_max": 25000.0,
        },
        "capital_gains": {
            "stcg_111a_rate": 0.15,
            "ltcg_112a_rate": 0.10,
            "ltcg_112a_exemption": 100000.0,
            "unlisted_ltcg_rate": 0.20,
        }
    },
    "2024-25": {
        "assessment_year": "2025-26",
        "old_regime": {
            "standard_deduction_salaried": 50000.0,
            "slabs": [
                {"min": 0, "max": 250000, "rate": 0.0, "label": "Up to ₹2,50,000"},
                {"min": 250000, "max": 500000, "rate": 0.05, "label": "₹2,50,001 to ₹5,00,000"},
                {"min": 500000, "max": 1000000, "rate": 0.20, "label": "₹5,00,001 to ₹10,00,000"},
                {"min": 1000000, "max": float("inf"), "rate": 0.30, "label": "Above ₹10,00,000"},
            ],
            "senior_citizen_slabs": [
                {"min": 0, "max": 300000, "rate": 0.0, "label": "Up to ₹3,00,000 (Senior Citizen)"},
                {"min": 300000, "max": 500000, "rate": 0.05, "label": "₹3,00,001 to ₹5,00,000"},
                {"min": 500000, "max": 1000000, "rate": 0.20, "label": "₹5,00,001 to ₹10,00,000"},
                {"min": 1000000, "max": float("inf"), "rate": 0.30, "label": "Above ₹10,00,000"},
            ],
            "rebate_87a_limit": 500000.0,
            "rebate_87a_max": 12500.0,
            "max_80c": 150000.0,
            "max_80d_self": 25000.0,
            "max_80d_parents_non_senior": 25000.0,
            "max_80d_parents_senior": 50000.0,
            "max_80ccd_1b": 50000.0,
            "max_24b": 200000.0,
            "max_80tta": 10000.0,
        },
        "new_regime": {
            # Budget 2024 revised standard deduction and slabs
            "standard_deduction_salaried": 75000.0,
            "slabs": [
                {"min": 0, "max": 300000, "rate": 0.0, "label": "Up to ₹3,00,000"},
                {"min": 300000, "max": 700000, "rate": 0.05, "label": "₹3,00,001 to ₹7,00,000"},
                {"min": 700000, "max": 1000000, "rate": 0.10, "label": "₹7,00,001 to ₹10,00,000"},
                {"min": 1000000, "max": 1200000, "rate": 0.15, "label": "₹10,00,001 to ₹12,00,000"},
                {"min": 1200000, "max": 1500000, "rate": 0.20, "label": "₹12,00,001 to ₹15,00,000"},
                {"min": 1500000, "max": float("inf"), "rate": 0.30, "label": "Above ₹15,00,000"},
            ],
            "rebate_87a_limit": 700000.0,
            "rebate_87a_max": 25000.0,
        },
        "capital_gains": {
            # Effective post Budget (23-July-2024)
            "stcg_111a_rate": 0.20,
            "ltcg_112a_rate": 0.125,
            "ltcg_112a_exemption": 125000.0,
            "unlisted_ltcg_rate": 0.125,
        }
    },
    "2025-26": {
        "assessment_year": "2026-27",
        "old_regime": {
            "standard_deduction_salaried": 50000.0,
            "slabs": [
                {"min": 0, "max": 250000, "rate": 0.0, "label": "Up to ₹2,50,000"},
                {"min": 250000, "max": 500000, "rate": 0.05, "label": "₹2,50,001 to ₹5,00,000"},
                {"min": 500000, "max": 1000000, "rate": 0.20, "label": "₹5,00,001 to ₹10,00,000"},
                {"min": 1000000, "max": float("inf"), "rate": 0.30, "label": "Above ₹10,00,000"},
            ],
            "rebate_87a_limit": 500000.0,
            "rebate_87a_max": 12500.0,
            "max_80c": 150000.0,
            "max_80d_self": 25000.0,
            "max_80d_parents_non_senior": 25000.0,
            "max_80d_parents_senior": 50000.0,
            "max_80ccd_1b": 50000.0,
            "max_24b": 200000.0,
            "max_80tta": 10000.0,
        },
        "new_regime": {
            "standard_deduction_salaried": 75000.0,
            "slabs": [
                {"min": 0, "max": 300000, "rate": 0.0, "label": "Up to ₹3,00,000"},
                {"min": 300000, "max": 700000, "rate": 0.05, "label": "₹3,00,001 to ₹7,00,000"},
                {"min": 700000, "max": 1000000, "rate": 0.10, "label": "₹7,00,001 to ₹10,00,000"},
                {"min": 1000000, "max": 1200000, "rate": 0.15, "label": "₹10,00,001 to ₹12,00,000"},
                {"min": 1200000, "max": 1500000, "rate": 0.20, "label": "₹12,00,001 to ₹15,00,000"},
                {"min": 1500000, "max": float("inf"), "rate": 0.30, "label": "Above ₹15,00,000"},
            ],
            "rebate_87a_limit": 700000.0,
            "rebate_87a_max": 25000.0,
        },
        "capital_gains": {
            "stcg_111a_rate": 0.20,
            "ltcg_112a_rate": 0.125,
            "ltcg_112a_exemption": 125000.0,
            "unlisted_ltcg_rate": 0.125,
        }
    }
}

# Health and education cess is uniform 4% across all regimes and years
CESS_RATE = 0.04

def get_year_config(financial_year: str) -> dict:
    clean_year = financial_year.replace("FY", "").strip()
    if clean_year not in TAX_RULES_BY_YEAR:
        # Default to 2024-25 if unknown
        return TAX_RULES_BY_YEAR["2024-25"]
    return TAX_RULES_BY_YEAR[clean_year]
