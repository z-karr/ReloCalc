/**
 * Premium Features Comprehensive Test Suite
 * Tests all Phase 1-5 implementations with real city data
 */

import { cities as allCities, getCityById, getCitiesByCountry } from '../data/cities';
import { City } from '../types';
import {
  DEFAULT_ASSUMPTIONS,
  ProjectionAssumptions,
} from '../types/premium';

// Import premium calculators
import {
  calculateCityProjection,
  compareProjections,
  calculateScenarios,
} from '../utils/premium/projectionCalculator';

import {
  calculateBreakEven,
  quickBreakEvenEstimate,
} from '../utils/premium/breakEvenCalculator';

import {
  calculateRentVsBuy,
  getMonthlyCostComparison,
} from '../utils/premium/rentVsBuyCalculator';

import {
  compareMultipleCities,
  getComparisonSummary,
  DEFAULT_WEIGHTS,
} from '../utils/premium/multiCityComparator';

import {
  calculateNegotiationToolkit,
  getNegotiationSummary,
  INDUSTRY_BENCHMARKS,
} from '../utils/premium/negotiationCalculator';

import {
  generateChecklist,
  toggleTaskCompletion,
  getProgressByPhase,
  getOverdueTasks,
  ChecklistOptions,
} from '../utils/premium/checklistGenerator';

// Import existing calculators for integration testing
import { calculateSalary } from '../utils/taxCalculator';

// ============================================================================
// TEST UTILITIES
// ============================================================================

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: string;
}

const testResults: TestResult[] = [];

function logTest(name: string, passed: boolean, error?: string, details?: string) {
  testResults.push({ name, passed, error, details });
  const status = passed ? '✓' : '✗';
  console.log(`${status} ${name}`);
  if (error) console.log(`  Error: ${error}`);
  if (details) console.log(`  Details: ${details}`);
}

function assertDefined<T>(value: T | undefined | null, name: string): asserts value is T {
  if (value === undefined || value === null) {
    throw new Error(`${name} is undefined or null`);
  }
}

function assertNumber(value: number, name: string, min?: number, max?: number) {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error(`${name} is not a valid number: ${value}`);
  }
  if (min !== undefined && value < min) {
    throw new Error(`${name} (${value}) is less than minimum (${min})`);
  }
  if (max !== undefined && value > max) {
    throw new Error(`${name} (${value}) is greater than maximum (${max})`);
  }
}

function assertArray<T>(value: T[], name: string, minLength?: number) {
  if (!Array.isArray(value)) {
    throw new Error(`${name} is not an array`);
  }
  if (minLength !== undefined && value.length < minLength) {
    throw new Error(`${name} has length ${value.length}, expected at least ${minLength}`);
  }
}

// ============================================================================
// TEST: DATA INTEGRITY
// ============================================================================

