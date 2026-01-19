import { City } from '../../types';

// ============================================================================
// THAI CITIES
// ============================================================================

export const BANGKOK: City = {
  id: 'bangkok',
  name: 'Bangkok',
  country: 'th',
  countryCode: 'TH',
  latitude: 13.7563,
  longitude: 100.5018,
  population: 10500000,
  costOfLivingIndex: 58,
  medianRent: 900,
  medianHomePrice: 280000,
  transitScore: 75,
  walkScore: 70,
  climate: 'tropical',
  averageCommute: 45,
  crimeIndex: 55, // Lower is better
  healthcareIndex: 85,
  educationIndex: 78,
  entertainmentIndex: 92,
  outdoorIndex: 65,
  jobGrowthRate: 0.030,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.05, // 5% social security
  },
  visaRequired: true,
  languageBarrier: 'medium', // Thai primary, English common in business
  timeZoneOffset: 7, // ICT (UTC+7)
  expatCommunitySize: 'large',
};

export const CHIANG_MAI: City = {
  id: 'chiang-mai',
  name: 'Chiang Mai',
  country: 'th',
  countryCode: 'TH',
  latitude: 18.7883,
  longitude: 98.9853,
  population: 131000,
  costOfLivingIndex: 48,
  medianRent: 600,
  medianHomePrice: 180000,
  transitScore: 50,
  walkScore: 60,
  climate: 'tropical',
  averageCommute: 25,
  crimeIndex: 45, // Lower is better
  healthcareIndex: 80,
  educationIndex: 72,
  entertainmentIndex: 75,
  outdoorIndex: 90,
  jobGrowthRate: 0.025,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.05,
  },
  visaRequired: true,
  languageBarrier: 'medium',
  timeZoneOffset: 7, // ICT (UTC+7)
  expatCommunitySize: 'large',
};

export const PHUKET: City = {
  id: 'phuket',
  name: 'Phuket',
  country: 'th',
  countryCode: 'TH',
  latitude: 7.8804,
  longitude: 98.3923,
  population: 416000,
  costOfLivingIndex: 70,
  medianRent: 1200,
  medianHomePrice: 350000,
  transitScore: 40,
  walkScore: 55,
  climate: 'tropical',
  averageCommute: 30,
  crimeIndex: 50, // Lower is better
  healthcareIndex: 82,
  educationIndex: 70,
  entertainmentIndex: 85,
  outdoorIndex: 95,
  jobGrowthRate: 0.028,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.05,
  },
  visaRequired: true,
  languageBarrier: 'medium',
  timeZoneOffset: 7, // ICT (UTC+7)
  expatCommunitySize: 'large',
};

export const THAI_CITIES: City[] = [
  BANGKOK,
  CHIANG_MAI,
  PHUKET,
];
