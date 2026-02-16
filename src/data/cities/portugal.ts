import { City } from '../../types';

// ============================================================================
// PORTUGUESE CITIES
// ============================================================================

export const LISBON: City = {
  id: 'lisbon',
  name: 'Lisbon',
  state: 'Lisbon District',
  country: 'pt',
  countryCode: 'PT',
  latitude: 38.7223,
  longitude: -9.1393,
  population: 545000,
  costOfLivingIndex: 53, // Updated Jan 2026 (Numbeo: 53.4) - More affordable than previously thought
  medianRent: 1200,
  medianHomePrice: 380000,
  transitScore: 80,
  walkScore: 85,
  climate: 'temperate',
  averageCommute: 35,
  crimeIndex: 30,
  healthcareIndex: 80,
  educationIndex: 75,
  entertainmentIndex: 85,
  outdoorIndex: 80,
  jobGrowthRate: 0.025,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.11,
  },
  visaRequired: true,
  languageBarrier: 'low',
  timeZoneOffset: 0, // WET/UTC
  expatCommunitySize: 'large',
};

export const PORTO: City = {
  id: 'porto',
  name: 'Porto',
  state: 'Porto District',
  country: 'pt',
  countryCode: 'PT',
  latitude: 41.1579,
  longitude: -8.6291,
  population: 238000,
  costOfLivingIndex: 49, // Updated Jan 2026 (Numbeo: 48.5) - Very affordable
  medianRent: 950,
  medianHomePrice: 300000,
  transitScore: 75,
  walkScore: 80,
  climate: 'temperate',
  averageCommute: 30,
  crimeIndex: 25,
  healthcareIndex: 78,
  educationIndex: 73,
  entertainmentIndex: 75,
  outdoorIndex: 75,
  jobGrowthRate: 0.020,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.11,
  },
  visaRequired: true,
  languageBarrier: 'low',
  timeZoneOffset: 0, // WET/UTC
  expatCommunitySize: 'medium',
};

export const PORTUGUESE_CITIES: City[] = [
  LISBON,
  PORTO,
];
