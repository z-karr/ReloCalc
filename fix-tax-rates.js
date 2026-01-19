#!/usr/bin/env node
/**
 * Fix taxRates in all new city files to include required fields
 */

const fs = require('fs');
const path = require('path');

// Define the correct tax rates for each country
// regionalRate: 0 for most countries (no state/regional tax)
// socialContributions: typical employee contribution rate
const COUNTRY_TAX_RATES = {
  belgium: { regionalRate: 0, socialContributions: 0.1305 }, // 13.05% social security
  brazil: { regionalRate: 0, socialContributions: 0.11 }, // ~11% INSS average
  chile: { regionalRate: 0, socialContributions: 0.1876 }, // AFP + health + unemployment
  china: { regionalRate: 0, socialContributions: 0.225 }, // 22.5% social insurance
  costaRica: { regionalRate: 0, socialContributions: 0.1067 }, // 10.67% CCSS
  czechia: { regionalRate: 0, socialContributions: 0.11 }, // 6.5% social + 4.5% health
  denmark: { regionalRate: 0, socialContributions: 0.08 }, // 8% labor market
  elSalvador: { regionalRate: 0, socialContributions: 0.1025 }, // ISSS + AFP
  france: { regionalRate: 0, socialContributions: 0.22 }, // 22% social security
  greece: { regionalRate: 0, socialContributions: 0.1607 }, // 16.07% social security
  guatemala: { regionalRate: 0, socialContributions: 0.0483 }, // 4.83% IGSS
  indonesia: { regionalRate: 0, socialContributions: 0.03 }, // 3% BPJS
  ireland: { regionalRate: 0, socialContributions: 0.04 }, // 4% PRSI
  italy: { regionalRate: 0.0173, socialContributions: 0.0919 }, // Regional + INPS
  morocco: { regionalRate: 0, socialContributions: 0.0674 }, // CNSS + AMO
  newZealand: { regionalRate: 0, socialContributions: 0.0139 }, // 1.39% ACC levy
  norway: { regionalRate: 0, socialContributions: 0.078 }, // 7.8% national insurance
  philippines: { regionalRate: 0, socialContributions: 0.085 }, // SSS + PhilHealth + Pag-IBIG
  poland: { regionalRate: 0, socialContributions: 0.2571 }, // 13.71% social + 9% health + 2.45% sickness
  spain: { regionalRate: 0, socialContributions: 0.0635 }, // 6.35% social security
  sweden: { regionalRate: 0, socialContributions: 0.07 }, // 7% pension
  switzerland: { regionalRate: 0, socialContributions: 0.141 }, // 6.5% + 1.1% + 6.5%
  netherlands: { regionalRate: 0, socialContributions: 0 }, // Social insurance included in brackets
};

// Countries that don't use progressive_national (skip these)
const SKIP_COUNTRIES = new Set([
  // These might use other types
]);

console.log('Fixing taxRates in city files...\n');

let filesFixed = 0;
let errors = 0;

Object.entries(COUNTRY_TAX_RATES).forEach(([country, rates]) => {
  const filePath = path.join(__dirname, 'src', 'data', 'cities', `${country}.ts`);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠ File not found: ${country}.ts`);
    errors++;
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Replace simple taxRates with full object
  const oldPattern = /taxRates:\s*{\s*type:\s*['"]progressive_national['"]\s*}/g;
  const newValue = `taxRates: { type: 'progressive_national', regionalRate: ${rates.regionalRate}, socialContributions: ${rates.socialContributions} }`;

  const newContent = content.replace(oldPattern, newValue);

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✓ Fixed ${country}.ts`);
    filesFixed++;
  } else {
    console.log(`  ${country}.ts - No changes needed`);
  }
});

console.log(`\n✓ Fixed ${filesFixed} files`);
if (errors > 0) {
  console.log(`⚠ ${errors} errors`);
}
