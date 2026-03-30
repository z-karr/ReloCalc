/**
 * 5-Year Financial Projection Calculator
 * Premium Feature: Projects wealth trajectory over time
 */

import { City } from '../../types';
import {
  ProjectionAssumptions,
  YearlyProjection,
  CityProjection,
  ProjectionComparison,
  DEFAULT_ASSUMPTIONS,
  PREMIUM_DEFAULTS,
  CityPremiumData,
  HousingIntent,
  DEFAULT_HOUSING_INTENT,
} from '../../types/premium';
import { calculateSalary } from '../taxCalculator';

// ============================================================================
// PROJECTION CALCULATION
// ============================================================================

/**
 * Calculate 5-year financial projection for a single city
 *
 * @param city - The city to calculate projections for
 * @param initialSalary - Starting gross salary
 * @param assumptions - Financial assumptions (growth rates, etc.)
 * @param movingCosts - One-time moving costs (deducted in year 1)
 * @param baselineExpenses - Optional baseline annual expenses (from current city)
 * @param baselineCOL - Optional baseline COL index (from current city)
 * @param housingIntent - Optional housing intent (rent vs buy)
 * @param premiumData - Optional premium city data
 */
export function calculateCityProjection(
  city: City,
  initialSalary: number,
  assumptions: ProjectionAssumptions = DEFAULT_ASSUMPTIONS,
  movingCosts: number = 0,
  baselineExpenses?: number,
  baselineCOL?: number,
  housingIntent: HousingIntent = DEFAULT_HOUSING_INTENT,
  premiumData?: Partial<CityPremiumData>
): CityProjection {
  const cityData = { ...PREMIUM_DEFAULTS, ...premiumData };
  const projections: YearlyProjection[] = [];

  // Calculate initial net salary for expense baseline
  const initialSalaryCalc = calculateSalary(initialSalary, city);
  const initialNetSalary = initialSalaryCalc.netSalary;

  // Determine base annual non-housing expenses (scaled by COL)
  // Housing costs are calculated separately based on rent vs buy
  let baseNonHousingExpenses: number;

  if (baselineExpenses !== undefined && baselineCOL !== undefined && baselineCOL > 0) {
    // Scale baseline expenses by COL ratio
    const colRatio = city.costOfLivingIndex / baselineCOL;
    // Assume 35% of total expenses is housing, so non-housing is 65% of the scaled baseline
    baseNonHousingExpenses = baselineExpenses * colRatio * 0.65;
  } else {
    // No baseline provided - use 40% of net salary for non-housing expenses
    baseNonHousingExpenses = initialNetSalary * 0.40;
  }

  // Housing-specific calculations
  const homePrice = housingIntent.targetHomePrice || city.medianHomePrice;
  const mortgageRate = housingIntent.mortgageRate || cityData.currentMortgageRate;
  const mortgageTerm = housingIntent.mortgageTerm || 30;
  const downPaymentPercent = housingIntent.downPaymentPercent;

  // Buy scenario calculations
  let downPayment = 0;
  let monthlyMortgage = 0;
  let annualPropertyTax = 0;
  let annualHomeInsurance = 0;
  let annualMaintenance = 0;
  let currentHomeValue = homePrice;
  let remainingLoan = 0;

  if (housingIntent.plansToBuy) {
    downPayment = homePrice * downPaymentPercent;
    remainingLoan = homePrice - downPayment;

    // Calculate monthly mortgage payment (P&I)
    const monthlyRate = mortgageRate / 12;
    const numPayments = mortgageTerm * 12;
    monthlyMortgage = remainingLoan *
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    annualPropertyTax = homePrice * cityData.propertyTaxRate;
    annualHomeInsurance = homePrice * cityData.homeInsuranceRate;
    annualMaintenance = homePrice * cityData.avgMaintenanceCost;
  }

  let cumulativeSavings = 0;
  let currentSalary = initialSalary;
  let currentLoanBalance = remainingLoan;

  // Deduct down payment from initial savings if buying
  if (housingIntent.plansToBuy) {
    cumulativeSavings = -downPayment;
  }

  for (let year = 1; year <= 5; year++) {
    // Apply salary growth (starting from year 2)
    if (year > 1) {
      currentSalary = currentSalary * (1 + assumptions.salaryGrowthRate);
    }

    // Calculate net salary after taxes
    const salaryCalc = calculateSalary(currentSalary, city);
    const netSalary = salaryCalc.netSalary;

    // Calculate non-housing expenses with inflation
    const inflationMultiplier = Math.pow(1 + assumptions.colInflationRate, year - 1);
    const annualNonHousingExpenses = baseNonHousingExpenses * inflationMultiplier;

    // Calculate housing expenses based on rent vs buy
    let annualHousingExpenses: number;
    let annualRent: number;
    let homeEquity = 0;

    if (housingIntent.plansToBuy) {
      // Buying: mortgage + property tax + insurance + maintenance
      const yearMultiplier = Math.pow(1 + assumptions.homeAppreciationRate, year - 1);
      annualPropertyTax = homePrice * cityData.propertyTaxRate * yearMultiplier;

      annualHousingExpenses = (monthlyMortgage * 12) + annualPropertyTax + annualHomeInsurance + annualMaintenance;
      annualRent = 0; // Not renting

      // Home appreciation
      currentHomeValue = homePrice * Math.pow(1 + assumptions.homeAppreciationRate, year);

      // Calculate principal paid this year
      let yearPrincipal = 0;
      let tempBalance = currentLoanBalance;
      const monthlyRate = mortgageRate / 12;

      for (let month = 1; month <= 12; month++) {
        if (tempBalance > 0) {
          const interestPayment = tempBalance * monthlyRate;
          const principalPayment = Math.min(monthlyMortgage - interestPayment, tempBalance);
          yearPrincipal += principalPayment;
          tempBalance -= principalPayment;
        }
      }
      currentLoanBalance = Math.max(0, currentLoanBalance - yearPrincipal);
      homeEquity = currentHomeValue - currentLoanBalance;
    } else {
      // Renting: rent + renter's insurance
      const rentMultiplier = Math.pow(1 + assumptions.rentInflationRate, year - 1);
      annualRent = city.medianRent * 12 * rentMultiplier;
      const rentersInsurance = 25 * 12; // ~$25/month
      annualHousingExpenses = annualRent + rentersInsurance;
    }

    const annualLivingExpenses = annualNonHousingExpenses + annualHousingExpenses;

    // Calculate savings (net salary minus all expenses)
    let annualSavings = netSalary - annualLivingExpenses;

    // Deduct moving costs in year 1
    if (year === 1 && movingCosts > 0) {
      annualSavings -= movingCosts;
    }

    // Track cumulative savings
    cumulativeSavings += annualSavings;

    // Apply investment returns to cumulative savings (only on positive balance)
    if (cumulativeSavings > 0) {
      cumulativeSavings *= (1 + assumptions.investmentReturnRate);
    }

    // Net worth = cumulative savings + home equity (if buying)
    const netWorth = cumulativeSavings + homeEquity;

    projections.push({
      year,
      grossSalary: currentSalary,
      netSalary,
      annualLivingExpenses,
      annualRent,
      annualSavings,
      cumulativeSavings,
      netWorth,
      homeEquity: housingIntent.plansToBuy ? homeEquity : undefined,
    });
  }

  // Get year 5 totals
  const year5 = projections[4];

  return {
    city,
    projections,
    totalNetWorthYear5: year5.netWorth,
    totalSavingsYear5: year5.cumulativeSavings,
  };
}

