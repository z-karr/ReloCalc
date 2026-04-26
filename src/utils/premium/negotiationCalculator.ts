/**
 * Employer Negotiation Calculator
 * Premium Feature: Calculate relocation costs and negotiation leverage
 */

import { City } from '../../types';
import {
  RelocationCostBreakdown,
  IndustryBenchmark,
  NegotiationToolkit,
} from '../../types/premium';
import { calculateSalary } from '../taxCalculator';
import {
  getCostFactorsForCities,
  classifyMove,
  getMoveTypeLabel,
  formatDistance,
  MoveClassification,
  calculateTravelCosts,
  TravelCostBreakdown,
} from './distanceCalculator';

// ============================================================================
// INDUSTRY BENCHMARKS
// ============================================================================

export const INDUSTRY_BENCHMARKS: IndustryBenchmark[] = [
  {
    component: 'Moving Expenses',
    typicalCoverage: 'Full coverage',
    percentCovered: 100,
    dollarRange: { low: 3000, high: 15000 },
  },
  {
    component: 'Temporary Housing',
    typicalCoverage: '30-60 days',
    percentCovered: 90,
    dollarRange: { low: 3000, high: 12000 },
  },
  {
    component: 'House Hunting Trips',
    typicalCoverage: '2-3 trips',
    percentCovered: 85,
    dollarRange: { low: 1500, high: 5000 },
  },
  {
    component: 'Closing Costs',
    typicalCoverage: 'Up to 3% of home price',
    percentCovered: 70,
    dollarRange: { low: 5000, high: 25000 },
  },
  {
    component: 'COL Adjustment',
    typicalCoverage: 'Varies by company',
    percentCovered: 50,
    dollarRange: { low: 0, high: 20000 },
  },
  {
    component: 'Relocation Bonus',
    typicalCoverage: 'One-time payment',
    percentCovered: 75,
    dollarRange: { low: 5000, high: 25000 },
  },
  {
    component: 'Tax Gross-Up',
    typicalCoverage: 'On taxable benefits',
    percentCovered: 60,
    dollarRange: { low: 2000, high: 15000 },
  },
];

// ============================================================================
// MAIN CALCULATION
// ============================================================================

/**
 * Calculate comprehensive negotiation toolkit
 */
export function calculateNegotiationToolkit(
  currentCity: City,
  currentSalary: number,
  targetCity: City,
  targetSalary: number,
  movingCosts: number,
  options?: {
    temporaryHousingDays?: number;
    houseHuntingTrips?: number;
    isHomeowner?: boolean;
    homePrice?: number;
    householdSize?: number;
    moveTravelMode?: 'driving' | 'flying';
    plansToBuy?: boolean;
  }
): NegotiationToolkit {
  // Get distance-based cost factors
  const costFactors = getCostFactorsForCities(currentCity, targetCity);
  const plansToBuy = options?.plansToBuy ?? false;

  // Adjust defaults based on housing intent
  // Buyers typically need more time (closing process) and more house hunting trips
  const baseTempHousingDays = costFactors.tempHousingDays;
  const adjustedTempHousingDays = plansToBuy
    ? Math.round(baseTempHousingDays * 1.5) // 50% longer for buyers (closing process)
    : baseTempHousingDays;

  const baseHouseHuntingTrips = 2;
  const adjustedHouseHuntingTrips = plansToBuy ? 3 : baseHouseHuntingTrips; // Buyers often need more trips

  const opts = {
    // Use smart defaults based on move type and housing intent if not specified
    temporaryHousingDays: options?.temporaryHousingDays ?? adjustedTempHousingDays,
    houseHuntingTrips: options?.houseHuntingTrips ?? adjustedHouseHuntingTrips,
    isHomeowner: options?.isHomeowner ?? false,
    homePrice: options?.homePrice ?? targetCity.medianHomePrice,
    householdSize: options?.householdSize ?? 1,
    moveTravelMode: options?.moveTravelMode ?? 'driving',
    plansToBuy,
    costFactors, // Pass cost factors through
  };

  // Calculate cost breakdown
  const costBreakdown = calculateRelocationCosts(
    currentCity,
    currentSalary,
    targetCity,
    targetSalary,
    movingCosts,
    opts
  );

  // Calculate typical package value
  const typicalPackageValue = calculateTypicalPackage(costBreakdown);

  // Calculate gap
  const actualCosts = costBreakdown.totalRelocationCost;
  const gap = actualCosts - typicalPackageValue;

  // Generate recommended ask
  const recommendedAsk = calculateRecommendedAsk(costBreakdown, gap);

  // Generate negotiation points
  const negotiationPoints = generateNegotiationPoints(
    costBreakdown,
    gap,
    currentCity,
    targetCity,
    costFactors.moveClassification,
    opts.temporaryHousingDays
  );

  // Generate scripts
  const scripts = generateNegotiationScripts(
    costBreakdown,
    currentCity,
    targetCity,
    currentSalary,
    targetSalary,
    costFactors.moveClassification,
    opts.temporaryHousingDays,
    opts.plansToBuy
  );

  return {
    costBreakdown,
    benchmarks: INDUSTRY_BENCHMARKS,
    typicalPackageValue,
    actualCosts,
    gap,
    recommendedAsk,
    negotiationPoints,
    scripts,
  };
}

