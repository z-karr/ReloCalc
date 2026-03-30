/**
 * Multi-City Comparison Calculator
 * Premium Feature: Compare up to 5 cities with weighted scoring
 */

import { City } from '../../types';
import {
  CityScore,
  MultiCityComparison,
  CityPremiumData,
  PREMIUM_DEFAULTS,
} from '../../types/premium';
import { calculateSalary } from '../taxCalculator';

// ============================================================================
// TYPES
// ============================================================================

export interface ComparisonWeights {
  financial: number;      // 0-1 (default 0.35)
  qualityOfLife: number;  // 0-1 (default 0.25)
  mobility: number;       // 0-1 (default 0.15)
  career: number;         // 0-1 (default 0.15)
  lifestyle: number;      // 0-1 (default 0.10)
}

export const DEFAULT_WEIGHTS: ComparisonWeights = {
  financial: 0.35,
  qualityOfLife: 0.25,
  mobility: 0.15,
  career: 0.15,
  lifestyle: 0.10,
};

// ============================================================================
// MAIN COMPARISON FUNCTION
// ============================================================================

/**
 * Compare multiple cities with weighted scoring
 */
export function compareMultipleCities(
  currentCity: City,
  currentSalary: number,
  targetCities: { city: City; expectedSalary: number }[],
  weights: ComparisonWeights = DEFAULT_WEIGHTS
): MultiCityComparison {
  // Calculate scores for all cities including current
  const allCities = [
    { city: currentCity, salary: currentSalary },
    ...targetCities.map(t => ({ city: t.city, salary: t.expectedSalary })),
  ];

  // Calculate individual city scores
  const cityScores = allCities.map(({ city, salary }) =>
    calculateCityScore(city, salary, currentCity, currentSalary, weights)
  );

  // Calculate rankings
  const rankedScores = calculateRankings(cityScores);

  // Find best cities by category
  const bestOverall = findBestByField(rankedScores, 'overallScore');
  const bestFinancial = findBestByField(rankedScores, 'financialScore');
  const bestQualityOfLife = findBestByField(rankedScores, 'qualityOfLifeScore');
  const bestCareer = findBestByField(rankedScores, 'careerScore');
  const mostAffordable = findMostAffordable(rankedScores);

  // Generate insights
  const insights = generateComparisonInsights(
    rankedScores,
    currentCity,
    bestOverall,
    bestFinancial
  );

  // Generate recommendation
  const recommendation = generateRecommendation(
    rankedScores,
    currentCity,
    bestOverall
  );

  return {
    cities: rankedScores,
    currentCity,
    currentSalary,
    bestOverall: bestOverall.city,
    bestFinancial: bestFinancial.city,
    bestQualityOfLife: bestQualityOfLife.city,
    bestCareer: bestCareer.city,
    mostAffordable: mostAffordable.city,
    insights,
    recommendation,
  };
}

// ============================================================================
// SCORING FUNCTIONS
// ============================================================================

/**
 * Calculate comprehensive score for a single city
 */
function calculateCityScore(
  city: City,
  salary: number,
  currentCity: City,
  currentSalary: number,
  weights: ComparisonWeights
): CityScore {
  // Calculate salary metrics
  const salaryCalc = calculateSalary(salary, city);
  const currentCalc = calculateSalary(currentSalary, currentCity);

  // Financial metrics
  const netSalary = salaryCalc.netSalary;
  const colAdjustedIncome = netSalary * (100 / city.costOfLivingIndex);
  const effectiveTaxRate = salaryCalc.effectiveTaxRate;
  const monthlyRent = city.medianRent;
  const homeAffordability = city.medianHomePrice / salary; // Years of salary to buy

  // Calculate category scores (0-100 scale)
  const financialScore = calculateFinancialScore(
    colAdjustedIncome,
    currentCalc.netSalary * (100 / currentCity.costOfLivingIndex),
    effectiveTaxRate,
    monthlyRent,
    netSalary
  );

  const qualityOfLifeScore = calculateQualityOfLifeScore(city);
  const mobilityScore = calculateMobilityScore(city);
  const careerScore = calculateCareerScore(city);
  const lifestyleScore = calculateLifestyleScore(city);

  // Calculate overall weighted score
  const overallScore =
    financialScore * weights.financial +
    qualityOfLifeScore * weights.qualityOfLife +
    mobilityScore * weights.mobility +
    careerScore * weights.career +
    lifestyleScore * weights.lifestyle;

  // Generate strengths and weaknesses
  const { strengths, weaknesses } = analyzeStrengthsWeaknesses(
    city,
    financialScore,
    qualityOfLifeScore,
    mobilityScore,
    careerScore,
    lifestyleScore
  );

  return {
    city,
    overallScore: Math.round(overallScore),
    financialScore: Math.round(financialScore),
    qualityOfLifeScore: Math.round(qualityOfLifeScore),
    mobilityScore: Math.round(mobilityScore),
    careerScore: Math.round(careerScore),
    lifestyleScore: Math.round(lifestyleScore),
    metrics: {
      netSalary,
      colAdjustedIncome,
      effectiveTaxRate,
      monthlyRent,
      homeAffordability,
      safetyScore: 100 - city.crimeIndex, // Invert crime index
      healthcareScore: city.healthcareIndex,
      educationScore: city.educationIndex,
      transitScore: city.transitScore,
      jobGrowthScore: normalizeJobGrowth(city.jobGrowthRate),
    },
    rankings: {
      overall: 0, // Will be set by calculateRankings
      financial: 0,
      qualityOfLife: 0,
      affordability: 0,
      career: 0,
    },
    strengths,
    weaknesses,
  };
}

