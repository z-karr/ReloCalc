import { City } from '../../types';

// ============================================================================
// SOUTH KOREAN CITIES
// ============================================================================

export const SEOUL: City = {
  id: 'seoul',
  name: 'Seoul',
  country: 'kr',
  countryCode: 'KR',
  latitude: 37.5665,
  longitude: 126.9780,
  population: 9700000,
  costOfLivingIndex: 90,
  medianRent: 1600,
  medianHomePrice: 550000,
  transitScore: 95,
  walkScore: 85,
  climate: 'continental',
  averageCommute: 42,
  crimeIndex: 35, // Lower is better
  healthcareIndex: 95,
  educationIndex: 92,
  entertainmentIndex: 90,
  outdoorIndex: 70,
  jobGrowthRate: 0.028,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.09, // 9% social security
  },
  visaRequired: true,
  languageBarrier: 'high', // Korean primary language
  timeZoneOffset: 9, // KST (UTC+9)
  expatCommunitySize: 'large',
};

export const BUSAN: City = {
  id: 'busan',
  name: 'Busan',
  country: 'kr',
  countryCode: 'KR',
  latitude: 35.1796,
  longitude: 129.0756,
  population: 3400000,
  costOfLivingIndex: 75,
  medianRent: 1100,
  medianHomePrice: 350000,
  transitScore: 85,
  walkScore: 75,
  climate: 'temperate',
  averageCommute: 35,
  crimeIndex: 30, // Lower is better
  healthcareIndex: 90,
  educationIndex: 88,
  entertainmentIndex: 80,
  outdoorIndex: 85,
  jobGrowthRate: 0.022,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.09,
  },
  visaRequired: true,
  languageBarrier: 'high',
  timeZoneOffset: 9, // KST (UTC+9)
  expatCommunitySize: 'medium',
};

export const JEJU: City = {
  id: 'jeju',
  name: 'Jeju',
  country: 'kr',
  countryCode: 'KR',
  latitude: 33.4996,
  longitude: 126.5312,
  population: 670000,
  costOfLivingIndex: 78,
  medianRent: 1200,
  medianHomePrice: 380000,
  transitScore: 50,
  walkScore: 55,
  climate: 'temperate',
  averageCommute: 25,
  crimeIndex: 25, // Lower is better
  healthcareIndex: 85,
  educationIndex: 82,
  entertainmentIndex: 70,
  outdoorIndex: 95,
  jobGrowthRate: 0.025,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.09,
  },
  visaRequired: true,
  languageBarrier: 'high',
  timeZoneOffset: 9, // KST (UTC+9)
  expatCommunitySize: 'small',
};

export const SOUTH_KOREAN_CITIES: City[] = [
  SEOUL,
  BUSAN,
  JEJU,
];