// ============================================================================
// COST CALCULATIONS
// ============================================================================

/**
 * Calculate detailed relocation cost breakdown
 */
function calculateRelocationCosts(
  currentCity: City,
  currentSalary: number,
  targetCity: City,
  targetSalary: number,
  movingCosts: number,
  options: {
    temporaryHousingDays: number;
    houseHuntingTrips: number;
    isHomeowner: boolean;
    homePrice: number;
    householdSize: number;
    moveTravelMode: 'driving' | 'flying';
    plansToBuy: boolean;
    costFactors: ReturnType<typeof getCostFactorsForCities>;
  }
): RelocationCostBreakdown {
  const { costFactors, householdSize, moveTravelMode, plansToBuy } = options;
  const moveClassification = costFactors.moveClassification;

  // Moving expenses (from moving calculator)
  const movingExpenses = movingCosts;

  // Temporary housing - scales with move distance (longer moves = longer temp housing)
  const dailyHousingCost = (targetCity.medianRent / 30) * 1.5; // Hotels/Airbnb premium
  const temporaryHousing = dailyHousingCost * options.temporaryHousingDays;

  // House hunting trips - cost varies by distance (local = day trip, cross-country = flights)
  const tripCost = costFactors.houseHuntingCostPerTrip;
  // For longer moves, typically send fewer people per trip (usually just decision-maker)
  const peoplePerTrip = costFactors.houseHuntingPeopleDefault;
  const houseHuntingTrips = tripCost * peoplePerTrip * options.houseHuntingTrips;

  // Duplicate housing (overlap period ~30 days)
  const currentRent = currentCity.medianRent;
  const duplicateHousing = currentRent; // One month overlap

  // Travel costs (final move) - based on user's chosen travel mode
  const travelCostBreakdown = calculateTravelCosts(
    moveClassification.distanceMiles,
    householdSize,
    moveTravelMode
  );
  const travelCosts = travelCostBreakdown.totalCost;

  // Storage if needed - varies by move type (longer = more likely to need storage)
  const baseStorageCost = 300; // Base monthly storage cost
  const storageIfNeeded = Math.round(baseStorageCost * costFactors.storageCostMultiplier);

  // Calculate salary/tax differences
  const currentCalc = calculateSalary(currentSalary, currentCity);
  const targetCalc = calculateSalary(targetSalary, targetCity);

  // COL adjustment needed (annual difference)
  const currentPurchasingPower = currentCalc.netSalary * (100 / currentCity.costOfLivingIndex);
  const targetPurchasingPower = targetCalc.netSalary * (100 / targetCity.costOfLivingIndex);
  const colAdjustmentNeeded = Math.max(0, (currentPurchasingPower - targetPurchasingPower));

  // Tax burden difference (annual)
  const taxBurdenDifference = targetCalc.effectiveTaxRate - currentCalc.effectiveTaxRate;
  const annualTaxImpact = targetSalary * taxBurdenDifference;

  // Gross-up calculation (relocation benefits are taxable)
  // Estimate ~35% marginal tax rate on relocation benefits
  const taxableRelocationBenefits = movingExpenses + temporaryHousing + houseHuntingTrips;
  const grossUpAmount = taxableRelocationBenefits * 0.35;

  // Total
  const totalRelocationCost =
    movingExpenses +
    temporaryHousing +
    houseHuntingTrips +
    duplicateHousing +
    travelCosts +
    storageIfNeeded +
    grossUpAmount;

  return {
    movingExpenses,
    temporaryHousing,
    houseHuntingTrips,
    duplicateHousing,
    travelCosts,
    storageIfNeeded,
    colAdjustmentNeeded,
    taxBurdenDifference: annualTaxImpact,
    grossUpAmount,
    totalRelocationCost,
  };
}

