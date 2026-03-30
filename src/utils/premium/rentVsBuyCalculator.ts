/**
 * Rent vs Buy Analysis Calculator
 * Premium Feature: Determine optimal housing strategy per city
 */

import { City } from '../../types';
import {
  RentScenario,
  BuyScenario,
  RentVsBuyAnalysis,
  CityPremiumData,
  PREMIUM_DEFAULTS,
} from '../../types/premium';

// ============================================================================
// MAIN CALCULATION
// ============================================================================

/**
 * Calculate comprehensive rent vs buy analysis for a city
 */
export function calculateRentVsBuy(
  city: City,
  yearsToAnalyze: number = 10,
  customInputs?: {
    monthlyRent?: number;
    purchasePrice?: number;
    downPaymentPercent?: number;
    mortgageRate?: number;
    mortgageTerm?: number;
    hoaFees?: number;
  },
  premiumData?: Partial<CityPremiumData>
): RentVsBuyAnalysis {
  const cityData = { ...PREMIUM_DEFAULTS, ...premiumData };

  // Rent scenario setup
  const monthlyRent = customInputs?.monthlyRent ?? city.medianRent;
  const rentScenario = calculateRentScenario(
    monthlyRent,
    yearsToAnalyze,
    cityData.rentInflationRate,
    customInputs?.purchasePrice ?? city.medianHomePrice,
    customInputs?.downPaymentPercent ?? cityData.typicalDownPayment
  );

  // Buy scenario setup
  const purchasePrice = customInputs?.purchasePrice ?? city.medianHomePrice;
  const downPaymentPercent = customInputs?.downPaymentPercent ?? cityData.typicalDownPayment;
  const mortgageRate = customInputs?.mortgageRate ?? cityData.currentMortgageRate;
  const mortgageTerm = customInputs?.mortgageTerm ?? 30;
  const hoaFees = customInputs?.hoaFees ?? (cityData.avgHOAFees || 0);

  const buyScenario = calculateBuyScenario(
    purchasePrice,
    downPaymentPercent,
    mortgageRate,
    mortgageTerm,
    yearsToAnalyze,
    cityData.propertyTaxRate,
    cityData.homeInsuranceRate,
    cityData.avgMaintenanceCost,
    hoaFees,
    cityData.homeAppreciationRate
  );

  // Calculate break-even year
  const breakEvenYear = findBreakEvenYear(rentScenario, buyScenario, yearsToAnalyze);

  // Compare at 5 and 10 year milestones
  const comparison5Year = createComparison(rentScenario, buyScenario, 5);
  const comparison10Year = createComparison(rentScenario, buyScenario, Math.min(10, yearsToAnalyze));

  // Generate recommendation
  const { recommendation, confidenceLevel, reasoning } = generateRecommendation(
    breakEvenYear,
    comparison5Year,
    comparison10Year,
    rentScenario,
    buyScenario
  );

  return {
    city,
    rentScenario,
    buyScenario,
    breakEvenYear,
    recommendation,
    confidenceLevel,
    reasoning,
    comparison5Year,
    comparison10Year,
  };
}

// ============================================================================
// RENT SCENARIO CALCULATION
// ============================================================================

/**
 * Calculate rent scenario projections
 */
function calculateRentScenario(
  monthlyRent: number,
  years: number,
  annualRentIncrease: number,
  homePrice: number,
  downPaymentPercent: number
): RentScenario {
  const rentersInsurance = 25; // ~$25/month average
  const investmentReturn = 0.07; // 7% market return

  // The down payment that would have been used to buy
  const investedDownPayment = homePrice * downPaymentPercent;

  const totalRentPaid: number[] = [];
  const investmentValue: number[] = [];
  const totalCost: number[] = [];

  let cumulativeRent = 0;
  let currentRent = monthlyRent;
  let investment = investedDownPayment;

  for (let year = 1; year <= years; year++) {
    // Annual rent (with yearly increase starting year 2)
    if (year > 1) {
      currentRent *= (1 + annualRentIncrease);
    }
    const yearRent = currentRent * 12 + rentersInsurance * 12;
    cumulativeRent += yearRent;
    totalRentPaid.push(cumulativeRent);

    // Investment grows (down payment + portion of savings)
    // Assume renter saves difference between rent and equivalent mortgage payment
    investment *= (1 + investmentReturn);
    investmentValue.push(investment);

    // Total cost = cumulative rent - investment gains
    const netCost = cumulativeRent - (investment - investedDownPayment);
    totalCost.push(netCost);
  }

  return {
    monthlyRent,
    annualRentIncrease,
    rentersInsurance,
    investedDownPayment,
    investmentReturn,
    totalRentPaid,
    investmentValue,
    totalCost,
  };
}

