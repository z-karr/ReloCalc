import { TaxBracket } from '../../types';

// ============================================================================
// ARGENTINE TAX SYSTEM (2024-2026)
// ============================================================================

// Income tax brackets for Argentina (in ARS, but we'll calculate on USD)
// Argentina uses progressive brackets
export const ARGENTINA_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 15000, rate: 0.05 },
  { min: 15000, max: 30000, rate: 0.09 },
  { min: 30000, max: 60000, rate: 0.12 },
  { min: 60000, max: 90000, rate: 0.15 },
  { min: 90000, max: 150000, rate: 0.19 },
  { min: 150000, max: 250000, rate: 0.23 },
  { min: 250000, max: Infinity, rate: 0.27 },
];

// Social security contributions (employee portion)
export const SOCIAL_SECURITY_RATE = 0.17; // 17% total
export const PENSION_RATE = 0.11;
export const HEALTHCARE_RATE = 0.03;
export const UNEMPLOYMENT_RATE = 0.03;

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
 * Calculate Argentine income tax
 */
export function calculateIncomeTax(grossSalary: number): number {
  return calculateBracketTax(grossSalary, ARGENTINA_TAX_BRACKETS);
}

/**
 * Calculate social security contributions
 */
export function calculateSocialSecurity(grossSalary: number): number {
  return grossSalary * SOCIAL_SECURITY_RATE;
}

/**
 * Calculate total Argentine taxes and contributions
 */
export function calculateArgentineTax(grossSalary: number) {
  const incomeTax = calculateIncomeTax(grossSalary);
  const socialSecurity = calculateSocialSecurity(grossSalary);

  return {
    incomeTax,
    socialSecurity,
    totalTax: incomeTax + socialSecurity,
  };
}
