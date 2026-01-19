import { TaxBracket } from '../../types';

// ============================================================================
// AUSTRALIAN TAX SYSTEM (2024-2026)
// ============================================================================

// Federal tax brackets for Australia (2024-25)
// Updated July 2024 - Stage 3 tax cuts implemented
export const AUSTRALIA_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 18200, rate: 0 },      // Tax-free threshold
  { min: 18200, max: 45000, rate: 0.16 },   // Reduced from 19%
  { min: 45000, max: 135000, rate: 0.30 },  // Reduced from 32.5%, bracket expanded
  { min: 135000, max: 190000, rate: 0.37 },
  { min: 190000, max: Infinity, rate: 0.45 },
];

// Medicare Levy
export const MEDICARE_LEVY_RATE = 0.02; // 2%
export const MEDICARE_LEVY_THRESHOLD = 23226; // Single person threshold

// Superannuation Guarantee (employer contribution, not deducted from salary)
// But employees may make voluntary contributions
export const SUPERANNUATION_RATE = 0.115; // 11.5% in 2024

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
 * Calculate Australian income tax
 */
export function calculateIncomeTax(grossSalary: number): number {
  return calculateBracketTax(grossSalary, AUSTRALIA_TAX_BRACKETS);
}

/**
 * Calculate Medicare Levy
 */
export function calculateMedicareLevy(grossSalary: number): number {
  if (grossSalary < MEDICARE_LEVY_THRESHOLD) {
    return 0; // Below threshold
  }
  return grossSalary * MEDICARE_LEVY_RATE;
}

/**
 * Calculate total Australian taxes
 * Note: Superannuation is typically employer-paid, not deducted from salary
 */
export function calculateAustralianTax(grossSalary: number) {
  const incomeTax = calculateIncomeTax(grossSalary);
  const medicareLevy = calculateMedicareLevy(grossSalary);

  return {
    incomeTax,
    medicareLevy,
    totalTax: incomeTax + medicareLevy,
  };
}
