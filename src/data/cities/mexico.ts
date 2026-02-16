import { City } from '../../types';

// ============================================================================
// MEXICAN CITIES
// ============================================================================
// Cost of Living data from Numbeo (January 2026) - Updated
// Tax system: Progressive national tax + social security

export const MEXICO_CITY: City = {
  id: 'mexico-city',
  name: 'Mexico City',
  state: 'Mexico City',
  country: 'mx',
  countryCode: 'MX',
  population: 9200000,
  latitude: 19.4326,
  longitude: -99.1332,
  costOfLivingIndex: 45, // Updated Jan 2026 (Numbeo: 44.9)
  medianRent: 950,
  medianRentLocal: 16150, // ~17 MXN/USD
  medianHomePrice: 220000,
  medianHomePriceLocal: 3740000,
  stateTaxRate: 0,
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
  costOfLivingIndex: 40, // Updated Jan 2026 (Numbeo: 40.3)
  medianRent: 750,
  medianRentLocal: 12750,
  medianHomePrice: 165000,
  medianHomePriceLocal: 2805000,
  stateTaxRate: 0,
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
  costOfLivingIndex: 50, // Updated Jan 2026 (Numbeo: 49.8) - Tourist town
  medianRent: 1150,
  medianRentLocal: 19550,
  medianHomePrice: 270000,
  medianHomePriceLocal: 4590000,
  stateTaxRate: 0,
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

export const MONTERREY: City = {
  id: 'monterrey',
  name: 'Monterrey',
  state: 'Nuevo León',
  country: 'mx',
  countryCode: 'MX',
  latitude: 25.6866,
  longitude: -100.3161,
  population: 1135000,
  costOfLivingIndex: 43, // Updated Jan 2026 (Numbeo: 42.7)
  medianRent: 800,
  medianRentLocal: 13600,
  medianHomePrice: 180000,
  medianHomePriceLocal: 3060000,
  stateTaxRate: 0,
  transitScore: 55,
  walkScore: 60,
  climate: 'dry',
  averageCommute: 30,
  crimeIndex: 68,
  healthcareIndex: 71,
  educationIndex: 74,
  entertainmentIndex: 72,
  outdoorIndex: 70,
  jobGrowthRate: 0.032,
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

export const MEXICAN_CITIES: City[] = [
  MEXICO_CITY,
  GUADALAJARA,
  PLAYA_DEL_CARMEN,
  MONTERREY,
];
