import { TaxBracket } from '../../types';

// ============================================================================
// SOUTH AFRICAN TAX SYSTEM (2024-2026)
// ============================================================================

// Income tax brackets for 2024
export const SOUTH_AFRICA_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 22000, rate: 0.18 },
  { min: 22000, max: 35000, rate: 0.26 },
  { min: 35000, max: 61000, rate: 0.31 },
  { min: 61000, max: 77000, rate: 0.36 },
  { min: 77000, max: 110000, rate: 0.39 },
  { min: 110000, max: 155000, rate: 0.41 },
  { min: 155000, max: Infinity, rate: 0.45 },
];

// Social security contributions
export const SOCIAL_SECURITY_RATE = 0.01; // 1%

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
  return calculateBracketTax(grossSalary, SOUTH_AFRICA_TAX_BRACKETS);
}

/**
 * Calculate social security contributions
 */
export function calculateSocialSecurity(grossSalary: number): number {
  return grossSalary * SOCIAL_SECURITY_RATE;
}

/**
 * Calculate total South African taxes
 */
export function calculateSouthAfricanTax(grossSalary: number) {
  const incomeTax = calculateIncomeTax(grossSalary);
  const socialSecurity = calculateSocialSecurity(grossSalary);

  return {
    incomeTax,
    socialSecurity,
    totalTax: incomeTax + socialSecurity,
  };
}
