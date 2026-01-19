import { TaxRateInfo } from '../types';

// ============================================================================
// TAX LABEL INTERNATIONALIZATION
// ============================================================================

/**
 * Provides context-appropriate tax labels for different tax systems.
 *
 * This ensures the UI displays relevant terminology based on the tax system:
 * - US: "Federal Tax", "State Tax", "FICA"
 * - UK: "Income Tax", "National Insurance"
 * - Australia: "Income Tax", "Medicare Levy"
 * - Canada: "Federal Tax", "Provincial Tax", "CPP/EI"
 * - etc.
 */

export interface TaxLabels {
  national: string;         // e.g., "Federal Tax", "Income Tax"
  regional: string | null;  // e.g., "State Tax", "Provincial Tax", or null
  social: string;           // e.g., "FICA", "National Insurance", "CPP/EI"
}

/**
 * Get appropriate tax category labels based on the tax system type
 */
export function getTaxCategoryLabels(taxRates: TaxRateInfo): TaxLabels {
  switch (taxRates.type) {
    case 'us_federal_state':
      return {
        national: 'Federal Tax',
        regional: 'State Tax',
        social: 'FICA',
      };

    case 'progressive_national':
      // Most progressive systems (UK, Australia, Canada federal, etc.)
      return {
        national: 'Income Tax',
        regional: null,
        social: 'Social Contributions',
      };

    case 'flat_national':
      // Flat tax systems (UAE, etc.)
      return {
        national: 'Income Tax',
        regional: null,
        social: 'Social Insurance',
      };

    default:
      // Fallback for unknown systems
      return {
        national: 'Income Tax',
        regional: null,
        social: 'Social Contributions',
      };
  }
}

/**
 * Get country-specific regional tax label
 * Used when a country has both national and regional taxes
 */
export function getRegionalTaxLabel(countryId: string): string {
  const labels: Record<string, string> = {
    us: 'State Tax',
    ca: 'Provincial Tax',
    de: 'Länder Tax',
    au: 'State Tax',
    ch: 'Cantonal Tax',
    // Add more as countries are expanded
  };

  return labels[countryId] || 'Regional Tax';
}

/**
 * Get country-specific social contribution label
 * Provides more specific terminology when available
 */
export function getSocialContributionLabel(countryId: string): string {
  const labels: Record<string, string> = {
    us: 'FICA',
    gb: 'National Insurance',
    au: 'Medicare Levy',
    ca: 'CPP/EI',
    de: 'Social Security',
    jp: 'Social Insurance',
    kr: 'National Pension',
    mx: 'IMSS',
    ar: 'Social Security',
    // Add more as countries are expanded
  };

  return labels[countryId] || 'Social Contributions';
}

/**
 * Get country-specific explanation for social contributions
 * Helps users understand what these contributions fund
 */
export function getSocialContributionExplanation(countryId: string): string {
  const explanations: Record<string, string> = {
    us: 'Social Security and Medicare',
    gb: 'State pension and NHS contributions',
    au: 'Universal healthcare funding',
    ca: 'Canada Pension Plan and Employment Insurance',
    de: 'Pension, health, unemployment, and care insurance',
    jp: 'Pension, health, and employment insurance',
    // Add more as needed
  };

  return explanations[countryId] || 'Pension, healthcare, and social welfare programs';
}

/**
 * Get full tax breakdown labels for a specific city
 * This is a convenience function that combines all label functions
 */
export function getTaxBreakdownLabels(
  taxRates: TaxRateInfo,
  countryId: string
): {
  national: string;
  regional: string | null;
  social: string;
  socialExplanation: string;
} {
  const baseLabels = getTaxCategoryLabels(taxRates);

  return {
    national: baseLabels.national,
    regional: baseLabels.regional ? getRegionalTaxLabel(countryId) : null,
    social: getSocialContributionLabel(countryId),
    socialExplanation: getSocialContributionExplanation(countryId),
  };
}

/**
 * Format tax type for display in charts/tables
 * Provides short, consistent labels across the app
 */
export function formatTaxTypeLabel(
  taxType: 'national' | 'regional' | 'social',
  countryId: string
): string {
  switch (taxType) {
    case 'national':
      return countryId === 'us' ? 'Federal' : 'Income';
    case 'regional':
      return countryId === 'us' ? 'State' : 'Regional';
    case 'social':
      return countryId === 'us' ? 'FICA' : 'Social';
    default:
      return 'Other';
  }
}
