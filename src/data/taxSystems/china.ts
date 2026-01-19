import { TaxBracket, SalaryCalculation } from '../../types';

// ============================================================================
// CHINESE TAX SYSTEM (2024)
// ============================================================================
// Source: State Taxation Administration of China
// Last updated: January 2024
// System: Progressive individual income tax + social insurance

// Individual Income Tax (IIT) brackets (2024)
// Monthly tax brackets (annual salary / 12)
export const CHINA_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 5000, rate: 0.03 }, // 3%
  { min: 5000, max: 20000, rate: 0.10 }, // 10%
  { min: 20000, max: 40000, rate: 0.20 }, // 20%
  { min: 40000, max: 60000, rate: 0.25 }, // 25%
  { min: 60000, max: 85000, rate: 0.30 }, // 30%
  { min: 85000, max: Infinity, rate: 0.45 }, // 45%
];

// Basic deduction (annual)
export const BASIC_DEDUCTION = 60000; // CNY 60,000 per year (~$8,287 at 7.24 rate)

// Social insurance contributions (employee portion - varies by city)
// Using Beijing/Shanghai rates as reference
export const PENSION_INSURANCE = 0.08; // 8%
export const MEDICAL_INSURANCE = 0.02; // 2%
export const UNEMPLOYMENT_INSURANCE = 0.005; // 0.5%
export const HOUSING_FUND = 0.12; // 12%
export const TOTAL_SOCIAL_INSURANCE = PENSION_INSURANCE + MEDICAL_INSURANCE + UNEMPLOYMENT_INSURANCE + HOUSING_FUND; // 22.5%

export function calculateChineseTax(grossSalary: number): SalaryCalculation {
  // Social insurance contributions (on gross salary)
  const socialInsurance = grossSalary * TOTAL_SOCIAL_INSURANCE;

  // Taxable income = gross - basic deduction
  const taxableIncome = Math.max(0, grossSalary - BASIC_DEDUCTION);

  // Calculate progressive income tax (using annual brackets)
  let incomeTax = 0;
  for (const bracket of CHINA_TAX_BRACKETS) {
    if (taxableIncome > bracket.min) {
      const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
      incomeTax += taxableInBracket * bracket.rate;
    }
  }

  const totalTax = incomeTax + socialInsurance;
  const netSalary = grossSalary - totalTax;

  return {
    grossSalary,
    federalTax: incomeTax,
    stateTax: 0,
    localTax: 0,
    fica: socialInsurance,
    netSalary,
    monthlyTakeHome: netSalary / 12,
    effectiveTaxRate: totalTax / grossSalary,
    adjustedNetSalary: netSalary,
  };
}
