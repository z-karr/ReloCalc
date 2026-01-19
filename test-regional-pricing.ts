/**
 * Test Script: Regional Moving Cost Pricing
 *
 * This script tests the regional pricing system with example moves from different countries.
 * It verifies that costs are calculated in local currency and properly converted to USD.
 */

import { getCityById } from './src/data/cities/index';
import { estimateDomesticMovingCost } from './src/utils/movingCalculator';
import { HomeSize, MovingMethod } from './src/types';

// Helper function to format currency
const formatMoney = (amount: number, currencyCode: string): string => {
  const symbols: Record<string, string> = {
    'USD': '$',
    'JPY': '¥',
    'EUR': '€',
    'AUD': 'A$',
    'BRL': 'R$',
  };
  const symbol = symbols[currencyCode] || currencyCode + ' ';
  return `${symbol}${Math.round(amount).toLocaleString()}`;
};

// Test configuration
const testMoves = [
  {
    name: 'Tokyo → Osaka (Japan)',
    fromCityId: 'tokyo',
    toCityId: 'osaka',
    localCurrency: 'JPY',
    expectedDistance: '~515 km',
  },
  {
    name: 'Paris → Lyon (France)',
    fromCityId: 'paris_fr',
    toCityId: 'lyon_fr',
    localCurrency: 'EUR',
    expectedDistance: '~470 km',
  },
  {
    name: 'Berlin → Munich (Germany)',
    fromCityId: 'berlin',
    toCityId: 'munich',
    localCurrency: 'EUR',
    expectedDistance: '~585 km',
  },
  {
    name: 'Sydney → Melbourne (Australia)',
    fromCityId: 'sydney',
    toCityId: 'melbourne',
    localCurrency: 'AUD',
    expectedDistance: '~880 km',
  },
  {
    name: 'São Paulo → Rio de Janeiro (Brazil)',
    fromCityId: 'sao_paulo_br',
    toCityId: 'rio_de_janeiro_br',
    localCurrency: 'BRL',
    expectedDistance: '~430 km',
  },
];

const homeSize: HomeSize = '2br'; // Standard 2-bedroom apartment for testing
const movingMethod: MovingMethod = 'full_service'; // Professional movers

console.log('\n===========================================');
console.log('REGIONAL MOVING COST PRICING - TEST RESULTS');
console.log('===========================================\n');
console.log(`Test Configuration:`);
console.log(`  Home Size: 2BR Apartment`);
console.log(`  Moving Method: Full Service (Professional Movers)`);
console.log(`  User Currency: USD (for comparison)\n`);

testMoves.forEach(test => {
  console.log(`\n${test.name}`);
  console.log(`${'='.repeat(test.name.length)}`);

  const fromCity = getCityById(test.fromCityId);
  const toCity = getCityById(test.toCityId);

  if (!fromCity || !toCity) {
    console.log(`❌ ERROR: Cities not found (${test.fromCityId}, ${test.toCityId})`);
    return;
  }

  console.log(`Expected Distance: ${test.expectedDistance}`);
  console.log(`Local Currency: ${test.localCurrency}`);

  try {
    // Calculate with USD as user currency
    const estimate = estimateDomesticMovingCost(
      fromCity,
      toCity,
      homeSize,
      movingMethod,
      false, // hasVehicle
      false, // hasPets
      true,  // isRenting
      'USD'  // userCurrency
    );

    console.log(`\nCost in USD: ${formatMoney(estimate.totalEstimate, 'USD')}`);
    console.log(`\nExpense Breakdown:`);
    estimate.breakdown.forEach(expense => {
      const required = expense.isRequired ? '✓' : '○';
      console.log(`  ${required} ${expense.description}: ${formatMoney(expense.estimatedCost, 'USD')}`);
    });

    // Show expected local currency cost (reverse calculation for reference)
    // This is just for display - the actual calculation happens in local currency first
    const exchangeRates: Record<string, number> = {
      'JPY': 150,
      'EUR': 0.92,
      'AUD': 1.55,
      'BRL': 5.00,
    };
    if (exchangeRates[test.localCurrency]) {
      const localCost = estimate.totalEstimate * exchangeRates[test.localCurrency];
      console.log(`\n(≈ ${formatMoney(localCost, test.localCurrency)} in local currency)`);
    }

  } catch (error) {
    console.log(`❌ ERROR: ${error instanceof Error ? error.message : String(error)}`);
  }
});

console.log('\n\n===========================================');
console.log('TEST COMPLETE');
console.log('===========================================\n');

// Additional test: Compare different moving methods for Tokyo → Osaka
console.log('\n===========================================');
console.log('COMPARISON: Different Moving Methods');
console.log('Tokyo → Osaka, 2BR Apartment');
console.log('===========================================\n');

const tokyo = getCityById('tokyo');
const osaka = getCityById('osaka');

if (tokyo && osaka) {
  const methods: MovingMethod[] = ['diy', 'full_service'];

  methods.forEach(method => {
    console.log(`\n${method === 'diy' ? 'DIY (Truck Rental)' : 'Full Service (Professional Movers)'}`);
    console.log(`${'-'.repeat(40)}`);

    try {
      const estimate = estimateDomesticMovingCost(
        tokyo,
        osaka,
        '2br',
        method,
        false,
        false,
        true,
        'USD'
      );

      console.log(`Total Cost: ${formatMoney(estimate.totalEstimate, 'USD')}`);
      console.log(`Main Moving Cost: ${formatMoney(estimate.breakdown[0].estimatedCost, 'USD')}`);

    } catch (error) {
      console.log(`❌ ERROR: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
}

console.log('\n');
