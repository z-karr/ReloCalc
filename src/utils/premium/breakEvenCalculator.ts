/**
 * Enhanced Break-Even Analysis Calculator
 * Premium Feature: Detailed timeline for when a move pays for itself
 */

import { City } from '../../types';
import {
  BreakEvenAnalysis,
  BreakEvenScenario,
  ProjectionAssumptions,
  DEFAULT_ASSUMPTIONS,
  HousingIntent,
  DEFAULT_HOUSING_INTENT,
  PREMIUM_DEFAULTS,
} from '../../types/premium';
import { calculateSalary } from '../taxCalculator';

// ============================================================================
// BREAK-EVEN CALCULATION
// ============================================================================

/**
 * Calculate comprehensive break-even analysis between two cities
 * Now factors in housing intent (rent vs buy) for accurate monthly expense comparison
 */
export function calculateBreakEven(
  currentCity: City,
  currentSalary: number,
  targetCity: City,
  targetSalary: number,
  movingCosts: number,
  assumptions: ProjectionAssumptions = DEFAULT_ASSUMPTIONS,
  housingIntent: HousingIntent = DEFAULT_HOUSING_INTENT
): BreakEvenAnalysis {
  // Calculate net salaries
  const currentCalc = calculateSalary(currentSalary, currentCity);
  const targetCalc = calculateSalary(targetSalary, targetCity);

  // Monthly figures
  const currentMonthlyNet = currentCalc.netSalary / 12;
  const targetMonthlyNet = targetCalc.netSalary / 12;
  const monthlySalaryDifference = targetMonthlyNet - currentMonthlyNet;

  // Monthly non-housing COL difference (estimated as % of net income based on COL index)
  // Non-housing expenses are ~40% of net income (housing is separate)
  const colRatio = targetCity.costOfLivingIndex / currentCity.costOfLivingIndex;
  const currentMonthlyNonHousingCOL = currentMonthlyNet * 0.40;
  const targetMonthlyNonHousingCOL = currentMonthlyNonHousingCOL * colRatio;
  const monthlyNonHousingColDifference = targetMonthlyNonHousingCOL - currentMonthlyNonHousingCOL;

  // Calculate housing costs based on intent
  let monthlyHousingDifference: number;
  let totalUpfrontCosts = movingCosts;
  let monthlyEquityBuilding = 0;

  // Current city housing (assume renting since they're moving FROM here)
  const currentMonthlyRent = currentCity.medianRent;

  if (housingIntent.plansToBuy) {
    // Buying in target city
    const homePrice = housingIntent.targetHomePrice || targetCity.medianHomePrice;
    const downPaymentPercent = housingIntent.downPaymentPercent;
    const mortgageRate = housingIntent.mortgageRate || PREMIUM_DEFAULTS.currentMortgageRate;
    const mortgageTerm = housingIntent.mortgageTerm || 30;

    // Down payment is an upfront cost
    const downPayment = homePrice * downPaymentPercent;
    totalUpfrontCosts += downPayment;

    // Calculate monthly mortgage payment (P&I)
    const loanAmount = homePrice - downPayment;
    const monthlyRate = mortgageRate / 12;
    const numPayments = mortgageTerm * 12;
    const monthlyMortgage = loanAmount *
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    // Other monthly costs
    const monthlyPropertyTax = (homePrice * PREMIUM_DEFAULTS.propertyTaxRate) / 12;
    const monthlyInsurance = (homePrice * PREMIUM_DEFAULTS.homeInsuranceRate) / 12;
    const monthlyMaintenance = (homePrice * PREMIUM_DEFAULTS.avgMaintenanceCost) / 12;

    const targetMonthlyHousing = monthlyMortgage + monthlyPropertyTax + monthlyInsurance + monthlyMaintenance;
    monthlyHousingDifference = targetMonthlyHousing - currentMonthlyRent;

    // Estimate monthly equity building (principal portion of mortgage payment)
    // In early years, roughly 25-30% of payment goes to principal
    monthlyEquityBuilding = monthlyMortgage * 0.25;
  } else {
    // Renting in target city
    const targetMonthlyRent = targetCity.medianRent;
    const rentersInsurance = 25; // ~$25/month
    monthlyHousingDifference = (targetMonthlyRent + rentersInsurance) - currentMonthlyRent;
  }

  // Monthly rent difference (for reporting - uses actual rent values)
  const monthlyRentDifference = targetCity.medianRent - currentCity.medianRent;

  // Total monthly COL difference including housing
  const monthlyColDifference = monthlyNonHousingColDifference + monthlyHousingDifference;

  // Net monthly advantage (positive = target is better)
  // Salary increase minus total COL increase
  // For buyers, we add back equity building since it's savings, not expense
  const monthlyNetAdvantage = monthlySalaryDifference - monthlyColDifference + monthlyEquityBuilding;

  // Basic break-even calculation using total upfront costs
  let breakEvenMonths: number;
  if (monthlyNetAdvantage <= 0) {
    // Move never pays off financially
    breakEvenMonths = Infinity;
  } else {
    breakEvenMonths = Math.ceil(totalUpfrontCosts / monthlyNetAdvantage);
  }

  // Format break-even
  const breakEvenFormatted = formatBreakEven(breakEvenMonths);

  // Calculate scenarios (pass total upfront costs and housing intent)
  const scenarios = calculateScenarios(
    currentCity,
    currentSalary,
    targetCity,
    targetSalary,
    totalUpfrontCosts,
    housingIntent
  );

  // Calculate cumulative advantage over time (use total upfront costs)
  const cumulativeAdvantage = calculateCumulativeAdvantage(
    monthlyNetAdvantage,
    totalUpfrontCosts,
    assumptions
  );

  // Generate insights and recommendation
  const isFinanciallyBeneficial = breakEvenMonths < 60; // Within 5 years
  const { recommendation, considerations } = generateBreakEvenInsights(
    currentCity,
    targetCity,
    breakEvenMonths,
    monthlyNetAdvantage,
    scenarios
  );

  return {
    currentCity,
    targetCity,
    movingCosts,
    monthlySalaryDifference,
    monthlyColDifference,
    monthlyRentDifference,
    monthlyNetAdvantage,
    breakEvenMonths: breakEvenMonths === Infinity ? -1 : breakEvenMonths,
    breakEvenFormatted,
    scenarios,
    cumulativeAdvantage,
    isFinanciallyBeneficial,
    recommendation,
    considerations,
  };
}

