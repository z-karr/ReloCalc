import { TaxBracket } from '../../types';

// ============================================================================
// MEXICAN TAX SYSTEM (2024-2026)
// ============================================================================

// Income tax brackets for Mexico (in USD)
// Mexico uses progressive brackets
export const MEXICO_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 7700, rate: 0.0192 },
  { min: 7700, max: 65000, rate: 0.064 },
  { min: 65000, max: 115000, rate: 0.1088 },
  { min: 115000, max: 135000, rate: 0.16 },
  { min: 135000, max: 250000, rate: 0.1792 },
  { min: 250000, max: 400000, rate: 0.2136 },
  { min: 400000, max: 800000, rate: 0.2352 },
  { min: 800000, max: 3000000, rate: 0.30 },
  { min: 3000000, max: 5000000, rate: 0.32 },
  { min: 5000000, max: Infinity, rate: 0.34 },
];

// Social security contributions (employee portion)
export const SOCIAL_SECURITY_RATE = 0.03; // 3% employee portion

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
 * Calculate Mexican income tax
 */
export function calculateIncomeTax(grossSalary: number): number {
  return calculateBracketTax(grossSalary, MEXICO_TAX_BRACKETS);
}

/**
 * Calculate social security contributions
 */
export function calculateSocialSecurity(grossSalary: number): number {
  return grossSalary * SOCIAL_SECURITY_RATE;
}

/**
 * Calculate total Mexican taxes and contributions
 */
export function calculateMexicanTax(grossSalary: number) {
  const incomeTax = calculateIncomeTax(grossSalary);
  const socialSecurity = calculateSocialSecurity(grossSalary);

  return {
    incomeTax,
    socialSecurity,
    totalTax: incomeTax + socialSecurity,
  };
}
