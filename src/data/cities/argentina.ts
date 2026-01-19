import { City } from '../../types';

// ============================================================================
// ARGENTINE CITIES
// ============================================================================

export const BUENOS_AIRES: City = {
  id: 'buenos-aires',
  name: 'Buenos Aires',
  state: 'Buenos Aires Province',
  country: 'ar',
  countryCode: 'AR',
  population: 3075000,
  latitude: -34.6037,
  longitude: -58.3816,
  costOfLivingIndex: 45, // Very affordable compared to US
  medianRent: 600, // USD equivalent
  medianHomePrice: 120000,
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
  costOfLivingIndex: 38, // Even more affordable
  medianRent: 450,
  medianHomePrice: 90000,
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

export const ARGENTINE_CITIES: City[] = [
  BUENOS_AIRES,
  CORDOBA,
];
