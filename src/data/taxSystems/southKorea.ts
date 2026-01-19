import { TaxBracket } from '../../types';

// ============================================================================
// SOUTH KOREAN TAX SYSTEM (2024-2026)
// ============================================================================

// Income tax brackets for 2024
export const SOUTH_KOREA_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 12000, rate: 0.06 },
  { min: 12000, max: 46000, rate: 0.15 },
  { min: 46000, max: 88000, rate: 0.24 },
  { min: 88000, max: 150000, rate: 0.35 },
  { min: 150000, max: 300000, rate: 0.38 },
  { min: 300000, max: 500000, rate: 0.40 },
  { min: 500000, max: Infinity, rate: 0.42 },
];

// Social security contributions
export const SOCIAL_SECURITY_RATE = 0.09; // 9%

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
  return calculateBracketTax(grossSalary, SOUTH_KOREA_TAX_BRACKETS);
}

/**
 * Calculate social security contributions
 */
export function calculateSocialSecurity(grossSalary: number): number {
  return grossSalary * SOCIAL_SECURITY_RATE;
}

/**
 * Calculate total South Korean taxes
 */
export function calculateSouthKoreanTax(grossSalary: number) {
  const incomeTax = calculateIncomeTax(grossSalary);
  const socialSecurity = calculateSocialSecurity(grossSalary);

  return {
    incomeTax,
    socialSecurity,
    totalTax: incomeTax + socialSecurity,
  };
}
