import { City } from '../../types';

// ============================================================================
// AUSTRALIAN CITIES
// ============================================================================

export const SYDNEY: City = {
  id: 'sydney',
  name: 'Sydney',
  state: 'New South Wales',
  country: 'au',
  countryCode: 'AU',
  latitude: -33.8688,
  longitude: 151.2093,
  population: 5312000,
  costOfLivingIndex: 75, // Updated Jan 2026 (Numbeo: 74.6)
  medianRent: 2700,
  medianHomePrice: 980000,
  transitScore: 75,
  walkScore: 70,
  climate: 'temperate',
  averageCommute: 35,
  crimeIndex: 48, // Very safe
  healthcareIndex: 95,
  educationIndex: 90,
  entertainmentIndex: 92,
  outdoorIndex: 98, // Beaches, harbor, outdoor lifestyle
  jobGrowthRate: 0.028,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0, // No state income tax in Australia
    socialContributions: 0.02, // Medicare Levy
  },
  visaRequired: true,
  languageBarrier: 'none',
  timeZoneOffset: 11, // AEDT (UTC+11)
  expatCommunitySize: 'large',
};

export const MELBOURNE: City = {
  id: 'melbourne',
  name: 'Melbourne',
  state: 'Victoria',
  country: 'au',
  countryCode: 'AU',
  latitude: -37.8136,
  longitude: 144.9631,
  population: 5078000,
  costOfLivingIndex: 72, // Updated Jan 2026 (Numbeo: 71.5)
  medianRent: 2300,
  medianHomePrice: 800000,
  transitScore: 78,
  walkScore: 72,
  climate: 'temperate',
  averageCommute: 38,
  crimeIndex: 45, // Very safe
  healthcareIndex: 94,
  educationIndex: 92,
  entertainmentIndex: 95, // Arts and culture capital
  outdoorIndex: 85,
  jobGrowthRate: 0.025,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.02,
  },
  visaRequired: true,
  languageBarrier: 'none',
  timeZoneOffset: 11, // AEDT (UTC+11)
  expatCommunitySize: 'large',
};

export const BRISBANE: City = {
  id: 'brisbane',
  name: 'Brisbane',
  state: 'Queensland',
  country: 'au',
  countryCode: 'AU',
  latitude: -27.4698,
  longitude: 153.0251,
  population: 2560000,
  costOfLivingIndex: 66, // Updated Jan 2026 (Numbeo: 65.8)
  medianRent: 1950,
  medianHomePrice: 670000,
  transitScore: 65,
  walkScore: 65,
  climate: 'tropical', // Subtropical
  averageCommute: 32,
  crimeIndex: 50,
  healthcareIndex: 92,
  educationIndex: 88,
  entertainmentIndex: 75,
  outdoorIndex: 92, // Great weather, outdoor activities
  jobGrowthRate: 0.030,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.02,
  },
  visaRequired: true,
  languageBarrier: 'none',
  timeZoneOffset: 10, // AEST (UTC+10)
  expatCommunitySize: 'medium',
};

export const AUSTRALIAN_CITIES: City[] = [
  SYDNEY,
  MELBOURNE,
  BRISBANE,
];
