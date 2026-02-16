import { City } from '../../types';

// ============================================================================
// NEW ZEALAND CITIES
// ============================================================================
// Cost of Living data from Numbeo (January 2026) - Updated
// Tax system: Progressive national tax + ACC levy

export const AUCKLAND: City = {
  id: 'auckland_nz',
  name: 'Auckland',
  latitude: -36.8485,
  longitude: 174.7633,
  state: 'Auckland',
  country: 'nz',
  countryCode: 'NZ',
  costOfLivingIndex: 73, // Updated Jan 2026 (Numbeo: 72.8)
  medianRent: 1750,
  medianRentLocal: 2923,
  medianHomePrice: 710000,
  medianHomePriceLocal: 1185700,
  stateTaxRate: 0,
  taxRates: { type: 'progressive_national', regionalRate: 0, socialContributions: 0.0139 },
  climate: 'temperate' as const,
  population: 1000000,
  crimeIndex: 42,
  walkScore: 75,
  transitScore: 70,
  jobGrowthRate: 5.0,
  averageCommute: 30,
  healthcareIndex: 77,
  educationIndex: 78,
  entertainmentIndex: 75,
  outdoorIndex: 70,
  visaRequired: true,
  languageBarrier: 'none',
  timeZoneOffset: 12,
  expatCommunitySize: 'large',
};

export const WELLINGTON: City = {
  id: 'wellington_nz',
  name: 'Wellington',
  state: 'Wellington',
  country: 'nz',
  countryCode: 'NZ',
  latitude: -41.2865,
  longitude: 174.7762,
  costOfLivingIndex: 69, // Updated Jan 2026 (Numbeo: 68.5)
  medianRent: 1640,
  medianRentLocal: 2739,
  medianHomePrice: 630000,
  medianHomePriceLocal: 1052100,
  stateTaxRate: 0,
  taxRates: { type: 'progressive_national', regionalRate: 0, socialContributions: 0.0139 },
  climate: 'temperate' as const,
  population: 1000000,
  crimeIndex: 38,
  walkScore: 80,
  transitScore: 68,
  jobGrowthRate: 5.0,
  averageCommute: 30,
  healthcareIndex: 76,
  educationIndex: 77,
  entertainmentIndex: 75,
  outdoorIndex: 70,
  visaRequired: true,
  languageBarrier: 'none',
  timeZoneOffset: 12,
  expatCommunitySize: 'large',
};

export const QUEENSTOWN: City = {
  id: 'queenstown_nz',
  name: 'Queenstown',
  state: 'Otago',
  country: 'nz',
  countryCode: 'NZ',
  latitude: -45.0312,
  longitude: 168.6626,
  costOfLivingIndex: 75, // Updated Jan 2026 (Numbeo: 75.2)
  medianRent: 1860,
  medianRentLocal: 3106,
  medianHomePrice: 820000,
  medianHomePriceLocal: 1369400,
  stateTaxRate: 0,
  taxRates: { type: 'progressive_national', regionalRate: 0, socialContributions: 0.0139 },
  climate: 'temperate' as const,
  population: 1000000,
  crimeIndex: 28,
  walkScore: 70,
  transitScore: 50,
  jobGrowthRate: 5.0,
  averageCommute: 30,
  healthcareIndex: 75,
  educationIndex: 74,
  entertainmentIndex: 75,
  outdoorIndex: 70,
  visaRequired: true,
  languageBarrier: 'none',
  timeZoneOffset: 12,
  expatCommunitySize: 'large',
};

export const NEW_ZEALAND_CITIES: City[] = [
  AUCKLAND,
  WELLINGTON,
  QUEENSTOWN,
];
