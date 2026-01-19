import { TaxBracket, SalaryCalculation } from '../../types';

// ============================================================================
// ITALIAN TAX SYSTEM (2024)
// ============================================================================
// Source: Italian Revenue Agency (Agenzia delle Entrate)
// Last updated: January 2024
// System: Progressive national income tax (IRPEF) + regional tax + social contributions

// IRPEF (Imposta sul Reddito delle Persone Fisiche) brackets (2024)
export const ITALY_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 15000, rate: 0.23 },
  { min: 15000, max: 28000, rate: 0.25 },
  { min: 28000, max: 50000, rate: 0.35 },
  { min: 50000, max: Infinity, rate: 0.43 },
];

// Regional tax (IRAP - varies by region)
// Using average rate
export const REGIONAL_TAX_RATE = 0.0173; // ~1.73% average

// Municipal tax (addizionale comunale)
export const MUNICIPAL_TAX_RATE = 0.008; // ~0.8% average

// Social Security contributions (employee portion)
// INPS (pension and health insurance)
export const SOCIAL_SECURITY_RATE = 0.0919; // 9.19% employee portion

export function calculateItalianTax(grossSalary: number): SalaryCalculation {
  let incomeTax = 0;

  // Calculate progressive income tax (IRPEF)
  for (const bracket of ITALY_TAX_BRACKETS) {
    if (grossSalary > bracket.min) {
      const taxableInBracket = Math.min(grossSalary, bracket.max) - bracket.min;
      incomeTax += taxableInBracket * bracket.rate;
    }
  }

  // Calculate regional tax
  const regionalTax = grossSalary * REGIONAL_TAX_RATE;

  // Calculate municipal tax
  const municipalTax = grossSalary * MUNICIPAL_TAX_RATE;

  // Calculate social security
  const socialSecurity = grossSalary * SOCIAL_SECURITY_RATE;

  const totalTax = incomeTax + regionalTax + municipalTax + socialSecurity;
  const netSalary = grossSalary - totalTax;

  return {
    grossSalary,
    federalTax: incomeTax,
    stateTax: regionalTax,
    localTax: municipalTax,
    fica: socialSecurity,
    netSalary,
    monthlyTakeHome: netSalary / 12,
    effectiveTaxRate: totalTax / grossSalary,
    adjustedNetSalary: netSalary,
  };
}
