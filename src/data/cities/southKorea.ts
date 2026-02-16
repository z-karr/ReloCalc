import { City } from '../../types';

// ============================================================================
// SOUTH KOREAN CITIES
// ============================================================================
// Cost of Living data from Numbeo (January 2026) - Updated
// Tax system: Progressive national income tax + social security

export const SEOUL: City = {
  id: 'seoul',
  name: 'Seoul',
  state: 'Seoul Capital Area',
  country: 'kr',
  countryCode: 'KR',
  latitude: 37.5665,
  longitude: 126.9780,
  population: 9700000,
  costOfLivingIndex: 82, // Updated Jan 2026 (Numbeo: 82.1)
  medianRent: 1700,
  medianRentLocal: 2210000, // ~1300 KRW/USD
  medianHomePrice: 580000,
  medianHomePriceLocal: 754000000,
  stateTaxRate: 0,
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
  state: 'Gyeongsang',
  country: 'kr',
  countryCode: 'KR',
  latitude: 35.1796,
  longitude: 129.0756,
  population: 3400000,
  costOfLivingIndex: 68, // Updated Jan 2026 (Numbeo: 68.3)
  medianRent: 1150,
  medianRentLocal: 1495000,
  medianHomePrice: 370000,
  medianHomePriceLocal: 481000000,
  stateTaxRate: 0,
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
  state: 'Jeju Island',
  country: 'kr',
  countryCode: 'KR',
  latitude: 33.4996,
  longitude: 126.5312,
  population: 670000,
  costOfLivingIndex: 70, // Updated Jan 2026 (Numbeo: 70.2)
  medianRent: 1250,
  medianRentLocal: 1625000,
  medianHomePrice: 400000,
  medianHomePriceLocal: 520000000,
  stateTaxRate: 0,
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
