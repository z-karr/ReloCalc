import { City } from '../../types';
import { calculateSwissTax } from '../taxSystems/switzerland';

// ============================================================================
// SWISS CITIES
// ============================================================================
// Cost of Living data from Numbeo (January 2024)
// Tax system: Federal + Cantonal + Municipal + Social security
// Note: Cantonal tax rates vary significantly - using city-specific rates

export const ZURICH: City = {
  id: 'zurich_ch',
  name: 'Zurich',
  state: 'Zurich',
  country: 'ch',
  countryCode: 'CH',
  latitude: 47.3769,
  longitude: 8.5417,
  costOfLivingIndex: 135,
  medianRent: 2400,
  medianRentLocal: 2112,
  medianHomePrice: 950000,
  medianHomePriceLocal: 836000,
  stateTaxRate: 0.11, // Zurich canton rate
  taxRates: { type: 'progressive_national', regionalRate: 0, socialContributions: 0.141 },
  climate: 'temperate' as const,
  population: 1000000,
  crimeIndex: 20,
  walkScore: 90,
  transitScore: 100,
  jobGrowthRate: 5.0,
  averageCommute: 30,
  healthcareIndex: 85,
  educationIndex: 82,
  entertainmentIndex: 75,
  outdoorIndex: 70,
  visaRequired: true,
  languageBarrier: 'low',
  timeZoneOffset: 1,
  expatCommunitySize: 'large',
};

export const GENEVA: City = {
  id: 'geneva_ch',
  name: 'Geneva',
  state: 'Geneva',
  country: 'ch',
  countryCode: 'CH',
  latitude: 46.2044,
  longitude: 6.1432,
  costOfLivingIndex: 140,
  medianRent: 2600,
  medianRentLocal: 2288,
  medianHomePrice: 1050000,
  medianHomePriceLocal: 924000,
  stateTaxRate: 0.12, // Geneva canton rate (slightly higher)
  taxRates: { type: 'progressive_national', regionalRate: 0, socialContributions: 0.141 },
  climate: 'temperate' as const,
  population: 1000000,
  crimeIndex: 22,
  walkScore: 88,
  transitScore: 95,
  jobGrowthRate: 5.0,
  averageCommute: 30,
  healthcareIndex: 85,
  educationIndex: 81,
  entertainmentIndex: 75,
  outdoorIndex: 70,
  visaRequired: true,
  languageBarrier: 'low',
  timeZoneOffset: 1,
  expatCommunitySize: 'large',
};

export const BASEL: City = {
  id: 'basel_ch',
  name: 'Basel',
  state: 'Basel-Stadt',
  country: 'ch',
  countryCode: 'CH',
  latitude: 47.5596,
  longitude: 7.5886,
  costOfLivingIndex: 130,
  medianRent: 2100,
  medianRentLocal: 1848,
  medianHomePrice: 850000,
  medianHomePriceLocal: 748000,
  stateTaxRate: 0.10, // Basel canton rate
  taxRates: { type: 'progressive_national', regionalRate: 0, socialContributions: 0.141 },
  climate: 'temperate' as const,
  population: 1000000,
  crimeIndex: 19,
  walkScore: 87,
  transitScore: 92,
  jobGrowthRate: 5.0,
  averageCommute: 30,
  healthcareIndex: 84,
  educationIndex: 80,
  entertainmentIndex: 75,
  outdoorIndex: 70,
  visaRequired: true,
  languageBarrier: 'low',
  timeZoneOffset: 1,
  expatCommunitySize: 'large',
};

export const BERN: City = {
  id: 'bern_ch',
  name: 'Bern',
  state: 'Bern',
  country: 'ch',
  countryCode: 'CH',
  latitude: 46.9480,
  longitude: 7.4474,
  costOfLivingIndex: 125,
  medianRent: 1900,
  medianRentLocal: 1672,
  medianHomePrice: 780000,
  medianHomePriceLocal: 686400,
  stateTaxRate: 0.10, // Bern canton rate
  taxRates: { type: 'progressive_national', regionalRate: 0, socialContributions: 0.141 },
  climate: 'temperate' as const,
  population: 1000000,
  crimeIndex: 18,
  walkScore: 85,
  transitScore: 88,
  jobGrowthRate: 5.0,
  averageCommute: 30,
  healthcareIndex: 84,
  educationIndex: 81,
  entertainmentIndex: 75,
  outdoorIndex: 70,
  visaRequired: true,
  languageBarrier: 'low',
  timeZoneOffset: 1,
  expatCommunitySize: 'medium',
};

export const SWITZERLAND_CITIES: City[] = [
  ZURICH,
  GENEVA,
  BASEL,
  BERN,
];
