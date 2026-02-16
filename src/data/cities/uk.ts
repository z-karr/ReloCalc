import { City } from '../../types';

// ============================================================================
// UK CITIES
// ============================================================================

export const LONDON: City = {
  id: 'london',
  name: 'London',
  country: 'gb',
  countryCode: 'GB',
  latitude: 51.5074,
  longitude: -0.1278,
  population: 9000000,
  costOfLivingIndex: 88, // Updated Jan 2026 (Numbeo: 88.1)
  medianRent: 2750,
  medianHomePrice: 780000,
  transitScore: 95,
  walkScore: 90,
  climate: 'temperate',
  averageCommute: 45,
  crimeIndex: 60, // Lower is better
  healthcareIndex: 92,
  educationIndex: 90,
  entertainmentIndex: 98,
  outdoorIndex: 75,
  jobGrowthRate: 0.025,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.12, // 12% National Insurance
  },
  visaRequired: true,
  languageBarrier: 'none', // English speaking
  timeZoneOffset: 0, // GMT (UTC+0)
  expatCommunitySize: 'large',
};

export const MANCHESTER: City = {
  id: 'manchester',
  name: 'Manchester',
  country: 'gb',
  countryCode: 'GB',
  latitude: 53.4808,
  longitude: -2.2426,
  population: 552000,
  costOfLivingIndex: 69, // Updated Jan 2026 (Numbeo: 68.5)
  medianRent: 1550,
  medianHomePrice: 360000,
  transitScore: 80,
  walkScore: 78,
  climate: 'temperate',
  averageCommute: 32,
  crimeIndex: 65, // Lower is better
  healthcareIndex: 88,
  educationIndex: 85,
  entertainmentIndex: 82,
  outdoorIndex: 70,
  jobGrowthRate: 0.028,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.12,
  },
  visaRequired: true,
  languageBarrier: 'none',
  timeZoneOffset: 0, // GMT (UTC+0)
  expatCommunitySize: 'large',
};

export const EDINBURGH: City = {
  id: 'edinburgh',
  name: 'Edinburgh',
  country: 'gb',
  countryCode: 'GB',
  latitude: 55.9533,
  longitude: -3.1883,
  population: 524000,
  costOfLivingIndex: 72, // Updated Jan 2026 (Numbeo: 72.3)
  medianRent: 1650,
  medianHomePrice: 420000,
  transitScore: 75,
  walkScore: 82,
  climate: 'temperate',
  averageCommute: 30,
  crimeIndex: 55, // Lower is better
  healthcareIndex: 90,
  educationIndex: 92,
  entertainmentIndex: 85,
  outdoorIndex: 85,
  jobGrowthRate: 0.022,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.12,
  },
  visaRequired: true,
  languageBarrier: 'none',
  timeZoneOffset: 0, // GMT (UTC+0)
  expatCommunitySize: 'large',
};

export const BRISTOL: City = {
  id: 'bristol',
  name: 'Bristol',
  country: 'gb',
  countryCode: 'GB',
  latitude: 51.4545,
  longitude: -2.5879,
  population: 467000,
  costOfLivingIndex: 70, // Updated Jan 2026 (Numbeo: 70.1)
  medianRent: 1600,
  medianHomePrice: 430000,
  transitScore: 72,
  walkScore: 75,
  climate: 'temperate',
  averageCommute: 28,
  crimeIndex: 58, // Lower is better
  healthcareIndex: 87,
  educationIndex: 88,
  entertainmentIndex: 80,
  outdoorIndex: 78,
  jobGrowthRate: 0.026,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.12,
  },
  visaRequired: true,
  languageBarrier: 'none',
  timeZoneOffset: 0, // GMT (UTC+0)
  expatCommunitySize: 'large',
};

export const UK_CITIES: City[] = [
  LONDON,
  MANCHESTER,
  EDINBURGH,
  BRISTOL,
];
