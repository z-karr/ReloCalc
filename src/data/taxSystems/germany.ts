import { TaxBracket } from '../../types';

// ============================================================================
// GERMAN TAX SYSTEM (2024-2026)
// ============================================================================

// Federal tax brackets for Germany (2024-25)
export const GERMANY_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 11000, rate: 0 },         // Tax-free threshold
  { min: 11000, max: 63000, rate: 0.14 },  // Progressive rate starts at 14%
  { min: 63000, max: 278000, rate: 0.42 }, // Standard top rate
  { min: 278000, max: Infinity, rate: 0.45 }, // Rich tax rate
];

// Social Security Contributions (combined employee + employer share)
// In practice, these are split roughly 50/50 between employee and employer
// We'll use the employee portion for take-home calculations
export const SOCIAL_SECURITY_RATE = 0.20; // ~20% combined (pension, health, unemployment, care insurance)

// Solidarity Surcharge (mostly phased out for most taxpayers as of 2021)
// Only applies to top earners now, so we'll ignore it for simplicity
export const SOLIDARITY_SURCHARGE_RATE = 0.0;

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
 * Calculate German income tax
 */
export function calculateIncomeTax(grossSalary: number): number {
  return calculateBracketTax(grossSalary, GERMANY_TAX_BRACKETS);
}

/**
 * Calculate German social security contributions
 */
export function calculateSocialSecurity(grossSalary: number): number {
  return grossSalary * SOCIAL_SECURITY_RATE;
}

/**
 * Calculate total German taxes
 */
export function calculateGermanTax(grossSalary: number) {
  const incomeTax = calculateIncomeTax(grossSalary);
  const socialSecurity = calculateSocialSecurity(grossSalary);

  return {
    incomeTax,
    socialSecurity,
    totalTax: incomeTax + socialSecurity,
  };
}
