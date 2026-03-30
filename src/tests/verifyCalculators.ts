/**
 * Calculator Verification Script
 * Quick checks that all premium calculators are properly exported and have correct types
 */

import { cities as allCities, getCityById } from '../data/cities';
import { City } from '../types';
import { DEFAULT_ASSUMPTIONS } from '../types/premium';

// Import all premium calculators
import {
  calculateCityProjection,
  compareProjections,
  calculateScenarios,
  prepareChartData,
} from '../utils/premium/projectionCalculator';

import {
  calculateBreakEven,
  prepareBreakEvenChartData,
  quickBreakEvenEstimate,
} from '../utils/premium/breakEvenCalculator';

import {
  calculateRentVsBuy,
  prepareRentVsBuyChartData,
  getMonthlyCostComparison,
} from '../utils/premium/rentVsBuyCalculator';

import {
  compareMultipleCities,
  prepareRadarChartData,
  prepareBarChartData,
  getComparisonSummary,
  DEFAULT_WEIGHTS,
} from '../utils/premium/multiCityComparator';

import {
  calculateNegotiationToolkit,
  comparePackageToNeeds,
  getNegotiationSummary,
  INDUSTRY_BENCHMARKS,
} from '../utils/premium/negotiationCalculator';

import {
  generateChecklist,
  toggleTaskCompletion,
  addCustomTask,
  removeTask,
  addTaskNotes,
  refreshChecklistStatus,
  getTasksByPhase,
  getOverdueTasks,
  getUpcomingTasks,
  getProgressByPhase,
  estimateRemainingTime,
} from '../utils/premium/checklistGenerator';

// Verification results
interface VerificationResult {
  calculator: string;
  passed: boolean;
  functions: string[];
  error?: string;
}