function testDataIntegrity() {
  console.log('\n=== DATA INTEGRITY TESTS ===\n');

  // Test 1: All cities have required fields
  try {
    const missingFields: string[] = [];
    allCities.forEach((city: City) => {
      const requiredFields = [
        'id', 'name', 'country', 'countryCode', 'costOfLivingIndex',
        'medianRent', 'medianHomePrice', 'taxRates', 'population'
      ];
      requiredFields.forEach(field => {
        if ((city as unknown as Record<string, unknown>)[field] === undefined) {
          missingFields.push(`${city.name}: missing ${field}`);
        }
      });
    });

    if (missingFields.length > 0) {
      throw new Error(`Missing fields: ${missingFields.slice(0, 5).join(', ')}...`);
    }
    logTest(`All ${allCities.length} cities have required fields`, true);
  } catch (e) {
    logTest('All cities have required fields', false, (e as Error).message);
  }

  // Test 2: All cities have valid numeric values
  try {
    const invalidValues: string[] = [];
    allCities.forEach((city: City) => {
      if (city.costOfLivingIndex <= 0) invalidValues.push(`${city.name}: invalid COL index`);
      if (city.medianRent <= 0) invalidValues.push(`${city.name}: invalid rent`);
      if (city.medianHomePrice <= 0) invalidValues.push(`${city.name}: invalid home price`);
      if (city.population <= 0) invalidValues.push(`${city.name}: invalid population`);
    });

    if (invalidValues.length > 0) {
      throw new Error(`Invalid values: ${invalidValues.slice(0, 5).join(', ')}...`);
    }
    logTest('All cities have valid numeric values', true);
  } catch (e) {
    logTest('All cities have valid numeric values', false, (e as Error).message);
  }

  // Test 3: Tax rates are properly structured
  try {
    const taxIssues: string[] = [];
    allCities.forEach((city: City) => {
      if (!city.taxRates || !city.taxRates.type) {
        taxIssues.push(`${city.name}: missing taxRates.type`);
      }
    });

    if (taxIssues.length > 0) {
      throw new Error(`Tax issues: ${taxIssues.slice(0, 5).join(', ')}...`);
    }
    logTest('All cities have valid tax rate structures', true);
  } catch (e) {
    logTest('All cities have valid tax rate structures', false, (e as Error).message);
  }

  // Test 4: getCityById works
  try {
    const nyc = getCityById('nyc');
    assertDefined(nyc, 'NYC');
    if (nyc.name !== 'New York City') throw new Error('NYC name mismatch');

    const berlin = getCityById('berlin');
    assertDefined(berlin, 'Berlin');
    if (berlin.country !== 'de') throw new Error('Berlin country mismatch');

    logTest('getCityById works correctly', true);
  } catch (e) {
    logTest('getCityById works correctly', false, (e as Error).message);
  }

  // Test 5: Country filtering works
  try {
    const usCities = getCitiesByCountry('us');
    const deCities = getCitiesByCountry('de');
    const jpCities = getCitiesByCountry('jp');

    assertArray(usCities, 'US cities', 10);
    assertArray(deCities, 'DE cities', 1);
    assertArray(jpCities, 'JP cities', 1);

    logTest('getCitiesByCountry works correctly', true, undefined,
      `US: ${usCities.length}, DE: ${deCities.length}, JP: ${jpCities.length}`);
  } catch (e) {
    logTest('getCitiesByCountry works correctly', false, (e as Error).message);
  }
}

// ============================================================================
// TEST: TAX CALCULATOR INTEGRATION
// ============================================================================

function testTaxCalculatorIntegration() {
  console.log('\n=== TAX CALCULATOR INTEGRATION TESTS ===\n');

  const testSalaries = [50000, 100000, 200000];
  const testCities = ['nyc', 'austin', 'seattle', 'berlin', 'london', 'tokyo', 'singapore'];

  testCities.forEach(cityId => {
    try {
      const city = getCityById(cityId);
      if (!city) {
        logTest(`Tax calculation for ${cityId}`, false, 'City not found');
        return;
      }

      testSalaries.forEach(salary => {
        const result = calculateSalary(salary, city);

        assertDefined(result, 'Salary calculation result');
        assertNumber(result.grossSalary, 'grossSalary', salary, salary);
        assertNumber(result.netSalary, 'netSalary', 0, salary);
        assertNumber(result.effectiveTaxRate, 'effectiveTaxRate', 0, 1);
      });

      logTest(`Tax calculation for ${city.name}`, true);
    } catch (e) {
      logTest(`Tax calculation for ${cityId}`, false, (e as Error).message);
    }
  });
}

// ============================================================================
// TEST: PROJECTION CALCULATOR
// ============================================================================

