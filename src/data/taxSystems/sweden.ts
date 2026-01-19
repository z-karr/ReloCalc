import { TaxBracket, SalaryCalculation } from '../../types';

// ============================================================================
// SWEDISH TAX SYSTEM (2024)
// ============================================================================
// Source: Swedish Tax Agency (Skatteverket)
// Last updated: January 2024
// System: Municipal tax + State tax (on high earners) + Social fees

// Municipal tax (kommunalskatt) - varies by municipality
// Using Stockholm's rate as reference: ~32%
export const MUNICIPAL_TAX_RATE = 0.32; // Average ~32% across Sweden

// State tax (statlig inkomstskatt) on income above certain threshold
// Applies to income above SEK 615,300 (~$59,500 USD at 10.35 exchange rate)
export const STATE_TAX_THRESHOLD = 59500;
export const STATE_TAX_RATE_LOW = 0.20; // 20% on income between thresholds
export const STATE_TAX_THRESHOLD_HIGH = 87300; // SEK 903,100
export const STATE_TAX_RATE_HIGH = 0.05; // Additional 5% on very high income

// Social security fees (paid by employer, but affects gross-to-net)
// For simplicity, we only include employee portion if any
// In Sweden, employers pay most social fees, employees pay very little
export const EMPLOYEE_SOCIAL_FEES = 0.07; // ~7% for pension contribution (premie pension)

// Basic deduction (grundavdrag)
export const BASIC_DEDUCTION = 15800; // Approximately SEK 163,500 in USD

export function calculateSwedishTax(grossSalary: number): SalaryCalculation {
  // Apply basic deduction
  const taxableIncome = Math.max(0, grossSalary - BASIC_DEDUCTION);

  // Calculate municipal tax (on taxable income)
  const municipalTax = taxableIncome * MUNICIPAL_TAX_RATE;

  // Calculate state tax (only on income above threshold)
  let stateTax = 0;
  if (grossSalary > STATE_TAX_THRESHOLD) {
    const excessIncomeLevel1 = Math.min(grossSalary - STATE_TAX_THRESHOLD, STATE_TAX_THRESHOLD_HIGH - STATE_TAX_THRESHOLD);
    stateTax = excessIncomeLevel1 * STATE_TAX_RATE_LOW;

    // Very high earners pay additional 5%
    if (grossSalary > STATE_TAX_THRESHOLD_HIGH) {
      const excessIncomeLevel2 = grossSalary - STATE_TAX_THRESHOLD_HIGH;
      stateTax += excessIncomeLevel2 * STATE_TAX_RATE_HIGH;
    }
  }

  // Employee pension contribution
  const pensionContribution = grossSalary * EMPLOYEE_SOCIAL_FEES;

  const totalTax = municipalTax + stateTax + pensionContribution;
  const netSalary = grossSalary - totalTax;

  return {
    grossSalary,
    federalTax: municipalTax + stateTax, // Combined as "federal" for display
    stateTax: 0,
    localTax: 0,
    fica: pensionContribution,
    netSalary,
    monthlyTakeHome: netSalary / 12,
    effectiveTaxRate: totalTax / grossSalary,
    adjustedNetSalary: netSalary,
  };
}
