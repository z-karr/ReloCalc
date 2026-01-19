import { TaxBracket, SalaryCalculation } from '../../types';

// ============================================================================
// PHILIPPINE TAX SYSTEM (2024)
// ============================================================================
// Source: Bureau of Internal Revenue (BIR)
// Last updated: January 2024
// System: Progressive income tax + social contributions (SSS, PhilHealth, Pag-IBIG)

// Income tax brackets (TRAIN Law - Tax Reform for Acceleration and Inclusion)
export const PHILIPPINES_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 4479, rate: 0 }, // Tax exempt (PHP 250,000 at 55.80 rate)
  { min: 4479, max: 7168, rate: 0.15 }, // 15%
  { min: 7168, max: 14336, rate: 0.20 }, // 20%
  { min: 14336, max: 143365, rate: 0.25 }, // 25%
  { min: 143365, max: 716828, rate: 0.30 }, // 30%
  { min: 716828, max: Infinity, rate: 0.35 }, // 35%
];

// Social security contributions (employee portion)
// SSS (Social Security System) - capped contribution
export const SSS_RATE = 0.045; // 4.5% employee share
export const SSS_MAX_CONTRIBUTION = 1125; // ~PHP 62,640 max annual (~$1,125)

// PhilHealth (health insurance)
export const PHILHEALTH_RATE = 0.04; // 4% total, 2% employee share
export const PHILHEALTH_EMPLOYEE_SHARE = 0.02; // 2% employee portion

// Pag-IBIG (Home Development Mutual Fund)
export const PAGIBIG_RATE = 0.02; // 2%

export function calculatePhilippineTax(grossSalary: number): SalaryCalculation {
  // SSS contribution (capped)
  const sss = Math.min(grossSalary * SSS_RATE, SSS_MAX_CONTRIBUTION);

  // PhilHealth contribution
  const philHealth = grossSalary * PHILHEALTH_EMPLOYEE_SHARE;

  // Pag-IBIG contribution
  const pagIbig = grossSalary * PAGIBIG_RATE;

  const socialSecurity = sss + philHealth + pagIbig;

  // Calculate progressive income tax
  let incomeTax = 0;
  for (const bracket of PHILIPPINES_TAX_BRACKETS) {
    if (grossSalary > bracket.min) {
      const taxableInBracket = Math.min(grossSalary, bracket.max) - bracket.min;
      incomeTax += taxableInBracket * bracket.rate;
    }
  }

  const totalTax = incomeTax + socialSecurity;
  const netSalary = grossSalary - totalTax;

  return {
    grossSalary,
    federalTax: incomeTax,
    stateTax: 0,
    localTax: 0,
    fica: socialSecurity,
    netSalary,
    monthlyTakeHome: netSalary / 12,
    effectiveTaxRate: totalTax / grossSalary,
    adjustedNetSalary: netSalary,
  };
}
