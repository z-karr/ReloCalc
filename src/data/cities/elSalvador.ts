import { City } from '../../types';

// ============================================================================
// SALVADORAN CITIES
// ============================================================================
// Cost of Living data from Numbeo (January 2026) - Updated
// Tax system: Progressive national tax + social security

export const SAN_SALVADOR: City = {
  id: 'san_salvador_sv',
  name: 'San Salvador',
  state: 'San Salvador',
  country: 'sv',
  countryCode: 'SV',
  costOfLivingIndex: 45, // Updated Jan 2026 (Numbeo: 44.8)
  latitude: 13.6929,
  longitude: -89.2182,
  medianRent: 600,
  medianRentLocal: 600,
  medianHomePrice: 142000,
  medianHomePriceLocal: 142000,
  stateTaxRate: 0,
  taxRates: { type: 'progressive_national', regionalRate: 0, socialContributions: 0.1025 },
  climate: 'temperate' as const,
  population: 1000000,
  crimeIndex: 68,
  walkScore: 65,
  transitScore: 55,
  jobGrowthRate: 5.0,
  averageCommute: 30,
  healthcareIndex: 60,
  educationIndex: 62,
  entertainmentIndex: 75,
  outdoorIndex: 70,
  visaRequired: true,
  languageBarrier: 'medium',
  timeZoneOffset: -6,
  expatCommunitySize: 'small',
};

export const EL_SALVADOR_CITIES: City[] = [
  SAN_SALVADOR,
];
