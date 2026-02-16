import { City } from '../../types';
import { calculateItalianTax } from '../taxSystems/italy';

// ============================================================================
// ITALIAN CITIES
// ============================================================================
// Cost of Living data from Numbeo (January 2026) - Updated
// Tax system: Progressive IRPEF + regional + municipal + social security

export const ROME: City = {
  id: 'rome_it',
  name: 'Rome',
  state: 'Lazio',
  country: 'it',
  countryCode: 'IT',
  latitude: 41.9028,
  longitude: 12.4964,
  costOfLivingIndex: 62, // Updated Jan 2026 (Numbeo: 61.8)
  medianRent: 1250,
  medianRentLocal: 1150,
  medianHomePrice: 440000,
  medianHomePriceLocal: 404800,
  stateTaxRate: 0.0173, // Lazio regional tax
  taxRates: { type: 'progressive_national', regionalRate: 0.0173, socialContributions: 0.0919 },
  climate: 'temperate' as const,
  population: 1000000,
  crimeIndex: 48,
  walkScore: 85,
  transitScore: 88,
  jobGrowthRate: 5.0,
  averageCommute: 30,
  healthcareIndex: 76,
  educationIndex: 74,
  entertainmentIndex: 75,
  outdoorIndex: 70,
  visaRequired: true,
  languageBarrier: 'medium',
  timeZoneOffset: 1,
  expatCommunitySize: 'large',
};

export const MILAN: City = {
  id: 'milan_it',
  name: 'Milan',
  state: 'Lombardy',
  country: 'it',
  countryCode: 'IT',
  latitude: 45.4642,
  longitude: 9.1900,
  costOfLivingIndex: 73, // Updated Jan 2026 (Numbeo: 72.6)
  medianRent: 1550,
  medianRentLocal: 1426,
  medianHomePrice: 550000,
  medianHomePriceLocal: 506000,
  stateTaxRate: 0.0173, // Lombardy regional tax
  taxRates: { type: 'progressive_national', regionalRate: 0.0173, socialContributions: 0.0919 },
  climate: 'temperate' as const,
  population: 1000000,
  crimeIndex: 42,
  walkScore: 88,
  transitScore: 92,
  jobGrowthRate: 5.0,
  averageCommute: 30,
  healthcareIndex: 78,
  educationIndex: 77,
  entertainmentIndex: 75,
  outdoorIndex: 70,
  visaRequired: true,
  languageBarrier: 'medium',
  timeZoneOffset: 1,
  expatCommunitySize: 'large',
};

export const FLORENCE: City = {
  id: 'florence_it',
  name: 'Florence',
  state: 'Tuscany',
  country: 'it',
  countryCode: 'IT',
  latitude: 43.7696,
  longitude: 11.2558,
  costOfLivingIndex: 68, // Updated Jan 2026 (Numbeo: 67.7)
  medianRent: 1150,
  medianRentLocal: 1058,
  medianHomePrice: 400000,
  medianHomePriceLocal: 368000,
  stateTaxRate: 0.0173, // Tuscany regional tax
  taxRates: { type: 'progressive_national', regionalRate: 0.0173, socialContributions: 0.0919 },
  climate: 'temperate' as const,
  population: 1000000,
  crimeIndex: 38,
  walkScore: 90,
  transitScore: 75,
  jobGrowthRate: 5.0,
  averageCommute: 30,
  healthcareIndex: 77,
  educationIndex: 76,
  entertainmentIndex: 75,
  outdoorIndex: 70,
  visaRequired: true,
  languageBarrier: 'medium',
  timeZoneOffset: 1,
  expatCommunitySize: 'large',
};

export const VENICE: City = {
  id: 'venice_it',
  name: 'Venice',
  state: 'Veneto',
  country: 'it',
  countryCode: 'IT',
  latitude: 45.4408,
  longitude: 12.3155,
  costOfLivingIndex: 69, // Updated Jan 2026 (estimated from regional data)
  medianRent: 1350,
  medianRentLocal: 1242,
  medianHomePrice: 470000,
  medianHomePriceLocal: 432400,
  stateTaxRate: 0.0173, // Veneto regional tax
  taxRates: { type: 'progressive_national', regionalRate: 0.0173, socialContributions: 0.0919 },
  climate: 'temperate' as const,
  population: 1000000,
  crimeIndex: 35,
  walkScore: 95,
  transitScore: 80,
  jobGrowthRate: 5.0,
  averageCommute: 30,
  healthcareIndex: 76,
  educationIndex: 74,
  entertainmentIndex: 75,
  outdoorIndex: 70,
  visaRequired: true,
  languageBarrier: 'medium',
  timeZoneOffset: 1,
  expatCommunitySize: 'large',
};

export const ITALY_CITIES: City[] = [
  ROME,
  MILAN,
  FLORENCE,
  VENICE,
];
