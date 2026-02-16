import { City } from '../../types';
import { calculateDutchTax } from '../taxSystems/netherlands';

// ============================================================================
// DUTCH CITIES
// ============================================================================
// Cost of Living data from Numbeo (January 2026) - Updated
// Tax system: Progressive Box 1 tax (combined income + social insurance)

export const AMSTERDAM: City = {
  id: 'amsterdam_nl',
  name: 'Amsterdam',
  state: 'North Holland',
  country: 'nl',
  countryCode: 'NL',
  latitude: 52.3676,
  longitude: 4.9041,
  costOfLivingIndex: 81, // Updated Jan 2026 (Numbeo: 81.1)
  medianRent: 2000,
  medianRentLocal: 1840,
  medianHomePrice: 580000,
  medianHomePriceLocal: 533600,
  stateTaxRate: 0, // No separate regional tax (included in national)
  taxRates: { type: 'progressive_national', regionalRate: 0, socialContributions: 0 },
  climate: 'temperate' as const,
  population: 1000000,
  crimeIndex: 32,
  walkScore: 92,
  transitScore: 95,
  jobGrowthRate: 5.0,
  averageCommute: 30,
  healthcareIndex: 82,
  educationIndex: 80,
  entertainmentIndex: 75,
  outdoorIndex: 70,
  visaRequired: true,
  languageBarrier: 'low',
  timeZoneOffset: 1,
  expatCommunitySize: 'large',
};

export const ROTTERDAM: City = {
  id: 'rotterdam_nl',
  name: 'Rotterdam',
  state: 'South Holland',
  country: 'nl',
  countryCode: 'NL',
  latitude: 51.9244,
  longitude: 4.4777,
  costOfLivingIndex: 73, // Updated Jan 2026 (Numbeo: 73.3)
  medianRent: 1450,
  medianRentLocal: 1334,
  medianHomePrice: 400000,
  medianHomePriceLocal: 368000,
  stateTaxRate: 0,
  taxRates: { type: 'progressive_national', regionalRate: 0, socialContributions: 0 },
  climate: 'temperate' as const,
  population: 1000000,
  crimeIndex: 38,
  walkScore: 88,
  transitScore: 90,
  jobGrowthRate: 5.0,
  averageCommute: 30,
  healthcareIndex: 81,
  educationIndex: 78,
  entertainmentIndex: 75,
  outdoorIndex: 70,
  visaRequired: true,
  languageBarrier: 'low',
  timeZoneOffset: 1,
  expatCommunitySize: 'large',
};

export const THE_HAGUE: City = {
  id: 'the_hague_nl',
  name: 'The Hague',
  state: 'South Holland',
  country: 'nl',
  countryCode: 'NL',
  latitude: 52.0705,
  longitude: 4.3007,
  costOfLivingIndex: 73, // Updated Jan 2026 (Numbeo: 73.1)
  medianRent: 1550,
  medianRentLocal: 1426,
  medianHomePrice: 440000,
  medianHomePriceLocal: 404800,
  stateTaxRate: 0,
  taxRates: { type: 'progressive_national', regionalRate: 0, socialContributions: 0 },
  climate: 'temperate' as const,
  population: 1000000,
  crimeIndex: 30,
  walkScore: 90,
  transitScore: 88,
  jobGrowthRate: 5.0,
  averageCommute: 30,
  healthcareIndex: 82,
  educationIndex: 79,
  entertainmentIndex: 75,
  outdoorIndex: 70,
  visaRequired: true,
  languageBarrier: 'low',
  timeZoneOffset: 1,
  expatCommunitySize: 'large',
};

export const UTRECHT: City = {
  id: 'utrecht_nl',
  name: 'Utrecht',
  state: 'Utrecht',
  country: 'nl',
  countryCode: 'NL',
  latitude: 52.0907,
  longitude: 5.1214,
  costOfLivingIndex: 76, // Updated Jan 2026 (Numbeo: 76.2)
  medianRent: 1600,
  medianRentLocal: 1472,
  medianHomePrice: 470000,
  medianHomePriceLocal: 432400,
  stateTaxRate: 0,
  taxRates: { type: 'progressive_national', regionalRate: 0, socialContributions: 0 },
  climate: 'temperate' as const,
  population: 1000000,
  crimeIndex: 28,
  walkScore: 91,
  transitScore: 92,
  jobGrowthRate: 5.0,
  averageCommute: 30,
  healthcareIndex: 81,
  educationIndex: 80,
  entertainmentIndex: 75,
  outdoorIndex: 70,
  visaRequired: true,
  languageBarrier: 'low',
  timeZoneOffset: 1,
  expatCommunitySize: 'large',
};

export const NETHERLANDS_CITIES: City[] = [
  AMSTERDAM,
  ROTTERDAM,
  THE_HAGUE,
  UTRECHT,
];
