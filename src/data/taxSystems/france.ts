import { TaxBracket, SalaryCalculation } from '../../types';

// ============================================================================
// FRENCH TAX SYSTEM (2024)
// ============================================================================
// Source: French Ministry of Economy and Finance (Impôts.gouv.fr)
// Last updated: January 2024
// System: Progressive national income tax + social contributions

// French income tax brackets (2024)
// Note: French tax is calculated on household income divided by "parts" (quotient familial)
// For simplicity, using single person rates
export const FRANCE_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 11294, rate: 0 },
  { min: 11294, max: 28797, rate: 0.11 },
  { min: 28797, max: 82341, rate: 0.30 },
  { min: 82341, max: 177106, rate: 0.41 },
  { min: 177106, max: Infinity, rate: 0.45 },
];

// Social contributions (CSG + CRDS)
// CSG (Contribution Sociale Généralisée): 9.2%
// CRDS (Contribution au Remboursement de la Dette Sociale): 0.5%
export const SOCIAL_CONTRIBUTIONS_RATE = 0.097; // 9.7% total

// Health insurance and pension contributions (employee portion)
// Simplified combined rate for salaried employees
export const SOCIAL_SECURITY_RATE = 0.22; // ~22% (combined employee + employer approximation)

export function calculateFrenchTax(grossSalary: number): SalaryCalculation {
  let incomeTax = 0;

  // Calculate progressive income tax
  for (const bracket of FRANCE_TAX_BRACKETS) {
    if (grossSalary > bracket.min) {
      const taxableInBracket = Math.min(grossSalary, bracket.max) - bracket.min;
      incomeTax += taxableInBracket * bracket.rate;
    }
  }

  // Calculate social contributions (on gross salary)
  const socialContributions = grossSalary * SOCIAL_CONTRIBUTIONS_RATE;

  // Calculate social security (employee portion)
  const socialSecurity = grossSalary * SOCIAL_SECURITY_RATE;

  const totalTax = incomeTax + socialContributions + socialSecurity;
  const netSalary = grossSalary - totalTax;

  return {
    grossSalary,
    federalTax: incomeTax, // Using federalTax field for income tax
    stateTax: 0, // No regional income tax in France
    localTax: 0,
    fica: socialContributions + socialSecurity, // Using fica field for social contributions
    netSalary,
    monthlyTakeHome: netSalary / 12,
    effectiveTaxRate: totalTax / grossSalary,
    adjustedNetSalary: netSalary, // Will be adjusted by COL in calculator
  };
}
