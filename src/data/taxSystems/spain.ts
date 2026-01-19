import { TaxBracket, SalaryCalculation } from '../../types';

// ============================================================================
// SPANISH TAX SYSTEM (2024)
// ============================================================================
// Source: Spanish Tax Agency (Agencia Tributaria)
// Last updated: January 2024
// System: Progressive national income tax + regional tax + social security

// National income tax brackets (2024)
export const SPAIN_NATIONAL_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 12450, rate: 0.19 },
  { min: 12450, max: 20200, rate: 0.24 },
  { min: 20200, max: 35200, rate: 0.30 },
  { min: 35200, max: 60000, rate: 0.37 },
  { min: 60000, max: 300000, rate: 0.45 },
  { min: 300000, max: Infinity, rate: 0.47 },
];

// Regional tax (autonomous community)
// Using average across major regions (Madrid, Catalonia, Andalusia)
// Actual rates vary by region
export const SPAIN_REGIONAL_TAX_RATE = 0.12; // Approximate average

// Social Security contributions (employee portion)
// Healthcare, unemployment, pension contributions
export const SOCIAL_SECURITY_RATE = 0.0635; // 6.35% employee portion

export function calculateSpanishTax(
  grossSalary: number,
  regionalRate: number = SPAIN_REGIONAL_TAX_RATE
): SalaryCalculation {
  let nationalTax = 0;

  // Calculate progressive national income tax
  for (const bracket of SPAIN_NATIONAL_TAX_BRACKETS) {
    if (grossSalary > bracket.min) {
      const taxableInBracket = Math.min(grossSalary, bracket.max) - bracket.min;
      nationalTax += taxableInBracket * bracket.rate;
    }
  }

  // Calculate regional tax (simplified as flat rate on taxable income)
  const regionalTax = grossSalary * regionalRate;

  // Calculate social security
  const socialSecurity = grossSalary * SOCIAL_SECURITY_RATE;

  const totalTax = nationalTax + regionalTax + socialSecurity;
  const netSalary = grossSalary - totalTax;

  return {
    grossSalary,
    federalTax: nationalTax,
    stateTax: regionalTax,
    localTax: 0,
    fica: socialSecurity,
    netSalary,
    monthlyTakeHome: netSalary / 12,
    effectiveTaxRate: totalTax / grossSalary,
    adjustedNetSalary: netSalary,
  };
}