function testProjectionCalculator() {
  console.log('\n=== PROJECTION CALCULATOR TESTS ===\n');

  const testCities = ['nyc', 'austin', 'denver', 'berlin', 'tokyo'];
  const testSalary = 120000;

  // Test 1: Basic projection calculation
  testCities.forEach(cityId => {
    try {
      const city = getCityById(cityId);
      if (!city) {
        logTest(`Projection for ${cityId}`, false, 'City not found');
        return;
      }

      const projection = calculateCityProjection(
        city,
        testSalary,
        DEFAULT_ASSUMPTIONS
      );

      assertDefined(projection, 'Projection');
      assertDefined(projection.city, 'Projection city');
      assertArray(projection.projections, 'Yearly projections', 5);
      assertNumber(projection.totalNetWorthYear5, 'totalNetWorthYear5');
      assertNumber(projection.totalSavingsYear5, 'totalSavingsYear5');

      // Verify each year's projection
      projection.projections.forEach((year, i) => {
        assertNumber(year.year, 'year', i + 1, i + 1);
        assertNumber(year.grossSalary, 'grossSalary', testSalary * 0.9);
        assertNumber(year.netSalary, 'netSalary', 0);
        assertNumber(year.annualSavings, 'annualSavings');
        assertNumber(year.netWorth, 'netWorth');
      });

      logTest(`Projection for ${city.name}`, true, undefined,
        `5yr net worth: $${Math.round(projection.totalNetWorthYear5).toLocaleString()}`);
    } catch (e) {
      logTest(`Projection for ${cityId}`, false, (e as Error).message);
    }
  });

  // Test 2: Scenario comparison
  try {
    const nyc = getCityById('nyc')!;
    const scenarios = calculateScenarios(nyc, testSalary, 8000);

    assertDefined(scenarios.best, 'Best scenario');
    assertDefined(scenarios.expected, 'Expected scenario');
    assertDefined(scenarios.worst, 'Worst scenario');

    // Best should have higher net worth than worst
    if (scenarios.best.totalNetWorthYear5 <= scenarios.worst.totalNetWorthYear5) {
      throw new Error('Best scenario should have higher net worth than worst');
    }

    logTest('Scenario comparison works', true);
  } catch (e) {
    logTest('Scenario comparison works', false, (e as Error).message);
  }

  // Test 3: Compare projections between cities
  try {
    const nyc = getCityById('nyc')!;
    const austin = getCityById('austin')!;

    const comparison = compareProjections(
      nyc, 150000,
      [{ city: austin, salary: 130000 }],
      DEFAULT_ASSUMPTIONS,
      [8000]
    );

    assertDefined(comparison.currentCity, 'Current city projection');
    assertArray(comparison.targetCities, 'Target cities', 1);
    assertDefined(comparison.recommendation, 'recommendation');
    assertArray(comparison.insights, 'insights', 1);

    logTest('Compare projections between cities', true);
  } catch (e) {
    logTest('Compare projections between cities', false, (e as Error).message);
  }
}

// ============================================================================
// TEST: BREAK-EVEN CALCULATOR
// ============================================================================

function testBreakEvenCalculator() {
  console.log('\n=== BREAK-EVEN CALCULATOR TESTS ===\n');

  const testCases = [
    { from: 'nyc', to: 'austin', fromSalary: 150000, toSalary: 130000, movingCost: 8000 },
    { from: 'sf', to: 'denver', fromSalary: 180000, toSalary: 150000, movingCost: 10000 },
    { from: 'chicago', to: 'miami', fromSalary: 100000, toSalary: 95000, movingCost: 6000 },
    { from: 'nyc', to: 'berlin', fromSalary: 150000, toSalary: 120000, movingCost: 15000 },
    { from: 'london', to: 'tokyo', fromSalary: 120000, toSalary: 130000, movingCost: 20000 },
  ];

  testCases.forEach(tc => {
    try {
      const fromCity = getCityById(tc.from);
      const toCity = getCityById(tc.to);

      if (!fromCity || !toCity) {
        logTest(`Break-even ${tc.from} -> ${tc.to}`, false, 'City not found');
        return;
      }

      const analysis = calculateBreakEven(
        fromCity, tc.fromSalary,
        toCity, tc.toSalary,
        tc.movingCost,
        DEFAULT_ASSUMPTIONS
      );

      assertDefined(analysis, 'Break-even analysis');
      assertNumber(analysis.movingCosts, 'movingCosts', tc.movingCost, tc.movingCost);
      assertNumber(analysis.breakEvenMonths, 'breakEvenMonths');
      assertDefined(analysis.breakEvenFormatted, 'breakEvenFormatted');
      assertArray(analysis.scenarios, 'scenarios', 3);
      assertDefined(analysis.cumulativeAdvantage, 'cumulativeAdvantage');
      assertNumber(analysis.cumulativeAdvantage.year5, 'year5 advantage');
      assertDefined(analysis.recommendation, 'recommendation');
      assertArray(analysis.considerations, 'considerations');

      logTest(`Break-even ${fromCity.name} -> ${toCity.name}`, true, undefined,
        `${analysis.breakEvenFormatted}, 5yr: $${Math.round(analysis.cumulativeAdvantage.year5).toLocaleString()}`);
    } catch (e) {
      logTest(`Break-even ${tc.from} -> ${tc.to}`, false, (e as Error).message);
    }
  });

  // Test quick estimate
  try {
    // quickBreakEvenEstimate(currentSalary, targetSalary, currentCOLIndex, targetCOLIndex, movingCosts)
    const estimate = quickBreakEvenEstimate(100000, 120000, 100, 90, 10000);
    assertNumber(estimate.months, 'Quick estimate months', 0);
    logTest('Quick break-even estimate', true, undefined, `${estimate.months} months`);
  } catch (e) {
    logTest('Quick break-even estimate', false, (e as Error).message);
  }
}

