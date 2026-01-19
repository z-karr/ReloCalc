// Main cities export - re-exports from new modular structure
// This file maintains backward compatibility with existing imports

export {
  allCities as cities,
  getCityById,
  getCitiesByState,
  getCitiesByCountry,
  getCitiesByRegion,
  searchCities,
} from './cities/index';
