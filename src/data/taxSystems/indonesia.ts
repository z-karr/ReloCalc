import { TaxBracket, SalaryCalculation } from '../../types';

// ============================================================================
// INDONESIAN TAX SYSTEM (2024)
// ============================================================================
// Source: Directorate General of Taxes Indonesia
// Last updated: January 2024
// System: Progressive income tax + social security (BPJS)

// Income tax brackets (PPh 21 - Personal Income Tax)
export const INDONESIA_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 3835, rate: 0.05 }, // 5% (IDR 60,000,000 at 15,650 rate)
  { min: 3835, max: 15341, rate: 0.15 }, // 15% (IDR 250,000,000)
  { min: 15341, max: 30682, rate: 0.25 }, // 25% (IDR 500,000,000)
  { min: 30682, max: 319149, rate: 0.30 }, // 30% (IDR 5,000,000,000)
  { min: 319149, max: Infinity, rate: 0.35 }, // 35%
];

// Tax-free income (PTKP - non-taxable income)
export const PTKP_SINGLE = 3512; // IDR 54,000,000 per year (~$3,512 at 15,650 rate)

// Social security (BPJS) - employee portion
export const BPJS_HEALTH = 0.01; // 1% for health insurance
export const BPJS_EMPLOYMENT = 0.02; // 2% for employment insurance (BPJS Ketenagakerjaan)

export function calculateIndonesianTax(grossSalary: number): SalaryCalculation {
  // Social security contributions
  const bpjsHealth = grossSalary * BPJS_HEALTH;
  const bpjsEmployment = grossSalary * BPJS_EMPLOYMENT;
  const socialSecurity = bpjsHealth + bpjsEmployment;

  // Taxable income (after PTKP deduction)
  const taxableIncome = Math.max(0, grossSalary - PTKP_SINGLE);

  // Calculate progressive income tax
  let incomeTax = 0;
  for (const bracket of INDONESIA_TAX_BRACKETS) {
    if (taxableIncome > bracket.min) {
      const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
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
