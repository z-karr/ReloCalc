import { TaxBracket, SalaryCalculation } from '../../types';

// ============================================================================
// EL SALVADOR TAX SYSTEM (2024)
// ============================================================================
// Source: Ministerio de Hacienda de El Salvador
// Last updated: January 2024
// System: Progressive income tax + social security (ISSS/AFP)

// Income tax brackets (Impuesto sobre la Renta)
// Note: El Salvador uses USD as official currency
export const EL_SALVADOR_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 4064, rate: 0 }, // First $4,064 tax-free
  { min: 4064, max: 9143, rate: 0.10 }, // 10%
  { min: 9143, max: 22857, rate: 0.20 }, // 20%
  { min: 22857, max: Infinity, rate: 0.30 }, // 30%
];

// Social security contributions (employee portion)
// ISSS (health insurance): 3%
// AFP (pension): 7.25%
export const ISSS_RATE = 0.03; // 3% for health insurance
export const AFP_RATE = 0.0725; // 7.25% for pension

export function calculateElSalvadorTax(grossSalary: number): SalaryCalculation {
  // Social security contributions
  const isss = grossSalary * ISSS_RATE;
  const afp = grossSalary * AFP_RATE;
  const socialSecurity = isss + afp;

  // Calculate progressive income tax
  let incomeTax = 0;
  for (const bracket of EL_SALVADOR_TAX_BRACKETS) {
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
