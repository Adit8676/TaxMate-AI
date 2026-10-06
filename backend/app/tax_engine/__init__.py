"""Tax Engine module exports."""
from .models import (
    TaxProfileInput,
    TaxCalculationResult,
    RegimeComparisonResult,
    CapitalGainResult,
    CapitalGainTransaction,
    ValidationResult,
    DeductionsInput,
    TaxLineItem
)
from .calculator import (
    calculate_tax,
    compare_tax_regimes,
    calculate_capital_gains,
    validate_tax_inputs
)
from .rules_config import get_year_config, TAX_RULES_BY_YEAR

__all__ = [
    "TaxProfileInput",
    "TaxCalculationResult",
    "RegimeComparisonResult",
    "CapitalGainResult",
    "CapitalGainTransaction",
    "ValidationResult",
    "DeductionsInput",
    "TaxLineItem",
    "calculate_tax",
    "compare_tax_regimes",
    "calculate_capital_gains",
    "validate_tax_inputs",
    "get_year_config",
    "TAX_RULES_BY_YEAR"
]
