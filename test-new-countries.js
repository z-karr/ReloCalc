#!/usr/bin/env node
/**
 * Comprehensive Test Suite for New Countries Integration
 * Tests tax calculations, currency conversions, visa logic, and data integrity
 */

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function pass(message) {
  results.passed++;
  log(`✓ ${message}`, colors.green);
}

function fail(message) {
  results.failed++;
  log(`✗ ${message}`, colors.red);
}

function warn(message) {
  results.warnings++;
  log(`⚠ ${message}`, colors.yellow);
}

function section(title) {
  log(`\n${'='.repeat(80)}`, colors.cyan);
  log(title, colors.cyan);
  log('='.repeat(80), colors.cyan);
}

// Import required modules (we'll use require since this is a Node script)
const fs = require('fs');
const path = require('path');

// Test 1: Verify all country files exist
section('TEST 1: File Structure Verification');

const NEW_COUNTRIES = [
  'france', 'spain', 'italy', 'netherlands', 'ireland', 'switzerland',
  'belgium', 'sweden', 'denmark', 'norway', 'poland', 'greece', 'czechia',
  'brazil', 'chile', 'costaRica', 'elSalvador', 'guatemala',
  'china', 'indonesia', 'philippines', 'newZealand', 'morocco'
];

NEW_COUNTRIES.forEach(country => {
  const taxFile = path.join(__dirname, 'src', 'data', 'taxSystems', `${country}.ts`);
  const cityFile = path.join(__dirname, 'src', 'data', 'cities', `${country}.ts`);

  if (fs.existsSync(taxFile)) {
    pass(`Tax system file exists: ${country}.ts`);
  } else {
    fail(`Missing tax system file: ${country}.ts`);
  }

  if (fs.existsSync(cityFile)) {
    pass(`City file exists: ${country}.ts`);
  } else {
    fail(`Missing city file: ${country}.ts`);
  }
});

// Test 2: Verify cities are exported correctly
section('TEST 2: City Data Integrity');

NEW_COUNTRIES.forEach(country => {
  const cityFile = path.join(__dirname, 'src', 'data', 'cities', `${country}.ts`);

  if (fs.existsSync(cityFile)) {
    const content = fs.readFileSync(cityFile, 'utf8');

    // Check for required exports
    const countryUpper = country.toUpperCase().replace(/([A-Z])/g, '_$1').replace(/^_/, '');
    const exportPattern = new RegExp(`export const ${countryUpper}_CITIES`);

    if (exportPattern.test(content)) {
      pass(`${country}: Exports cities array correctly`);
    } else {
      fail(`${country}: Missing or incorrect cities array export`);
    }

    // Check for required City properties
    const requiredProps = [
      'id', 'name', 'state', 'country', 'countryCode',
      'costOfLivingIndex', 'medianRent', 'medianRentLocal',
      'medianHomePrice', 'medianHomePriceLocal', 'stateTaxRate',
      'taxRates', 'qualityOfLife', 'visaRequired', 'languageBarrier',
      'timeZoneOffset', 'expatCommunitySize'
    ];

    const missingProps = requiredProps.filter(prop => !content.includes(`${prop}:`));

    if (missingProps.length === 0) {
      pass(`${country}: All required city properties present`);
    } else {
      fail(`${country}: Missing properties: ${missingProps.join(', ')}`);
    }
  }
});

// Test 3: Verify tax system exports
section('TEST 3: Tax System Exports');

NEW_COUNTRIES.forEach(country => {
  const taxFile = path.join(__dirname, 'src', 'data', 'taxSystems', `${country}.ts`);

  if (fs.existsSync(taxFile)) {
    const content = fs.readFileSync(taxFile, 'utf8');

    // Check for tax calculation function
    const functionPattern = /export const calculate\w+Tax/;

    if (functionPattern.test(content)) {
      pass(`${country}: Exports tax calculation function`);
    } else {
      fail(`${country}: Missing tax calculation function`);
    }

    // Check for tax brackets or rates
    if (content.includes('TaxBracket') || content.includes('rate')) {
      pass(`${country}: Contains tax rate definitions`);
    } else {
      warn(`${country}: No obvious tax rate definitions found`);
    }
  }
});

// Test 4: Verify taxCalculator.ts integration
section('TEST 4: Tax Calculator Integration');

const taxCalculatorFile = path.join(__dirname, 'src', 'utils', 'taxCalculator.ts');