// ============================================================================
// SCENARIO CALCULATIONS
// ============================================================================

/**
 * Calculate break-even under different scenarios
 * Now factors in housing intent for accurate calculations
 */
function calculateScenarios(
  currentCity: City,
  currentSalary: number,
  targetCity: City,
  targetSalary: number,
  totalUpfrontCosts: number,
  housingIntent: HousingIntent = DEFAULT_HOUSING_INTENT
): BreakEvenScenario[] {
  const currentCalc = calculateSalary(currentSalary, currentCity);
  const targetCalc = calculateSalary(targetSalary, targetCity);

  // Calculate base monthly advantage accounting for housing intent
  const currentMonthlyNet = currentCalc.netSalary / 12;
  const targetMonthlyNet = targetCalc.netSalary / 12;
  const monthlySalaryDiff = targetMonthlyNet - currentMonthlyNet;

  // Non-housing COL difference (40% of income)
  const colRatio = targetCity.costOfLivingIndex / currentCity.costOfLivingIndex;
  const monthlyNonHousingColDiff = currentMonthlyNet * 0.40 * (colRatio - 1);

  // Housing cost difference
  let monthlyHousingDiff: number;
  let monthlyEquityBuilding = 0;
  const currentMonthlyRent = currentCity.medianRent;

  if (housingIntent.plansToBuy) {
    const homePrice = housingIntent.targetHomePrice || targetCity.medianHomePrice;
    const downPaymentPercent = housingIntent.downPaymentPercent;
    const mortgageRate = housingIntent.mortgageRate || PREMIUM_DEFAULTS.currentMortgageRate;
    const loanAmount = homePrice * (1 - downPaymentPercent);
    const monthlyRate = mortgageRate / 12;
    const numPayments = 360; // 30 years
    const monthlyMortgage = loanAmount *
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    const monthlyOwnershipCosts = monthlyMortgage +
      (homePrice * PREMIUM_DEFAULTS.propertyTaxRate / 12) +
      (homePrice * PREMIUM_DEFAULTS.homeInsuranceRate / 12) +
      (homePrice * PREMIUM_DEFAULTS.avgMaintenanceCost / 12);
    monthlyHousingDiff = monthlyOwnershipCosts - currentMonthlyRent;
    monthlyEquityBuilding = monthlyMortgage * 0.25;
  } else {
    monthlyHousingDiff = (targetCity.medianRent + 25) - currentMonthlyRent;
  }

  const baseMonthlyAdvantage = monthlySalaryDiff - monthlyNonHousingColDiff - monthlyHousingDiff + monthlyEquityBuilding;

  // Best case: 5% salary growth, 2% COL increase
  const bestMonthlyAdvantage = baseMonthlyAdvantage * 1.15; // 15% better
  const bestBreakEven = bestMonthlyAdvantage > 0 ?
    Math.ceil(totalUpfrontCosts / bestMonthlyAdvantage) : -1;
  const bestYear5 = bestMonthlyAdvantage > 0 ?
    bestMonthlyAdvantage * 60 - totalUpfrontCosts : -totalUpfrontCosts;

  // Expected case
  const expectedBreakEven = baseMonthlyAdvantage > 0 ?
    Math.ceil(totalUpfrontCosts / baseMonthlyAdvantage) : -1;
  const expectedYear5 = baseMonthlyAdvantage > 0 ?
    baseMonthlyAdvantage * 60 - totalUpfrontCosts : -totalUpfrontCosts;

  // Worst case: 1% salary growth, 4% COL increase
  const worstMonthlyAdvantage = baseMonthlyAdvantage * 0.75; // 25% worse
  const worstBreakEven = worstMonthlyAdvantage > 0 ?
    Math.ceil(totalUpfrontCosts / worstMonthlyAdvantage) : -1;
  const worstYear5 = worstMonthlyAdvantage > 0 ?
    worstMonthlyAdvantage * 60 - totalUpfrontCosts : -totalUpfrontCosts;

  return [
    {
      name: 'best',
      salaryGrowth: 0.05,
      colIncrease: 0.02,
      breakEvenMonths: bestBreakEven,
      year5Advantage: bestYear5,
    },
    {
      name: 'expected',
      salaryGrowth: 0.03,
      colIncrease: 0.025,
      breakEvenMonths: expectedBreakEven,
      year5Advantage: expectedYear5,
    },
    {
      name: 'worst',
      salaryGrowth: 0.01,
      colIncrease: 0.04,
      breakEvenMonths: worstBreakEven,
      year5Advantage: worstYear5,
    },
  ];
}

