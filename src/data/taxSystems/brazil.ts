import { TaxBracket, SalaryCalculation } from '../../types';

// ============================================================================
// BRAZILIAN TAX SYSTEM (2024)
// ============================================================================
// Source: Receita Federal do Brasil
// Last updated: January 2024
// System: Progressive federal income tax + social security (INSS)

// Federal income tax brackets (IRPF - Imposto de Renda Pessoa Física)
export const BRAZIL_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 4263, rate: 0 }, // BRL 21,000 at 4.97 rate
  { min: 4263, max: 6455, rate: 0.075 }, // 7.5%
  { min: 6455, max: 8648, rate: 0.15 }, // 15%
  { min: 8648, max: 10841, rate: 0.225 }, // 22.5%
  { min: 10841, max: Infinity, rate: 0.275 }, // 27.5%
];

// Social security (INSS - Instituto Nacional do Seguro Social) - employee portion
// Progressive contributions up to ceiling
export const INSS_BRACKETS: TaxBracket[] = [
  { min: 0, max: 2642, rate: 0.075 }, // 7.5% (BRL 1,320)
  { min: 2642, max: 4403, rate: 0.09 }, // 9% (BRL 2,200)
  { min: 4403, max: 6606, rate: 0.12 }, // 12% (BRL 3,300)
  { min: 6606, max: 15332, rate: 0.14 }, // 14% up to ceiling (BRL 7,640)
  { min: 15332, max: Infinity, rate: 0 }, // No INSS above ceiling
];

export function calculateBrazilianTax(grossSalary: number): SalaryCalculation {
  // Calculate INSS (social security)
  let inss = 0;
  for (const bracket of INSS_BRACKETS) {
    if (grossSalary > bracket.min) {
      const taxableInBracket = Math.min(grossSalary, bracket.max) - bracket.min;
      inss += taxableInBracket * bracket.rate;
    }
  }

  // Income tax is calculated on salary after INSS deduction
  const taxableIncome = grossSalary - inss;

  // Calculate progressive income tax
  let incomeTax = 0;
  for (const bracket of BRAZIL_TAX_BRACKETS) {
    if (taxableIncome > bracket.min) {
      const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
      incomeTax += taxableInBracket * bracket.rate;
    }
  }

  const totalTax = incomeTax + inss;
  const netSalary = grossSalary - totalTax;

  return {
    grossSalary,
    federalTax: incomeTax,
    stateTax: 0, // Brazil doesn't have state income tax
    localTax: 0,
    fica: inss,
    netSalary,
    monthlyTakeHome: netSalary / 12,
    effectiveTaxRate: totalTax / grossSalary,
    adjustedNetSalary: netSalary,
  };
}
