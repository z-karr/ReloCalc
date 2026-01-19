import { City } from '../../types';

// ============================================================================
// SINGAPORE (CITY-STATE)
// ============================================================================

export const SINGAPORE: City = {
  id: 'singapore',
  name: 'Singapore',
  country: 'sg',
  countryCode: 'SG',
  latitude: 1.3521,
  longitude: 103.8198,
  population: 5900000,
  costOfLivingIndex: 92,
  medianRent: 2800,
  medianHomePrice: 950000,
  transitScore: 88,
  walkScore: 82,
  climate: 'tropical',
  averageCommute: 35,
  crimeIndex: 25, // Lower is better - one of the safest cities
  healthcareIndex: 98, // World-class healthcare system
  educationIndex: 95, // Top-ranked education
  entertainmentIndex: 90,
  outdoorIndex: 75,
  jobGrowthRate: 0.032,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.20, // CPF (Central Provident Fund) - but typically employer pays
  },
  visaRequired: true,
  languageBarrier: 'none', // English is official language
  timeZoneOffset: 8, // SGT (UTC+8)
  expatCommunitySize: 'large', // ~38% of population are foreign nationals
};

export const SINGAPORE_CITIES: City[] = [
  SINGAPORE,
];
