import { TaxBracket } from '../../types';

// ============================================================================
// CANADIAN FEDERAL TAX SYSTEM (2024-2026)
// ============================================================================

// Federal tax brackets for 2024
export const CANADA_FEDERAL_BRACKETS: TaxBracket[] = [
  { min: 0, max: 55867, rate: 0.15 },
  { min: 55867, max: 111733, rate: 0.205 },
  { min: 111733, max: 173205, rate: 0.26 },
  { min: 173205, max: 246752, rate: 0.29 },
  { min: 246752, max: Infinity, rate: 0.33 },
];

// CPP (Canada Pension Plan) 2024
export const CPP_RATE = 0.0595;
export const CPP_MAX_PENSIONABLE_EARNINGS = 68500;
export const CPP_BASIC_EXEMPTION = 3500;

// EI (Employment Insurance) 2024
export const EI_RATE = 0.0166;
export const EI_MAX_INSURABLE_EARNINGS = 63200;

// Provincial tax rates (simplified - using effective rates)
// Note: Actual provincial taxes are also progressive, but for simplicity
// we use average effective rates for middle-income earners
export const PROVINCIAL_TAX_RATES: Record<string, number> = {
  'ON': 0.09,   // Ontario
  'BC': 0.10,   // British Columbia
  'QC': 0.20,   // Quebec (higher due to additional services)
  'AB': 0.10,   // Alberta
  'MB': 0.11,   // Manitoba
  'SK': 0.11,   // Saskatchewan
  'NS': 0.14,   // Nova Scotia
  'NB': 0.13,   // New Brunswick
  'NL': 0.13,   // Newfoundland and Labrador
  'PE': 0.13,   // Prince Edward Island
  'YT': 0.09,   // Yukon
  'NT': 0.10,   // Northwest Territories
  'NU': 0.09,   // Nunavut
};

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
  return calculateBracketTax(grossSalary, CANADA_FEDERAL_BRACKETS);
}

/**
 * Calculate provincial income tax
 */
export function calculateProvincialTax(grossSalary: number, province: string): number {
  const rate = PROVINCIAL_TAX_RATES[province] || 0.10; // Default to 10% if province not found
  return grossSalary * rate;
}

/**
 * Calculate CPP (Canada Pension Plan) contributions
 */
export function calculateCPP(grossSalary: number): number {
  const pensionableEarnings = Math.min(grossSalary, CPP_MAX_PENSIONABLE_EARNINGS) - CPP_BASIC_EXEMPTION;
  if (pensionableEarnings <= 0) return 0;
  return pensionableEarnings * CPP_RATE;
}

/**
 * Calculate EI (Employment Insurance) premiums
 */
export function calculateEI(grossSalary: number): number {
  const insurableEarnings = Math.min(grossSalary, EI_MAX_INSURABLE_EARNINGS);
  return insurableEarnings * EI_RATE;
}

/**
 * Calculate total Canadian taxes and contributions
 */
export function calculateCanadianTax(grossSalary: number, province: string) {
  const federalTax = calculateFederalTax(grossSalary);
  const provincialTax = calculateProvincialTax(grossSalary, province);
  const cpp = calculateCPP(grossSalary);
  const ei = calculateEI(grossSalary);

  return {
    federalTax,
    provincialTax,
    cpp,
    ei,
    totalTax: federalTax + provincialTax + cpp + ei,
  };
}
