import { City } from '../../types';

// ============================================================================
// UAE CITIES
// ============================================================================

export const DUBAI: City = {
  id: 'dubai',
  name: 'Dubai',
  country: 'ae',
  countryCode: 'AE',
  population: 3600000,
  costOfLivingIndex: 85,
  latitude: 25.2048,
  longitude: 55.2708,
  medianRent: 2200,
  medianHomePrice: 500000,
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

export const UAE_CITIES: City[] = [
  DUBAI,
];
