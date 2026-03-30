/**
 * Test Runner
 * Executes all premium feature tests
 */

import { runAllTests } from './premiumFeatures.test';

// Run all tests
const results = runAllTests();

// Exit with appropriate code
process.exit(results.failed > 0 ? 1 : 0);
