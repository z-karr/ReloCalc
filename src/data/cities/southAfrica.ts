import { City } from '../../types';

// ============================================================================
// SOUTH AFRICAN CITIES
// ============================================================================

export const CAPE_TOWN: City = {
  id: 'cape-town',
  name: 'Cape Town',
  country: 'za',
  countryCode: 'ZA',
  population: 433000,
  costOfLivingIndex: 52,
  latitude: -33.9249,
  longitude: 18.4241,
  medianRent: 1000,
  medianHomePrice: 220000,
  transitScore: 60,
  walkScore: 65,
  climate: 'temperate',
  averageCommute: 35,
  crimeIndex: 85, // Higher crime index
  healthcareIndex: 75,
  educationIndex: 78,
  entertainmentIndex: 80,
  outdoorIndex: 95,
  jobGrowthRate: 0.018,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.01, // 1% social security
  },
  visaRequired: true,
  languageBarrier: 'none', // English widely spoken
  timeZoneOffset: 2, // SAST (UTC+2)
  expatCommunitySize: 'large',
};

export const JOHANNESBURG: City = {
  id: 'johannesburg',
  name: 'Johannesburg',
  country: 'za',
  countryCode: 'ZA',
  latitude: -26.2041,
  longitude: 28.0473,
  population: 957000,
  costOfLivingIndex: 48,
  medianRent: 850,
  medianHomePrice: 180000,
  transitScore: 55,
  walkScore: 60,
  climate: 'temperate',
  averageCommute: 40,
  crimeIndex: 90, // Higher crime index
  healthcareIndex: 72,
  educationIndex: 75,
  entertainmentIndex: 75,
  outdoorIndex: 70,
  jobGrowthRate: 0.020,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.01,
  },
  visaRequired: true,
  languageBarrier: 'none',
  timeZoneOffset: 2, // SAST (UTC+2)
  expatCommunitySize: 'large',
};

export const SOUTH_AFRICAN_CITIES: City[] = [
  CAPE_TOWN,
  JOHANNESBURG,
];
