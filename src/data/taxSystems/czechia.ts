import { TaxBracket, SalaryCalculation } from '../../types';

// ============================================================================
// CZECH TAX SYSTEM (2024)
// ============================================================================
// Source: Czech Financial Administration
// Last updated: January 2024
// System: Flat income tax + social and health insurance

// Flat income tax rate (15% standard, 23% on high incomes)
export const STANDARD_TAX_RATE = 0.15;
export const HIGH_INCOME_TAX_RATE = 0.23;
export const HIGH_INCOME_THRESHOLD = 64772; // CZK 1,935,552 (~$85,000 at 22.80 rate)

// Basic tax allowance (základní sleva na poplatníka)
export const BASIC_TAX_ALLOWANCE = 1051; // CZK 30,840 per year (reduces monthly tax)

// Social security contributions (employee portion)
export const SOCIAL_INSURANCE_RATE = 0.065; // 6.5% for pension and sickness

// Health insurance (employee portion)
export const HEALTH_INSURANCE_RATE = 0.045; // 4.5%

export function calculateCzechTax(grossSalary: number): SalaryCalculation {
  // Social insurance
  const socialInsurance = grossSalary * SOCIAL_INSURANCE_RATE;

  // Health insurance
  const healthInsurance = grossSalary * HEALTH_INSURANCE_RATE;

  // Super-gross salary (for tax calculation) - employer contributions are tax base
  // Simplified: using gross salary as base for 2024 (rules changed)
  const taxBase = grossSalary;

  // Calculate income tax
  let incomeTax = 0;
  if (grossSalary <= HIGH_INCOME_THRESHOLD) {
    incomeTax = taxBase * STANDARD_TAX_RATE;
  } else {
    // Standard rate up to threshold, high rate above
    const standardPart = HIGH_INCOME_THRESHOLD * STANDARD_TAX_RATE;
    const highPart = (grossSalary - HIGH_INCOME_THRESHOLD) * HIGH_INCOME_TAX_RATE;
    incomeTax = standardPart + highPart;
  }

  // Apply basic tax allowance (monthly, so annual = 12x allowance)
  const annualTaxAllowance = BASIC_TAX_ALLOWANCE * 12;
  incomeTax = Math.max(0, incomeTax - annualTaxAllowance);

  const totalTax = incomeTax + socialInsurance + healthInsurance;
  const netSalary = grossSalary - totalTax;

  return {
    grossSalary,
    federalTax: incomeTax,
    stateTax: 0,
    localTax: 0,
    fica: socialInsurance + healthInsurance,
    netSalary,
    monthlyTakeHome: netSalary / 12,
    effectiveTaxRate: totalTax / grossSalary,
    adjustedNetSalary: netSalary,
  };
}
