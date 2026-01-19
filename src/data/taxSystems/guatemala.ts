import { TaxBracket, SalaryCalculation } from '../../types';

// ============================================================================
// GUATEMALAN TAX SYSTEM (2024)
// ============================================================================
// Source: Superintendencia de Administración Tributaria (SAT)
// Last updated: January 2024
// System: Progressive income tax + social security (IGSS)

// Income tax brackets (ISR - Impuesto Sobre la Renta)
// Employees can choose between two regimes - using the general regime
export const GUATEMALA_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 38462, rate: 0.05 }, // 5% on first GTQ 300,000 (~$38,462 at 7.8 rate)
  { min: 38462, max: Infinity, rate: 0.07 }, // 7% on amount above
];

// Social security (IGSS - Instituto Guatemalteco de Seguridad Social) - employee portion
export const IGSS_RATE = 0.0483; // 4.83% employee contribution

export function calculateGuatemalanTax(grossSalary: number): SalaryCalculation {
  // Social security (IGSS)
  const socialSecurity = grossSalary * IGSS_RATE;

  // Calculate progressive income tax
  let incomeTax = 0;
  for (const bracket of GUATEMALA_TAX_BRACKETS) {
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
