import { TaxBracket } from '../../types';

// ============================================================================
// US FEDERAL TAX SYSTEM (2024-2026)
// ============================================================================

// Federal tax brackets for single filers (2024)
export const US_FEDERAL_BRACKETS: TaxBracket[] = [
  { min: 0, max: 11600, rate: 0.10 },
  { min: 11600, max: 47150, rate: 0.12 },
  { min: 47150, max: 100525, rate: 0.22 },
  { min: 100525, max: 191950, rate: 0.24 },
  { min: 191950, max: 243725, rate: 0.32 },
  { min: 243725, max: 609350, rate: 0.35 },
  { min: 609350, max: Infinity, rate: 0.37 },
];

// Standard deduction for single filers (2024)
export const US_STANDARD_DEDUCTION = 14600;

// FICA (Social Security + Medicare) limits and rates
export const US_SOCIAL_SECURITY_RATE = 0.062;
export const US_SOCIAL_SECURITY_WAGE_BASE = 168600; // 2024 cap
export const US_MEDICARE_RATE = 0.0145;
export const US_MEDICARE_ADDITIONAL_THRESHOLD = 200000;
export const US_MEDICARE_ADDITIONAL_RATE = 0.009;

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
 * Calculate federal income tax
 */
export function calculateFederalTax(grossSalary: number): number {
  const taxableIncome = Math.max(0, grossSalary - US_STANDARD_DEDUCTION);
  return calculateBracketTax(taxableIncome, US_FEDERAL_BRACKETS);
}

/**
 * Calculate FICA (Social Security + Medicare)
 */
export function calculateFICA(grossSalary: number): number {
  // Social Security (capped)
  const socialSecurityWages = Math.min(grossSalary, US_SOCIAL_SECURITY_WAGE_BASE);
  const socialSecurity = socialSecurityWages * US_SOCIAL_SECURITY_RATE;

  // Medicare (uncapped with additional tax for high earners)
  const medicare = grossSalary * US_MEDICARE_RATE;
  const additionalMedicare = grossSalary > US_MEDICARE_ADDITIONAL_THRESHOLD
    ? (grossSalary - US_MEDICARE_ADDITIONAL_THRESHOLD) * US_MEDICARE_ADDITIONAL_RATE
    : 0;

  return socialSecurity + medicare + additionalMedicare;
}