// ============================================================================
// BUY SCENARIO CALCULATION
// ============================================================================

/**
 * Calculate buy scenario projections
 */
function calculateBuyScenario(
  purchasePrice: number,
  downPaymentPercent: number,
  mortgageRate: number,
  mortgageTerm: number,
  years: number,
  propertyTaxRate: number,
  homeInsuranceRate: number,
  maintenanceRate: number,
  hoaFees: number,
  homeAppreciationRate: number
): BuyScenario {
  const downPayment = purchasePrice * downPaymentPercent;
  const loanAmount = purchasePrice - downPayment;

  // Calculate monthly mortgage payment (P&I)
  const monthlyRate = mortgageRate / 12;
  const numPayments = mortgageTerm * 12;
  const monthlyMortgage = loanAmount *
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);

  // Annual costs
  const propertyTax = purchasePrice * propertyTaxRate;
  const homeInsurance = purchasePrice * homeInsuranceRate;
  const maintenance = purchasePrice * maintenanceRate;

  // Projections
  const homeValue: number[] = [];
  const remainingLoan: number[] = [];
  const equity: number[] = [];
  const totalCost: number[] = [];
  const totalPaid: number[] = [];

  let currentHomeValue = purchasePrice;
  let currentLoanBalance = loanAmount;
  let cumulativePaid = downPayment; // Start with down payment
  let cumulativeCost = downPayment;

  for (let year = 1; year <= years; year++) {
    // Home appreciation
    currentHomeValue *= (1 + homeAppreciationRate);
    homeValue.push(currentHomeValue);

    // Calculate principal paid this year
    let yearPrincipal = 0;
    let yearInterest = 0;
    let tempBalance = currentLoanBalance;

    for (let month = 1; month <= 12; month++) {
      if (tempBalance > 0) {
        const interestPayment = tempBalance * monthlyRate;
        const principalPayment = Math.min(monthlyMortgage - interestPayment, tempBalance);
        yearPrincipal += principalPayment;
        yearInterest += interestPayment;
        tempBalance -= principalPayment;
      }
    }

    currentLoanBalance = Math.max(0, currentLoanBalance - yearPrincipal);
    remainingLoan.push(currentLoanBalance);

    // Equity = Home value - remaining loan
    equity.push(currentHomeValue - currentLoanBalance);

    // Total costs this year
    const yearMortgage = monthlyMortgage * 12;
    const yearPropertyTax = purchasePrice * propertyTaxRate * Math.pow(1 + homeAppreciationRate, year - 1);
    const yearInsurance = homeInsurance;
    const yearMaintenance = maintenance;
    const yearHOA = hoaFees * 12;

    const yearTotalCost = yearMortgage + yearPropertyTax + yearInsurance + yearMaintenance + yearHOA;
    cumulativeCost += yearTotalCost;
    totalCost.push(cumulativeCost);

    cumulativePaid += yearMortgage + yearPropertyTax + yearInsurance + yearMaintenance + yearHOA;
    totalPaid.push(cumulativePaid);
  }

  return {
    purchasePrice,
    downPayment,
    downPaymentPercent,
    loanAmount,
    mortgageRate,
    mortgageTerm,
    monthlyMortgage,
    propertyTax,
    homeInsurance,
    maintenance,
    hoaFees,
    homeAppreciationRate,
    homeValue,
    remainingLoan,
    equity,
    totalCost,
    totalPaid,
  };
}

