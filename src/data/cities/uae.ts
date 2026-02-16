import { City } from '../../types';

// ============================================================================
// UAE CITIES
// ============================================================================
// Cost of Living data from Numbeo (January 2026) - Updated
// Tax system: NO income tax (0% flat rate)

export const DUBAI: City = {
  id: 'dubai',
  name: 'Dubai',
  state: 'Dubai',
  country: 'ae',
  countryCode: 'AE',
  population: 3600000,
  costOfLivingIndex: 74, // Updated Jan 2026 (Numbeo: 74.2)
  latitude: 25.2048,
  longitude: 55.2708,
  medianRent: 2300,
  medianRentLocal: 8450, // ~3.67 AED/USD
  medianHomePrice: 520000,
  medianHomePriceLocal: 1908400,
  stateTaxRate: 0,
  transitScore: 70,
  walkScore: 60,
  climate: 'dry',
  averageCommute: 35,
  crimeIndex: 25, // Lower is better - very safe
  healthcareIndex: 88,
  educationIndex: 82,
  entertainmentIndex: 92,
  outdoorIndex: 60,
  jobGrowthRate: 0.035,
  taxRates: {
    type: 'flat_national',
    flatRate: 0, // NO income tax!
    socialInsuranceRate: 0,
  },
  visaRequired: true,
  languageBarrier: 'none', // English widely spoken
  timeZoneOffset: 4, // GST (UTC+4)
  expatCommunitySize: 'large',
};

export const ABU_DHABI: City = {
  id: 'abudhabi',
  name: 'Abu Dhabi',
  state: 'Abu Dhabi',
  country: 'ae',
  countryCode: 'AE',
  population: 1500000,
  costOfLivingIndex: 73, // Updated Jan 2026 (Numbeo: 72.8)
  latitude: 24.4539,
  longitude: 54.3773,
  medianRent: 2100,
  medianRentLocal: 7707, // ~3.67 AED/USD
  medianHomePrice: 480000,
  medianHomePriceLocal: 1761600,
  stateTaxRate: 0,
  transitScore: 65,
  walkScore: 55,
  climate: 'dry',
  averageCommute: 30,
  crimeIndex: 22, // Lower is better - very safe
  healthcareIndex: 90,
  educationIndex: 83,
  entertainmentIndex: 88,
  outdoorIndex: 65,
  jobGrowthRate: 0.032,
  taxRates: {
    type: 'flat_national',
    flatRate: 0, // NO income tax!
    socialInsuranceRate: 0,
  },
  visaRequired: true,
  languageBarrier: 'none', // English widely spoken
  timeZoneOffset: 4, // GST (UTC+4)
  expatCommunitySize: 'large',
};

export const UAE_CITIES: City[] = [
  DUBAI,
  ABU_DHABI,
];
