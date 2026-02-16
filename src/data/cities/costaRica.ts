import { City } from '../../types';

// ============================================================================
// COSTA RICAN CITIES
// ============================================================================
// Cost of Living data from Numbeo (January 2026) - Updated
// Tax system: Progressive national tax + social security

export const SAN_JOSE: City = {
  id: 'san_jose_cr',
  name: 'San José',
  state: 'San José Province',
  country: 'cr',
  countryCode: 'CR',
  costOfLivingIndex: 55, // Updated Jan 2026 (Numbeo: 54.6)
  latitude: 9.9281,
  longitude: -84.0907,
  medianRent: 820,
  medianRentLocal: 426400,
  medianHomePrice: 240000,
  medianHomePriceLocal: 124800000,
  stateTaxRate: 0,
  taxRates: { type: 'progressive_national', regionalRate: 0, socialContributions: 0.1067 },
  climate: 'temperate' as const,
  population: 1000000,
  crimeIndex: 48,
  walkScore: 70,
  transitScore: 65,
  jobGrowthRate: 5.0,
  averageCommute: 30,
  healthcareIndex: 72,
  educationIndex: 71,
  entertainmentIndex: 75,
  outdoorIndex: 70,
  visaRequired: true,
  languageBarrier: 'medium',
  timeZoneOffset: -6,
  expatCommunitySize: 'large',
};

export const COSTA_RICA_CITIES: City[] = [
  SAN_JOSE,
];