export function verifyAllCalculators(): VerificationResult[] {
  const results: VerificationResult[] = [];

  // Get test cities
  const nyc = getCityById('nyc')!;
  const austin = getCityById('austin')!;
  const denver = getCityById('denver')!;

  // Verify Projection Calculator
  try {
    const projection = calculateCityProjection(nyc, 100000, DEFAULT_ASSUMPTIONS);
    const scenarios = calculateScenarios(nyc, 100000, 5000);
    const comparison = compareProjections(nyc, 100000, [{ city: austin, salary: 90000 }]);
    const chartData = prepareChartData(comparison);

    results.push({
      calculator: 'Projection Calculator',
      passed: true,
      functions: ['calculateCityProjection', 'calculateScenarios', 'compareProjections', 'prepareChartData'],
    });
  } catch (e) {
    results.push({
      calculator: 'Projection Calculator',
      passed: false,
      functions: [],
      error: (e as Error).message,
    });
  }

  // Verify Break-Even Calculator
  try {
    const breakEven = calculateBreakEven(nyc, 100000, austin, 90000, 8000, DEFAULT_ASSUMPTIONS);
    const chartData = prepareBreakEvenChartData(breakEven);
    const quickEstimate = quickBreakEvenEstimate(100000, 110000, 100, 90, 10000);

    results.push({
      calculator: 'Break-Even Calculator',
      passed: true,
      functions: ['calculateBreakEven', 'prepareBreakEvenChartData', 'quickBreakEvenEstimate'],
    });
  } catch (e) {
    results.push({
      calculator: 'Break-Even Calculator',
      passed: false,
      functions: [],
      error: (e as Error).message,
    });
  }

  // Verify Rent vs Buy Calculator
  try {
    const rentVsBuy = calculateRentVsBuy(nyc, 120000);
    const chartData = prepareRentVsBuyChartData(rentVsBuy);
    const monthly = getMonthlyCostComparison(rentVsBuy);

    results.push({
      calculator: 'Rent vs Buy Calculator',
      passed: true,
      functions: ['calculateRentVsBuy', 'prepareRentVsBuyChartData', 'getMonthlyCostComparison'],
    });
  } catch (e) {
    results.push({
      calculator: 'Rent vs Buy Calculator',
      passed: false,
      functions: [],
      error: (e as Error).message,
    });
  }

  // Verify Multi-City Comparator
  try {
    const comparison = compareMultipleCities(
      nyc,
      150000,
      [
        { city: austin, expectedSalary: 130000 },
        { city: denver, expectedSalary: 135000 },
      ],
      DEFAULT_WEIGHTS
    );
    const radarData = prepareRadarChartData(comparison);
    const barData = prepareBarChartData(comparison, 'overall');
    const summary = getComparisonSummary(comparison);

    results.push({
      calculator: 'Multi-City Comparator',
      passed: true,
      functions: ['compareMultipleCities', 'prepareRadarChartData', 'prepareBarChartData', 'getComparisonSummary'],
    });
  } catch (e) {
    results.push({
      calculator: 'Multi-City Comparator',
      passed: false,
      functions: [],
      error: (e as Error).message,
    });
  }

  // Verify Negotiation Calculator
  try {
    const toolkit = calculateNegotiationToolkit(nyc, 150000, austin, 130000, 10000);
    const packageComparison = comparePackageToNeeds(toolkit, {
      movingCoverage: 8000,
      temporaryHousing: 3000,
      bonus: 5000,
      other: 0,
    });
    const summary = getNegotiationSummary(toolkit);
    const benchmarks = INDUSTRY_BENCHMARKS;

    results.push({
      calculator: 'Negotiation Calculator',
      passed: true,
      functions: ['calculateNegotiationToolkit', 'comparePackageToNeeds', 'getNegotiationSummary', 'INDUSTRY_BENCHMARKS'],
    });
  } catch (e) {
    results.push({
      calculator: 'Negotiation Calculator',
      passed: false,
      functions: [],
      error: (e as Error).message,
    });
  }

  // Verify Checklist Generator
  try {
    const moveDate = new Date();
    moveDate.setDate(moveDate.getDate() + 60);

    const checklist = generateChecklist({
      moveDate,
      fromCity: nyc,
      toCity: austin,
      isInternational: false,
      hasPets: true,
      hasChildren: false,
      isCurrentlyHomeowner: false,
      isCurrentlyRenter: true,
    });

    const toggled = toggleTaskCompletion(checklist, checklist.items[0].id);
    const withCustom = addCustomTask(checklist, 'Custom task', 'planning', 45);
    const byPhase = getTasksByPhase(checklist, 'planning');
    const overdue = getOverdueTasks(checklist);
    const upcoming = getUpcomingTasks(checklist, 7);
    const progress = getProgressByPhase(checklist);
    const timeEstimate = estimateRemainingTime(checklist);

    results.push({
      calculator: 'Checklist Generator',
      passed: true,
      functions: [
        'generateChecklist', 'toggleTaskCompletion', 'addCustomTask',
        'getTasksByPhase', 'getOverdueTasks', 'getUpcomingTasks',
        'getProgressByPhase', 'estimateRemainingTime'
      ],
    });
  } catch (e) {
    results.push({
      calculator: 'Checklist Generator',
      passed: false,
      functions: [],
      error: (e as Error).message,
    });
  }

  // Summary
  console.log('\n========== CALCULATOR VERIFICATION ==========\n');
  results.forEach(r => {
    const status = r.passed ? '✓' : '✗';
    console.log(`${status} ${r.calculator}`);
    if (r.passed) {
      console.log(`    Functions verified: ${r.functions.length}`);
    } else {
      console.log(`    Error: ${r.error}`);
    }
  });

  const passedCount = results.filter(r => r.passed).length;
  console.log(`\nTotal: ${passedCount}/${results.length} calculators verified`);

  // Verify all cities work
  console.log('\n========== CITY DATA VERIFICATION ==========\n');
  console.log(`Total cities: ${allCities.length}`);

  const countryCounts = new Map<string, number>();
  allCities.forEach((city: City) => {
    countryCounts.set(city.country, (countryCounts.get(city.country) || 0) + 1);
  });
  console.log(`Countries: ${countryCounts.size}`);

  return results;
}

// Make available globally for browser console
if (typeof window !== 'undefined') {
  (window as any).verifyCalculators = verifyAllCalculators;
}

export default verifyAllCalculators;