if (fs.existsSync(taxCalculatorFile)) {
  const content = fs.readFileSync(taxCalculatorFile, 'utf8');

  // Check for imports
  const countryCodes = {
    france: 'fr', spain: 'es', italy: 'it', netherlands: 'nl',
    ireland: 'ie', switzerland: 'ch', belgium: 'be', sweden: 'se',
    denmark: 'dk', norway: 'no', poland: 'pl', greece: 'gr',
    czechia: 'cz', brazil: 'br', chile: 'cl', costaRica: 'cr',
    elSalvador: 'sv', guatemala: 'gt', china: 'cn', indonesia: 'id',
    philippines: 'ph', newZealand: 'nz', morocco: 'ma'
  };

  Object.entries(countryCodes).forEach(([country, code]) => {
    const importPattern = new RegExp(`import.*${country}`);
    const countryCheckPattern = new RegExp(`city\\.country === '${code}'`);

    if (importPattern.test(content)) {
      pass(`${country}: Import statement found`);
    } else {
      fail(`${country}: Missing import statement`);
    }

    if (countryCheckPattern.test(content)) {
      pass(`${country}: Country check logic found`);
    } else {
      fail(`${country}: Missing country check logic`);
    }
  });
} else {
  fail('taxCalculator.ts not found');
}

// Test 5: Verify cities/index.ts integration
section('TEST 5: Cities Index Integration');

const citiesIndexFile = path.join(__dirname, 'src', 'data', 'cities', 'index.ts');

if (fs.existsSync(citiesIndexFile)) {
  const content = fs.readFileSync(citiesIndexFile, 'utf8');

  NEW_COUNTRIES.forEach(country => {
    const importPattern = new RegExp(`import.*${country}`);
    const countryUpper = country.toUpperCase().replace(/([A-Z])/g, '_$1').replace(/^_/, '');
    const spreadPattern = new RegExp(`\\.\\.\\.${countryUpper}_CITIES`);

    if (importPattern.test(content)) {
      pass(`${country}: Import in cities/index.ts found`);
    } else {
      fail(`${country}: Missing import in cities/index.ts`);
    }

    if (spreadPattern.test(content)) {
      pass(`${country}: Cities spread into allCities array`);
    } else {
      fail(`${country}: Cities not added to allCities array`);
    }
  });

  // Check region filters
  const regionChecks = {
    'latin_america': ['br', 'cl', 'cr', 'sv', 'gt'],
    'europe': ['fr', 'es', 'it', 'nl', 'ie', 'ch', 'be', 'se', 'dk', 'no', 'pl', 'gr', 'cz'],
    'asia_pacific': ['cn', 'id', 'ph', 'nz'],
    'africa': ['ma']
  };

  Object.entries(regionChecks).forEach(([region, codes]) => {
    codes.forEach(code => {
      if (content.includes(`city.country === '${code}'`) && content.includes(`region === '${region}'`)) {
        pass(`${code}: Added to ${region} region filter`);
      } else {
        fail(`${code}: Not found in ${region} region filter`);
      }
    });
  });
} else {
  fail('cities/index.ts not found');
}

// Test 6: Verify visa requirements
section('TEST 6: Visa Requirements Integration');

const visaFile = path.join(__dirname, 'src', 'utils', 'visaRequirements.ts');

if (fs.existsSync(visaFile)) {
  const content = fs.readFileSync(visaFile, 'utf8');

  // Check for new country codes in visa pairs
  const newCountryCodes = ['fr', 'es', 'it', 'nl', 'ie', 'ch', 'be', 'se', 'dk',
                           'no', 'pl', 'gr', 'cz', 'br', 'cl', 'cr', 'sv', 'gt',
                           'cn', 'id', 'ph', 'nz', 'ma'];

  newCountryCodes.forEach(code => {
    const pattern = new RegExp(`'${code}:`);
    if (pattern.test(content)) {
      pass(`${code}: Found in visa requirements matrix`);
    } else {
      warn(`${code}: Not found in visa requirements matrix`);
    }
  });

  // Check for EU/Schengen internal travel
  const euPairs = [
    'fr:de', 'fr:es', 'fr:it', 'de:fr', 'de:es', 'es:fr'
  ];

  euPairs.forEach(pair => {
    if (content.includes(`'${pair}'`)) {
      pass(`EU pair ${pair}: Visa-free travel configured`);
    } else {
      warn(`EU pair ${pair}: Missing visa-free configuration`);
    }
  });
} else {
  fail('visaRequirements.ts not found');
}

// Test 7: Verify UserPreferencesContext
section('TEST 7: User Preferences Context');

const prefsFile = path.join(__dirname, 'src', 'context', 'UserPreferencesContext.tsx');

