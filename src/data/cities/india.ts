import { City } from '../../types';

// ============================================================================
// INDIAN CITIES
// ============================================================================
// Cost of Living data from Numbeo (January 2026) - Updated
// Tax system: Progressive national tax + EPF

export const MUMBAI: City = {
  id: 'mumbai',
  name: 'Mumbai',
  country: 'in',
  countryCode: 'IN',
  latitude: 19.0760,
  longitude: 72.8777,
  population: 20400000,
  costOfLivingIndex: 34, // Updated Jan 2026 (Numbeo: 34.2)
  medianRent: 710,
  medianHomePrice: 305000,
  stateTaxRate: 0,
  transitScore: 70,
  walkScore: 65,
  climate: 'tropical',
  averageCommute: 50,
  crimeIndex: 58, // Lower is better
  healthcareIndex: 80,
  educationIndex: 82,
  entertainmentIndex: 88, // Bollywood capital, vibrant nightlife
  outdoorIndex: 60,
  jobGrowthRate: 0.045, // Strong tech and finance growth
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.12, // EPF (Employee Provident Fund)
  },
  visaRequired: true,
  languageBarrier: 'low', // English widely spoken in business
  timeZoneOffset: 5.5, // IST (UTC+5:30)
  expatCommunitySize: 'medium',
};

export const DELHI: City = {
  id: 'delhi',
  name: 'Delhi',
  country: 'in',
  countryCode: 'IN',
  latitude: 28.7041,
  longitude: 77.1025,
  population: 32900000,
  costOfLivingIndex: 30, // Updated Jan 2026 (Numbeo: 30.4)
  medianRent: 600,
  medianHomePrice: 261000,
  stateTaxRate: 0,
  transitScore: 75,
  walkScore: 62,
  climate: 'continental',
  averageCommute: 45,
  crimeIndex: 62, // Lower is better
  healthcareIndex: 78,
  educationIndex: 85,
  entertainmentIndex: 85,
  outdoorIndex: 55,
  jobGrowthRate: 0.040,
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.12,
  },
  visaRequired: true,
  languageBarrier: 'low',
  timeZoneOffset: 5.5, // IST (UTC+5:30)
  expatCommunitySize: 'medium',
};

export const BANGALORE: City = {
  id: 'bangalore',
  name: 'Bangalore',
  country: 'in',
  countryCode: 'IN',
  latitude: 12.9716,
  longitude: 77.5946,
  population: 13600000,
  costOfLivingIndex: 32, // Updated Jan 2026 (Numbeo: 32.1)
  medianRent: 655,
  medianHomePrice: 283000,
  stateTaxRate: 0,
  transitScore: 60,
  walkScore: 58,
  climate: 'tropical',
  averageCommute: 55,
  crimeIndex: 52, // Lower is better
  healthcareIndex: 85, // Strong medical facilities
  educationIndex: 88, // Tech education hub
  entertainmentIndex: 82,
  outdoorIndex: 65,
  jobGrowthRate: 0.055, // India's Silicon Valley
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.12,
  },
  visaRequired: true,
  languageBarrier: 'low', // English very common in tech sector
  timeZoneOffset: 5.5, // IST (UTC+5:30)
  expatCommunitySize: 'large', // Major tech expat hub
};

export const HYDERABAD: City = {
  id: 'hyderabad',
  name: 'Hyderabad',
  country: 'in',
  countryCode: 'IN',
  latitude: 17.3850,
  longitude: 78.4867,
  population: 10500000,
  costOfLivingIndex: 28, // Updated Jan 2026 (Numbeo: 28.3)
  medianRent: 545,
  medianHomePrice: 218000,
  stateTaxRate: 0,
  transitScore: 55,
  walkScore: 55,
  climate: 'tropical',
  averageCommute: 48,
  crimeIndex: 50, // Lower is better
  healthcareIndex: 82,
  educationIndex: 85,
  entertainmentIndex: 78,
  outdoorIndex: 60,
  jobGrowthRate: 0.050, // Growing tech hub
  taxRates: {
    type: 'progressive_national',
    regionalRate: 0,
    socialContributions: 0.12,
  },
  visaRequired: true,
  languageBarrier: 'low',
  timeZoneOffset: 5.5, // IST (UTC+5:30)
  expatCommunitySize: 'medium',
};

export const INDIA_CITIES: City[] = [
  MUMBAI,
  DELHI,
  BANGALORE,
  HYDERABAD,
];
