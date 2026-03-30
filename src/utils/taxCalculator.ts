import { City, SalaryCalculation, Currency, TaxRateInfo } from '../types';
import { getCountryById } from '../data/countries';

// ============================================================================
// TAX CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate taxes and net salary for a given gross salary and city
 */
export function calculateSalary(
  grossSalary: number,
  city: City,
  baseCostOfLivingIndex?: number
): SalaryCalculation {
  const country = getCountryById(city.country);

  if (!country) {
    throw new Error(`Country not found: ${city.country}`);
  }

  // Calculate taxes based on tax system type
  const taxBreakdown = calculateTaxes(grossSalary, city.taxRates);

  // Legacy fields for backward compatibility (US-centric)
  const federalTax = taxBreakdown.incomeTax || 0;
  const stateTax = taxBreakdown.regionalTax || 0;
  const localTax = 0; // Most countries don't have local income tax
  const fica = taxBreakdown.socialInsurance || 0;

  const totalTax = taxBreakdown.totalTax;
  const netSalary = grossSalary - totalTax;

  // Adjust for cost of living if base index provided
  const adjustedNetSalary = baseCostOfLivingIndex
    ? netSalary * (baseCostOfLivingIndex / city.costOfLivingIndex)
    : netSalary;

  const monthlyTakeHome = netSalary / 12;
  const effectiveTaxRate = totalTax / grossSalary;

  // Convert to local currency
  const grossSalaryLocal = grossSalary * country.currency.exchangeRate;
  const netSalaryLocal = netSalary * country.currency.exchangeRate;
  const monthlyTakeHomeLocal = monthlyTakeHome * country.currency.exchangeRate;

  return {
    grossSalary,
    federalTax,
    stateTax,
    localTax,
    fica,
    netSalary,
    adjustedNetSalary,
    monthlyTakeHome,
    effectiveTaxRate,
    currency: country.currency,
    grossSalaryLocal,
    netSalaryLocal,
    monthlyTakeHomeLocal,
    taxBreakdown,
  };
}

/**
 * Calculate equivalent salary needed in target city to maintain same lifestyle
 */
export function calculateEquivalentSalary(
  currentSalary: number,
  fromCity: City,
  toCity: City
): number {
  // Calculate net salary in current city
  const currentCalculation = calculateSalary(currentSalary, fromCity);
  const currentNet = currentCalculation.netSalary;

  // Adjust for cost of living difference
  const targetNet = currentNet * (toCity.costOfLivingIndex / fromCity.costOfLivingIndex);

  // Work backwards to find gross salary needed to achieve target net
  // Use iterative approach since tax is non-linear
  let grossEstimate = targetNet * 1.4; // Start with estimate (assuming ~30% tax)
  let iterations = 0;
  const maxIterations = 20;
  const tolerance = 100; // Within $100

  while (iterations < maxIterations) {
    const testCalculation = calculateSalary(grossEstimate, toCity);
    const testNet = testCalculation.netSalary;
    const diff = targetNet - testNet;

    if (Math.abs(diff) < tolerance) {
      break;
    }

    // Adjust estimate (account for marginal tax rate)
    const effectiveRate = testCalculation.effectiveTaxRate;
    grossEstimate += diff / (1 - effectiveRate);
    iterations++;
  }

  return Math.round(grossEstimate);
}

/**
 * Calculate taxes based on tax system type
 */
function calculateTaxes(grossSalary: number, taxRates: TaxRateInfo): {
  incomeTax: number;
  regionalTax?: number;
  socialInsurance?: number;
  vat?: number;
  otherTaxes?: number;
  totalTax: number;
} {
  switch (taxRates.type) {
    case 'us_federal_state':
      return calculateUSFederalStateTaxes(grossSalary, taxRates);

    case 'progressive_national':
      return calculateProgressiveTaxes(grossSalary, taxRates);

    case 'flat_national':
      return calculateFlatTaxes(grossSalary, taxRates);

    case 'vat_based':
      return calculateVATBasedTaxes(grossSalary, taxRates);

    // Note: 'territorial' and 'hybrid' types are handled by the default case
    // when/if they are added to TaxRateInfo union type in the future

    default:
      // Fallback to progressive
      return calculateProgressiveTaxes(grossSalary, taxRates);
  }
}

/**
 * US Federal + State tax calculation (existing US cities)
 */
