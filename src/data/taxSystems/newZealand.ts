import { TaxBracket, SalaryCalculation } from '../../types';

// ============================================================================
// NEW ZEALAND TAX SYSTEM (2024)
// ============================================================================
// Source: Inland Revenue New Zealand (IRD)
// Last updated: January 2024
// System: Progressive PAYE (Pay As You Earn) income tax

// PAYE tax brackets (2024)
export const NEW_ZEALAND_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 8462, rate: 0.105 }, // 10.5% (NZD 14,000 at 1.67 rate)
  { min: 8462, max: 28144, rate: 0.175 }, // 17.5% (NZD 48,000)
  { min: 28144, max: 42216, rate: 0.30 }, // 30% (NZD 70,000)
  { min: 42216, max: 108383, rate: 0.33 }, // 33% (NZD 180,000)
  { min: 108383, max: Infinity, rate: 0.39 }, // 39%
];

// ACC (Accident Compensation Corporation) levy - earner premium
export const ACC_LEVY_RATE = 0.0139; // 1.39% for 2024

export function calculateNewZealandTax(grossSalary: number): SalaryCalculation {
  // Calculate progressive PAYE income tax
  let incomeTax = 0;
  for (const bracket of NEW_ZEALAND_TAX_BRACKETS) {
    if (grossSalary > bracket.min) {
      const taxableInBracket = Math.min(grossSalary, bracket.max) - bracket.min;
      incomeTax += taxableInBracket * bracket.rate;
    }
  }

  // ACC levy
  const accLevy = grossSalary * ACC_LEVY_RATE;

  const totalTax = incomeTax + accLevy;
  const netSalary = grossSalary - totalTax;

  return {
    grossSalary,
    federalTax: incomeTax,
    stateTax: 0,
    localTax: 0,
    fica: accLevy, // ACC levy as social insurance
    netSalary,
    monthlyTakeHome: netSalary / 12,
    effectiveTaxRate: totalTax / grossSalary,
    adjustedNetSalary: netSalary,
  };
}
