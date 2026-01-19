import { TaxBracket, SalaryCalculation } from '../../types';

// ============================================================================
// MOROCCAN TAX SYSTEM (2024)
// ============================================================================
// Source: Direction Générale des Impôts (DGI) Morocco
// Last updated: January 2024
// System: Progressive income tax (IR) + social security (CNSS)

// Income tax brackets (Impôt sur le Revenu - IR)
export const MOROCCO_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 3006, rate: 0 }, // Tax exempt (MAD 30,000 at 9.98 rate)
  { min: 3006, max: 5010, rate: 0.10 }, // 10%
  { min: 5010, max: 6014, rate: 0.20 }, // 20%
  { min: 6014, max: 8018, rate: 0.30 }, // 30%
  { min: 8018, max: 18042, rate: 0.34 }, // 34%
  { min: 18042, max: Infinity, rate: 0.38 }, // 38%
];

// Social security (CNSS - Caisse Nationale de Sécurité Sociale) - employee portion
export const CNSS_RATE = 0.0448; // 4.48% employee contribution

// AMO (Assurance Maladie Obligatoire - health insurance)
export const AMO_RATE = 0.0226; // 2.26% employee contribution

export function calculateMoroccanTax(grossSalary: number): SalaryCalculation {
  // Social security contributions
  const cnss = grossSalary * CNSS_RATE;
  const amo = grossSalary * AMO_RATE;
  const socialSecurity = cnss + amo;

  // Calculate progressive income tax
  let incomeTax = 0;
  for (const bracket of MOROCCO_TAX_BRACKETS) {
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
