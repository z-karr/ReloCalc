import { City } from '../../types';

// ============================================================================
// ARGENTINE CITIES
// ============================================================================
// Cost of Living data from Numbeo (January 2026) - Updated
// Tax system: Progressive national tax + social security

export const BUENOS_AIRES: City = {
  id: 'buenos-aires',
  name: 'Buenos Aires',
  state: 'Buenos Aires Province',
  country: 'ar',
  countryCode: 'AR',
  population: 3075000,
  latitude: -34.6037,
  longitude: -58.3816,
  costOfLivingIndex: 48, // Updated Jan 2026 (Numbeo: 48.2)
  medianRent: 655,
  medianHomePrice: 130000,
  stateTaxRate: 0,
  transitScore: 75,
  walkScore: 78,
  climate: 'temperate',
  averageCommute: 40,
  crimeIndex: 82, // Higher crime than developed countries
  healthcareIndex: 70,
  educationIndex: 75,
  entertainmentIndex: 90, // Great cultural scene
  outdoorIndex: 65,
  jobGrowthRate: 0.015,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0, // No provincial income tax in Argentina
    socialContributions: 0.17, // Social security
  },
  visaRequired: true,
  languageBarrier: 'medium', // Spanish primary language
  timeZoneOffset: -3, // ART (Argentina Time)
  expatCommunitySize: 'large',
};

export const CORDOBA: City = {
  id: 'cordoba-ar',
  name: 'Córdoba',
  state: 'Córdoba Province',
  country: 'ar',
  countryCode: 'AR',
  latitude: -31.4201,
  longitude: -64.1888,
  population: 1330000,
  costOfLivingIndex: 42, // Updated Jan 2026 (Numbeo: 42.4)
  medianRent: 490,
  medianHomePrice: 98000,
  stateTaxRate: 0,
  transitScore: 65,
  walkScore: 70,
  climate: 'temperate',
  averageCommute: 32,
  crimeIndex: 75, // Slightly safer than Buenos Aires
  healthcareIndex: 68,
  educationIndex: 72,
  entertainmentIndex: 70,
  outdoorIndex: 75, // Near Sierras mountains
  jobGrowthRate: 0.018,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.17,
  },
  visaRequired: true,
  languageBarrier: 'medium',
  timeZoneOffset: -3,
  expatCommunitySize: 'medium',
};

export const MENDOZA: City = {
  id: 'mendoza-ar',
  name: 'Mendoza',
  state: 'Mendoza Province',
  country: 'ar',
  countryCode: 'AR',
  latitude: -32.8895,
  longitude: -68.8458,
  population: 115000,
  costOfLivingIndex: 44, // Updated Jan 2026 (Numbeo: 44.1)
  medianRent: 520,
  medianHomePrice: 105000,
  stateTaxRate: 0,
  transitScore: 60,
  walkScore: 72,
  climate: 'temperate',
  averageCommute: 30,
  crimeIndex: 70,
  healthcareIndex: 67,
  educationIndex: 71,
  entertainmentIndex: 68,
  outdoorIndex: 85,
  jobGrowthRate: 0.016,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.17,
  },
  visaRequired: true,
  languageBarrier: 'medium',
  timeZoneOffset: -3,
  expatCommunitySize: 'medium',
};

export const ROSARIO: City = {
  id: 'rosario-ar',
  name: 'Rosario',
  state: 'Santa Fe Province',
  country: 'ar',
  countryCode: 'AR',
  latitude: -32.9442,
  longitude: -60.6505,
  population: 948000,
  costOfLivingIndex: 43, // Updated Jan 2026 (Numbeo: 43.3)
  medianRent: 500,
  medianHomePrice: 95000,
  stateTaxRate: 0,
  transitScore: 68,
  walkScore: 74,
  climate: 'temperate',
  averageCommute: 32,
  crimeIndex: 78,
  healthcareIndex: 68,
  educationIndex: 72,
  entertainmentIndex: 72,
  outdoorIndex: 70,
  jobGrowthRate: 0.017,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.17,
  },
  visaRequired: true,
  languageBarrier: 'medium',
  timeZoneOffset: -3,
  expatCommunitySize: 'medium',
};

export const ARGENTINE_CITIES: City[] = [
  BUENOS_AIRES,
  CORDOBA,
  MENDOZA,
  ROSARIO,
];