/**
 * Calculate financial score (0-100)
 */
function calculateFinancialScore(
  colAdjustedIncome: number,
  currentColAdjustedIncome: number,
  effectiveTaxRate: number,
  monthlyRent: number,
  netSalary: number
): number {
  // Score based on COL-adjusted income relative to baseline
  const incomeScore = Math.min(100, (colAdjustedIncome / 80000) * 100);

  // Score based on effective tax rate (lower is better)
  const taxScore = Math.max(0, 100 - effectiveTaxRate * 200);

  // Score based on rent affordability (rent as % of net salary)
  const rentRatio = (monthlyRent * 12) / netSalary;
  const affordabilityScore = Math.max(0, 100 - rentRatio * 200);

  // Weighted combination
  return incomeScore * 0.5 + taxScore * 0.25 + affordabilityScore * 0.25;
}

/**
 * Calculate quality of life score (0-100)
 */
function calculateQualityOfLifeScore(city: City): number {
  const safetyScore = Math.max(0, 100 - city.crimeIndex);
  const healthcareScore = city.healthcareIndex;
  const educationScore = city.educationIndex;

  return (safetyScore * 0.4 + healthcareScore * 0.3 + educationScore * 0.3);
}

/**
 * Calculate mobility score (0-100)
 */
function calculateMobilityScore(city: City): number {
  const walkScore = city.walkScore;
  const transitScore = city.transitScore;
  const commuteScore = Math.max(0, 100 - city.averageCommute * 1.5);

  return (walkScore * 0.35 + transitScore * 0.35 + commuteScore * 0.3);
}

/**
 * Calculate career score (0-100)
 */
function calculateCareerScore(city: City): number {
  const jobGrowthScore = normalizeJobGrowth(city.jobGrowthRate);
  const populationScore = normalizePopulation(city.population);

  // Larger cities generally have more job opportunities
  return jobGrowthScore * 0.6 + populationScore * 0.4;
}

/**
 * Calculate lifestyle score (0-100)
 */