// ============================================================================
// COMPARISON HELPERS
// ============================================================================

/**
 * Find the year when buying becomes financially better than renting
 */
function findBreakEvenYear(
  rentScenario: RentScenario,
  buyScenario: BuyScenario,
  maxYears: number
): number | null {
  for (let year = 1; year <= maxYears; year++) {
    const rentNetWorth = rentScenario.investmentValue[year - 1];
    const buyNetWorth = buyScenario.equity[year - 1];

    // Buy becomes better when equity exceeds investment value
    if (buyNetWorth > rentNetWorth) {
      return year;
    }
  }
  return null; // Never breaks even within analysis period
}

/**
 * Create comparison at a specific year
 */
function createComparison(
  rentScenario: RentScenario,
  buyScenario: BuyScenario,
  year: number
): {
  rentTotalCost: number;
  buyTotalCost: number;
  rentNetWorth: number;
  buyNetWorth: number;
  winner: 'rent' | 'buy';
  difference: number;
} {
  const yearIndex = year - 1;

  const rentTotalCost = rentScenario.totalRentPaid[yearIndex];
  const buyTotalCost = buyScenario.totalCost[yearIndex];

  // Net worth comparison
  // Renter: Investment value
  // Buyer: Equity in home
  const rentNetWorth = rentScenario.investmentValue[yearIndex];
  const buyNetWorth = buyScenario.equity[yearIndex];

  const winner = buyNetWorth > rentNetWorth ? 'buy' : 'rent';
  const difference = Math.abs(buyNetWorth - rentNetWorth);

  return {
    rentTotalCost,
    buyTotalCost,
    rentNetWorth,
    buyNetWorth,
    winner,
    difference,
  };
}

// ============================================================================
// RECOMMENDATION ENGINE
// ============================================================================

/**
 * Generate recommendation based on analysis
 */