function calculateUSFederalStateTaxes(
  grossSalary: number,
  taxRates: any
): {
  incomeTax: number;
  regionalTax?: number;
  socialInsurance?: number;
  totalTax: number;
} {
  // Simplified US federal tax brackets (2024, single filer)
  const federalTax = calculateProgressiveBrackets(grossSalary, [
    { min: 0, max: 11000, rate: 0.10 },
    { min: 11000, max: 44725, rate: 0.12 },
    { min: 44725, max: 95375, rate: 0.22 },
    { min: 95375, max: 182100, rate: 0.24 },
    { min: 182100, max: 231250, rate: 0.32 },
    { min: 231250, max: 578125, rate: 0.35 },
    { min: 578125, max: Infinity, rate: 0.37 },
  ]);

  const stateTax = grossSalary * (taxRates.stateTaxRate || 0);
  const localTax = grossSalary * (taxRates.localTaxRate || 0);

  // FICA (Social Security + Medicare)
  const socialSecurityCap = 160200;
  const socialSecurityTax = Math.min(grossSalary, socialSecurityCap) * 0.062;
  const medicareTax = grossSalary * 0.0145;
  const additionalMedicare = Math.max(0, grossSalary - 200000) * 0.009;
  const fica = socialSecurityTax + medicareTax + additionalMedicare;

  return {
    incomeTax: federalTax,
    regionalTax: stateTax + localTax,
    socialInsurance: fica,
    totalTax: federalTax + stateTax + localTax + fica,
  };
}

/**
 * Progressive national tax calculation (most countries)
 */
function calculateProgressiveTaxes(
  grossSalary: number,
  taxRates: any
): {
  incomeTax: number;
  regionalTax?: number;
  socialInsurance?: number;
  totalTax: number;
} {
  // Use simplified progressive rates based on income level
  // This is a rough approximation - proper implementation would use country-specific brackets
  let incomeTaxRate = 0;

  if (grossSalary < 20000) {
    incomeTaxRate = 0.10;
  } else if (grossSalary < 40000) {
    incomeTaxRate = 0.15;
  } else if (grossSalary < 60000) {
    incomeTaxRate = 0.20;
  } else if (grossSalary < 100000) {
    incomeTaxRate = 0.25;
  } else if (grossSalary < 150000) {
    incomeTaxRate = 0.30;
  } else {
    incomeTaxRate = 0.35;
  }

  const incomeTax = grossSalary * incomeTaxRate;
  const regionalTax = grossSalary * (taxRates.regionalRate || 0);
  const socialInsurance = grossSalary * (taxRates.socialContributions || 0);

  return {
    incomeTax,
    regionalTax: regionalTax || undefined,
    socialInsurance: socialInsurance || undefined,
    totalTax: incomeTax + regionalTax + socialInsurance,
  };
}

/**
 * Flat tax calculation
 */
function calculateFlatTaxes(
  grossSalary: number,
  taxRates: any
): {
  incomeTax: number;
  socialInsurance?: number;
  totalTax: number;
} {
  const incomeTax = grossSalary * taxRates.flatRate;
  const socialInsurance = grossSalary * (taxRates.socialInsuranceRate || 0);

  return {
    incomeTax,
    socialInsurance: socialInsurance || undefined,
    totalTax: incomeTax + socialInsurance,
  };
}

/**
 * VAT-based tax calculation (e.g., UAE with no income tax)
 */
function calculateVATBasedTaxes(
  grossSalary: number,
  taxRates: any
): {
  incomeTax: number;
  vat?: number;
  totalTax: number;
} {
  // No income tax, but estimate VAT on spending
  // Assume 70% of income is spent
  const estimatedSpending = grossSalary * 0.7;
  const vat = estimatedSpending * (taxRates.vatRate || 0);

  return {
    incomeTax: 0,
    vat,
    totalTax: vat,
  };
}

/**
 * Calculate progressive tax brackets
 */
function calculateProgressiveBrackets(
  income: number,
  brackets: Array<{ min: number; max: number; rate: number }>
): number {
  let tax = 0;

  for (const bracket of brackets) {
    if (income > bracket.min) {
      const taxableInBracket = Math.min(income, bracket.max) - bracket.min;
      tax += taxableInBracket * bracket.rate;
    }
  }

  return tax;
}

// ============================================================================
// FORMATTING FUNCTIONS
// ============================================================================

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency?: Currency): string {
  const roundedAmount = Math.round(amount);

  if (currency && currency.code !== 'USD') {
    // Format with currency symbol
    const formatted = roundedAmount.toLocaleString('en-US');
    return `${currency.symbol}${formatted}`;
  }

  // Default to USD formatting
  return `$${roundedAmount.toLocaleString('en-US')}`;
}

/**
 * Format percentage
 */
export function formatPercent(value: number): string {
  const percent = (value * 100).toFixed(1);
  return `${percent}%`;
}
