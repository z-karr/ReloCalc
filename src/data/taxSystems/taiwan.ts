import { TaxBracket } from '../../types';

// ============================================================================
// TAIWAN TAX SYSTEM (2024-2026)
// ============================================================================

// Income tax brackets for 2024
export const TAIWAN_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 54000, rate: 0.05 },
  { min: 54000, max: 121000, rate: 0.12 },
  { min: 121000, max: 242000, rate: 0.20 },
  { min: 242000, max: 453000, rate: 0.30 },
  { min: 453000, max: Infinity, rate: 0.40 },
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
  return calculateBracketTax(grossSalary, TAIWAN_TAX_BRACKETS);
}

/**
 * Calculate social security contributions
 */
export function calculateSocialSecurity(grossSalary: number): number {
  return grossSalary * SOCIAL_SECURITY_RATE;
}

/**
 * Calculate total Taiwan taxes
 */
export function calculateTaiwanTax(grossSalary: number) {
  const incomeTax = calculateIncomeTax(grossSalary);
  const socialSecurity = calculateSocialSecurity(grossSalary);

  return {
    incomeTax,
    socialSecurity,
    totalTax: incomeTax + socialSecurity,
  };
}
