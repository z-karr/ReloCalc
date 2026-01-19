// ============================================================================
// UAE TAX SYSTEM (2024-2026)
// ============================================================================

// UAE has NO income tax for individuals
// This makes it a very attractive destination for high earners

export const INCOME_TAX_RATE = 0; // 0%
export const SOCIAL_SECURITY_RATE = 0; // 0%

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate UAE taxes (which is zero)
 */
export function calculateUAETax(grossSalary: number) {
  return {
    incomeTax: 0,
    socialSecurity: 0,
    totalTax: 0,
  };
}
