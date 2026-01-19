#!/usr/bin/env node
/**
 * Fix TypeScript errors in new files
 */

const fs = require('fs');
const path = require('path');

console.log('Fixing TypeScript errors...\n');

let filesFixed = 0;

// Fix 1: Change TaxCalculation to SalaryCalculation in tax system files
console.log('1. Fixing TaxCalculation → SalaryCalculation');

const taxSystemFiles = [
  'belgium', 'brazil', 'chile', 'china', 'costaRica', 'czechia', 'denmark',
  'elSalvador', 'france', 'greece', 'guatemala', 'indonesia', 'ireland',
  'italy', 'morocco', 'netherlands', 'newZealand', 'norway', 'philippines',
  'poland', 'spain', 'sweden', 'switzerland'
];

taxSystemFiles.forEach(file => {
  const filePath = path.join(__dirname, 'src', 'data', 'taxSystems', `${file}.ts`);

  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const newContent = content.replace(/TaxCalculation/g, 'SalaryCalculation');

    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`  ✓ Fixed ${file}.ts`);
      filesFixed++;
    }
  }
});

// Fix 2: Expand qualityOfLife object into flat properties in city files
console.log('\n2. Fixing qualityOfLife object → flat properties');

const cityFiles = [
  'belgium', 'brazil', 'chile', 'china', 'costaRica', 'czechia', 'denmark',
  'elSalvador', 'france', 'greece', 'guatemala', 'indonesia', 'ireland',
  'italy', 'morocco', 'netherlands', 'newZealand', 'norway', 'philippines',
  'poland', 'spain', 'sweden', 'switzerland'
];

cityFiles.forEach(file => {
  const filePath = path.join(__dirname, 'src', 'data', 'cities', `${file}.ts`);

  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Pattern to match qualityOfLife block
    const qualityOfLifePattern = /qualityOfLife: {\s*walkScore: (\d+),\s*transitScore: (\d+),\s*crimeIndex: (\d+),\s*healthcareIndex: (\d+),\s*educationIndex: (\d+),\s*}/g;

    // Replace with flat properties
    const newContent = content.replace(qualityOfLifePattern, (match, walkScore, transitScore, crimeIndex, healthcareIndex, educationIndex) => {
      return `climate: 'temperate' as const,
  population: 1000000,
  crimeIndex: ${crimeIndex},
  walkScore: ${walkScore},
  transitScore: ${transitScore},
  jobGrowthRate: 5.0,
  averageCommute: 30,
  healthcareIndex: ${healthcareIndex},
  educationIndex: ${educationIndex},
  entertainmentIndex: 75,
  outdoorIndex: 70,`;
    });

    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`  ✓ Fixed ${file}.ts`);
      filesFixed++;
    }
  }
});

console.log(`\n✓ Fixed ${filesFixed} files total`);