// ============================================================================
// TEST: RENT VS BUY CALCULATOR
// ============================================================================

function testRentVsBuyCalculator() {
  console.log('\n=== RENT VS BUY CALCULATOR TESTS ===\n');

  const testCities = ['nyc', 'austin', 'denver', 'phoenix', 'seattle', 'berlin', 'tokyo'];
  const testSalary = 120000;

  testCities.forEach(cityId => {
    try {
      const city = getCityById(cityId);
      if (!city) {
        logTest(`Rent vs Buy for ${cityId}`, false, 'City not found');
        return;
      }

      const analysis = calculateRentVsBuy(city, testSalary);

      assertDefined(analysis, 'Rent vs Buy analysis');
      assertDefined(analysis.rentScenario, 'Rent scenario');
      assertDefined(analysis.buyScenario, 'Buy scenario');
      assertNumber(analysis.rentScenario.monthlyRent, 'monthlyRent', 0);
      assertNumber(analysis.buyScenario.purchasePrice, 'purchasePrice', 0);
      assertNumber(analysis.buyScenario.monthlyMortgage, 'monthlyMortgage', 0);
      assertDefined(analysis.recommendation, 'recommendation');
      assertDefined(analysis.confidenceLevel, 'confidenceLevel');
      assertDefined(analysis.reasoning, 'reasoning');
      assertDefined(analysis.comparison5Year, 'comparison5Year');
      assertDefined(analysis.comparison10Year, 'comparison10Year');

      // Verify arrays have proper length
      assertArray(analysis.rentScenario.totalCost, 'rent totalCost', 10);
      assertArray(analysis.buyScenario.homeValue, 'buy homeValue', 10);
      assertArray(analysis.buyScenario.equity, 'buy equity', 10);

      logTest(`Rent vs Buy for ${city.name}`, true, undefined,
        `Rec: ${analysis.recommendation}, Break-even: ${analysis.breakEvenYear || 'never'} years`);
    } catch (e) {
      logTest(`Rent vs Buy for ${cityId}`, false, (e as Error).message);
    }
  });

  // Test monthly cost comparison helper
  try {
    const nyc = getCityById('nyc')!;
    const analysis = calculateRentVsBuy(nyc, 150000);
    const monthly = getMonthlyCostComparison(analysis);

    assertNumber(monthly.rentMonthly, 'rentMonthly', 0);
    assertNumber(monthly.buyMonthly, 'buyMonthly', 0);
    assertNumber(monthly.difference, 'difference');

    logTest('Monthly cost comparison helper', true, undefined,
      `Rent: $${monthly.rentMonthly}, Buy: $${monthly.buyMonthly}`);
  } catch (e) {
    logTest('Monthly cost comparison helper', false, (e as Error).message);
  }
}

// ============================================================================
// TEST: MULTI-CITY COMPARATOR
// ============================================================================

