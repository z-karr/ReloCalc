import { City } from '../../types';

// ============================================================================
// THAI CITIES
// ============================================================================
// Cost of Living data from Numbeo (January 2026) - Updated
// Tax system: Progressive national tax + social security

export const BANGKOK: City = {
  id: 'bangkok',
  name: 'Bangkok',
  country: 'th',
  countryCode: 'TH',
  latitude: 13.7563,
  longitude: 100.5018,
  population: 10500000,
  costOfLivingIndex: 48, // Updated Jan 2026 (Numbeo: 47.6)
  medianRent: 980,
  medianHomePrice: 305000,
  stateTaxRate: 0,
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
  costOfLivingIndex: 40, // Updated Jan 2026 (Numbeo: 39.8)
  medianRent: 650,
  medianHomePrice: 195000,
  stateTaxRate: 0,
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
  costOfLivingIndex: 50, // Updated Jan 2026 (Numbeo: 49.5)
  medianRent: 1310,
  medianHomePrice: 380000,
  stateTaxRate: 0,
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

export const PATTAYA: City = {
  id: 'pattaya',
  name: 'Pattaya',
  country: 'th',
  countryCode: 'TH',
  latitude: 12.9236,
  longitude: 100.8825,
  population: 120000,
  costOfLivingIndex: 45, // Updated Jan 2026 (Numbeo: 44.8)
  medianRent: 720,
  medianHomePrice: 220000,
  stateTaxRate: 0,
  transitScore: 45,
  walkScore: 58,
  climate: 'tropical',
  averageCommute: 25,
  crimeIndex: 52,
  healthcareIndex: 78,
  educationIndex: 68,
  entertainmentIndex: 82,
  outdoorIndex: 85,
  jobGrowthRate: 0.026,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.05,
  },
  visaRequired: true,
  languageBarrier: 'medium',
  timeZoneOffset: 7,
  expatCommunitySize: 'large',
};

export const THAI_CITIES: City[] = [
  BANGKOK,
  CHIANG_MAI,
  PHUKET,
  PATTAYA,
];
