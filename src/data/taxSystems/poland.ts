import { TaxBracket, SalaryCalculation } from '../../types';

// ============================================================================
// POLISH TAX SYSTEM (2024)
// ============================================================================
// Source: Polish Ministry of Finance
// Last updated: January 2024
// System: Progressive income tax + social security contributions

// Income tax brackets (PIT - Podatek dochodowy od osób fizycznych)
export const POLAND_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 30000, rate: 0.12 }, // 12% (PLN 120,000 at 4.02 rate)
  { min: 30000, max: Infinity, rate: 0.32 }, // 32%
];

// Tax-free allowance
export const TAX_FREE_ALLOWANCE = 7530; // ~PLN 30,000 in USD (reduces tax)

// Social security contributions (employee portion)
// ZUS (Zakład Ubezpieczeń Społecznych)
export const PENSION_CONTRIBUTION = 0.0976; // 9.76%
export const DISABILITY_CONTRIBUTION = 0.015; // 1.5%
export const SICKNESS_CONTRIBUTION = 0.0245; // 2.45%
export const TOTAL_SOCIAL_SECURITY = PENSION_CONTRIBUTION + DISABILITY_CONTRIBUTION + SICKNESS_CONTRIBUTION; // 13.71%

// Health insurance contribution
export const HEALTH_INSURANCE_RATE = 0.09; // 9% (7.75% tax deductible, but simplified here)

export function calculatePolishTax(grossSalary: number): SalaryCalculation {
  // Social security contributions (deducted from gross)
  const socialSecurity = grossSalary * TOTAL_SOCIAL_SECURITY;

  // Income after social security
  const incomeAfterZUS = grossSalary - socialSecurity;

  // Calculate income tax on income after ZUS
  let incomeTax = 0;
  for (const bracket of POLAND_TAX_BRACKETS) {
    if (incomeAfterZUS > bracket.min) {
      const taxableInBracket = Math.min(incomeAfterZUS, bracket.max) - bracket.min;
      incomeTax += taxableInBracket * bracket.rate;
    }
  }

  // Apply tax reduction (from tax-free allowance)
  const taxReduction = Math.min(TAX_FREE_ALLOWANCE * 0.12, incomeTax);
  incomeTax = Math.max(0, incomeTax - taxReduction);

  // Health insurance (on gross income, partially deductible from tax)
  const healthInsurance = grossSalary * HEALTH_INSURANCE_RATE;

  const totalTax = incomeTax + socialSecurity + healthInsurance;
  const netSalary = grossSalary - totalTax;

  return {
    grossSalary,
    federalTax: incomeTax,
    stateTax: 0,
    localTax: 0,
    fica: socialSecurity + healthInsurance,
    netSalary,
    monthlyTakeHome: netSalary / 12,
    effectiveTaxRate: totalTax / grossSalary,
    adjustedNetSalary: netSalary,
  };
}