function calculateLifestyleScore(city: City): number {
  const entertainmentScore = city.entertainmentIndex;
  const outdoorScore = city.outdoorIndex;

  return (entertainmentScore * 0.5 + outdoorScore * 0.5);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Normalize job growth rate to 0-100 score
 */
function normalizeJobGrowth(rate: number): number {
  // Rate typically ranges from -2% to +5%
  // Map to 0-100 scale
  return Math.min(100, Math.max(0, (rate + 2) * 14.3));
}

/**
 * Normalize population to 0-100 score (for job market size)
 */
function normalizePopulation(pop: number): number {
  // Use log scale since population varies widely
  // 100K = ~40, 1M = ~60, 10M = ~80, 20M+ = 100
  const logPop = Math.log10(Math.max(pop, 100000));
  return Math.min(100, Math.max(0, (logPop - 5) * 25 + 40));
}

/**
 * Calculate rankings for all cities
 */
function calculateRankings(scores: CityScore[]): CityScore[] {
  // Sort by each category and assign rankings
  const sortByOverall = [...scores].sort((a, b) => b.overallScore - a.overallScore);
  const sortByFinancial = [...scores].sort((a, b) => b.financialScore - a.financialScore);
  const sortByQoL = [...scores].sort((a, b) => b.qualityOfLifeScore - a.qualityOfLifeScore);
  const sortByAffordability = [...scores].sort((a, b) => {
    // Lower home affordability ratio is better
    return a.metrics.homeAffordability - b.metrics.homeAffordability;
  });
  const sortByCareer = [...scores].sort((a, b) => b.careerScore - a.careerScore);

  return scores.map(score => ({
    ...score,
    rankings: {
      overall: sortByOverall.findIndex(s => s.city.id === score.city.id) + 1,
      financial: sortByFinancial.findIndex(s => s.city.id === score.city.id) + 1,
      qualityOfLife: sortByQoL.findIndex(s => s.city.id === score.city.id) + 1,
      affordability: sortByAffordability.findIndex(s => s.city.id === score.city.id) + 1,
      career: sortByCareer.findIndex(s => s.city.id === score.city.id) + 1,
    },
  }));
}

/**
 * Find best city by a specific score field
 */
function findBestByField(
  scores: CityScore[],
  field: 'overallScore' | 'financialScore' | 'qualityOfLifeScore' | 'careerScore'
): CityScore {
  return scores.reduce((best, current) =>
    current[field] > best[field] ? current : best
  );
}

/**
 * Find most affordable city
 */
function findMostAffordable(scores: CityScore[]): CityScore {
  return scores.reduce((best, current) =>
    current.metrics.homeAffordability < best.metrics.homeAffordability ? current : best
  );
}

/**
 * Analyze strengths and weaknesses for a city
 */
function analyzeStrengthsWeaknesses(
  city: City,
  financial: number,
  qol: number,
  mobility: number,
  career: number,
  lifestyle: number
): { strengths: string[]; weaknesses: string[] } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // Financial
  if (financial >= 75) {
    strengths.push('Strong financial outlook');
  } else if (financial < 50) {
    weaknesses.push('Higher cost relative to income');
  }

  // Quality of Life
  if (qol >= 75) {
    strengths.push('Excellent quality of life');
  } else if (qol < 50) {
    weaknesses.push('Quality of life concerns');
  }

  // Specific metrics
  if (city.crimeIndex < 30) {
    strengths.push('Very safe area');
  } else if (city.crimeIndex > 60) {
    weaknesses.push('Higher crime rates');
  }

  if (city.transitScore >= 70) {
    strengths.push('Great public transit');
  } else if (city.transitScore < 40) {
    weaknesses.push('Limited public transit');
  }

  if (city.walkScore >= 80) {
    strengths.push('Very walkable');
  }

  if (career >= 75) {
    strengths.push('Strong job market');
  } else if (career < 50) {
    weaknesses.push('Limited career opportunities');
  }

  if (lifestyle >= 75) {
    strengths.push('Rich entertainment & outdoor scene');
  }

  // Tax-specific
  if (city.taxRates.type === 'us_federal_state' && city.taxRates.stateTaxRate === 0) {
    strengths.push('No state income tax');
  }

  // Limit to top 3-4
  return {
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 3),
  };
}

/**
 * Generate comparison insights
 */
function generateComparisonInsights(
  scores: CityScore[],
  currentCity: City,
  bestOverall: CityScore,
  bestFinancial: CityScore
): string[] {
  const insights: string[] = [];
  const currentScore = scores.find(s => s.city.id === currentCity.id);

  if (!currentScore) return insights;

  // Best overall insight
  if (bestOverall.city.id !== currentCity.id) {
    const diff = bestOverall.overallScore - currentScore.overallScore;
    insights.push(
      `${bestOverall.city.name} ranks #1 overall, scoring ${diff} points higher than your current city`
    );
  } else {
    insights.push(
      `Your current city (${currentCity.name}) ranks #1 overall among compared cities`
    );
  }

  // Financial comparison
  if (bestFinancial.city.id !== currentCity.id && bestFinancial.city.id !== bestOverall.city.id) {
    insights.push(
      `${bestFinancial.city.name} offers the best financial opportunity with ${formatCurrency(bestFinancial.metrics.colAdjustedIncome)} COL-adjusted income`
    );
  }

  // Affordability insight
  const mostAffordable = scores.reduce((best, current) =>
    current.metrics.homeAffordability < best.metrics.homeAffordability ? current : best
  );
  if (mostAffordable.city.id !== currentCity.id) {
    insights.push(
      `${mostAffordable.city.name} has the most affordable housing at ${mostAffordable.metrics.homeAffordability.toFixed(1)}x annual salary`
    );
  }

  // Score spread insight
  const scoreSpread = Math.max(...scores.map(s => s.overallScore)) -
                      Math.min(...scores.map(s => s.overallScore));
  if (scoreSpread < 10) {
    insights.push('All cities are closely matched - personal preference may be the deciding factor');
  } else if (scoreSpread > 25) {
    insights.push('Significant differences between cities - clear winners and losers in this comparison');
  }

  return insights;
}