function generateRecommendation(
  breakEvenYear: number | null,
  comparison5Year: {
    winner: 'rent' | 'buy';
    difference: number;
    rentNetWorth: number;
    buyNetWorth: number;
  },
  comparison10Year: {
    winner: 'rent' | 'buy';
    difference: number;
    rentNetWorth: number;
    buyNetWorth: number;
  },
  rentScenario: RentScenario,
  buyScenario: BuyScenario
): {
  recommendation: 'rent' | 'buy' | 'either';
  confidenceLevel: 'high' | 'medium' | 'low';
  reasoning: string;
} {
  // Decision matrix based on break-even and timeline
  let recommendation: 'rent' | 'buy' | 'either';
  let confidenceLevel: 'high' | 'medium' | 'low';
  let reasoning: string;

  if (breakEvenYear === null || breakEvenYear > 10) {
    // Renting is better - break-even beyond analysis period
    recommendation = 'rent';
    confidenceLevel = 'high';
    reasoning = `Renting is financially advantageous. Buying doesn't break even within 10 years. ` +
      `At year 5, renting leaves you ${formatCurrency(comparison5Year.difference)} ahead in net worth.`;
  } else if (breakEvenYear <= 3) {
    // Buying is clearly better
    recommendation = 'buy';
    confidenceLevel = 'high';
    reasoning = `Buying is strongly recommended. Break-even occurs in just ${breakEvenYear} year${breakEvenYear > 1 ? 's' : ''}. ` +
      `By year 5, you'll have ${formatCurrency(comparison5Year.difference)} more in home equity than you would have in investments.`;
  } else if (breakEvenYear <= 5) {
    // Buying is better for medium-term
    if (comparison5Year.winner === 'buy') {
      recommendation = 'buy';
      confidenceLevel = 'medium';
      reasoning = `Buying is recommended if you plan to stay at least ${breakEvenYear} years. ` +
        `Break-even at year ${breakEvenYear}. By year 5, buying puts you ${formatCurrency(comparison5Year.difference)} ahead.`;
    } else {
      recommendation = 'either';
      confidenceLevel = 'low';
      reasoning = `Close call. Break-even at year ${breakEvenYear}, but renting is slightly ahead at year 5. ` +
        `Consider your job stability and likelihood of staying long-term.`;
    }
  } else if (breakEvenYear <= 7) {
    // Requires longer commitment
    recommendation = comparison10Year.winner;
    confidenceLevel = 'medium';
    reasoning = `${comparison10Year.winner === 'buy' ? 'Buying' : 'Renting'} is better long-term. ` +
      `Break-even at year ${breakEvenYear}. Consider buying only if you're confident about staying 7+ years.`;
  } else {
    // Very long break-even
    recommendation = 'rent';
    confidenceLevel = 'medium';
    reasoning = `Renting is recommended unless you're certain about staying ${breakEvenYear}+ years. ` +
      `The long break-even period makes buying risky if your plans might change.`;
  }

  // Add context about monthly costs
  const monthlyRentCost = rentScenario.monthlyRent + rentScenario.rentersInsurance;
  const monthlyBuyCost = buyScenario.monthlyMortgage +
    (buyScenario.propertyTax / 12) +
    (buyScenario.homeInsurance / 12) +
    (buyScenario.maintenance / 12) +
    buyScenario.hoaFees;

  const monthlyCostDiff = monthlyBuyCost - monthlyRentCost;

  if (monthlyCostDiff > 500) {
    reasoning += ` Note: Buying costs ${formatCurrency(monthlyCostDiff)} more per month than renting.`;
  } else if (monthlyCostDiff < -200) {
    reasoning += ` Bonus: Monthly ownership costs are ${formatCurrency(Math.abs(monthlyCostDiff))} less than rent.`;
  }

  return { recommendation, confidenceLevel, reasoning };
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${Math.round(amount / 1000)}K`;
  }
  return `$${Math.round(amount)}`;
}

// ============================================================================
// CHART DATA PREPARATION
// ============================================================================

/**
 * Prepare data for rent vs buy comparison chart
 */
export function prepareRentVsBuyChartData(
  analysis: RentVsBuyAnalysis,
  years: number = 10
): {
  labels: string[];
  rentNetWorth: number[];
  buyNetWorth: number[];
  breakEvenYear: number | null;
} {
  const labels = Array.from({ length: years }, (_, i) => `Year ${i + 1}`);

  return {
    labels,
    rentNetWorth: analysis.rentScenario.investmentValue.slice(0, years),
    buyNetWorth: analysis.buyScenario.equity.slice(0, years),
    breakEvenYear: analysis.breakEvenYear,
  };
}

/**
 * Calculate monthly cost comparison
 */
export function getMonthlyCostComparison(
  analysis: RentVsBuyAnalysis
): {
  rentMonthly: number;
  buyMonthly: number;
  difference: number;
  breakdown: {
    rent: { base: number; insurance: number };
    buy: { mortgage: number; propertyTax: number; insurance: number; maintenance: number; hoa: number };
  };
} {
  const rentMonthly = analysis.rentScenario.monthlyRent + analysis.rentScenario.rentersInsurance;

  const buyBreakdown = {
    mortgage: analysis.buyScenario.monthlyMortgage,
    propertyTax: analysis.buyScenario.propertyTax / 12,
    insurance: analysis.buyScenario.homeInsurance / 12,
    maintenance: analysis.buyScenario.maintenance / 12,
    hoa: analysis.buyScenario.hoaFees,
  };

  const buyMonthly = Object.values(buyBreakdown).reduce((a, b) => a + b, 0);

  return {
    rentMonthly,
    buyMonthly,
    difference: buyMonthly - rentMonthly,
    breakdown: {
      rent: {
        base: analysis.rentScenario.monthlyRent,
        insurance: analysis.rentScenario.rentersInsurance,
      },
      buy: buyBreakdown,
    },
  };
}
