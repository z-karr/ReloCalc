import { TaxBracket } from '../../types';

// ============================================================================
// UK TAX SYSTEM (2024-2026)
// ============================================================================

// Income tax brackets for 2024
export const UK_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 12600, rate: 0.00 }, // Personal allowance
  { min: 12600, max: 50300, rate: 0.20 }, // Basic rate
  { min: 50300, max: 125000, rate: 0.40 }, // Higher rate
  { min: 125000, max: Infinity, rate: 0.45 }, // Additional rate
];

// National Insurance contributions
// Reduced from 12% to 8% in April 2024
export const NATIONAL_INSURANCE_RATE = 0.08; // 8%

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate tax using progressive brackets
 */
export function calculateBracketTax(taxableIncome: number, brackets: TaxBracket[]): number {
  let tax = 0;
  let previousMax = 0;

  for (const bracket of brackets) {
    if (taxableIncome <= previousMax) {
      break;
    }

    const taxableInBracket = Math.min(taxableIncome, bracket.max) - Math.max(previousMax, bracket.min);
    if (taxableInBracket > 0) {
      tax += taxableInBracket * bracket.rate;
    }

    previousMax = bracket.max;
  }

  return tax;
}

/**
 * Calculate income tax
 */
export function calculateIncomeTax(grossSalary: number): number {
  return calculateBracketTax(grossSalary, UK_TAX_BRACKETS);
}

/**
 * Calculate National Insurance contributions
 */
export function calculateNationalInsurance(grossSalary: number): number {
  // National Insurance is paid on earnings above the personal allowance
  const niThreshold = 12600;
  if (grossSalary <= niThreshold) return 0;
  return (grossSalary - niThreshold) * NATIONAL_INSURANCE_RATE;
}

/**
 * Calculate total UK taxes
 */
export function calculateUKTax(grossSalary: number) {
  const incomeTax = calculateIncomeTax(grossSalary);
  const nationalInsurance = calculateNationalInsurance(grossSalary);

  return {
    incomeTax,
    nationalInsurance,
    totalTax: incomeTax + nationalInsurance,
  };
}
