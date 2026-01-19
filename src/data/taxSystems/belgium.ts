import { TaxBracket, SalaryCalculation } from '../../types';

// ============================================================================
// BELGIAN TAX SYSTEM (2024)
// ============================================================================
// Source: Belgian Federal Public Service Finance
// Last updated: January 2024
// System: Progressive federal tax + social security contributions

// Federal income tax brackets (2024)
export const BELGIUM_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 15200, rate: 0.25 },
  { min: 15200, max: 26830, rate: 0.40 },
  { min: 26830, max: 46440, rate: 0.45 },
  { min: 46440, max: Infinity, rate: 0.50 },
];

// Social security contributions (employee portion)
// ONSS (Office National de Sécurité Sociale)
export const SOCIAL_SECURITY_RATE = 0.1305; // 13.05% employee portion

// Basic tax-free allowance
export const TAX_FREE_ALLOWANCE = 10160; // €9,270 equivalent in USD

export function calculateBelgianTax(grossSalary: number): SalaryCalculation {
  let incomeTax = 0;

  // Apply tax-free allowance
  const taxableIncome = Math.max(0, grossSalary - TAX_FREE_ALLOWANCE);

  // Calculate progressive income tax
  for (const bracket of BELGIUM_TAX_BRACKETS) {
    if (taxableIncome > bracket.min) {
      const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
      incomeTax += taxableInBracket * bracket.rate;
    }
  }

  // Calculate social security (on gross salary, before tax-free allowance)
  const socialSecurity = grossSalary * SOCIAL_SECURITY_RATE;

  const totalTax = incomeTax + socialSecurity;
  const netSalary = grossSalary - totalTax;

  return {
    grossSalary,
    federalTax: incomeTax,
    stateTax: 0, // No regional income tax in Belgium
    localTax: 0,
    fica: socialSecurity,
    netSalary,
    monthlyTakeHome: netSalary / 12,
    effectiveTaxRate: totalTax / grossSalary,
    adjustedNetSalary: netSalary,
  };
}