/**
 * Calculate typical company package value
 */
function calculateTypicalPackage(costs: RelocationCostBreakdown): number {
  // Companies typically cover:
  // - 100% moving expenses
  // - 80% temporary housing
  // - 85% house hunting
  // - 50% of other costs
  return (
    costs.movingExpenses * 1.0 +
    costs.temporaryHousing * 0.8 +
    costs.houseHuntingTrips * 0.85 +
    costs.duplicateHousing * 0.5 +
    costs.travelCosts * 0.9 +
    costs.grossUpAmount * 0.6
  );
}

/**
 * Calculate recommended ask amount
 */
function calculateRecommendedAsk(
  costs: RelocationCostBreakdown,
  gap: number
): number {
  // Start with full costs
  let ask = costs.totalRelocationCost;

  // Add buffer for unexpected expenses (10%)
  ask *= 1.1;

  // Round to nearest $500
  return Math.ceil(ask / 500) * 500;
}

// ============================================================================
// NEGOTIATION CONTENT
// ============================================================================

/**
 * Generate negotiation talking points
 */
function generateNegotiationPoints(
  costs: RelocationCostBreakdown,
  gap: number,
  currentCity: City,
  targetCity: City,
  moveClassification?: MoveClassification,
  temporaryHousingDays?: number
): string[] {
  const points: string[] = [];

  // Get move type description for better context
  const moveTypeLabel = moveClassification
    ? getMoveTypeLabel(moveClassification.type).toLowerCase()
    : 'relocation';
  const distanceText = moveClassification
    ? ` (${formatDistance(moveClassification.distanceMiles)})`
    : '';

  // Move type/distance point — sets the stage for why costs are what they are
  if (moveClassification) {
    const moveType = moveClassification.type;
    const distance = moveClassification.distanceMiles;
    if (moveType === 'international') {
      points.push(
        `This is an international relocation${distanceText}, which typically involves the most comprehensive packages due to cross-border logistics, visa support, and extended transition timelines.`
      );
    } else if (moveType === 'cross-country') {
      points.push(
        `This is a cross-country move spanning ${formatDistance(distance)}, placing it in the highest tier of domestic relocations. Industry data shows cross-country moves cost 2-3x more than regional moves due to longer transit, extended temporary housing, and higher travel costs.`
      );
    } else if (moveType === 'long-distance') {
      points.push(
        `At ${formatDistance(distance)}, this qualifies as a long-distance relocation. Moves of this distance typically require professional movers, temporary housing, and multiple house hunting trips — all standard components of a comprehensive relocation package.`
      );
    } else if (moveType === 'regional') {
      points.push(
        `This is a regional move of ${formatDistance(distance)}. While shorter than cross-country moves, the distance still requires professional movers and a transition period for housing, making relocation support appropriate.`
      );
    } else {
      points.push(
        `This is a local move of ${formatDistance(distance)}. While the distance is manageable, professional moving services and a brief transition period are still standard relocation support items.`
      );
    }
  }

  // Moving costs point
  points.push(
    `Moving costs alone are estimated at $${costs.movingExpenses.toLocaleString()}, which is within industry norms for a ${moveTypeLabel}${distanceText}.`
  );

  // Temporary housing point — use actual days for daily rate
  if (costs.temporaryHousing > 3000 && temporaryHousingDays && temporaryHousingDays > 0) {
    const dailyRate = Math.round(costs.temporaryHousing / temporaryHousingDays);
    const typicalDays = moveClassification?.type === 'cross-country' ? '60-90'
      : moveClassification?.type === 'long-distance' ? '45-60'
      : moveClassification?.type === 'regional' ? '30-45'
      : '14-30';
    points.push(
      `Temporary housing in ${targetCity.name} runs approximately $${dailyRate}/day. A ${typicalDays} day allowance is standard for a ${moveTypeLabel}.`
    );
  }

  // COL adjustment point
  if (costs.colAdjustmentNeeded > 5000) {
    const colDiff = ((targetCity.costOfLivingIndex / currentCity.costOfLivingIndex) - 1) * 100;
    points.push(
      `${targetCity.name} has a ${colDiff.toFixed(0)}% higher cost of living than ${currentCity.name}. A COL adjustment helps maintain equivalent purchasing power.`
    );
  }

  // Tax gross-up point
  if (costs.grossUpAmount > 2000) {
    points.push(
      `Since relocation benefits are taxable income, a gross-up of $${costs.grossUpAmount.toLocaleString()} ensures the full benefit value is received.`
    );
  }

  // Gap point
  if (gap > 0) {
    points.push(
      `The gap between typical company coverage and actual relocation costs is approximately $${gap.toLocaleString()}. This represents out-of-pocket expenses without additional support.`
    );
  }

  // Industry standard point
  points.push(
    `Based on industry benchmarks, a comprehensive relocation package for this move would typically range from $${(costs.totalRelocationCost * 0.7).toLocaleString()} to $${(costs.totalRelocationCost * 1.1).toLocaleString()}.`
  );

  return points;
}

