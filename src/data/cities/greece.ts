import { City } from '../../types';

// ============================================================================
// GREEK CITIES
// ============================================================================
// Cost of Living data from Numbeo (January 2026) - Updated
// Tax system: Progressive national tax + social security

export const ATHENS: City = {
  id: 'athens_gr',
  name: 'Athens',
  state: 'Attica',
  country: 'gr',
  countryCode: 'GR',
  latitude: 37.9838,
  longitude: 23.7275,
  costOfLivingIndex: 62, // Updated Jan 2026 (Numbeo: 61.5)
  medianRent: 820,
  medianRentLocal: 754,
  medianHomePrice: 261000,
  medianHomePriceLocal: 240120,
  stateTaxRate: 0,
  taxRates: { type: 'progressive_national', regionalRate: 0, socialContributions: 0.1607 },
  climate: 'temperate' as const,
  population: 1000000,
  crimeIndex: 40,
  walkScore: 83,
  transitScore: 80,
  jobGrowthRate: 5.0,
  averageCommute: 30,
  healthcareIndex: 68,
  educationIndex: 70,
  entertainmentIndex: 75,
  outdoorIndex: 70,
  visaRequired: true,
  languageBarrier: 'medium',
  timeZoneOffset: 2,
  expatCommunitySize: 'large',
};

export const THESSALONIKI: City = {
  id: 'thessaloniki_gr',
  name: 'Thessaloniki',
  state: 'Central Macedonia',
  country: 'gr',
  countryCode: 'GR',
  latitude: 40.6401,
  longitude: 22.9444,
  costOfLivingIndex: 57, // Updated Jan 2026 (Numbeo: 57.3)
  medianRent: 655,
  medianRentLocal: 602,
  medianHomePrice: 207000,
  medianHomePriceLocal: 190440,
  stateTaxRate: 0,
  taxRates: { type: 'progressive_national', regionalRate: 0, socialContributions: 0.1607 },
  climate: 'temperate' as const,
  population: 1000000,
  crimeIndex: 38,
  walkScore: 78,
  transitScore: 65,
  jobGrowthRate: 5.0,
  averageCommute: 30,
  healthcareIndex: 67,
  educationIndex: 69,
  entertainmentIndex: 75,
  outdoorIndex: 70,
  visaRequired: true,
  languageBarrier: 'medium',
  timeZoneOffset: 2,
  expatCommunitySize: 'medium',
};

export const HERAKLION: City = {
  id: 'heraklion_gr',
  name: 'Heraklion',
  state: 'Crete',
  country: 'gr',
  countryCode: 'GR',
  latitude: 35.3387,
  longitude: 25.1442,
  costOfLivingIndex: 55, // Updated Jan 2026 (Numbeo: 55.1)
  medianRent: 600,
  medianRentLocal: 552,
  medianHomePrice: 185000,
  medianHomePriceLocal: 170200,
  stateTaxRate: 0,
  taxRates: { type: 'progressive_national', regionalRate: 0, socialContributions: 0.1607 },
  climate: 'temperate' as const,
  population: 1000000,
  crimeIndex: 32,
  walkScore: 75,
  transitScore: 55,
  jobGrowthRate: 5.0,
  averageCommute: 30,
  healthcareIndex: 66,
  educationIndex: 67,
  entertainmentIndex: 75,
  outdoorIndex: 70,
  visaRequired: true,
  languageBarrier: 'medium',
  timeZoneOffset: 2,
  expatCommunitySize: 'small',
};

export const GREECE_CITIES: City[] = [
  ATHENS,
  THESSALONIKI,
  HERAKLION,
];
