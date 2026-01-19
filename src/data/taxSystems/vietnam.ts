import { TaxBracket } from '../../types';

// ============================================================================
// VIETNAMESE TAX SYSTEM (2024-2026)
// ============================================================================

// Income tax brackets for 2024
export const VIETNAM_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 5000, rate: 0.05 },
  { min: 5000, max: 10000, rate: 0.10 },
  { min: 10000, max: 18000, rate: 0.15 },
  { min: 18000, max: 32000, rate: 0.20 },
  { min: 32000, max: 52000, rate: 0.25 },
  { min: 52000, max: 80000, rate: 0.30 },
  { min: 80000, max: Infinity, rate: 0.35 },
];

// Social security contributions
export const SOCIAL_SECURITY_RATE = 0.105; // 10.5%

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
  return calculateBracketTax(grossSalary, VIETNAM_TAX_BRACKETS);
}

/**
 * Calculate social security contributions
 */
export function calculateSocialSecurity(grossSalary: number): number {
  return grossSalary * SOCIAL_SECURITY_RATE;
}

/**
 * Calculate total Vietnamese taxes
 */
export function calculateVietnameseTax(grossSalary: number) {
  const incomeTax = calculateIncomeTax(grossSalary);
  const socialSecurity = calculateSocialSecurity(grossSalary);

  return {
    incomeTax,
    socialSecurity,
    totalTax: incomeTax + socialSecurity,
  };
}
