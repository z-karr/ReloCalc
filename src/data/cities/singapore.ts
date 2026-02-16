import { City } from '../../types';

// ============================================================================
// SINGAPORE (CITY-STATE)
// ============================================================================
// Cost of Living data from Numbeo (January 2026) - Updated
// Tax system: Progressive income tax + CPF (Central Provident Fund)

export const SINGAPORE: City = {
  id: 'singapore',
  name: 'Singapore',
  state: 'Singapore',
  country: 'sg',
  countryCode: 'SG',
  latitude: 1.3521,
  longitude: 103.8198,
  population: 5900000,
  costOfLivingIndex: 88, // Updated Jan 2026 (Numbeo: 88.4)
  medianRent: 2900,
  medianRentLocal: 3885, // ~1.34 SGD/USD
  medianHomePrice: 980000,
  medianHomePriceLocal: 1313200,
  stateTaxRate: 0,
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
