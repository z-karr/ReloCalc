import { TaxBracket, SalaryCalculation } from '../../types';

// ============================================================================
// SWISS TAX SYSTEM (2024)
// ============================================================================
// Source: Swiss Federal Tax Administration
// Last updated: January 2024
// System: Federal + Cantonal + Municipal taxes + Social security

// Federal income tax (direct federal tax - withholding tax simplified)
// Using average effective rates for typical income levels
export const FEDERAL_TAX_RATE = 0.08; // ~8% average effective federal tax

// Cantonal tax (varies greatly - using Zurich as reference)
// Zurich canton + municipal combined effective rate
export const CANTONAL_TAX_RATE = 0.11; // ~11% for Zurich

// Social security contributions (AHV/IV/EO + ALV + pension)
// Employee portion of social insurance
export const SOCIAL_SECURITY_RATE = 0.065; // 6.5% employee portion
export const UNEMPLOYMENT_INSURANCE_RATE = 0.011; // 1.1% (up to CHF 148,200)
export const PENSION_CONTRIBUTION_RATE = 0.065; // ~6.5% pension (varies by age/employer)

export function calculateSwissTax(
  grossSalary: number,
  cantonalRate: number = CANTONAL_TAX_RATE
): SalaryCalculation {
  // Federal tax (simplified - actual system is progressive but complex)
  const federalTax = grossSalary * FEDERAL_TAX_RATE;

  // Cantonal + Municipal tax (combined)
  const cantonalTax = grossSalary * cantonalRate;

  // Social security (AHV/IV/EO)
  const socialSecurity = grossSalary * SOCIAL_SECURITY_RATE;

  // Unemployment insurance (on income up to CHF 148,200 in USD)
  const unemploymentInsurance = grossSalary * UNEMPLOYMENT_INSURANCE_RATE;

  // Pension contributions (mandatory occupational pension - 2nd pillar)
  const pension = grossSalary * PENSION_CONTRIBUTION_RATE;

  const totalTax = federalTax + cantonalTax + socialSecurity + unemploymentInsurance + pension;
  const netSalary = grossSalary - totalTax;

  return {
    grossSalary,
    federalTax,
    stateTax: cantonalTax, // Using stateTax for cantonal+municipal
    localTax: 0,
    fica: socialSecurity + unemploymentInsurance + pension, // Social contributions
    netSalary,
    monthlyTakeHome: netSalary / 12,
    effectiveTaxRate: totalTax / grossSalary,
    adjustedNetSalary: netSalary,
  };
}
