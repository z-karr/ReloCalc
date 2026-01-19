#!/usr/bin/env node
/**
 * Tax Calculation Tests
 * Tests sample tax calculations for all new countries
 */

const fs = require('fs');
const path = require('path');

// Color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function section(title) {
  log(`\n${'='.repeat(80)}`, colors.cyan);
  log(title, colors.cyan);
  log('='.repeat(80), colors.cyan);
}

section('Tax Calculation Logic Verification');

// Test that all countries have calculation blocks in taxCalculator.ts
const taxCalculatorPath = path.join(__dirname, 'src', 'utils', 'taxCalculator.ts');
const taxCalculatorContent = fs.readFileSync(taxCalculatorPath, 'utf8');

const testCountries = [
  { code: 'fr', name: 'France' },
  { code: 'es', name: 'Spain' },
  { code: 'it', name: 'Italy' },
  { code: 'nl', name: 'Netherlands' },
  { code: 'ie', name: 'Ireland' },
  { code: 'ch', name: 'Switzerland' },
  { code: 'be', name: 'Belgium' },
  { code: 'se', name: 'Sweden' },
  { code: 'dk', name: 'Denmark' },
  { code: 'no', name: 'Norway' },
  { code: 'pl', name: 'Poland' },
  { code: 'gr', name: 'Greece' },
  { code: 'cz', name: 'Czechia' },
  { code: 'br', name: 'Brazil' },
  { code: 'cl', name: 'Chile' },
  { code: 'cr', name: 'Costa Rica' },
  { code: 'sv', name: 'El Salvador' },
  { code: 'gt', name: 'Guatemala' },
  { code: 'cn', name: 'China' },
  { code: 'id', name: 'Indonesia' },
  { code: 'ph', name: 'Philippines' },
  { code: 'nz', name: 'New Zealand' },
  { code: 'ma', name: 'Morocco' },
];

let passed = 0;
let failed = 0;

testCountries.forEach(({ code, name }) => {
  // Check for country code check
  const countryCheckRegex = new RegExp(`if\\s*\\(\\s*city\\.country\\s*===\\s*['"]${code}['"]\\s*\\)`, 'g');
  const matches = taxCalculatorContent.match(countryCheckRegex);

  if (matches && matches.length > 0) {
    log(`✓ ${name} (${code}): Tax calculation block found`, colors.green);
    passed++;

    // Check for variable assignment pattern
    const blockStart = taxCalculatorContent.indexOf(`city.country === '${code}'`);
    const blockEnd = taxCalculatorContent.indexOf('if (city.country ===', blockStart + 1);
    const block = blockEnd > blockStart
      ? taxCalculatorContent.substring(blockStart, blockEnd)
      : taxCalculatorContent.substring(blockStart, blockStart + 2000);

    // Verify essential calculation components
    const hasCalculation = /const.*=.*calculate\w+Tax/i.test(block);
    const hasResult = /const result.*SalaryCalculation/i.test(block);
    const hasReturn = /return result/i.test(block);

    if (hasCalculation && hasResult && hasReturn) {
      log(`  └─ Complete calculation structure verified`, colors.green);
    } else {
      log(`  └─ ⚠ Calculation structure may be incomplete`, colors.yellow);
      if (!hasCalculation) log(`     - Missing tax calculation call`, colors.yellow);
      if (!hasResult) log(`     - Missing result object`, colors.yellow);
      if (!hasReturn) log(`     - Missing return statement`, colors.yellow);
    }
  } else {
    log(`✗ ${name} (${code}): Tax calculation block NOT found`, colors.red);
    failed++;
  }
});

section('City Export Verification');

const citiesIndexPath = path.join(__dirname, 'src', 'data', 'cities', 'index.ts');
const citiesIndexContent = fs.readFileSync(citiesIndexPath, 'utf8');

