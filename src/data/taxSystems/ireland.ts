import { TaxBracket, SalaryCalculation } from '../../types';

// ============================================================================
// IRISH TAX SYSTEM (2024)
// ============================================================================
// Source: Revenue Commissioners (revenue.ie)
// Last updated: January 2024
// System: Progressive income tax + Universal Social Charge (USC) + PRSI

// Income tax brackets (2024) - Single person
export const IRELAND_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 42000, rate: 0.20 }, // Standard rate
  { min: 42000, max: Infinity, rate: 0.40 }, // Higher rate
];

// Universal Social Charge (USC) - Progressive charge on gross income
export const USC_BRACKETS: TaxBracket[] = [
  { min: 0, max: 12012, rate: 0.005 }, // 0.5%
  { min: 12012, max: 25760, rate: 0.02 }, // 2%
  { min: 25760, max: 70044, rate: 0.045 }, // 4.5%
  { min: 70044, max: Infinity, rate: 0.08 }, // 8%
];

// PRSI (Pay Related Social Insurance) - employee rate
export const PRSI_RATE = 0.04; // 4% on all income above €352/week (~€18,304/year)
export const PRSI_THRESHOLD = 18304;

export function calculateIrishTax(grossSalary: number): SalaryCalculation {
  let incomeTax = 0;
  let usc = 0;

  // Calculate progressive income tax
  for (const bracket of IRELAND_TAX_BRACKETS) {
    if (grossSalary > bracket.min) {
      const taxableInBracket = Math.min(grossSalary, bracket.max) - bracket.min;
      incomeTax += taxableInBracket * bracket.rate;
    }
  }

  // Calculate USC
  for (const bracket of USC_BRACKETS) {
    if (grossSalary > bracket.min) {
      const taxableInBracket = Math.min(grossSalary, bracket.max) - bracket.min;
      usc += taxableInBracket * bracket.rate;
    }
  }

  // Calculate PRSI (only above threshold)
  const prsi = grossSalary > PRSI_THRESHOLD ? grossSalary * PRSI_RATE : 0;

  const totalTax = incomeTax + usc + prsi;
  const netSalary = grossSalary - totalTax;

  return {
    grossSalary,
    federalTax: incomeTax,
    stateTax: 0, // No regional tax
    localTax: 0,
    fica: usc + prsi, // Using fica field for USC + PRSI
    netSalary,
    monthlyTakeHome: netSalary / 12,
    effectiveTaxRate: totalTax / grossSalary,
    adjustedNetSalary: netSalary,
  };
}
