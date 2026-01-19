import { TaxBracket, SalaryCalculation } from '../../types';

// ============================================================================
// COSTA RICAN TAX SYSTEM (2024)
// ============================================================================
// Source: Ministerio de Hacienda de Costa Rica
// Last updated: January 2024
// System: Progressive income tax + social security (CCSS)

// Income tax brackets (Impuesto sobre la Renta)
export const COSTA_RICA_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 15962, rate: 0 }, // CRC 8,300,000 at 520 rate
  { min: 15962, max: 23942, rate: 0.10 }, // 10%
  { min: 23942, max: 39904, rate: 0.15 }, // 15%
  { min: 39904, max: 79808, rate: 0.20 }, // 20%
  { min: 79808, max: Infinity, rate: 0.25 }, // 25%
];

// Social security (CCSS - Caja Costarricense de Seguro Social) - employee portion
export const CCSS_RATE = 0.1067; // 10.67% employee contribution
// Includes: health insurance, pension, IVM (disability/old age/death)

export function calculateCostaRicanTax(grossSalary: number): SalaryCalculation {
  // Social security (CCSS)
  const socialSecurity = grossSalary * CCSS_RATE;

  // Calculate progressive income tax (on gross salary)
  let incomeTax = 0;
  for (const bracket of COSTA_RICA_TAX_BRACKETS) {
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