function testMultiCityComparator() {
  console.log('\n=== MULTI-CITY COMPARATOR TESTS ===\n');

  const testCases = [
    {
      name: 'US Tech Hubs',
      currentCity: 'nyc',
      currentSalary: 150000,
      targetCities: ['austin', 'denver', 'seattle'],
      targetSalaries: [130000, 135000, 155000],
    },
    {
      name: 'US Mix',
      currentCity: 'chicago',
      currentSalary: 100000,
      targetCities: ['miami', 'phoenix', 'nashville'],
      targetSalaries: [95000, 90000, 95000],
    },
    {
      name: 'International',
      currentCity: 'nyc',
      currentSalary: 180000,
      targetCities: ['london', 'berlin', 'tokyo'],
      targetSalaries: [140000, 120000, 150000],
    },
  ];

  testCases.forEach(tc => {
    try {
      const currentCity = getCityById(tc.currentCity);
      if (!currentCity) {
        logTest(`Multi-city comparison: ${tc.name}`, false, 'Current city not found');
        return;
      }

      const targetCities = tc.targetCities.map((id, index) => {
        const city = getCityById(id);
        return city ? { city, expectedSalary: tc.targetSalaries[index] } : null;
      }).filter((x): x is { city: City; expectedSalary: number } => x !== null);

      if (targetCities.length !== tc.targetCities.length) {
        logTest(`Multi-city comparison: ${tc.name}`, false, 'Some target cities not found');
        return;
      }

      const comparison = compareMultipleCities(
        currentCity,
        tc.currentSalary,
        targetCities
      );

      assertDefined(comparison, 'Comparison');
      assertArray(comparison.cities, 'cities', targetCities.length);
      assertDefined(comparison.bestOverall, 'bestOverall');
      assertDefined(comparison.bestFinancial, 'bestFinancial');
      assertDefined(comparison.bestQualityOfLife, 'bestQualityOfLife');
      assertArray(comparison.insights, 'insights', 1);

      // Verify each city score
      comparison.cities.forEach(cityScore => {
        assertNumber(cityScore.overallScore, 'overallScore', 0, 100);
        assertNumber(cityScore.financialScore, 'financialScore', 0, 100);
        assertNumber(cityScore.qualityOfLifeScore, 'qualityOfLifeScore', 0, 100);
        assertArray(cityScore.strengths, 'strengths');
        assertArray(cityScore.weaknesses, 'weaknesses');
      });

      const summary = getComparisonSummary(comparison);
      assertDefined(summary.topCity, 'topCity');
      assertNumber(summary.topCity.score, 'topScore', 0, 100);

      logTest(`Multi-city comparison: ${tc.name}`, true, undefined,
        `Best: ${comparison.bestOverall.name} (${comparison.cities[0].overallScore})`);
    } catch (e) {
      logTest(`Multi-city comparison: ${tc.name}`, false, (e as Error).message);
    }
  });
}

// ============================================================================
// TEST: NEGOTIATION CALCULATOR
// ============================================================================

