/**
 * Browser-compatible test runner
 * This can be imported and called from the app to run tests in the console
 */

import { runAllTests } from './premiumFeatures.test';

export function runPremiumTests() {
  console.log('Running Premium Features Tests...');
  const results = runAllTests();

  console.log('\n========== TEST RESULTS ==========');
  console.log(`Total: ${results.passed + results.failed}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

  if (results.failed > 0) {
    console.log('\nFailed Tests:');
    results.results.filter(r => !r.passed).forEach(r => {
      console.log(`  ✗ ${r.name}: ${r.error}`);
    });
  }

  return results;
}

// Export for easy import
export default runPremiumTests;
