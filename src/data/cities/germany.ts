import { City } from '../../types';

// ============================================================================
// GERMAN CITIES
// ============================================================================

export const BERLIN: City = {
  id: 'berlin',
  name: 'Berlin',
  state: 'Berlin',
  country: 'de',
  countryCode: 'DE',
  latitude: 52.5200,
  longitude: 13.4050,
  population: 3600000,
  costOfLivingIndex: 90, // Updated Jan 2026
  medianRent: 1900, // Updated Jan 2026 - rising rents
  medianHomePrice: 480000, // Updated Jan 2026
  transitScore: 85,
  walkScore: 80,
  climate: 'temperate',
  averageCommute: 32,
  crimeIndex: 45,
  healthcareIndex: 88,
  educationIndex: 90,
  entertainmentIndex: 95, // Rich cultural scene
  outdoorIndex: 75,
  jobGrowthRate: 0.032,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.20,
  },
  visaRequired: true,
  languageBarrier: 'medium',
  timeZoneOffset: 1, // CET (UTC+1)
  expatCommunitySize: 'large',
};

export const MUNICH: City = {
  id: 'munich',
  name: 'Munich',
  state: 'Bavaria',
  country: 'de',
  countryCode: 'DE',
  latitude: 48.1351,
  longitude: 11.5820,
  population: 1500000,
  costOfLivingIndex: 74, // Updated Jan 2026 (Numbeo: 74.1)
  medianRent: 2100,
  medianHomePrice: 720000,
  transitScore: 82,
  walkScore: 75,
  climate: 'temperate',
  averageCommute: 28,
  crimeIndex: 38, // Very safe
  healthcareIndex: 92,
  educationIndex: 93,
  entertainmentIndex: 85,
  outdoorIndex: 88, // Close to Alps
  jobGrowthRate: 0.028,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.20,
  },
  visaRequired: true,
  languageBarrier: 'medium',
  timeZoneOffset: 1, // CET (UTC+1)
  expatCommunitySize: 'medium',
};

export const FRANKFURT: City = {
  id: 'frankfurt',
  name: 'Frankfurt',
  state: 'Hesse',
  country: 'de',
  countryCode: 'DE',
  latitude: 50.1109,
  longitude: 8.6821,
  population: 750000,
  costOfLivingIndex: 74, // Updated Jan 2026 (Numbeo: 74.0)
  medianRent: 1950,
  medianHomePrice: 570000,
  transitScore: 80,
  walkScore: 72,
  climate: 'temperate',
  averageCommute: 30,
  crimeIndex: 42,
  healthcareIndex: 90,
  educationIndex: 88,
  entertainmentIndex: 75,
  outdoorIndex: 70,
  jobGrowthRate: 0.025, // Financial hub
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.20,
  },
  visaRequired: true,
  languageBarrier: 'medium',
  timeZoneOffset: 1, // CET (UTC+1)
  expatCommunitySize: 'large',
};

export const HAMBURG: City = {
  id: 'hamburg',
  name: 'Hamburg',
  state: 'Hamburg',
  country: 'de',
  countryCode: 'DE',
  latitude: 53.5511,
  longitude: 9.9937,
  population: 1800000,
  costOfLivingIndex: 70, // Updated Jan 2026 (Numbeo: 70.3)
  medianRent: 1850,
  medianHomePrice: 520000,
  transitScore: 78,
  walkScore: 74,
  climate: 'temperate',
  averageCommute: 31,
  crimeIndex: 44,
  healthcareIndex: 89,
  educationIndex: 89,
  entertainmentIndex: 82,
  outdoorIndex: 78, // Port city
  jobGrowthRate: 0.027,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.20,
  },
  visaRequired: true,
  languageBarrier: 'medium',
  timeZoneOffset: 1, // CET (UTC+1)
  expatCommunitySize: 'medium',
};

export const GERMAN_CITIES: City[] = [
  BERLIN,
  MUNICH,
  FRANKFURT,
  HAMBURG,
];