/**
 * Compare projections between current city and target cities
 *
 * Uses the current city's expenses as a baseline, then scales for each
 * target city based on their Cost of Living index. This answers the question:
 * "If I maintain my current lifestyle, how will my finances differ in each city?"
 */
export function compareProjections(
  currentCity: City,
  currentSalary: number,
  targetCities: { city: City; salary: number }[],
  assumptions: ProjectionAssumptions = DEFAULT_ASSUMPTIONS,
  movingCosts: number[] = [],
  housingIntent: HousingIntent = DEFAULT_HOUSING_INTENT
): ProjectionComparison {
  // Calculate current city projection (no moving costs, no baseline needed, renting)
  // Current city always assumes renting (they're moving FROM here)
  const currentCityProjection = calculateCityProjection(
    currentCity,
    currentSalary,
    assumptions,
    0,
    undefined,
    undefined,
    DEFAULT_HOUSING_INTENT // Current city always renting
  );

  // Get baseline expenses from current city (Year 1 living expenses = 65% of net salary)
  // This represents "what I currently spend to maintain my lifestyle"
  const currentNetSalary = calculateSalary(currentSalary, currentCity).netSalary;
  const baselineAnnualExpenses = currentNetSalary * 0.65;
  const baselineCOL = currentCity.costOfLivingIndex;

  // Calculate projections for each target city using the baseline
  // This scales expenses by COL ratio to show real purchasing power difference
  const targetCityProjections = targetCities.map((target, index) =>
    calculateCityProjection(
      target.city,
      target.salary,
      assumptions,
      movingCosts[index] || 0,
      baselineAnnualExpenses,
      baselineCOL,
      housingIntent // Use housing intent for target cities
    )
  );

  // Calculate break-even and crossover months for each target
  const targetProjectionsWithBreakEven = targetCityProjections.map((targetProj) => {
    const breakEvenMonth = calculateBreakEvenMonth(currentCityProjection, targetProj);
    return {
      ...targetProj,
      breakEvenMonth,
    };
  });

  // Generate insights and recommendation
  const { recommendation, insights } = generateProjectionInsights(
    currentCityProjection,
    targetProjectionsWithBreakEven,
    assumptions
  );

  return {
    currentCity: currentCityProjection,
    targetCities: targetProjectionsWithBreakEven,
    assumptions,
    recommendation,
    insights,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate the month when target city's cumulative savings exceeds current city
 * Returns undefined if break-even never occurs within 5 years
 */
function calculateBreakEvenMonth(
  currentProjection: CityProjection,
  targetProjection: CityProjection
): number | undefined {
  // Check if target ends up ahead by year 5
  if (targetProjection.totalSavingsYear5 <= currentProjection.totalSavingsYear5) {
    return undefined; // Never breaks even within 5 years
  }

  // Interpolate to find the break-even month
  for (let year = 1; year <= 5; year++) {
    const currentYear = currentProjection.projections[year - 1];
    const targetYear = targetProjection.projections[year - 1];

    if (targetYear.cumulativeSavings >= currentYear.cumulativeSavings) {
      // Break-even occurred in this year
      if (year === 1) {
        // Linear interpolation within year 1
        const currentMonthly = currentYear.cumulativeSavings / 12;
        const targetMonthly = targetYear.cumulativeSavings / 12;
        // Rough estimate - actual would need monthly calculations
        return Math.max(1, Math.ceil(12 * (1 - targetYear.cumulativeSavings / currentYear.cumulativeSavings)));
      }

      // Check previous year to interpolate
      const prevCurrentYear = currentProjection.projections[year - 2];
      const prevTargetYear = targetProjection.projections[year - 2];

      // Linear interpolation
      const currentGap = prevCurrentYear.cumulativeSavings - prevTargetYear.cumulativeSavings;
      const yearEndGap = currentYear.cumulativeSavings - targetYear.cumulativeSavings;

      if (currentGap > 0 && yearEndGap <= 0) {
        const monthsInYear = 12 * currentGap / (currentGap - yearEndGap);
        return (year - 1) * 12 + Math.ceil(monthsInYear);
      }

      return year * 12;
    }
  }

  return undefined;
}

/**
 * Generate insights and recommendation from projections
 */
function generateProjectionInsights(
  currentProjection: CityProjection,
  targetProjections: CityProjection[],
  assumptions: ProjectionAssumptions
): { recommendation: string; insights: string[] } {
  const insights: string[] = [];
  let bestCity = currentProjection.city;
  let bestNetWorth = currentProjection.totalNetWorthYear5;

  // Find best performing city
  for (const target of targetProjections) {
    if (target.totalNetWorthYear5 > bestNetWorth) {
      bestCity = target.city;
      bestNetWorth = target.totalNetWorthYear5;
    }
  }

  // Generate insights
  for (const target of targetProjections) {
    const difference = target.totalNetWorthYear5 - currentProjection.totalNetWorthYear5;
    const diffFormatted = formatCurrencyCompact(Math.abs(difference));

    if (difference > 0) {
      insights.push(
        `${target.city.name} puts you ahead by ${diffFormatted} after 5 years`
      );

      if (target.breakEvenMonth) {
        const breakEvenFormatted = formatMonthsToYearsMonths(target.breakEvenMonth);
        insights.push(
          `Break-even in ${target.city.name}: ${breakEvenFormatted}`
        );
      }
    } else if (difference < 0) {
      insights.push(
        `Staying in ${currentProjection.city.name} saves you ${diffFormatted} over 5 years vs ${target.city.name}`
      );
    }
  }

  // Year-over-year comparison insight
  const year1Current = currentProjection.projections[0].annualSavings;
  const year5Current = currentProjection.projections[4].annualSavings;
  const savingsGrowth = ((year5Current - year1Current) / year1Current * 100).toFixed(0);
  insights.push(
    `With ${(assumptions.salaryGrowthRate * 100).toFixed(0)}% annual raises, your savings grow ${savingsGrowth}% by year 5`
  );

  // Generate recommendation
  let recommendation: string;
  if (bestCity.id === currentProjection.city.id) {
    recommendation = `Based on 5-year projections, staying in ${currentProjection.city.name} provides the best financial outcome.`;
  } else {
    const diff = bestNetWorth - currentProjection.totalNetWorthYear5;
    recommendation = `${bestCity.name} offers the strongest 5-year financial trajectory, putting you ${formatCurrencyCompact(diff)} ahead.`;
  }

  return { recommendation, insights };
}

/**
 * Format currency in compact form
 */
function formatCurrencyCompact(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${Math.round(amount)}`;
}

/**
 * Format months as years and months
 */
function formatMonthsToYearsMonths(months: number): string {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${months} months`;
  }
  if (remainingMonths === 0) {
    return `${years} year${years > 1 ? 's' : ''}`;
  }
  return `${years} year${years > 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
}

// ============================================================================
// SCENARIO ANALYSIS
// ============================================================================

/**
 * Calculate projections under different scenarios (best, expected, worst)
 * for the target city, using the current city as baseline for COL comparison.
 *
 * @param city - Target city to project
 * @param initialSalary - Expected salary in target city
 * @param movingCosts - One-time moving costs
 * @param baselineExpenses - Annual expenses in current city (optional)
 * @param baselineCOL - COL index of current city (optional)
 */
export function calculateScenarios(
  city: City,
  initialSalary: number,
  movingCosts: number = 0,
  baselineExpenses?: number,
  baselineCOL?: number,
  housingIntent: HousingIntent = DEFAULT_HOUSING_INTENT
): {
  best: CityProjection;
  expected: CityProjection;
  worst: CityProjection;
} {
  // Best case: High salary growth, low inflation
  const bestAssumptions: ProjectionAssumptions = {
    salaryGrowthRate: 0.05,      // 5% raises
    rentInflationRate: 0.02,     // 2% rent inflation
    homeAppreciationRate: 0.06,  // 6% appreciation
    colInflationRate: 0.02,      // 2% COL inflation
    savingsRate: 0.25,           // 25% savings rate
    investmentReturnRate: 0.10,  // 10% market returns
  };

  // Expected case: Use defaults
  const expectedAssumptions = DEFAULT_ASSUMPTIONS;

  // Worst case: Low salary growth, high inflation
  const worstAssumptions: ProjectionAssumptions = {
    salaryGrowthRate: 0.01,      // 1% raises
    rentInflationRate: 0.05,     // 5% rent inflation
    homeAppreciationRate: 0.02,  // 2% appreciation
    colInflationRate: 0.04,      // 4% COL inflation
    savingsRate: 0.15,           // 15% savings rate
    investmentReturnRate: 0.04,  // 4% market returns
  };

  return {
    best: calculateCityProjection(city, initialSalary, bestAssumptions, movingCosts, baselineExpenses, baselineCOL, housingIntent),
    expected: calculateCityProjection(city, initialSalary, expectedAssumptions, movingCosts, baselineExpenses, baselineCOL, housingIntent),
    worst: calculateCityProjection(city, initialSalary, worstAssumptions, movingCosts, baselineExpenses, baselineCOL, housingIntent),
  };
}

// ============================================================================
// CHART DATA PREPARATION
// ============================================================================

/**
 * Prepare data for line chart visualization
 */
export function prepareChartData(
  comparison: ProjectionComparison
): {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    color: string;
  }>;
} {
  const labels = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];

  const colors = [
    '#2563eb', // Blue (current)
    '#16a34a', // Green
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Purple
  ];

  const datasets = [
    {
      label: `${comparison.currentCity.city.name} (Current)`,
      data: comparison.currentCity.projections.map((p) => p.netWorth),
      color: colors[0],
    },
    ...comparison.targetCities.map((target, index) => ({
      label: target.city.name,
      data: target.projections.map((p) => p.netWorth),
      color: colors[(index + 1) % colors.length],
    })),
  ];

  return { labels, datasets };
}
