import { City } from '../../types';

// ============================================================================
// CANADIAN CITIES
// ============================================================================

export const TORONTO: City = {
  id: 'toronto',
  name: 'Toronto',
  state: 'Ontario',
  country: 'ca',
  countryCode: 'CA',
  latitude: 43.6532,
  longitude: -79.3832,
  population: 2930000,
  costOfLivingIndex: 89,
  medianRent: 2200,
  medianHomePrice: 750000,
  transitScore: 85,
  walkScore: 80,
  climate: 'continental',
  averageCommute: 35,
  crimeIndex: 75, // Lower is better
  healthcareIndex: 90,
  educationIndex: 88,
  entertainmentIndex: 85,
  outdoorIndex: 70,
  jobGrowthRate: 0.025,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0.09, // Ontario provincial rate
    socialContributions: 0.0761, // CPP + EI combined
  },
  visaRequired: true,
  languageBarrier: 'none',
  timeZoneOffset: -5, // EST
  expatCommunitySize: 'large',
};

export const VANCOUVER: City = {
  id: 'vancouver',
  name: 'Vancouver',
  state: 'British Columbia',
  country: 'ca',
  countryCode: 'CA',
  latitude: 49.2827,
  longitude: -123.1207,
  population: 675000,
  costOfLivingIndex: 94,
  medianRent: 2400,
  medianHomePrice: 950000,
  transitScore: 80,
  walkScore: 82,
  climate: 'temperate',
  averageCommute: 32,
  crimeIndex: 68, // Lower is better
  healthcareIndex: 92,
  educationIndex: 87,
  entertainmentIndex: 88,
  outdoorIndex: 95,
  jobGrowthRate: 0.030,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0.10, // BC provincial rate
    socialContributions: 0.0761,
  },
  visaRequired: true,
  languageBarrier: 'none',
  timeZoneOffset: -8, // PST
  expatCommunitySize: 'large',
};

export const MONTREAL: City = {
  id: 'montreal',
  name: 'Montreal',
  state: 'Quebec',
  country: 'ca',
  countryCode: 'CA',
  latitude: 45.5017,
  longitude: -73.5673,
  population: 1780000,
  costOfLivingIndex: 77,
  medianRent: 1500,
  medianHomePrice: 450000,
  transitScore: 82,
  walkScore: 75,
  climate: 'continental',
  averageCommute: 31,
  crimeIndex: 72, // Lower is better
  healthcareIndex: 88,
  educationIndex: 86,
  entertainmentIndex: 90,
  outdoorIndex: 65,
  jobGrowthRate: 0.020,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0.20, // Quebec has higher provincial taxes
    socialContributions: 0.0761,
  },
  visaRequired: true,
  languageBarrier: 'low', // French is primary, but English widely spoken
  timeZoneOffset: -5, // EST
  expatCommunitySize: 'large',
};

export const CALGARY: City = {
  id: 'calgary',
  name: 'Calgary',
  state: 'Alberta',
  country: 'ca',
  countryCode: 'CA',
  latitude: 51.0447,
  longitude: -114.0719,
  population: 1300000,
  costOfLivingIndex: 84,
  medianRent: 1700,
  medianHomePrice: 500000,
  transitScore: 65,
  walkScore: 60,
  climate: 'continental',
  averageCommute: 28,
  crimeIndex: 65, // Lower is better
  healthcareIndex: 89,
  educationIndex: 85,
  entertainmentIndex: 75,
  outdoorIndex: 85,
  jobGrowthRate: 0.022,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0.10, // Alberta provincial rate
    socialContributions: 0.0761,
  },
  visaRequired: true,
  languageBarrier: 'none',
  timeZoneOffset: -7, // MST
  expatCommunitySize: 'medium',
};

export const CANADIAN_CITIES: City[] = [
  TORONTO,
  VANCOUVER,
  MONTREAL,
  CALGARY,
];
