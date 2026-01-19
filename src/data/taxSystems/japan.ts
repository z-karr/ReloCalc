import { TaxBracket } from '../../types';

// ============================================================================
// JAPANESE TAX SYSTEM (2024-2026)
// ============================================================================

// Federal tax brackets for Japan (2024-25)
// Note: Brackets are based on JPY amounts, but we calculate on USD amounts
// since all salaries in the calculator are in USD
export const JAPAN_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 1950000 / 149.50, rate: 0.05 },     // ~$13,043
  { min: 1950000 / 149.50, max: 3300000 / 149.50, rate: 0.10 },  // ~$22,073
  { min: 3300000 / 149.50, max: 6950000 / 149.50, rate: 0.20 },  // ~$46,488
  { min: 6950000 / 149.50, max: 9000000 / 149.50, rate: 0.23 },  // ~$60,201
  { min: 9000000 / 149.50, max: 18000000 / 149.50, rate: 0.33 }, // ~$120,401
  { min: 18000000 / 149.50, max: 40000000 / 149.50, rate: 0.40 }, // ~$267,559
  { min: 40000000 / 149.50, max: Infinity, rate: 0.45 }, // ~$267,559+
];

// Social Insurance Contributions (combined)
// Includes: pension insurance, health insurance, employment insurance, long-term care insurance
export const SOCIAL_INSURANCE_RATE = 0.15; // ~15% combined employee portion

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
 * Calculate Japanese income tax
 */
export function calculateIncomeTax(grossSalary: number): number {
  return calculateBracketTax(grossSalary, JAPAN_TAX_BRACKETS);
}

/**
 * Calculate Japanese social insurance contributions
 */
export function calculateSocialInsurance(grossSalary: number): number {
  return grossSalary * SOCIAL_INSURANCE_RATE;
}

/**
 * Calculate total Japanese taxes
 */
export function calculateJapaneseTax(grossSalary: number) {
  const incomeTax = calculateIncomeTax(grossSalary);
  const socialInsurance = calculateSocialInsurance(grossSalary);

  return {
    incomeTax,
    socialInsurance,
    totalTax: incomeTax + socialInsurance,
  };
}