/**
 * Calculate cumulative advantage at key milestones
 */
function calculateCumulativeAdvantage(
  monthlyAdvantage: number,
  movingCosts: number,
  assumptions: ProjectionAssumptions
): {
  month6: number;
  year1: number;
  year2: number;
  year3: number;
  year5: number;
} {
  // Start with negative (moving costs)
  const initialDebt = -movingCosts;

  // Simple calculation without compounding salary growth
  return {
    month6: initialDebt + monthlyAdvantage * 6,
    year1: initialDebt + monthlyAdvantage * 12,
    year2: initialDebt + monthlyAdvantage * 24 * (1 + assumptions.salaryGrowthRate / 2),
    year3: initialDebt + monthlyAdvantage * 36 * (1 + assumptions.salaryGrowthRate),
    year5: initialDebt + monthlyAdvantage * 60 * (1 + assumptions.salaryGrowthRate * 2),
  };
}

// ============================================================================
// INSIGHT GENERATION
// ============================================================================

/**
 * Generate insights and recommendations
 */
function generateBreakEvenInsights(
  currentCity: City,
  targetCity: City,
  breakEvenMonths: number,
  monthlyAdvantage: number,
  scenarios: BreakEvenScenario[]
): { recommendation: string; considerations: string[] } {
  const considerations: string[] = [];
  let recommendation: string;

  // Generate recommendation based on break-even time
  if (breakEvenMonths === Infinity || breakEvenMonths < 0) {
    recommendation = `Moving to ${targetCity.name} does not appear financially advantageous. Consider non-financial factors or negotiate a higher salary.`;
    considerations.push('The move may not make financial sense with current salary expectations');
    considerations.push('Consider negotiating for a higher salary in the new location');
    considerations.push('Factor in non-monetary benefits like career growth or quality of life');
  } else if (breakEvenMonths <= 6) {
    recommendation = `Excellent financial move! You'll recover moving costs in just ${breakEvenMonths} months.`;
    considerations.push('This is a strong financial opportunity');
    considerations.push('Quick break-even suggests significant salary/COL advantage');
  } else if (breakEvenMonths <= 12) {
    recommendation = `Solid financial decision. Break-even within ${breakEvenMonths} months (under a year).`;
    considerations.push('You\'ll be financially ahead within your first year');
    considerations.push('Consider building an emergency fund for the transition');
  } else if (breakEvenMonths <= 24) {
    recommendation = `Reasonable financial move. Expect to break even in ${formatBreakEven(breakEvenMonths)}.`;
    considerations.push('Plan for 1-2 years before seeing net financial benefit');
    considerations.push('Ensure you\'re committed to staying in the new city for at least 2-3 years');
  } else if (breakEvenMonths <= 36) {
    recommendation = `Moderate financial benefit. Break-even in ${formatBreakEven(breakEvenMonths)} - ensure you plan to stay long-term.`;
    considerations.push('This move requires a 3+ year commitment to be worthwhile');
    considerations.push('Consider if career advancement justifies the longer break-even');
  } else if (breakEvenMonths <= 60) {
    recommendation = `Long-term investment required. Break-even in ${formatBreakEven(breakEvenMonths)}.`;
    considerations.push('Only pursue if you plan to stay 5+ years');
    considerations.push('Non-financial factors should play a major role in this decision');
  } else {
    recommendation = `Extended break-even period of ${formatBreakEven(breakEvenMonths)}. This move should be driven by non-financial factors.`;
    considerations.push('Financial benefit is minimal - focus on quality of life factors');
    considerations.push('Consider if the new location offers career growth potential');
  }

  // Add scenario-based considerations
  const expectedScenario = scenarios.find(s => s.name === 'expected');
  const bestScenario = scenarios.find(s => s.name === 'best');

  if (expectedScenario && bestScenario) {
    if (bestScenario.year5Advantage > 0) {
      considerations.push(
        `Best case: ${formatCurrency(bestScenario.year5Advantage)} ahead after 5 years`
      );
    }
    if (expectedScenario.year5Advantage > 0) {
      considerations.push(
        `Expected case: ${formatCurrency(expectedScenario.year5Advantage)} ahead after 5 years`
      );
    }
  }

  // Add COL-specific considerations
  if (targetCity.costOfLivingIndex > currentCity.costOfLivingIndex * 1.2) {
    considerations.push('Significant COL increase - ensure salary covers the higher expenses');
  }
  if (targetCity.costOfLivingIndex < currentCity.costOfLivingIndex * 0.8) {
    considerations.push('Lower COL area - your purchasing power will increase');
  }

  // Rent-specific consideration
  if (targetCity.medianRent > currentCity.medianRent * 1.3) {
    considerations.push('Housing costs significantly higher - budget carefully');
  }

  return { recommendation, considerations };
}