/**
 * Generate negotiation scripts
 */
function generateNegotiationScripts(
  costs: RelocationCostBreakdown,
  currentCity: City,
  targetCity: City,
  currentSalary: number,
  targetSalary: number,
  moveClassification?: MoveClassification,
  temporaryHousingDays?: number,
  plansToBuy?: boolean
): NegotiationToolkit['scripts'] {
  const colDiff = ((targetCity.costOfLivingIndex / currentCity.costOfLivingIndex) - 1) * 100;

  // COL script adapts based on whether target is more or less expensive
  let colScript: string;
  if (colDiff > 0 && costs.colAdjustmentNeeded > 0) {
    colScript = `"I'm excited about this opportunity in ${targetCity.name}. I've done research on the cost of living difference between ${currentCity.name} and ${targetCity.name}, which shows approximately a ${colDiff.toFixed(0)}% increase. To maintain my current standard of living and purchasing power, I'd like to discuss a cost of living adjustment of $${Math.round(costs.colAdjustmentNeeded).toLocaleString()} annually, or a one-time relocation bonus to offset this difference."`;
  } else {
    colScript = `"I'm excited about this opportunity in ${targetCity.name}. While the cost of living is comparable to or lower than ${currentCity.name}, the relocation itself involves significant one-time expenses. I'd like to discuss a relocation bonus to cover the transition costs and ensure I can hit the ground running in the new role."`;
  }

  // Temp housing script uses actual days based on move type
  const tempDaysRange = moveClassification?.type === 'cross-country' ? '60-90'
    : moveClassification?.type === 'long-distance' ? '45-60'
    : moveClassification?.type === 'international' ? '60-90'
    : moveClassification?.type === 'regional' ? '30-45'
    : '14-30';
  const housingContext = plansToBuy
    ? 'especially when purchasing a home, which involves inspections, appraisals, and closing'
    : 'especially for someone new to the area';

  const tempHousingScript = `"Finding suitable housing in ${targetCity.name} typically takes ${tempDaysRange} days, ${housingContext}. I'd like to request temporary housing support during this transition period. Based on local rates, this would be approximately $${costs.temporaryHousing.toLocaleString()}. This allows me to start contributing to the team immediately while securing appropriate permanent housing."`;

  // Home sale script adapts based on whether user is a buyer/homeowner
  let homeSaleScript: string;
  if (plansToBuy) {
    homeSaleScript = `"As I'll be purchasing a home in ${targetCity.name}, I'd like to discuss closing cost assistance and any home buying programs your company offers. Covering closing costs — typically 2-3% of the purchase price — is a standard component of relocation packages and helps reduce the financial complexity of the transition."`;
  } else {
    homeSaleScript = `"I'd like to discuss support for the housing transition, including lease break costs at my current residence and security deposit assistance in ${targetCity.name}. These one-time costs are a standard component of relocation support and help ensure a smooth transition."`;
  }

  return {
    colAdjustment: colScript,

    grossUp: `"I understand that relocation benefits are considered taxable income. To ensure I receive the full value of the relocation package, I'd like to request a tax gross-up provision. Based on my estimated marginal tax rate, this would be approximately $${costs.grossUpAmount.toLocaleString()}. This is a standard practice at many companies and ensures the relocation support achieves its intended purpose."`,

    temporaryHousing: tempHousingScript,

    homeSaleAssistance: homeSaleScript,
  };
}

