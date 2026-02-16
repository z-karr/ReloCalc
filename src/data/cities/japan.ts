import { City } from '../../types';

// ============================================================================
// JAPANESE CITIES
// ============================================================================

export const TOKYO: City = {
  id: 'tokyo',
  name: 'Tokyo',
  state: 'Tokyo',
  country: 'jp',
  countryCode: 'JP',
  latitude: 35.6762,
  longitude: 139.6503,
  population: 14000000,
  costOfLivingIndex: 75, // Updated Jan 2026 - weak yen makes Tokyo affordable
  medianRent: 2000, // Updated Jan 2026 - lower due to yen weakness
  medianHomePrice: 550000, // Updated Jan 2026
  transitScore: 95,
  walkScore: 85,
  climate: 'temperate',
  averageCommute: 45,
  crimeIndex: 25, // Very safe
  healthcareIndex: 95,
  educationIndex: 92,
  entertainmentIndex: 98, // World-class entertainment
  outdoorIndex: 70,
  jobGrowthRate: 0.020,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.15,
  },
  visaRequired: true,
  languageBarrier: 'high',
  timeZoneOffset: 9, // JST (UTC+9)
  expatCommunitySize: 'large',
};

export const OSAKA: City = {
  id: 'osaka',
  name: 'Osaka',
  state: 'Osaka',
  country: 'jp',
  countryCode: 'JP',
  latitude: 34.6937,
  longitude: 135.5023,
  population: 2700000,
  costOfLivingIndex: 68, // Updated Jan 2026 - weak yen effect
  medianRent: 1500, // Updated Jan 2026
  medianHomePrice: 380000, // Updated Jan 2026
  transitScore: 90,
  walkScore: 82,
  climate: 'temperate',
  averageCommute: 38,
  crimeIndex: 28,
  healthcareIndex: 93,
  educationIndex: 90,
  entertainmentIndex: 92,
  outdoorIndex: 68,
  jobGrowthRate: 0.018,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.15,
  },
  visaRequired: true,
  languageBarrier: 'high',
  timeZoneOffset: 9, // JST (UTC+9)
  expatCommunitySize: 'medium',
};

export const KYOTO: City = {
  id: 'kyoto',
  name: 'Kyoto',
  state: 'Kyoto',
  country: 'jp',
  countryCode: 'JP',
  latitude: 35.0116,
  longitude: 135.7681,
  population: 1500000,
  costOfLivingIndex: 63, // Updated Jan 2026 - weak yen effect
  medianRent: 1300, // Updated Jan 2026
  medianHomePrice: 350000, // Updated Jan 2026
  transitScore: 85,
  walkScore: 80,
  climate: 'temperate',
  averageCommute: 32,
  crimeIndex: 22, // Very safe, traditional city
  healthcareIndex: 91,
  educationIndex: 91,
  entertainmentIndex: 85,
  outdoorIndex: 82, // Historic temples, nature
  jobGrowthRate: 0.015,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.15,
  },
  visaRequired: true,
  languageBarrier: 'high',
  timeZoneOffset: 9, // JST (UTC+9)
  expatCommunitySize: 'small',
};

export const FUKUOKA: City = {
  id: 'fukuoka',
  name: 'Fukuoka',
  state: 'Fukuoka',
  country: 'jp',
  countryCode: 'JP',
  latitude: 33.5904,
  longitude: 130.4017,
  population: 1600000,
  costOfLivingIndex: 58, // Updated Jan 2026 - weak yen effect
  medianRent: 1100, // Updated Jan 2026
  medianHomePrice: 280000, // Updated Jan 2026
  transitScore: 82,
  walkScore: 75,
  climate: 'temperate',
  averageCommute: 30,
  crimeIndex: 26,
  healthcareIndex: 90,
  educationIndex: 88,
  entertainmentIndex: 80,
  outdoorIndex: 78,
  jobGrowthRate: 0.022, // Growing tech hub
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.15,
  },
  visaRequired: true,
  languageBarrier: 'high',
  timeZoneOffset: 9, // JST (UTC+9)
  expatCommunitySize: 'small',
};

export const JAPANESE_CITIES: City[] = [
  TOKYO,
  OSAKA,
  KYOTO,
  FUKUOKA,
];
