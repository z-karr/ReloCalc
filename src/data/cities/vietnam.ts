import { City } from '../../types';

// ============================================================================
// VIETNAMESE CITIES
// ============================================================================
// Cost of Living data from Numbeo (January 2026) - Updated
// Tax system: Progressive national tax + social security

export const HO_CHI_MINH_CITY: City = {
  id: 'ho-chi-minh-city',
  name: 'Ho Chi Minh City',
  country: 'vn',
  countryCode: 'VN',
  latitude: 10.8231,
  longitude: 106.6297,
  population: 9000000,
  costOfLivingIndex: 42, // Updated Jan 2026 (Numbeo: 41.5)
  medianRent: 710,
  medianHomePrice: 163000,
  stateTaxRate: 0,
  transitScore: 60,
  walkScore: 68,
  climate: 'tropical',
  averageCommute: 40,
  crimeIndex: 52, // Lower is better
  healthcareIndex: 70,
  educationIndex: 72,
  entertainmentIndex: 80,
  outdoorIndex: 65,
  jobGrowthRate: 0.035,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.105, // 10.5% social security
  },
  visaRequired: true,
  languageBarrier: 'high', // Vietnamese primary language
  timeZoneOffset: 7, // ICT (UTC+7)
  expatCommunitySize: 'large',
};

export const HANOI: City = {
  id: 'hanoi',
  name: 'Hanoi',
  country: 'vn',
  countryCode: 'VN',
  latitude: 21.0285,
  longitude: 105.8542,
  population: 8100000,
  costOfLivingIndex: 39, // Updated Jan 2026 (Numbeo: 38.8)
  medianRent: 655,
  medianHomePrice: 142000,
  stateTaxRate: 0,
  transitScore: 55,
  walkScore: 65,
  climate: 'tropical',
  averageCommute: 38,
  crimeIndex: 48, // Lower is better
  healthcareIndex: 72,
  educationIndex: 75,
  entertainmentIndex: 78,
  outdoorIndex: 70,
  jobGrowthRate: 0.032,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.105,
  },
  visaRequired: true,
  languageBarrier: 'high',
  timeZoneOffset: 7, // ICT (UTC+7)
  expatCommunitySize: 'large',
};

export const DA_NANG: City = {
  id: 'da-nang',
  name: 'Da Nang',
  country: 'vn',
  countryCode: 'VN',
  latitude: 16.0544,
  longitude: 108.2022,
  population: 1200000,
  costOfLivingIndex: 36, // Updated Jan 2026 (Numbeo: 36.2)
  medianRent: 600,
  medianHomePrice: 131000,
  stateTaxRate: 0,
  transitScore: 50,
  walkScore: 60,
  climate: 'tropical',
  averageCommute: 30,
  crimeIndex: 45, // Lower is better
  healthcareIndex: 68,
  educationIndex: 70,
  entertainmentIndex: 70,
  outdoorIndex: 85,
  jobGrowthRate: 0.038,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.105,
  },
  visaRequired: true,
  languageBarrier: 'high',
  timeZoneOffset: 7, // ICT (UTC+7)
  expatCommunitySize: 'medium',
};

export const VIETNAMESE_CITIES: City[] = [
  HO_CHI_MINH_CITY,
  HANOI,
  DA_NANG,
];
