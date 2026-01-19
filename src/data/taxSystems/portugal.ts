import { TaxBracket } from '../../types';

// ============================================================================
// PORTUGUESE TAX SYSTEM (2024-2026)
// ============================================================================

// Income tax brackets for Portugal (in USD)
// Portugal uses progressive brackets
export const PORTUGAL_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 7700, rate: 0.145 },
  { min: 7700, max: 11000, rate: 0.21 },
  { min: 11000, max: 15800, rate: 0.265 },
  { min: 15800, max: 20000, rate: 0.285 },
  { min: 20000, max: 25000, rate: 0.35 },
  { min: 25000, max: 36800, rate: 0.37 },
  { min: 36800, max: 48000, rate: 0.45 },
  { min: 48000, max: Infinity, rate: 0.48 },
];

// Social security contributions (employee portion)
export const SOCIAL_SECURITY_RATE = 0.11; // 11% employee portion

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
 * Calculate Portuguese income tax
 */
export function calculateIncomeTax(grossSalary: number): number {
  return calculateBracketTax(grossSalary, PORTUGAL_TAX_BRACKETS);
}

/**
 * Calculate social security contributions
 */
export function calculateSocialSecurity(grossSalary: number): number {
  return grossSalary * SOCIAL_SECURITY_RATE;
}

/**
 * Calculate total Portuguese taxes and contributions
 */
export function calculatePortugueseTax(grossSalary: number) {
  const incomeTax = calculateIncomeTax(grossSalary);
  const socialSecurity = calculateSocialSecurity(grossSalary);

  return {
    incomeTax,
    socialSecurity,
    totalTax: incomeTax + socialSecurity,
  };
}