// ============================================================================
// PACKAGE COMPARISON
// ============================================================================

/**
 * Compare an offer to the calculated needs
 */
export function comparePackageToNeeds(
  toolkit: NegotiationToolkit,
  offeredPackage: {
    movingCoverage: number;
    temporaryHousing: number;
    bonus: number;
    other: number;
  }
): {
  totalOffered: number;
  totalNeeded: number;
  gap: number;
  coveragePercent: number;
  uncoveredItems: string[];
  assessment: 'generous' | 'adequate' | 'below_average' | 'minimal';
} {
  const totalOffered =
    offeredPackage.movingCoverage +
    offeredPackage.temporaryHousing +
    offeredPackage.bonus +
    offeredPackage.other;

  const totalNeeded = toolkit.actualCosts;
  const gap = totalNeeded - totalOffered;
  const coveragePercent = (totalOffered / totalNeeded) * 100;

  // Identify uncovered items
  const uncoveredItems: string[] = [];
  if (offeredPackage.movingCoverage < toolkit.costBreakdown.movingExpenses) {
    uncoveredItems.push('Moving expenses gap');
  }
  if (offeredPackage.temporaryHousing < toolkit.costBreakdown.temporaryHousing) {
    uncoveredItems.push('Temporary housing');
  }
  if (toolkit.costBreakdown.grossUpAmount > 0 && offeredPackage.other < toolkit.costBreakdown.grossUpAmount) {
    uncoveredItems.push('Tax gross-up');
  }

  // Assessment
  let assessment: 'generous' | 'adequate' | 'below_average' | 'minimal';
  if (coveragePercent >= 100) {
    assessment = 'generous';
  } else if (coveragePercent >= 80) {
    assessment = 'adequate';
  } else if (coveragePercent >= 60) {
    assessment = 'below_average';
  } else {
    assessment = 'minimal';
  }

  return {
    totalOffered,
    totalNeeded,
    gap,
    coveragePercent,
    uncoveredItems,
    assessment,
  };
}

// ============================================================================
// SUMMARY HELPERS
// ============================================================================

/**
 * Get a quick summary of negotiation leverage
 */
export function getNegotiationSummary(
  toolkit: NegotiationToolkit
): {
  headline: string;
  totalCosts: string;
  recommendedAsk: string;
  topPriorities: string[];
} {
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount.toFixed(0)}`;
  };

  // Determine top priorities
  const priorities: { item: string; amount: number }[] = [
    { item: 'Moving expenses', amount: toolkit.costBreakdown.movingExpenses },
    { item: 'Temporary housing', amount: toolkit.costBreakdown.temporaryHousing },
    { item: 'Tax gross-up', amount: toolkit.costBreakdown.grossUpAmount },
    { item: 'COL adjustment', amount: toolkit.costBreakdown.colAdjustmentNeeded },
  ].filter(p => p.amount > 1000)
   .sort((a, b) => b.amount - a.amount)
   .slice(0, 3);

  const topPriorities = priorities.map(
    p => `${p.item}: ${formatCurrency(p.amount)}`
  );

  return {
    headline: toolkit.gap > 0
      ? `Potential gap of ${formatCurrency(toolkit.gap)} between typical coverage and actual costs`
      : 'Your relocation costs are within typical company coverage',
    totalCosts: formatCurrency(toolkit.actualCosts),
    recommendedAsk: formatCurrency(toolkit.recommendedAsk),
    topPriorities,
  };
}
