import { City } from '../../types';

// ============================================================================
// SOUTH AFRICAN CITIES
// ============================================================================
// Cost of Living data from Numbeo (January 2026) - Updated
// Tax system: Progressive national tax + social security

export const CAPE_TOWN: City = {
  id: 'cape-town',
  name: 'Cape Town',
  country: 'za',
  countryCode: 'ZA',
  population: 433000,
  costOfLivingIndex: 48, // Updated Jan 2026 (Numbeo: 47.6)
  latitude: -33.9249,
  longitude: 18.4241,
  medianRent: 1090,
  medianHomePrice: 240000,
  stateTaxRate: 0,
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
  costOfLivingIndex: 44, // Updated Jan 2026 (Numbeo: 43.8)
  medianRent: 930,
  medianHomePrice: 196000,
  stateTaxRate: 0,
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

export const DURBAN: City = {
  id: 'durban',
  name: 'Durban',
  country: 'za',
  countryCode: 'ZA',
  latitude: -29.8587,
  longitude: 31.0218,
  population: 595000,
  costOfLivingIndex: 42, // Updated Jan 2026 (Numbeo: 41.7)
  medianRent: 800,
  medianHomePrice: 170000,
  stateTaxRate: 0,
  transitScore: 50,
  walkScore: 58,
  climate: 'temperate',
  averageCommute: 35,
  crimeIndex: 82,
  healthcareIndex: 70,
  educationIndex: 72,
  entertainmentIndex: 72,
  outdoorIndex: 85,
  jobGrowthRate: 0.016,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.01,
  },
  visaRequired: true,
  languageBarrier: 'none',
  timeZoneOffset: 2,
  expatCommunitySize: 'medium',
};

export const PRETORIA: City = {
  id: 'pretoria',
  name: 'Pretoria',
  country: 'za',
  countryCode: 'ZA',
  latitude: -25.7479,
  longitude: 28.2293,
  population: 741000,
  costOfLivingIndex: 43, // Updated Jan 2026 (Numbeo: 42.9)
  medianRent: 850,
  medianHomePrice: 185000,
  stateTaxRate: 0,
  transitScore: 52,
  walkScore: 62,
  climate: 'temperate',
  averageCommute: 38,
  crimeIndex: 85,
  healthcareIndex: 73,
  educationIndex: 74,
  entertainmentIndex: 70,
  outdoorIndex: 72,
  jobGrowthRate: 0.019,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.01,
  },
  visaRequired: true,
  languageBarrier: 'none',
  timeZoneOffset: 2,
  expatCommunitySize: 'medium',
};

export const SOUTH_AFRICAN_CITIES: City[] = [
  CAPE_TOWN,
  JOHANNESBURG,
  DURBAN,
  PRETORIA,
];
