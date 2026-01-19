import { City } from '../../types';
import { usCities } from './us';
import { ARGENTINE_CITIES } from './argentina';
import { AUSTRALIAN_CITIES } from './australia';
import { CANADIAN_CITIES } from './canada';
import { GERMAN_CITIES } from './germany';
import { JAPANESE_CITIES } from './japan';
import { MEXICAN_CITIES } from './mexico';
import { PORTUGUESE_CITIES } from './portugal';
import { SOUTH_AFRICAN_CITIES } from './southAfrica';
import { SOUTH_KOREAN_CITIES } from './southKorea';
import { TAIWANESE_CITIES } from './taiwan';
import { THAI_CITIES } from './thailand';
import { SINGAPORE_CITIES } from './singapore';
import { INDIA_CITIES } from './india';
import { UAE_CITIES } from './uae';
import { UK_CITIES } from './uk';
import { VIETNAMESE_CITIES } from './vietnam';
import { FRANCE_CITIES } from './france';
import { SPAIN_CITIES } from './spain';
import { ITALY_CITIES } from './italy';
import { NETHERLANDS_CITIES } from './netherlands';
import { IRELAND_CITIES } from './ireland';
import { SWITZERLAND_CITIES } from './switzerland';
import { BELGIUM_CITIES } from './belgium';
import { SWEDEN_CITIES } from './sweden';
import { DENMARK_CITIES } from './denmark';
import { NORWAY_CITIES } from './norway';
import { POLAND_CITIES } from './poland';
import { GREECE_CITIES } from './greece';
import { CZECHIA_CITIES } from './czechia';
import { BRAZIL_CITIES } from './brazil';
import { CHILE_CITIES } from './chile';
import { COSTA_RICA_CITIES } from './costaRica';
import { EL_SALVADOR_CITIES } from './elSalvador';
import { GUATEMALA_CITIES } from './guatemala';
import { CHINA_CITIES } from './china';
import { INDONESIA_CITIES } from './indonesia';
import { PHILIPPINES_CITIES } from './philippines';
import { NEW_ZEALAND_CITIES } from './newZealand';
import { MOROCCO_CITIES } from './morocco';

// ============================================================================
// CITY AGGREGATION
// ============================================================================

// Aggregate all cities from all countries
// As we add more countries in Phase 2, import and add them here
export const allCities: City[] = [
  ...usCities,
  ...ARGENTINE_CITIES,
  ...AUSTRALIAN_CITIES,
  ...CANADIAN_CITIES,
  ...GERMAN_CITIES,
  ...JAPANESE_CITIES,
  ...MEXICAN_CITIES,
  ...PORTUGUESE_CITIES,
  ...SOUTH_AFRICAN_CITIES,
  ...SOUTH_KOREAN_CITIES,
  ...TAIWANESE_CITIES,
  ...THAI_CITIES,
  ...SINGAPORE_CITIES,
  ...INDIA_CITIES,
  ...UAE_CITIES,
  ...UK_CITIES,
  ...VIETNAMESE_CITIES,
  ...FRANCE_CITIES,
  ...SPAIN_CITIES,
  ...ITALY_CITIES,
  ...NETHERLANDS_CITIES,
  ...IRELAND_CITIES,
  ...SWITZERLAND_CITIES,
  ...BELGIUM_CITIES,
  ...SWEDEN_CITIES,
  ...DENMARK_CITIES,
  ...NORWAY_CITIES,
  ...POLAND_CITIES,
  ...GREECE_CITIES,
  ...CZECHIA_CITIES,
  ...BRAZIL_CITIES,
  ...CHILE_CITIES,
  ...COSTA_RICA_CITIES,
  ...EL_SALVADOR_CITIES,
  ...GUATEMALA_CITIES,
  ...CHINA_CITIES,
  ...INDONESIA_CITIES,
  ...PHILIPPINES_CITIES,
  ...NEW_ZEALAND_CITIES,
  ...MOROCCO_CITIES,
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getCityById = (id: string): City | undefined => {
  return allCities.find(city => city.id === id);
};

export const getCitiesByState = (state: string): City[] => {
  return allCities.filter(city => city.state === state);
};

export const getCitiesByCountry = (countryId: string): City[] => {
  return allCities.filter(city => city.country === countryId);
};

export const getCitiesByRegion = (region: string): City[] => {
  // Filter cities by their country's region
  return allCities.filter(city => {
    if (region === 'north_america') {
      return city.country === 'us' || city.country === 'ca';
    }
    if (region === 'latin_america') {
      return city.country === 'ar' || city.country === 'mx' || city.country === 'br' || city.country === 'cl' || city.country === 'cr' || city.country === 'sv' || city.country === 'gt';
    }
    if (region === 'europe') {
      return city.country === 'de' || city.country === 'pt' || city.country === 'gb' || city.country === 'uk' || city.country === 'fr' || city.country === 'es' || city.country === 'it' || city.country === 'nl' || city.country === 'ie' || city.country === 'ch' || city.country === 'be' || city.country === 'se' || city.country === 'dk' || city.country === 'no' || city.country === 'pl' || city.country === 'gr' || city.country === 'cz';
    }
    if (region === 'asia_pacific') {
      return city.country === 'au' || city.country === 'jp' || city.country === 'kr' || city.country === 'tw' || city.country === 'th' || city.country === 'sg' || city.country === 'in' || city.country === 'vn' || city.country === 'cn' || city.country === 'id' || city.country === 'ph' || city.country === 'nz';
    }
    if (region === 'africa') {
      return city.country === 'za' || city.country === 'ma';
    }
    if (region === 'middle_east') {
      return city.country === 'ae';
    }
    // Add more regions as we expand
    return false;
  });
};

export const searchCities = (query: string): City[] => {
  const lowerQuery = query.toLowerCase();
  return allCities.filter(
    city =>
      city.name.toLowerCase().includes(lowerQuery) ||
      (city.state && city.state.toLowerCase().includes(lowerQuery)) ||
      city.country.toLowerCase().includes(lowerQuery)
  );
};

// For backward compatibility, export cities as the main export
export const cities = allCities;