function testNegotiationCalculator() {
  console.log('\n=== NEGOTIATION CALCULATOR TESTS ===\n');

  // Test industry benchmarks exist
  try {
    assertArray(INDUSTRY_BENCHMARKS, 'INDUSTRY_BENCHMARKS', 5);
    INDUSTRY_BENCHMARKS.forEach(benchmark => {
      assertDefined(benchmark.component, 'component');
      assertDefined(benchmark.typicalCoverage, 'typicalCoverage');
      assertNumber(benchmark.percentCovered, 'percentCovered', 0, 100);
      assertDefined(benchmark.dollarRange, 'dollarRange');
      assertNumber(benchmark.dollarRange.low, 'low', 0);
      assertNumber(benchmark.dollarRange.high, 'high', benchmark.dollarRange.low);
    });
    logTest('Industry benchmarks structure', true);
  } catch (e) {
    logTest('Industry benchmarks structure', false, (e as Error).message);
  }

  const testCases = [
    { from: 'sf', to: 'austin', fromSalary: 180000, toSalary: 150000, movingCost: 12000 },
    { from: 'nyc', to: 'denver', fromSalary: 150000, toSalary: 135000, movingCost: 10000 },
    { from: 'boston', to: 'miami', fromSalary: 120000, toSalary: 110000, movingCost: 8000 },
  ];

  testCases.forEach(tc => {
    try {
      const fromCity = getCityById(tc.from);
      const toCity = getCityById(tc.to);

      if (!fromCity || !toCity) {
        logTest(`Negotiation toolkit ${tc.from} -> ${tc.to}`, false, 'City not found');
        return;
      }

      const toolkit = calculateNegotiationToolkit(
        fromCity, tc.fromSalary,
        toCity, tc.toSalary,
        tc.movingCost
      );

      assertDefined(toolkit, 'Toolkit');
      assertDefined(toolkit.costBreakdown, 'costBreakdown');
      assertNumber(toolkit.costBreakdown.movingExpenses, 'movingExpenses', 0);
      assertNumber(toolkit.costBreakdown.temporaryHousing, 'temporaryHousing', 0);
      assertNumber(toolkit.costBreakdown.totalRelocationCost, 'totalRelocationCost', 0);
      assertNumber(toolkit.typicalPackageValue, 'typicalPackageValue', 0);
      assertNumber(toolkit.actualCosts, 'actualCosts', 0);
      assertNumber(toolkit.recommendedAsk, 'recommendedAsk', 0);
      assertArray(toolkit.negotiationPoints, 'negotiationPoints', 1);
      assertDefined(toolkit.scripts, 'scripts');
      assertDefined(toolkit.scripts.colAdjustment, 'colAdjustment script');
      assertDefined(toolkit.scripts.grossUp, 'grossUp script');

      const summary = getNegotiationSummary(toolkit);
      assertDefined(summary.headline, 'headline');
      assertDefined(summary.totalCosts, 'totalCosts');
      assertDefined(summary.recommendedAsk, 'recommendedAsk');

      logTest(`Negotiation toolkit ${fromCity.name} -> ${toCity.name}`, true, undefined,
        `Ask: ${summary.recommendedAsk}, Gap: ${toolkit.gap > 0 ? '$' + Math.round(toolkit.gap).toLocaleString() : 'None'}`);
    } catch (e) {
      logTest(`Negotiation toolkit ${tc.from} -> ${tc.to}`, false, (e as Error).message);
    }
  });
}

// ============================================================================
// TEST: CHECKLIST GENERATOR
// ============================================================================