// ============================================================================
// FORMATTING HELPERS
// ============================================================================

/**
 * Format break-even months as readable string
 */
function formatBreakEven(months: number): string {
  if (months === Infinity || months < 0) {
    return 'Not financially beneficial';
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  }
  return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
}

/**
 * Format currency
 */
function formatCurrency(amount: number): string {
  const prefix = amount < 0 ? '-' : '';
  const absAmount = Math.abs(amount);

  if (absAmount >= 1000000) {
    return `${prefix}$${(absAmount / 1000000).toFixed(1)}M`;
  }
  if (absAmount >= 1000) {
    return `${prefix}$${(absAmount / 1000).toFixed(0)}K`;
  }
  return `${prefix}$${absAmount.toFixed(0)}`;
}

// ============================================================================
// CHART DATA PREPARATION
// ============================================================================

/**
 * Prepare data for break-even visualization chart
 */
export function prepareBreakEvenChartData(
  analysis: BreakEvenAnalysis
): {
  labels: string[];
  cumulativeAdvantage: number[];
  breakEvenIndex: number | null;
} {
  // Generate 60 monthly data points (5 years)
  const labels: string[] = [];
  const cumulativeAdvantage: number[] = [];
  let breakEvenIndex: number | null = null;

  let cumulative = -analysis.movingCosts;

  for (let month = 1; month <= 60; month++) {
    // Monthly labels
    if (month % 6 === 0) {
      const years = Math.floor(month / 12);
      const months = month % 12;
      if (months === 0) {
        labels.push(`Year ${years}`);
      } else {
        labels.push(`${years}y ${months}m`);
      }
    } else {
      labels.push('');
    }

    cumulative += analysis.monthlyNetAdvantage;
    cumulativeAdvantage.push(cumulative);

    // Track break-even point
    if (breakEvenIndex === null && cumulative >= 0) {
      breakEvenIndex = month - 1;
    }
  }

  return {
    labels,
    cumulativeAdvantage,
    breakEvenIndex,
  };
}

/**
 * Calculate quick break-even estimate (simplified version for display)
 */
export function quickBreakEvenEstimate(
  currentSalary: number,
  targetSalary: number,
  currentCOLIndex: number,
  targetCOLIndex: number,
  movingCosts: number
): {
  months: number;
  formatted: string;
  isPositive: boolean;
} {
  // Estimate effective salary after COL adjustment
  const currentEffective = currentSalary;
  const targetEffective = targetSalary * (currentCOLIndex / targetCOLIndex);

  const monthlyAdvantage = (targetEffective - currentEffective) / 12;

  if (monthlyAdvantage <= 0) {
    return {
      months: -1,
      formatted: 'N/A',
      isPositive: false,
    };
  }

  const months = Math.ceil(movingCosts / monthlyAdvantage);

  return {
    months,
    formatted: formatBreakEven(months),
    isPositive: true,
  };
}