/**
 * Generate final recommendation
 */
function generateRecommendation(
  scores: CityScore[],
  currentCity: City,
  bestOverall: CityScore
): string {
  const currentScore = scores.find(s => s.city.id === currentCity.id);

  if (!currentScore) {
    return `Based on the analysis, ${bestOverall.city.name} scores highest overall.`;
  }

  if (bestOverall.city.id === currentCity.id) {
    return `Your current city (${currentCity.name}) ranks highest in this comparison. ` +
      `Consider the target cities only if specific factors like career growth or lifestyle changes are priorities.`;
  }

  const diff = bestOverall.overallScore - currentScore.overallScore;

  if (diff > 15) {
    return `${bestOverall.city.name} is a strong recommendation, scoring ${diff} points higher than ${currentCity.name}. ` +
      `The move appears advantageous across multiple factors.`;
  } else if (diff > 5) {
    return `${bestOverall.city.name} edges out ${currentCity.name} by ${diff} points. ` +
      `The difference is meaningful but consider your personal priorities carefully.`;
  } else {
    return `${bestOverall.city.name} and ${currentCity.name} are closely matched. ` +
      `Focus on specific factors that matter most to you - the overall scores are within margin of preference.`;
  }
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
 * Prepare data for radar chart visualization
 */
export function prepareRadarChartData(
  comparison: MultiCityComparison
): {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    color: string;
  }>;
} {
  const labels = ['Financial', 'Quality of Life', 'Mobility', 'Career', 'Lifestyle'];

  const colors = [
    '#2563eb', // Blue
    '#16a34a', // Green
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Purple
  ];

  const datasets = comparison.cities.map((cityScore, index) => ({
    label: cityScore.city.name,
    data: [
      cityScore.financialScore,
      cityScore.qualityOfLifeScore,
      cityScore.mobilityScore,
      cityScore.careerScore,
      cityScore.lifestyleScore,
    ],
    color: colors[index % colors.length],
  }));

  return { labels, datasets };
}

/**
 * Prepare data for bar chart comparison
 */
export function prepareBarChartData(
  comparison: MultiCityComparison,
  metric: 'overall' | 'financial' | 'qol' | 'career' | 'affordability'
): {
  labels: string[];
  values: number[];
  colors: string[];
} {
  const colors = [
    '#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6',
  ];

  const sortedCities = [...comparison.cities].sort((a, b) => {
    switch (metric) {
      case 'overall':
        return b.overallScore - a.overallScore;
      case 'financial':
        return b.financialScore - a.financialScore;
      case 'qol':
        return b.qualityOfLifeScore - a.qualityOfLifeScore;
      case 'career':
        return b.careerScore - a.careerScore;
      case 'affordability':
        return a.metrics.homeAffordability - b.metrics.homeAffordability;
      default:
        return b.overallScore - a.overallScore;
    }
  });

  return {
    labels: sortedCities.map(s => s.city.name),
    values: sortedCities.map(s => {
      switch (metric) {
        case 'overall':
          return s.overallScore;
        case 'financial':
          return s.financialScore;
        case 'qol':
          return s.qualityOfLifeScore;
        case 'career':
          return s.careerScore;
        case 'affordability':
          return Math.round(100 - s.metrics.homeAffordability * 10); // Invert for display
        default:
          return s.overallScore;
      }
    }),
    colors: sortedCities.map((_, i) => colors[i % colors.length]),
  };
}

/**
 * Get comparison summary for quick display
 */
export function getComparisonSummary(
  comparison: MultiCityComparison
): {
  topCity: { name: string; score: number };
  runnerUp: { name: string; score: number } | null;
  currentRank: number;
  totalCities: number;
} {
  const sorted = [...comparison.cities].sort((a, b) => b.overallScore - a.overallScore);
  const currentRank = sorted.findIndex(s => s.city.id === comparison.currentCity.id) + 1;

  return {
    topCity: {
      name: sorted[0].city.name,
      score: sorted[0].overallScore,
    },
    runnerUp: sorted.length > 1 ? {
      name: sorted[1].city.name,
      score: sorted[1].overallScore,
    } : null,
    currentRank,
    totalCities: sorted.length,
  };
}
