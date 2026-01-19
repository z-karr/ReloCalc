import { TaxBracket, SalaryCalculation } from '../../types';

// ============================================================================
// DUTCH TAX SYSTEM (2024)
// ============================================================================
// Source: Belastingdienst (Dutch Tax Authority)
// Last updated: January 2024
// System: Progressive tax boxes (Box 1 for employment income)

// Box 1: Income from employment and homeownership (2024)
export const NETHERLANDS_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 75518, rate: 0.3693 }, // 36.93% (includes social security)
  { min: 75518, max: Infinity, rate: 0.495 }, // 49.5%
];

// The Dutch system combines income tax and social insurance contributions
// The rates above include:
// - Income tax (inkomstenbelasting)
// - National insurance contributions (AOW, Anw, Wlz)

// General tax credit (algemene heffingskorting)
// Reduces tax liability, phase-out starts at €24,813
export const GENERAL_TAX_CREDIT = 3362; // 2024 full credit

// Labour tax credit (arbeidskorting)
// Additional credit for working income
export const LABOUR_TAX_CREDIT_MAX = 5532; // 2024 maximum

export function calculateDutchTax(grossSalary: number): SalaryCalculation {
  let totalTax = 0;

  // Calculate progressive tax
  for (const bracket of NETHERLANDS_TAX_BRACKETS) {
    if (grossSalary > bracket.min) {
      const taxableInBracket = Math.min(grossSalary, bracket.max) - bracket.min;
      totalTax += taxableInBracket * bracket.rate;
    }
  }

  // Apply general tax credit
  let taxCredit = GENERAL_TAX_CREDIT;

  // Apply labour tax credit (simplified - full credit for incomes below phase-out threshold)
  if (grossSalary < 115000) {
    if (grossSalary < 11491) {
      // Build-up phase
      taxCredit += grossSalary * 0.08425;
    } else if (grossSalary < 24821) {
      // Constant phase
      taxCredit += LABOUR_TAX_CREDIT_MAX;
    } else {
      // Phase-out
      const phaseOutAmount = Math.max(0, LABOUR_TAX_CREDIT_MAX - (grossSalary - 24821) * 0.06510);
      taxCredit += phaseOutAmount;
    }
  }

  // Apply tax credits (cannot reduce below zero)
  totalTax = Math.max(0, totalTax - taxCredit);

  const netSalary = grossSalary - totalTax;

  return {
    grossSalary,
    federalTax: totalTax, // Box 1 income tax (includes social insurance)
    stateTax: 0, // No separate regional tax
    localTax: 0,
    fica: 0, // Included in federal tax
    netSalary,
    monthlyTakeHome: netSalary / 12,
    effectiveTaxRate: totalTax / grossSalary,
    adjustedNetSalary: netSalary,
  };
}
