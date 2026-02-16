import { City } from '../../types';

// ============================================================================
// GUATEMALAN CITIES
// ============================================================================
// Cost of Living data from Numbeo (January 2026) - Updated
// Tax system: Progressive national tax + social security

export const GUATEMALA_CITY: City = {
  id: 'guatemala_city_gt',
  name: 'Guatemala City',
  state: 'Guatemala',
  country: 'gt',
  countryCode: 'GT',
  costOfLivingIndex: 46, // Updated Jan 2026 (Numbeo: 45.8)
  latitude: 14.6349,
  longitude: -90.5069,
  medianRent: 635,
  medianRentLocal: 4951,
  medianHomePrice: 152000,
  medianHomePriceLocal: 1185920,
  stateTaxRate: 0,
  taxRates: { type: 'progressive_national', regionalRate: 0, socialContributions: 0.0483 },
  climate: 'temperate' as const,
  population: 1000000,
  crimeIndex: 72,
  walkScore: 62,
  transitScore: 58,
  jobGrowthRate: 5.0,
  averageCommute: 30,
  healthcareIndex: 59,
  educationIndex: 61,
  entertainmentIndex: 75,
  outdoorIndex: 70,
  visaRequired: true,
  languageBarrier: 'medium',
  timeZoneOffset: -6,
  expatCommunitySize: 'medium',
};

export const ANTIGUA: City = {
  id: 'antigua_gt',
  name: 'Antigua',
  state: 'Sacatepéquez',
  country: 'gt',
  countryCode: 'GT',
  latitude: 14.5586,
  longitude: -90.7339,
  costOfLivingIndex: 50, // Updated Jan 2026 (Numbeo: 49.6)
  medianRent: 710,
  medianRentLocal: 5538,
  medianHomePrice: 196000,
  medianHomePriceLocal: 1528320,
  stateTaxRate: 0,
  taxRates: { type: 'progressive_national', regionalRate: 0, socialContributions: 0.0483 },
  climate: 'temperate' as const,
  population: 1000000,
  crimeIndex: 55,
  walkScore: 75,
  transitScore: 45,
  jobGrowthRate: 5.0,
  averageCommute: 30,
  healthcareIndex: 60,
  educationIndex: 62,
  entertainmentIndex: 75,
  outdoorIndex: 70,
  visaRequired: true,
  languageBarrier: 'low',
  timeZoneOffset: -6,
  expatCommunitySize: 'large',
};

export const PANAJACHEL: City = {
  id: 'panajachel_gt',
  name: 'Panajachel',
  state: 'Sololá',
  country: 'gt',
  countryCode: 'GT',
  latitude: 14.7422,
  longitude: -91.1569,
  costOfLivingIndex: 42, // Updated Jan 2026 (Numbeo: 42.3)
  medianRent: 550,
  medianRentLocal: 4290,
  medianHomePrice: 130000,
  medianHomePriceLocal: 1014000,
  stateTaxRate: 0,
  taxRates: { type: 'progressive_national', regionalRate: 0, socialContributions: 0.0483 },
  climate: 'temperate' as const,
  population: 1000000,
  crimeIndex: 58,
  walkScore: 70,
  transitScore: 42,
  jobGrowthRate: 5.0,
  averageCommute: 30,
  healthcareIndex: 57,
  educationIndex: 59,
  entertainmentIndex: 75,
  outdoorIndex: 70,
  visaRequired: true,
  languageBarrier: 'low',
  timeZoneOffset: -6,
  expatCommunitySize: 'medium',
};

export const GUATEMALA_CITIES: City[] = [
  GUATEMALA_CITY,
  ANTIGUA,
  PANAJACHEL,
];
