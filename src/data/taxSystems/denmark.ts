import { TaxBracket, SalaryCalculation } from '../../types';

// ============================================================================
// DANISH TAX SYSTEM (2024)
// ============================================================================
// Source: SKAT (Danish Tax Agency)
// Last updated: January 2024
// System: Municipal tax + State tax + Labor market contribution

// Municipal tax (kommuneskat) - varies by municipality
// Using Copenhagen rate as reference: ~25%
export const MUNICIPAL_TAX_RATE = 0.25; // Average ~25%

// State tax (bundskat + topskat)
// Bottom tax: 12.09% on all income
export const STATE_TAX_BASE_RATE = 0.1209;

// Top tax: 15% on income above DKK 588,900 (~$85,700 at 6.87 rate)
export const TOP_TAX_THRESHOLD = 85700;
export const TOP_TAX_RATE = 0.15;

// Labor market contribution (arbejdsmarkedsbidrag)
export const LABOR_MARKET_CONTRIBUTION = 0.08; // 8% on gross income

// Employment deduction (beskæftigelsesfradrag)
export const EMPLOYMENT_DEDUCTION_RATE = 0.1015; // 10.15% of income, max DKK 46,600
export const EMPLOYMENT_DEDUCTION_MAX = 6780; // ~DKK 46,600 in USD

export function calculateDanishTax(grossSalary: number): SalaryCalculation {
  // Labor market contribution (deducted first, from gross)
  const laborMarketContribution = grossSalary * LABOR_MARKET_CONTRIBUTION;
  const incomeAfterAMB = grossSalary - laborMarketContribution;

  // Employment deduction
  const employmentDeduction = Math.min(incomeAfterAMB * EMPLOYMENT_DEDUCTION_RATE, EMPLOYMENT_DEDUCTION_MAX);
  const taxableIncome = incomeAfterAMB - employmentDeduction;

  // Municipal tax
  const municipalTax = taxableIncome * MUNICIPAL_TAX_RATE;

  // State tax (bottom tax)
  const stateTaxBase = taxableIncome * STATE_TAX_BASE_RATE;

  // Top tax (only on high earners)
  let topTax = 0;
  if (grossSalary > TOP_TAX_THRESHOLD) {
    topTax = (grossSalary - TOP_TAX_THRESHOLD) * TOP_TAX_RATE;
  }

  const totalTax = laborMarketContribution + municipalTax + stateTaxBase + topTax;
  const netSalary = grossSalary - totalTax;

  return {
    grossSalary,
    federalTax: municipalTax + stateTaxBase + topTax, // Combined as "federal"
    stateTax: 0,
    localTax: 0,
    fica: laborMarketContribution,
    netSalary,
    monthlyTakeHome: netSalary / 12,
    effectiveTaxRate: totalTax / grossSalary,
    adjustedNetSalary: netSalary,
  };
}
