import { City } from '../../types';

// ============================================================================
// CHILEAN CITIES
// ============================================================================
// Cost of Living data from Numbeo (January 2026) - Updated
// Tax system: Progressive national tax + social security

export const SANTIAGO: City = {
  id: 'santiago_cl',
  name: 'Santiago',
  state: 'Santiago Metropolitan',
  country: 'cl',
  countryCode: 'CL',
  costOfLivingIndex: 56, // Updated Jan 2026 (Numbeo: 55.8)
  latitude: -33.4489,
  longitude: -70.6693,
  medianRent: 765,
  medianRentLocal: 703960,
  medianHomePrice: 218000,
  medianHomePriceLocal: 200512000,
  stateTaxRate: 0,
  taxRates: { type: 'progressive_national', regionalRate: 0, socialContributions: 0.1876 },
  climate: 'temperate' as const,
  population: 1000000,
  crimeIndex: 52,
  walkScore: 78,
  transitScore: 82,
  jobGrowthRate: 5.0,
  averageCommute: 30,
  healthcareIndex: 70,
  educationIndex: 72,
  entertainmentIndex: 75,
  outdoorIndex: 70,
  visaRequired: true,
  languageBarrier: 'medium',
  timeZoneOffset: -3,
  expatCommunitySize: 'large',
};

export const VALPARAISO: City = {
  id: 'valparaiso_cl',
  name: 'Valparaíso',
  state: 'Valparaíso',
  country: 'cl',
  countryCode: 'CL',
  latitude: -33.0472,
  longitude: -71.6127,
  costOfLivingIndex: 52, // Updated Jan 2026 (Numbeo: 51.6)
  medianRent: 600,
  medianRentLocal: 552000,
  medianHomePrice: 163000,
  medianHomePriceLocal: 149960000,
  stateTaxRate: 0,
  taxRates: { type: 'progressive_national', regionalRate: 0, socialContributions: 0.1876 },
  climate: 'temperate' as const,
  population: 1000000,
  crimeIndex: 48,
  walkScore: 75,
  transitScore: 65,
  jobGrowthRate: 5.0,
  averageCommute: 30,
  healthcareIndex: 68,
  educationIndex: 70,
  entertainmentIndex: 75,
  outdoorIndex: 70,
  visaRequired: true,
  languageBarrier: 'medium',
  timeZoneOffset: -3,
  expatCommunitySize: 'medium',
};

export const CONCEPCION: City = {
  id: 'concepcion_cl',
  name: 'Concepción',
  state: 'Biobío',
  country: 'cl',
  countryCode: 'CL',
  latitude: -36.8201,
  longitude: -73.0444,
  costOfLivingIndex: 50, // Updated Jan 2026 (Numbeo: 49.8)
  medianRent: 545,
  medianRentLocal: 501400,
  medianHomePrice: 152000,
  medianHomePriceLocal: 139840000,
  stateTaxRate: 0,
  taxRates: { type: 'progressive_national', regionalRate: 0, socialContributions: 0.1876 },
  climate: 'temperate' as const,
  population: 1000000,
  crimeIndex: 45,
  walkScore: 72,
  transitScore: 60,
  jobGrowthRate: 5.0,
  averageCommute: 30,
  healthcareIndex: 67,
  educationIndex: 71,
  entertainmentIndex: 75,
  outdoorIndex: 70,
  visaRequired: true,
  languageBarrier: 'medium',
  timeZoneOffset: -3,
  expatCommunitySize: 'small',
};

export const CHILE_CITIES: City[] = [
  SANTIAGO,
  VALPARAISO,
  CONCEPCION,
];
