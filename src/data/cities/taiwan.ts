import { City } from '../../types';

// ============================================================================
// TAIWANESE CITIES
// ============================================================================

export const TAIPEI: City = {
  id: 'taipei',
  name: 'Taipei',
  country: 'tw',
  countryCode: 'TW',
  latitude: 25.0330,
  longitude: 121.5654,
  population: 2600000,
  costOfLivingIndex: 75,
  medianRent: 1200,
  medianHomePrice: 450000,
  transitScore: 92,
  walkScore: 88,
  climate: 'tropical',
  averageCommute: 35,
  crimeIndex: 30, // Lower is better
  healthcareIndex: 93,
  educationIndex: 90,
  entertainmentIndex: 88,
  outdoorIndex: 75,
  jobGrowthRate: 0.024,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.05, // 5% social security
  },
  visaRequired: true,
  languageBarrier: 'high', // Mandarin Chinese primary language
  timeZoneOffset: 8, // CST (UTC+8)
  expatCommunitySize: 'large',
};

export const KAOHSIUNG: City = {
  id: 'kaohsiung',
  name: 'Kaohsiung',
  country: 'tw',
  countryCode: 'TW',
  latitude: 22.6273,
  longitude: 120.3014,
  population: 2800000,
  costOfLivingIndex: 65,
  medianRent: 900,
  medianHomePrice: 320000,
  transitScore: 80,
  walkScore: 75,
  climate: 'tropical',
  averageCommute: 30,
  crimeIndex: 32, // Lower is better
  healthcareIndex: 88,
  educationIndex: 85,
  entertainmentIndex: 75,
  outdoorIndex: 80,
  jobGrowthRate: 0.020,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.05,
  },
  visaRequired: true,
  languageBarrier: 'high',
  timeZoneOffset: 8, // CST (UTC+8)
  expatCommunitySize: 'medium',
};

export const TAICHUNG: City = {
  id: 'taichung',
  name: 'Taichung',
  country: 'tw',
  countryCode: 'TW',
  latitude: 24.1477,
  longitude: 120.6736,
  population: 2800000,
  costOfLivingIndex: 68,
  medianRent: 1000,
  medianHomePrice: 350000,
  transitScore: 75,
  walkScore: 72,
  climate: 'tropical',
  averageCommute: 28,
  crimeIndex: 28, // Lower is better
  healthcareIndex: 90,
  educationIndex: 87,
  entertainmentIndex: 78,
  outdoorIndex: 82,
  jobGrowthRate: 0.022,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.05,
  },
  visaRequired: true,
  languageBarrier: 'high',
  timeZoneOffset: 8, // CST (UTC+8)
  expatCommunitySize: 'medium',
};

export const TAIWANESE_CITIES: City[] = [
  TAIPEI,
  KAOHSIUNG,
  TAICHUNG,
];