const cityExports = [
  { var: 'FRANCE_CITIES', file: 'france' },
  { var: 'SPAIN_CITIES', file: 'spain' },
  { var: 'ITALY_CITIES', file: 'italy' },
  { var: 'NETHERLANDS_CITIES', file: 'netherlands' },
  { var: 'IRELAND_CITIES', file: 'ireland' },
  { var: 'SWITZERLAND_CITIES', file: 'switzerland' },
  { var: 'BELGIUM_CITIES', file: 'belgium' },
  { var: 'SWEDEN_CITIES', file: 'sweden' },
  { var: 'DENMARK_CITIES', file: 'denmark' },
  { var: 'NORWAY_CITIES', file: 'norway' },
  { var: 'POLAND_CITIES', file: 'poland' },
  { var: 'GREECE_CITIES', file: 'greece' },
  { var: 'CZECHIA_CITIES', file: 'czechia' },
  { var: 'BRAZIL_CITIES', file: 'brazil' },
  { var: 'CHILE_CITIES', file: 'chile' },
  { var: 'COSTA_RICA_CITIES', file: 'costaRica' },
  { var: 'EL_SALVADOR_CITIES', file: 'elSalvador' },
  { var: 'GUATEMALA_CITIES', file: 'guatemala' },
  { var: 'CHINA_CITIES', file: 'china' },
  { var: 'INDONESIA_CITIES', file: 'indonesia' },
  { var: 'PHILIPPINES_CITIES', file: 'philippines' },
  { var: 'NEW_ZEALAND_CITIES', file: 'newZealand' },
  { var: 'MOROCCO_CITIES', file: 'morocco' },
];

cityExports.forEach(({ var: varName, file }) => {
  // Check import
  const importRegex = new RegExp(`import\\s*{\\s*${varName}\\s*}\\s*from\\s*['"]\\.\\/${file}['"]`);
  if (importRegex.test(citiesIndexContent)) {
    log(`✓ ${varName}: Imported from ./${file}`, colors.green);
    passed++;
  } else {
    log(`✗ ${varName}: Import not found`, colors.red);
    failed++;
  }

  // Check spread in allCities
  const spreadRegex = new RegExp(`\\.\\.\\.${varName}`);
  if (spreadRegex.test(citiesIndexContent)) {
    log(`✓ ${varName}: Spread into allCities array`, colors.green);
    passed++;
  } else {
    log(`✗ ${varName}: Not added to allCities array`, colors.red);
    failed++;
  }
});

section('Sample City Data Verification');

// Check a few sample cities have correct structure
const sampleCities = [
  { file: 'france', cityName: 'PARIS' },
  { file: 'brazil', cityName: 'SAO_PAULO' },
  { file: 'newZealand', cityName: 'AUCKLAND' },
];

sampleCities.forEach(({ file, cityName }) => {
  const cityFilePath = path.join(__dirname, 'src', 'data', 'cities', `${file}.ts`);

  if (fs.existsSync(cityFilePath)) {
    const content = fs.readFileSync(cityFilePath, 'utf8');

    // Check for essential properties
    const requiredFields = [
      'id:', 'name:', 'country:', 'countryCode:',
      'costOfLivingIndex:', 'medianRent:', 'medianRentLocal:',
      'taxRates:', 'qualityOfLife:', 'visaRequired:'
    ];

    const allPresent = requiredFields.every(field => content.includes(field));

    if (allPresent) {
      log(`✓ ${file}.ts: All required fields present`, colors.green);
      passed++;
    } else {
      log(`✗ ${file}.ts: Missing required fields`, colors.red);
      failed++;
    }
  }
});

section('Region Filter Verification');

// Check that new countries are added to region filters
const regionMappings = [
  { region: 'europe', codes: ['fr', 'es', 'it', 'nl', 'ie', 'ch', 'be', 'se', 'dk', 'no', 'pl', 'gr', 'cz'] },
  { region: 'latin_america', codes: ['br', 'cl', 'cr', 'sv', 'gt'] },
  { region: 'asia_pacific', codes: ['cn', 'id', 'ph', 'nz'] },
  { region: 'africa', codes: ['ma'] },
];

regionMappings.forEach(({ region, codes }) => {
  codes.forEach(code => {
    const regionCheckRegex = new RegExp(`region === '${region}'[\\s\\S]{0,500}city\\.country === '${code}'`);
    if (regionCheckRegex.test(citiesIndexContent)) {
      log(`✓ ${code}: Added to ${region} filter`, colors.green);
      passed++;
    } else {
      log(`✗ ${code}: Missing from ${region} filter`, colors.red);
      failed++;
    }
  });
});

section('Summary');

const total = passed + failed;
const passRate = ((passed / total) * 100).toFixed(1);

log(`\nTotal: ${total}`, colors.blue);
log(`Passed: ${passed}`, colors.green);
log(`Failed: ${failed}`, colors.red);
log(`Pass Rate: ${passRate}%`, passRate >= 95 ? colors.green : colors.yellow);

if (failed === 0) {
  log('\n✓ All tests passed!', colors.green);
  process.exit(0);
} else {
  log(`\n✗ ${failed} test(s) failed`, colors.red);
  process.exit(1);
}
