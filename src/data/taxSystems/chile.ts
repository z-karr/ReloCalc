import { TaxBracket, SalaryCalculation } from '../../types';

// ============================================================================
// CHILEAN TAX SYSTEM (2024)
// ============================================================================
// Source: Servicio de Impuestos Internos (SII)
// Last updated: January 2024
// System: Progressive income tax + social security

// Income tax brackets (Impuesto Global Complementario)
export const CHILE_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 765, rate: 0 }, // CLP 8,038,932 at 920 rate
  { min: 765, max: 1700, rate: 0.04 }, // 4%
  { min: 1700, max: 2830, rate: 0.08 }, // 8%
  { min: 2830, max: 3960, rate: 0.135 }, // 13.5%
  { min: 3960, max: 5099, rate: 0.23 }, // 23%
  { min: 5099, max: 6782, rate: 0.304 }, // 30.4%
  { min: 6782, max: Infinity, rate: 0.40 }, // 40%
];

// Social security contributions (employee portion)
// AFP (pension): ~10-11%
// Health insurance: ~7%
// Unemployment insurance: ~0.6%
export const AFP_RATE = 0.1076; // Average AFP rate ~10.76%
export const HEALTH_INSURANCE_RATE = 0.07; // 7% for public system (Fonasa)
export const UNEMPLOYMENT_INSURANCE_RATE = 0.006; // 0.6%

export function calculateChileanTax(grossSalary: number): SalaryCalculation {
  // Social security contributions
  const afp = grossSalary * AFP_RATE;
  const healthInsurance = grossSalary * HEALTH_INSURANCE_RATE;
  const unemploymentInsurance = grossSalary * UNEMPLOYMENT_INSURANCE_RATE;
  const socialSecurity = afp + healthInsurance + unemploymentInsurance;

  // Taxable income (after social security deductions)
  const taxableIncome = grossSalary - socialSecurity;

  // Calculate progressive income tax
  let incomeTax = 0;
  for (const bracket of CHILE_TAX_BRACKETS) {
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