function testChecklistGenerator() {
  console.log('\n=== CHECKLIST GENERATOR TESTS ===\n');

  const testCases: { name: string; options: Partial<ChecklistOptions> }[] = [
    { name: 'Basic domestic move', options: { isInternational: false, hasPets: false, hasChildren: false, isCurrentlyHomeowner: false, isCurrentlyRenter: true } },
    { name: 'Homeowner with pets', options: { isInternational: false, hasPets: true, hasChildren: false, isCurrentlyHomeowner: true, isCurrentlyRenter: false } },
    { name: 'Family with children', options: { isInternational: false, hasPets: false, hasChildren: true, isCurrentlyHomeowner: true, isCurrentlyRenter: false } },
    { name: 'International move', options: { isInternational: true, hasPets: true, hasChildren: true, isCurrentlyHomeowner: false, isCurrentlyRenter: true } },
  ];

  const fromCity = getCityById('nyc')!;
  const toCity = getCityById('austin')!;
  const moveDate = new Date();
  moveDate.setDate(moveDate.getDate() + 60); // 60 days from now

  testCases.forEach(tc => {
    try {
      const options: ChecklistOptions = {
        moveDate,
        fromCity,
        toCity,
        isInternational: tc.options.isInternational ?? false,
        hasPets: tc.options.hasPets ?? false,
        hasChildren: tc.options.hasChildren ?? false,
        isCurrentlyHomeowner: tc.options.isCurrentlyHomeowner ?? false,
        isCurrentlyRenter: tc.options.isCurrentlyRenter ?? true,
      };

      const checklist = generateChecklist(options);

      assertDefined(checklist, 'Checklist');
      assertArray(checklist.items, 'items', 20);
      assertNumber(checklist.totalItems, 'totalItems', 20);
      assertNumber(checklist.completedItems, 'completedItems', 0, 0);
      assertNumber(checklist.percentComplete, 'percentComplete', 0, 0);
      assertDefined(checklist.currentPhase, 'currentPhase');
      assertNumber(checklist.daysUntilMove, 'daysUntilMove');

      // Verify all items have required fields
      checklist.items.forEach(item => {
        assertDefined(item.id, 'item.id');
        assertDefined(item.task, 'item.task');
        assertDefined(item.category, 'item.category');
        assertNumber(item.daysBeforeMove, 'item.daysBeforeMove');
        if (item.completed !== false) throw new Error('New items should be incomplete');
      });

      // Verify conditional tasks
      if (tc.options.hasPets) {
        const petTasks = checklist.items.filter(i => i.task.toLowerCase().includes('pet') || i.task.toLowerCase().includes('vet'));
        if (petTasks.length === 0) throw new Error('Pet-related tasks missing');
      }
      if (tc.options.hasChildren) {
        const childTasks = checklist.items.filter(i => i.task.toLowerCase().includes('school') || i.task.toLowerCase().includes('children'));
        if (childTasks.length === 0) throw new Error('Children-related tasks missing');
      }
      if (tc.options.isInternational) {
        const intlTasks = checklist.items.filter(i => i.task.toLowerCase().includes('visa') || i.task.toLowerCase().includes('international'));
        if (intlTasks.length === 0) throw new Error('International-related tasks missing');
      }

      logTest(`Checklist: ${tc.name}`, true, undefined, `${checklist.totalItems} tasks`);
    } catch (e) {
      logTest(`Checklist: ${tc.name}`, false, (e as Error).message);
    }
  });

  // Test task toggling
  try {
    const checklist = generateChecklist({
      moveDate,
      fromCity,
      toCity,
      isInternational: false,
      hasPets: false,
      hasChildren: false,
      isCurrentlyHomeowner: false,
      isCurrentlyRenter: true,
    });

    const firstTaskId = checklist.items[0].id;
    const updated = toggleTaskCompletion(checklist, firstTaskId);

    if (!updated.items[0].completed) throw new Error('Task should be completed');
    if (updated.completedItems !== 1) throw new Error('completedItems should be 1');
    if (updated.percentComplete <= 0) throw new Error('percentComplete should be > 0');

    const toggledBack = toggleTaskCompletion(updated, firstTaskId);
    if (toggledBack.items[0].completed) throw new Error('Task should be uncompleted');

    logTest('Task completion toggling', true);
  } catch (e) {
    logTest('Task completion toggling', false, (e as Error).message);
  }

  // Test progress by phase
  try {
    const checklist = generateChecklist({
      moveDate,
      fromCity,
      toCity,
      isInternational: false,
      hasPets: false,
      hasChildren: false,
      isCurrentlyHomeowner: false,
      isCurrentlyRenter: true,
    });

    const progress = getProgressByPhase(checklist);
    assertArray(progress, 'progress', 5);

    progress.forEach(p => {
      assertDefined(p.phase, 'phase');
      assertDefined(p.label, 'label');
      assertNumber(p.total, 'total', 0);
      assertNumber(p.completed, 'completed', 0);
      assertNumber(p.percent, 'percent', 0, 100);
    });

    logTest('Progress by phase', true);
  } catch (e) {
    logTest('Progress by phase', false, (e as Error).message);
  }
}

// ============================================================================
// TEST: EDGE CASES
// ============================================================================

