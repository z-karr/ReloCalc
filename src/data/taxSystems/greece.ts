import { TaxBracket, SalaryCalculation } from '../../types';

// ============================================================================
// GREEK TAX SYSTEM (2024)
// ============================================================================
// Source: Independent Authority for Public Revenue (AADE)
// Last updated: January 2024
// System: Progressive income tax + social security contributions

// Income tax brackets (2024)
export const GREECE_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 10000, rate: 0.09 },
  { min: 10000, max: 20000, rate: 0.22 },
  { min: 20000, max: 30000, rate: 0.28 },
  { min: 30000, max: 40000, rate: 0.36 },
  { min: 40000, max: Infinity, rate: 0.44 },
];

// Social security contributions (employee portion)
// IKA (Social Insurance Institution)
export const SOCIAL_SECURITY_RATE = 0.1607; // 16.07% employee portion

// Solidarity contribution (on higher incomes)
export const SOLIDARITY_THRESHOLD = 12000;
export const SOLIDARITY_BRACKETS: TaxBracket[] = [
  { min: 12000, max: 20000, rate: 0.0222 }, // 2.22%
  { min: 20000, max: 30000, rate: 0.05 }, // 5%
  { min: 30000, max: 40000, rate: 0.065 }, // 6.5%
  { min: 40000, max: 65000, rate: 0.075 }, // 7.5%
  { min: 65000, max: 220000, rate: 0.09 }, // 9%
  { min: 220000, max: Infinity, rate: 0.10 }, // 10%
];

export function calculateGreekTax(grossSalary: number): SalaryCalculation {
  // Calculate progressive income tax
  let incomeTax = 0;
  for (const bracket of GREECE_TAX_BRACKETS) {
    if (grossSalary > bracket.min) {
      const taxableInBracket = Math.min(grossSalary, bracket.max) - bracket.min;
      incomeTax += taxableInBracket * bracket.rate;
    }
  }

  // Calculate solidarity contribution (only if above threshold)
  let solidarityContribution = 0;
  if (grossSalary > SOLIDARITY_THRESHOLD) {
    for (const bracket of SOLIDARITY_BRACKETS) {
      if (grossSalary > bracket.min) {
        const taxableInBracket = Math.min(grossSalary, bracket.max) - bracket.min;
        solidarityContribution += taxableInBracket * bracket.rate;
      }
    }
  }

  // Social security contributions
  const socialSecurity = grossSalary * SOCIAL_SECURITY_RATE;

  const totalTax = incomeTax + solidarityContribution + socialSecurity;
  const netSalary = grossSalary - totalTax;

  return {
    grossSalary,
    federalTax: incomeTax + solidarityContribution,
    stateTax: 0,
    localTax: 0,
    fica: socialSecurity,
    netSalary,
    monthlyTakeHome: netSalary / 12,
    effectiveTaxRate: totalTax / grossSalary,
    adjustedNetSalary: netSalary,
  };
}
