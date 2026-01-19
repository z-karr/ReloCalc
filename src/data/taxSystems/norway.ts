import { TaxBracket, SalaryCalculation } from '../../types';

// ============================================================================
// NORWEGIAN TAX SYSTEM (2024)
// ============================================================================
// Source: Norwegian Tax Administration (Skatteetaten)
// Last updated: January 2024
// System: Municipal tax + Bracket tax + National insurance

// Municipal tax (kommuneskatt) - average rate
export const MUNICIPAL_TAX_RATE = 0.22; // 22% average

// Bracket tax (trinnskatt) - progressive on gross income
export const BRACKET_TAX_LEVELS: TaxBracket[] = [
  { min: 0, max: 21080, rate: 0 }, // NOK 208,050 threshold (~21,080 USD at 10.60 rate)
  { min: 21080, max: 29530, rate: 0.017 }, // 1.7% Step 1
  { min: 29530, max: 73962, rate: 0.04 }, // 4% Step 2
  { min: 73962, max: 129340, rate: 0.136 }, // 13.6% Step 3
  { min: 129340, max: Infinity, rate: 0.166 }, // 16.6% Step 4
];

// National insurance (trygdeavgift) - on gross income
export const NATIONAL_INSURANCE_RATE = 0.078; // 7.8% for employees

// Standard deduction (minstefradrag)
export const STANDARD_DEDUCTION_RATE = 0.46; // 46% of income, capped
export const STANDARD_DEDUCTION_MAX = 11604; // ~NOK 123,000 in USD
export const STANDARD_DEDUCTION_MIN = 473; // ~NOK 5,000 minimum

export function calculateNorwegianTax(grossSalary: number): SalaryCalculation {
  // Standard deduction
  const standardDeduction = Math.max(
    STANDARD_DEDUCTION_MIN,
    Math.min(grossSalary * STANDARD_DEDUCTION_RATE, STANDARD_DEDUCTION_MAX)
  );

  const taxableIncome = Math.max(0, grossSalary - standardDeduction);

  // Municipal tax (on taxable income)
  const municipalTax = taxableIncome * MUNICIPAL_TAX_RATE;

  // Bracket tax (on gross income)
  let bracketTax = 0;
  for (const bracket of BRACKET_TAX_LEVELS) {
    if (grossSalary > bracket.min) {
      const taxableInBracket = Math.min(grossSalary, bracket.max) - bracket.min;
      bracketTax += taxableInBracket * bracket.rate;
    }
  }

  // National insurance (on gross income)
  const nationalInsurance = grossSalary * NATIONAL_INSURANCE_RATE;

  const totalTax = municipalTax + bracketTax + nationalInsurance;
  const netSalary = grossSalary - totalTax;

  return {
    grossSalary,
    federalTax: municipalTax + bracketTax,
    stateTax: 0,
    localTax: 0,
    fica: nationalInsurance,
    netSalary,
    monthlyTakeHome: netSalary / 12,
    effectiveTaxRate: totalTax / grossSalary,
    adjustedNetSalary: netSalary,
  };
}
