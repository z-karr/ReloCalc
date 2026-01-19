import { TaxBracket } from '../../types';

// ============================================================================
// THAI TAX SYSTEM (2024-2026)
// ============================================================================

// Income tax brackets for 2024
export const THAILAND_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 17000, rate: 0.05 },
  { min: 17000, max: 34000, rate: 0.10 },
  { min: 34000, max: 68000, rate: 0.15 },
  { min: 68000, max: 114000, rate: 0.20 },
  { min: 114000, max: 170000, rate: 0.25 },
  { min: 170000, max: 227000, rate: 0.30 },
  { min: 227000, max: Infinity, rate: 0.35 },
];

// Social security contributions
export const SOCIAL_SECURITY_RATE = 0.05; // 5%

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
  return calculateBracketTax(grossSalary, THAILAND_TAX_BRACKETS);
}

/**
 * Calculate social security contributions
 */
export function calculateSocialSecurity(grossSalary: number): number {
  return grossSalary * SOCIAL_SECURITY_RATE;
}

/**
 * Calculate total Thai taxes
 */
export function calculateThaiTax(grossSalary: number) {
  const incomeTax = calculateIncomeTax(grossSalary);
  const socialSecurity = calculateSocialSecurity(grossSalary);

  return {
    incomeTax,
    socialSecurity,
    totalTax: incomeTax + socialSecurity,
  };
}