function testEdgeCases() {
  console.log('\n=== EDGE CASE TESTS ===\n');

  // Test with very low salary
  try {
    const city = getCityById('nyc')!;
    const projection = calculateCityProjection(city, 30000, DEFAULT_ASSUMPTIONS);
    assertDefined(projection, 'Low salary projection');
    // Savings might be negative, but calculation should work
    logTest('Very low salary projection', true);
  } catch (e) {
    logTest('Very low salary projection', false, (e as Error).message);
  }

  // Test with very high salary
  try {
    const city = getCityById('nyc')!;
    const projection = calculateCityProjection(city, 1000000, DEFAULT_ASSUMPTIONS);
    assertDefined(projection, 'High salary projection');
    assertNumber(projection.totalNetWorthYear5, 'netWorth', 0);
    logTest('Very high salary projection', true);
  } catch (e) {
    logTest('Very high salary projection', false, (e as Error).message);
  }

  // Test same city comparison
  try {
    const city = getCityById('nyc')!;
    const breakEven = calculateBreakEven(city, 100000, city, 100000, 5000, DEFAULT_ASSUMPTIONS);
    assertDefined(breakEven, 'Same city break-even');
    // Moving to same city should have negative advantage (just moving costs)
    logTest('Same city comparison', true);
  } catch (e) {
    logTest('Same city comparison', false, (e as Error).message);
  }

  // Test international cities with different tax systems
  const internationalCities = ['berlin', 'london', 'tokyo', 'singapore', 'sydney', 'toronto'];
  internationalCities.forEach(cityId => {
    try {
      const city = getCityById(cityId);
      if (!city) {
        logTest(`International city ${cityId}`, false, 'City not found');
        return;
      }

      const salary = calculateSalary(100000, city);
      assertDefined(salary, 'Salary calculation');
      assertNumber(salary.netSalary, 'netSalary', 0, 100000);

      const projection = calculateCityProjection(city, 100000, DEFAULT_ASSUMPTIONS);
      assertDefined(projection, 'Projection');

      const rentVsBuy = calculateRentVsBuy(city, 100000);
      assertDefined(rentVsBuy, 'Rent vs Buy');

      logTest(`International: ${city.name} (${city.taxRates.type})`, true);
    } catch (e) {
      logTest(`International: ${cityId}`, false, (e as Error).message);
    }
  });

  // Test with custom assumptions
  try {
    const customAssumptions: ProjectionAssumptions = {
      salaryGrowthRate: 0.08,
      rentInflationRate: 0.05,
      homeAppreciationRate: 0.02,
      colInflationRate: 0.04,
      savingsRate: 0.35,
      investmentReturnRate: 0.10,
    };

    const city = getCityById('austin')!;
    const projection = calculateCityProjection(city, 100000, customAssumptions);
    assertDefined(projection, 'Custom assumptions projection');
    logTest('Custom assumptions projection', true);
  } catch (e) {
    logTest('Custom assumptions projection', false, (e as Error).message);
  }
}

// ============================================================================
// TEST: ALL CITIES ITERATION
// ============================================================================

function testAllCities() {
  console.log('\n=== ALL CITIES TESTS ===\n');

  let successCount = 0;
  let failCount = 0;
  const failures: string[] = [];

  allCities.forEach((city: City) => {
    try {
      // Test tax calculation
      const salary = calculateSalary(100000, city);
      assertDefined(salary, 'Salary');
      assertNumber(salary.netSalary, 'netSalary', 0, 100000);

      // Test projection
      const projection = calculateCityProjection(city, 100000, DEFAULT_ASSUMPTIONS);
      assertDefined(projection, 'Projection');

      // Test rent vs buy
      const rentVsBuy = calculateRentVsBuy(city, 100000);
      assertDefined(rentVsBuy, 'Rent vs Buy');

      successCount++;
    } catch (e) {
      failCount++;
      failures.push(`${city.name} (${city.country}): ${(e as Error).message}`);
    }
  });

  if (failCount === 0) {
    logTest(`All ${allCities.length} cities pass basic tests`, true);
  } else {
    logTest(`All cities pass basic tests`, false,
      `${failCount} failures out of ${allCities.length}`,
      failures.slice(0, 5).join('; '));
  }
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

export function runAllTests(): { passed: number; failed: number; results: TestResult[] } {
  console.log('='.repeat(60));
  console.log('PREMIUM FEATURES COMPREHENSIVE TEST SUITE');
  console.log('='.repeat(60));
  console.log(`Total cities in dataset: ${allCities.length}`);
  console.log(`Countries represented: ${new Set(allCities.map((c: City) => c.country)).size}`);
  console.log('='.repeat(60));

  testResults.length = 0;

  testDataIntegrity();
  testTaxCalculatorIntegration();
  testProjectionCalculator();
  testBreakEvenCalculator();
  testRentVsBuyCalculator();
  testMultiCityComparator();
  testNegotiationCalculator();
  testChecklistGenerator();
  testEdgeCases();
  testAllCities();

  const passed = testResults.filter(r => r.passed).length;
  const failed = testResults.filter(r => !r.passed).length;

  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${testResults.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / testResults.length) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\nFAILED TESTS:');
    testResults.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
  }

  console.log('='.repeat(60));

  return { passed, failed, results: testResults };
}

// Export for external use
export { testResults };