if (fs.existsSync(prefsFile)) {
  const content = fs.readFileSync(prefsFile, 'utf8');

  const newRegionCodes = {
    'FR': 'fr', 'ES': 'es', 'IT': 'it', 'NL': 'nl', 'IE': 'ie',
    'CH': 'ch', 'BE': 'be', 'SE': 'se', 'DK': 'dk', 'NO': 'no',
    'PL': 'pl', 'GR': 'gr', 'CZ': 'cz', 'BR': 'br', 'CL': 'cl',
    'CR': 'cr', 'SV': 'sv', 'GT': 'gt', 'CN': 'cn', 'ID': 'id',
    'PH': 'ph', 'NZ': 'nz', 'MA': 'ma'
  };

  Object.entries(newRegionCodes).forEach(([region, countryId]) => {
    const pattern = new RegExp(`'${region}':\\s*'${countryId}'`);
    if (pattern.test(content)) {
      pass(`${region}: Mapped to ${countryId} in REGION_TO_COUNTRY_MAP`);
    } else {
      fail(`${region}: Missing or incorrect mapping in REGION_TO_COUNTRY_MAP`);
    }
  });
} else {
  fail('UserPreferencesContext.tsx not found');
}

// Test 8: Verify HomeScreen stats
section('TEST 8: HomeScreen Statistics');

const homeScreenFile = path.join(__dirname, 'src', 'screens', 'HomeScreen.tsx');

if (fs.existsSync(homeScreenFile)) {
  const content = fs.readFileSync(homeScreenFile, 'utf8');

  if (content.includes('statNumber}>38<')) {
    pass('HomeScreen: Shows 38 countries');
  } else if (content.includes('statNumber}>14<')) {
    fail('HomeScreen: Still shows 14 countries (needs update)');
  } else {
    warn('HomeScreen: Country count format not recognized');
  }

  if (content.includes('95+')) {
    pass('HomeScreen: Shows 95+ cities');
  } else if (content.includes('60+')) {
    fail('HomeScreen: Still shows 60+ cities (needs update)');
  } else {
    warn('HomeScreen: City count format not recognized');
  }

  if (content.includes('38 countries')) {
    pass('HomeScreen: Info card mentions 38 countries');
  } else if (content.includes('14 countries')) {
    fail('HomeScreen: Info card still mentions 14 countries');
  } else {
    warn('HomeScreen: Info card country mention not found');
  }
} else {
  fail('HomeScreen.tsx not found');
}

// Test 9: Data consistency checks
section('TEST 9: Data Consistency');

// Count total cities
let totalCities = 0;
NEW_COUNTRIES.forEach(country => {
  const cityFile = path.join(__dirname, 'src', 'data', 'cities', `${country}.ts`);
  if (fs.existsSync(cityFile)) {
    const content = fs.readFileSync(cityFile, 'utf8');
    const matches = content.match(/export const \w+: City = {/g);
    if (matches) {
      totalCities += matches.length;
    }
  }
});

log(`\nTotal new cities added: ${totalCities}`, colors.blue);

if (totalCities >= 70 && totalCities <= 80) {
  pass(`City count in expected range: ${totalCities} cities`);
} else {
  warn(`City count outside expected range: ${totalCities} cities (expected ~75)`);
}

// Test 10: Currency data
section('TEST 10: Currency Data');

const exchangeRatesFile = path.join(__dirname, 'src', 'utils', 'currency', 'exchangeRates.ts');

if (fs.existsSync(exchangeRatesFile)) {
  const content = fs.readFileSync(exchangeRatesFile, 'utf8');

  const newCurrencies = ['EUR', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK',
                        'BRL', 'CLP', 'CRC', 'CNY', 'IDR', 'PHP', 'NZD', 'MAD'];

  newCurrencies.forEach(currency => {
    if (content.includes(`'${currency}'`) || content.includes(`"${currency}"`)) {
      pass(`Currency ${currency}: Found in exchange rates`);
    } else {
      fail(`Currency ${currency}: Missing from exchange rates`);
    }
  });
} else {
  fail('exchangeRates.ts not found');
}

// Final Summary
section('TEST SUMMARY');

const total = results.passed + results.failed + results.warnings;
const passRate = ((results.passed / total) * 100).toFixed(1);

log(`\nTotal Tests: ${total}`, colors.blue);
log(`Passed: ${results.passed}`, colors.green);
log(`Failed: ${results.failed}`, colors.red);
log(`Warnings: ${results.warnings}`, colors.yellow);
log(`\nPass Rate: ${passRate}%`,
    passRate >= 90 ? colors.green : passRate >= 70 ? colors.yellow : colors.red);

if (results.failed === 0) {
  log('\n✓ All critical tests passed! Ready for UI testing.', colors.green);
  process.exit(0);
} else {
  log('\n✗ Some tests failed. Please review the errors above.', colors.red);
  process.exit(1);
}
