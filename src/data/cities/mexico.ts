import { City } from '../../types';

// ============================================================================
// MEXICAN CITIES
// ============================================================================

export const MEXICO_CITY: City = {
  id: 'mexico-city',
  name: 'Mexico City',
  state: 'Mexico City',
  country: 'mx',
  countryCode: 'MX',
  population: 9200000,
  latitude: 19.4326,
  longitude: -99.1332,
  costOfLivingIndex: 55,
  medianRent: 900,
  medianHomePrice: 200000,
  transitScore: 80,
  walkScore: 75,
  climate: 'temperate',
  averageCommute: 45,
  crimeIndex: 70,
  healthcareIndex: 72,
  educationIndex: 75,
  entertainmentIndex: 85,
  outdoorIndex: 70,
  jobGrowthRate: 0.025,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.03,
  },
  visaRequired: false,
  languageBarrier: 'medium',
  timeZoneOffset: -6, // CST
  expatCommunitySize: 'large',
};

export const GUADALAJARA: City = {
  id: 'guadalajara',
  name: 'Guadalajara',
  state: 'Jalisco',
  country: 'mx',
  countryCode: 'MX',
  latitude: 20.6597,
  longitude: -103.3496,
  population: 1500000,
  costOfLivingIndex: 50,
  medianRent: 700,
  medianHomePrice: 150000,
  transitScore: 65,
  walkScore: 70,
  climate: 'temperate',
  averageCommute: 35,
  crimeIndex: 65,
  healthcareIndex: 70,
  educationIndex: 73,
  entertainmentIndex: 75,
  outdoorIndex: 75,
  jobGrowthRate: 0.030,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.03,
  },
  visaRequired: false,
  languageBarrier: 'medium',
  timeZoneOffset: -6, // CST
  expatCommunitySize: 'medium',
};

export const PLAYA_DEL_CARMEN: City = {
  id: 'playa-del-carmen',
  name: 'Playa del Carmen',
  state: 'Quintana Roo',
  country: 'mx',
  countryCode: 'MX',
  latitude: 20.6296,
  longitude: -87.0739,
  population: 300000,
  costOfLivingIndex: 65, // Tourist town, higher COL
  medianRent: 1100,
  medianHomePrice: 250000,
  transitScore: 50,
  walkScore: 80,
  climate: 'tropical',
  averageCommute: 20,
  crimeIndex: 60,
  healthcareIndex: 68,
  educationIndex: 65,
  entertainmentIndex: 80,
  outdoorIndex: 95, // Beach and outdoor activities
  jobGrowthRate: 0.035,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.03,
  },
  visaRequired: false,
  languageBarrier: 'medium',
  timeZoneOffset: -5, // EST
  expatCommunitySize: 'large',
};

export const MEXICAN_CITIES: City[] = [
  MEXICO_CITY,
  GUADALAJARA,
  PLAYA_DEL_CARMEN,
];
