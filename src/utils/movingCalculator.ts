import { MovingEstimate, HomeSize, MovingMethod, RelocationExpense, ExpenseCategory, City, MoveType, ContainerSize } from '../types';
import { getCountryById } from '../data/countries';

// Typical volume of household belongings (cubic feet) - NOT total home size
// Based on industry moving standards for actual belongings that need to be moved
const HOME_SIZE_VOLUME: Record<HomeSize, number> = {
  studio: 400,       // ~200-400 cu ft of belongings
  '1br': 650,        // ~500-800 cu ft of belongings
  '2br': 1050,       // ~900-1200 cu ft of belongings
  '3br': 1600,       // ~1400-1800 cu ft of belongings
  '4br': 2500,       // ~2200-2800 cu ft of belongings
  house_small: 3500, // ~3000-4000 cu ft of belongings (2000-2500 sq ft home)
  house_large: 6000, // ~5000-7000 cu ft of belongings (3000+ sq ft home)
};

// ============================================================================
// WEIGHT ESTIMATES (2025-2026 Industry Data)
// ============================================================================
// Based on research from Allied Van Lines, Coleman Allied, MoveBuddha, and industry standards
// Rule of thumb: 1,000-1,500 lbs per full-size room
// Sources: https://www.movebuddha.com, https://www.movers-wa.com, https://safeshipmoving.com
const HOME_SIZE_WEIGHT: Record<HomeSize, number> = {
  studio: 2000,       // 1,500-2,500 lbs typical
  '1br': 3000,        // 2,500-3,500 lbs typical
  '2br': 5000,        // 3,500-5,000 lbs (apartment) to 5,000-7,000 lbs (house)
  '3br': 8000,        // 7,000-10,000 lbs typical
  '4br': 12000,       // 10,000-15,000 lbs typical
  house_small: 10000, // Similar to 4BR apartment
  house_large: 16000, // 14,000-18,000 lbs typical
};

// Convert cubic feet to cubic meters (for international shipping)
const CUBIC_FEET_TO_CBM = 0.0283168;

// Container capacities in cubic meters
const CONTAINER_CAPACITIES = {
  minimalist: 0,      // Suitcases only
  lcl: 15,            // 5-15 CBM typical LCL shipment
  '20ft': 30,         // 20ft container = ~30 CBM
  '40ft': 67.7,       // 40ft container = ~67.7 CBM
};

// Weight per cubic foot (average household goods)
const LBS_PER_CUBIC_FOOT = 7;

// ============================================================================
// FULL-SERVICE MOVING COSTS (2025-2026 Industry Data)
// ============================================================================
// Based on research from ConsumerAffairs, Angi, Allied Van Lines, MoveBuddha
// Long-distance movers charge $0.50-$0.80 per pound, with rate scaling by distance
// Sources: https://www.movebuddha.com, https://www.angi.com, https://www.allied.com
//
// Market rate validation (2025-2026):
// - 2BR (5,000 lbs) at 500 mi: $2,300-$3,650 → our formula: ~$3,200
// - 2BR (5,000 lbs) at 1,000 mi: $3,500-$5,500 → our formula: ~$4,000
// - 3BR (8,000 lbs) at 1,000 mi: $4,500-$7,750 → our formula: ~$6,400
const FULL_SERVICE_BASE_RATE_PER_LB = 0.50;  // Base rate per pound (short distance)
const FULL_SERVICE_DISTANCE_RATE_SCALE = 0.30;  // Additional rate per lb at 2000+ miles
const FULL_SERVICE_DISTANCE_SCALE_MILES = 2000; // Distance at which max rate applies
const BASE_PICKUP_DELIVERY_FEE = 500; // Base fee for pickup and delivery
const FUEL_SURCHARGE_PER_MILE = 0.50; // Fuel surcharge (typical 15-20% of base)
const MINIMUM_FULL_SERVICE_COST = 1800; // Minimum for any full-service long-distance move

// Local vs long-distance threshold (industry standard: 50 miles)
const LOCAL_MOVE_THRESHOLD = 50; // miles

// Local moving hourly rates (for moves under 50 miles)
// Based on 2025-2026 industry averages: $80/hour per mover
const LOCAL_MOVERS_HOURLY_PER_PERSON = 80; // Per mover per hour
const LOCAL_TRAVEL_TIME_CHARGE = 80; // 1 extra hour typical for travel time
const LOCAL_MINIMUM_HOURS = 2; // 2-3 hour minimum typical

// Local move time estimates by home size (in hours)
// Based on actual industry data from Two Men and a Truck, HomeAdvisor, etc.
const LOCAL_MOVE_HOURS: Record<HomeSize, { min: number; max: number; crew: number }> = {
  studio: { min: 2, max: 3, crew: 2 },        // 2-3 hours, 2-person crew
  '1br': { min: 3, max: 4, crew: 2 },         // 3-4 hours, 2-person crew
  '2br': { min: 4, max: 5, crew: 2 },         // 4-5 hours, 2-3 person crew
  '3br': { min: 7, max: 8, crew: 3 },         // 7-8 hours, 3-4 person crew
  '4br': { min: 9, max: 10, crew: 4 },        // 9-10 hours, 4-person crew
  house_small: { min: 10, max: 11, crew: 4 }, // 10-11 hours, 4-person crew
  house_large: { min: 11, max: 12, crew: 4 }, // 11-12 hours, 4-5 person crew
};

// ============================================================================
// TRUCK RENTAL COSTS (U-Haul, Budget, Penske) - 2025-2026 Data
// ============================================================================
// Based on research from HireAHelper, U-Haul, and industry data
// Sources: https://blog.hireahelper.com/how-much-does-a-u-haul-really-cost-we-found-out/
//
// LOCAL moves: Daily rate + per-mile charge
// LONG-DISTANCE (one-way): Flat rate with mileage included
//
// Market rate validation (2025-2026):
// - 1,400 mi (2BR/15' truck): ~$1,946 total with fuel
// - 2,400 mi (2BR/15' truck): ~$2,949 total with fuel

// Local in-town rates (daily + mileage)
const TRUCK_RENTAL_LOCAL_COSTS: Record<string, number> = {
  small: 19.95,   // 10-12 ft (studio-1BR) - U-Haul pickup/cargo van
  medium: 29.95,  // 15 ft (2BR) - U-Haul 15ft
  large: 39.95,   // 20 ft (3BR) - U-Haul 20ft
  xlarge: 49.95,  // 26 ft (4BR+/house) - U-Haul 26ft
};

// Local per-mile rates (2025-2026)
const TRUCK_MILEAGE_RATE_LOCAL = 0.99; // U-Haul average: $0.79-$1.19/mile

// Long-distance ONE-WAY rates (includes mileage allowance)
// These are FLAT RATES based on distance, not daily + mileage
// Based on actual U-Haul quotes from research
const TRUCK_ONEWAY_BASE: Record<string, number> = {
  small: 400,    // 10 ft base for ~250 miles
  medium: 500,   // 15 ft base for ~250 miles
  large: 600,    // 20 ft base for ~250 miles
  xlarge: 700,   // 26 ft base for ~250 miles
};
const TRUCK_ONEWAY_PER_MILE: Record<string, number> = {
  small: 0.70,   // 10 ft: increases ~$0.70/mile beyond base
  medium: 0.85,  // 15 ft: increases ~$0.85/mile beyond base
  large: 0.95,   // 20 ft: increases ~$0.95/mile beyond base
  xlarge: 1.10,  // 26 ft: increases ~$1.10/mile beyond base
};

const ENVIRONMENTAL_FEE = 5; // Per rental (typical $1-$5)

// ============================================================================
// CONTAINER SERVICE COSTS (PODS, U-Pack, SMARTBOX) - 2025-2026 Data
// ============================================================================
// Based on research from MoveBuddha, HireAHelper, and real customer data
// Sources: https://www.movebuddha.com/blog/pods-cost/, https://blog.hireahelper.com
//
// KEY INSIGHT: Transport cost is PER-SHIPMENT, not per-container!
// PODS charges container fees + a single transport fee regardless of container count
//
// Market rate validation (2025-2026):
// - 500 miles: $2,401-$3,842 → our formula: ~$2,800
// - 1,000 miles: $2,881-$4,802 → our formula: ~$3,500
// - Cross-country: $3,000-$7,500 → our formula: ~$4,500-$5,500

// Local moves (<50 miles): Flat rate structure
const CONTAINER_LOCAL_BASE_COSTS: Record<string, number> = {
  studio: 350,       // 8-ft container: $220-$426
  '1br': 450,        // 8-12 ft container
  '2br': 600,        // 12-16 ft container: $294-$813
  '3br': 750,        // 16 ft container or 2x smaller
  '4br': 900,        // Multiple containers
  house_small: 1000, // Multiple containers
  house_large: 1200, // Multiple containers
};

// Per-container fees (delivery + pickup + 1 month storage)
// Based on PODS pricing: $88 delivery/pickup + $150-$350 storage
const CONTAINER_FEE_PER_UNIT: Record<HomeSize, { containers: number; feePerContainer: number }> = {
  studio: { containers: 1, feePerContainer: 300 },
  '1br': { containers: 1, feePerContainer: 350 },
  '2br': { containers: 2, feePerContainer: 350 },
  '3br': { containers: 2, feePerContainer: 400 },
  '4br': { containers: 3, feePerContainer: 400 },
  house_small: { containers: 3, feePerContainer: 400 },
  house_large: { containers: 4, feePerContainer: 400 },
};

// Transport pricing - THIS IS PER-SHIPMENT, NOT per-container
// Based on per-mile rates from real customer data: $1.50-$3.85/mile
const CONTAINER_TRANSPORT_BASE = 800; // Base transport fee
const CONTAINER_TRANSPORT_PER_MILE_TIERS = [
  { maxMiles: 500, costPerMile: 3.50 },   // Higher rate for shorter moves
  { maxMiles: 1000, costPerMile: 2.75 },  // Medium distance
  { maxMiles: 2000, costPerMile: 2.00 },  // Long distance
  { maxMiles: Infinity, costPerMile: 1.50 }, // Cross-country efficiency
];

// Packing supplies (more detailed estimate)
const PACKING_COST_PER_CUBIC_FT = 0.65; // Boxes, tape, bubble wrap, paper

// ============================================================================
// COUNTRY-SPECIFIC DOMESTIC MOVING COSTS
// ============================================================================

// Australia-specific constants (based on 2025-2026 research)
const AUSTRALIA_VOLUME_M3: Record<HomeSize, number> = {
  studio: 10,         // 8-12 m³
  '1br': 14.5,        // 12-17 m³
  '2br': 21.5,        // 18-25 m³
  '3br': 32.5,        // 25-40 m³
  '4br': 52.5,        // 40-65 m³
  house_small: 70,    // Estimated
  house_large: 100,   // Estimated
};

const AUSTRALIA_COST_PER_M3 = 176.78; // Average professional mover rate (AUD)
const AUSTRALIA_FUEL_LEVY_THRESHOLD_KM = 80;
const AUSTRALIA_FUEL_LEVY_RATE = 0.20; // 20% for distances >80km
const AUSTRALIA_TRUCK_RENTAL_PER_DAY = 225; // AUD average
const AUSTRALIA_FUEL_CONSUMPTION_L_PER_100KM = 22; // Diesel truck consumption
const AUSTRALIA_DIESEL_PRICE_PER_L = 1.83; // AUD per litre (2025 average)

// Canada-specific constants (based on 2025-2026 research)
const CANADA_COST_PER_KM_LONG_DISTANCE = 2.5; // CAD per km for >100km
const CANADA_CROSS_PROVINCE_FEE = 1000; // CAD for interprovincial moves
const CANADA_LOCAL_HOURLY_2_MOVERS = 160; // CAD per hour (2 movers + truck)
const CANADA_LOCAL_HOURLY_3_MOVERS = 215; // CAD per hour (3 movers + truck)
const CANADA_TRUCK_RENTAL_BASE = 100; // CAD for local
const CANADA_TRUCK_RENTAL_LONG_DISTANCE = 2500; // CAD base for cross-country
const CANADA_FUEL_CONSUMPTION_L_PER_100KM = 23.5; // ~10 mpg converted
const CANADA_FUEL_PRICE_PER_L = 1.49; // CAD per litre (2025 average)
const CANADA_CONTAINER_LOCAL = 749; // CAD average PODS local
const CANADA_CONTAINER_MEDIUM_DISTANCE = 2500; // CAD for 500-1000km
const CANADA_CONTAINER_LONG_DISTANCE = 3200; // CAD for >1000km

// UK-specific constants (based on 2025-2026 research)
const UK_BASE_COST_BY_HOME: Record<HomeSize, number> = {
  studio: 80,         // GBP for local move
  '1br': 140,
  '2br': 230,
  '3br': 350,
  '4br': 500,
  house_small: 650,
  house_large: 900,
};

const UK_COST_PER_MILE_SHORT = 4.0; // GBP per mile (<50 miles)
const UK_COST_PER_MILE_LONG = 3.0; // GBP per mile (>50 miles)
const UK_VAN_HIRE_PER_DAY = 70; // GBP average
const UK_VAN_MPG = 20; // Loaded Luton van
const UK_DIESEL_PRICE_PER_L = 1.43; // GBP per litre (Jan 2026)
const UK_MAN_WITH_VAN_HOURLY = 50; // GBP average (£30-60 range)
const UK_LOCAL_THRESHOLD_MILES = 10;

// ============================================================================
// REGIONAL PRICING SYSTEM
// ============================================================================

// Regional groups for pricing
export type RegionalGroup =
  | 'north_america'
  | 'europe_high_cost'
  | 'europe_western'
  | 'europe_southern_eastern'
  | 'asia_developed'
  | 'asia_emerging'
  | 'latin_america'
  | 'middle_east'
  | 'africa'
  | 'oceania';

// Map countries to regional pricing groups
const COUNTRY_TO_REGION: Record<string, RegionalGroup> = {
  // North America
  'us': 'north_america',
  'ca': 'north_america',

  // Europe - High Cost
  'ch': 'europe_high_cost', // Switzerland
  'no': 'europe_high_cost', // Norway
  'se': 'europe_high_cost', // Sweden
  'dk': 'europe_high_cost', // Denmark

  // Europe - Western
  'fr': 'europe_western', // France
  'de': 'europe_western', // Germany
  'nl': 'europe_western', // Netherlands
  'be': 'europe_western', // Belgium
  'ie': 'europe_western', // Ireland
  'at': 'europe_western', // Austria
  'gb': 'europe_western', // UK (using Western Europe pricing, already has specific calc)
  'au': 'oceania', // Australia (already has specific calc)

  // Europe - Southern/Eastern
  'es': 'europe_southern_eastern', // Spain
  'it': 'europe_southern_eastern', // Italy
  'pt': 'europe_southern_eastern', // Portugal
  'gr': 'europe_southern_eastern', // Greece
  'pl': 'europe_southern_eastern', // Poland
  'cz': 'europe_southern_eastern', // Czech Republic

  // Asia - Developed
  'jp': 'asia_developed', // Japan
  'kr': 'asia_developed', // South Korea
  'sg': 'asia_developed', // Singapore
  'tw': 'asia_developed', // Taiwan

  // Asia - Emerging
  'in': 'asia_emerging', // India
  'cn': 'asia_emerging', // China
  'th': 'asia_emerging', // Thailand
  'vn': 'asia_emerging', // Vietnam
  'id': 'asia_emerging', // Indonesia
  'ph': 'asia_emerging', // Philippines

  // Latin America
  'mx': 'latin_america', // Mexico
  'br': 'latin_america', // Brazil
  'ar': 'latin_america', // Argentina
  'cl': 'latin_america', // Chile
  'cr': 'latin_america', // Costa Rica
  'sv': 'latin_america', // El Salvador
  'gt': 'latin_america', // Guatemala

  // Middle East
  'ae': 'middle_east', // UAE
  'ma': 'middle_east', // Morocco (could also be Africa, but pricing more similar to Middle East)

  // Africa
  'za': 'africa', // South Africa

  // Oceania
  'nz': 'oceania', // New Zealand
};

// Exchange rates (relative to USD, as of January 2026)
// These should be updated periodically or fetched from an API
const EXCHANGE_RATES: Record<string, number> = {
  'USD': 1.00,    // US Dollar (base)
  'CAD': 1.35,    // Canadian Dollar
  'EUR': 0.92,    // Euro
  'GBP': 0.79,    // British Pound
  'AUD': 1.52,    // Australian Dollar
  'NZD': 1.63,    // New Zealand Dollar
  'CHF': 0.88,    // Swiss Franc
  'NOK': 10.50,   // Norwegian Krone
  'SEK': 10.30,   // Swedish Krona
  'DKK': 6.85,    // Danish Krone
  'JPY': 150.00,  // Japanese Yen
  'KRW': 1320.00, // South Korean Won
  'SGD': 1.34,    // Singapore Dollar
  'TWD': 31.50,   // Taiwan Dollar
  'INR': 83.00,   // Indian Rupee
  'CNY': 7.20,    // Chinese Yuan
  'THB': 35.00,   // Thai Baht
  'VND': 24500.00,// Vietnamese Dong
  'IDR': 15800.00,// Indonesian Rupiah
  'PHP': 56.00,   // Philippine Peso
  'MXN': 17.00,   // Mexican Peso
  'BRL': 5.00,    // Brazilian Real
  'ARS': 850.00,  // Argentine Peso
  'CLP': 950.00,  // Chilean Peso
  'CRC': 520.00,  // Costa Rican Colón
  'AED': 3.67,    // UAE Dirham
  'ZAR': 18.50,   // South African Rand
  'MAD': 10.00,   // Moroccan Dirham
};

// Get currency code for a country
const getCurrencyForCountry = (countryId: string): string => {
  const currencyMap: Record<string, string> = {
    'us': 'USD', 'ca': 'CAD',
    'gb': 'GBP', 'ie': 'EUR', 'au': 'AUD', 'nz': 'NZD',
    'fr': 'EUR', 'de': 'EUR', 'nl': 'EUR', 'be': 'EUR', 'es': 'EUR',
    'it': 'EUR', 'pt': 'EUR', 'gr': 'EUR', 'at': 'EUR',
    'ch': 'CHF', 'no': 'NOK', 'se': 'SEK', 'dk': 'DKK',
    'pl': 'PLN', 'cz': 'CZK',
    'jp': 'JPY', 'kr': 'KRW', 'sg': 'SGD', 'tw': 'TWD',
    'in': 'INR', 'cn': 'CNY', 'th': 'THB', 'vn': 'VND',
    'id': 'IDR', 'ph': 'PHP',
    'mx': 'MXN', 'br': 'BRL', 'ar': 'ARS', 'cl': 'CLP', 'cr': 'CRC',
    'sv': 'USD', 'gt': 'GTQ',
    'ae': 'AED', 'ma': 'MAD', 'za': 'ZAR',
  };
  return currencyMap[countryId] || 'USD';
};

// Convert currency
const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) return amount;

  const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
  const toRate = EXCHANGE_RATES[toCurrency] || 1;

  // Convert to USD first, then to target currency
  const amountInUSD = amount / fromRate;
  return amountInUSD * toRate;
};

/**
 * Calculate moving costs using regional pricing formulas
 * Returns cost in LOCAL currency
 */
const calculateRegionalMovingCost = (
  region: RegionalGroup,
  countryId: string,
  distanceKm: number,
  homeSize: HomeSize,
  movingMethod: MovingMethod
): number => {
  const volumeM3 = AUSTRALIA_VOLUME_M3[homeSize]; // Use same volume estimates globally

  // NORTH AMERICA - Use existing US/Canada specific calculators
  if (region === 'north_america') {
    // This will be handled by existing country-specific calculators
    return 0; // Placeholder
  }

  // EUROPE - HIGH COST (Switzerland, Norway, Sweden, Denmark)
  if (region === 'europe_high_cost') {
    if (movingMethod === 'diy') {
      // DIY available in Denmark, limited elsewhere
      const truckCost = 100; // EUR per day average
      const days = distanceKm > 300 ? 2 : 1;
      const fuelCost = (distanceKm / 100) * 12 * 1.80; // 12L/100km, €1.80/L
      return (truckCost * days) + fuelCost + 80; // +equipment
    }
    // Professional: Hourly-based, high labor costs
    const hourlyRate = 175; // EUR average (150-200)
    const hours = Math.max(4, Math.ceil(volumeM3 / 3)); // ~3m³ per hour estimate
    const distanceSurcharge = distanceKm > 50 ? (distanceKm * 1.5) : 0;
    return (hourlyRate * hours) + distanceSurcharge;
  }

  // EUROPE - WESTERN (France, Germany, Netherlands, Belgium, Ireland)
  if (region === 'europe_western') {
    if (movingMethod === 'diy') {
      const truckCost = 80; // EUR per day average
      const days = distanceKm > 300 ? 2 : 1;
      const fuelCost = (distanceKm / 100) * 10 * 1.60; // 10L/100km, €1.60/L
      return (truckCost * days) + fuelCost + 60;
    }
    // Professional: Volume-based OR hourly
    if (distanceKm < 50) {
      // Local: hourly
      const hourlyRate = 120; // EUR average (100-140)
      const hours = Math.max(4, Math.ceil(volumeM3 / 3.5));
      return hourlyRate * hours;
    }
    // Long distance: volume-based
    const ratePerM3 = 100; // EUR/m³ average (80-120)
    return volumeM3 * ratePerM3;
  }

  // EUROPE - SOUTHERN/EASTERN (Spain, Italy, Portugal, Greece, Poland, Czech)
  if (region === 'europe_southern_eastern') {
    if (movingMethod === 'diy') {
      const truckCost = 60; // EUR per day average (cheaper labor markets)
      const days = distanceKm > 300 ? 2 : 1;
      const fuelCost = (distanceKm / 100) * 10 * 1.50; // 10L/100km, €1.50/L
      return (truckCost * days) + fuelCost + 50;
    }
    // Professional: 0.7x Western Europe rates
    if (distanceKm < 50) {
      const hourlyRate = 85; // EUR (0.7 × 120)
      const hours = Math.max(4, Math.ceil(volumeM3 / 3.5));
      return hourlyRate * hours;
    }
    const ratePerM3 = 70; // EUR/m³ (0.7 × 100)
    return volumeM3 * ratePerM3;
  }

  // ASIA - DEVELOPED (Japan, South Korea, Singapore, Taiwan)
  if (region === 'asia_developed') {
    // Professional-only markets, property-type-based quotes
    // Using simplified formula based on research averages
    let baseCost = 0;

    if (countryId === 'jp') {
      // Japan: ¥30,000 (studio) to ¥150,000 (large)
      const baseRates: Record<HomeSize, number> = {
        'studio': 35000,
        '1br': 50000,
        '2br': 80000,
        '3br': 120000,
        '4br': 150000,
        'house_small': 200000,
        'house_large': 300000,
      };
      baseCost = baseRates[homeSize];
      // Distance surcharge (very rough estimate)
      if (distanceKm > 100) baseCost *= 1.3;
      if (distanceKm > 500) baseCost *= 1.6;
    } else if (countryId === 'kr') {
      // South Korea: ₩200,000 (studio) to ₩800,000 (3BR+)
      const baseRates: Record<HomeSize, number> = {
        'studio': 250000,
        '1br': 350000,
        '2br': 500000,
        '3br': 700000,
        '4br': 900000,
        'house_small': 1200000,
        'house_large': 1500000,
      };
      baseCost = baseRates[homeSize];
      if (distanceKm > 100) baseCost *= 1.4;
    } else if (countryId === 'sg') {
      // Singapore: S$350 (studio) to S$1,500 (3BR+)
      const baseRates: Record<HomeSize, number> = {
        'studio': 325,
        '1br': 500,
        '2br': 850,
        '3br': 1200,
        '4br': 1500,
        'house_small': 2000,
        'house_large': 2500,
      };
      baseCost = baseRates[homeSize];
      // Singapore is small, distance less relevant
    } else {
      // Taiwan default
      baseCost = volumeM3 * 1500; // TWD rough estimate
    }

    return baseCost;
  }

  // ASIA - EMERGING (India, China, Thailand, Vietnam, Indonesia, Philippines)
  if (region === 'asia_emerging') {
    if (countryId === 'in') {
      // India: Distance-based ₹5/kg/km
      const weightKg = volumeM3 * 150; // Rough conversion m³ to kg
      const costPerKm = 5; // ₹/kg/km
      return Math.max(10000, weightKg * distanceKm * costPerKm / 100); // Min ₹10,000
    } else if (countryId === 'cn') {
      // China: Platform (Huolala) or traditional
      if (homeSize === 'studio' || homeSize === '1br') {
        return 1500; // ¥ platform average
      }
      // Traditional professional
      const baseVolume = 2500; // ¥ for first 5m³
      const additionalM3 = Math.max(0, volumeM3 - 5);
      return baseVolume + (additionalM3 * 250);
    } else {
      // Other emerging Asia: Low labor costs, distance-based
      const baseCost = volumeM3 * 50; // Local currency rough estimate
      const distanceCost = distanceKm * 5;
      return baseCost + distanceCost;
    }
  }

  // LATIN AMERICA (Mexico, Brazil, Argentina, Chile, Costa Rica, etc.)
  if (region === 'latin_america') {
    if (countryId === 'br') {
      // Brazil: R$200 base + R$2/km
      const baseCost = 350;
      const distanceCost = distanceKm * 2.5;
      const sizeMult = {
        'studio': 0.7, '1br': 0.9, '2br': 1.0, '3br': 1.4,
        '4br': 1.8, 'house_small': 2.2, 'house_large': 3.0
      }[homeSize] || 1.0;
      return (baseCost + distanceCost) * sizeMult;
    } else if (countryId === 'cl') {
      // Chile: Fixed by home size
      const baseRates: Record<HomeSize, number> = {
        'studio': 180000,
        '1br': 300000,
        '2br': 500000,
        '3br': 750000,
        '4br': 1000000,
        'house_small': 1500000,
        'house_large': 2000000,
      };
      let cost = baseRates[homeSize];
      if (distanceKm > 100) cost *= 1.3;
      if (distanceKm > 500) cost *= 1.6;
      return cost;
    } else {
      // Other Latin America: Similar to Brazil model
      const baseCost = 200;
      const distanceCost = distanceKm * 2;
      const sizeMult = {
        'studio': 0.7, '1br': 0.9, '2br': 1.0, '3br': 1.4,
        '4br': 1.8, 'house_small': 2.2, 'house_large': 3.0
      }[homeSize] || 1.0;
      return (baseCost + distanceCost) * sizeMult;
    }
  }

  // MIDDLE EAST (UAE, Morocco)
  if (region === 'middle_east') {
    if (countryId === 'ae') {
      // UAE: Property-size-based fixed rates (AED)
      const baseRates: Record<HomeSize, number> = {
        'studio': 750,
        '1br': 1000,
        '2br': 1500,
        '3br': 2500,
        '4br': 4000,
        'house_small': 6000,
        'house_large': 10000,
      };
      let cost = baseRates[homeSize];
      // Inter-emirate surcharge
      if (distanceKm > 100) cost += 1000;
      return cost;
    } else {
      // Morocco: Volume-based estimate
      return volumeM3 * 100; // MAD rough estimate
    }
  }

  // AFRICA (South Africa)
  if (region === 'africa') {
    if (movingMethod === 'diy') {
      const truckCost = 350; // ZAR per day
      const days = distanceKm > 300 ? 2 : 1;
      const fuelCost = (distanceKm / 100) * 18 * 22; // 18L/100km, R22/L
      return (truckCost * days) + fuelCost + 200;
    }
    // Professional: R15-30/km + base
    const baseCost = volumeM3 * 150; // ZAR
    const distanceCost = distanceKm * 22; // ZAR/km average
    return baseCost + distanceCost;
  }

  // AUSTRALIA (separate from NZ due to different interstate pricing)
  if (countryId === 'au') {
    // Australia has a strong removalist industry with volume + distance pricing
    // Local moves: hourly, Interstate: volume-based with distance multipliers

    if (movingMethod === 'diy') {
      // DIY truck rental: A$100-200/day + fuel
      const truckCost = 150; // AUD per day
      const days = distanceKm > 500 ? Math.ceil(distanceKm / 600) + 1 : 1;
      const fuelCost = (distanceKm / 100) * 15 * 1.80; // L/100km × price per liter
      return (truckCost * days) + fuelCost + 100; // +100 for equipment/tolls
    }

    // Professional removalists (full service)
    if (distanceKm < 100) {
      // Local move: Hourly rates A$120-180/hour
      const hourlyRate = 150; // AUD
      const hours = Math.max(4, Math.ceil(volumeM3 / 2.5)); // Efficient Australian crews
      const baseCost = hourlyRate * hours;
      const gst = baseCost * 0.10; // 10% GST in Australia
      return baseCost + gst;
    } else {
      // Interstate/long-distance: Volume + distance pricing
      // Research: Sydney→Melbourne (880km, 2BR) = A$3,500-5,500
      const volumeCost = volumeM3 * 150; // A$150 per cubic meter base rate

      // Distance multipliers for Australian interstate moves
      let distanceMultiplier = 1.0;
      if (distanceKm > 1500) {
        distanceMultiplier = 2.5; // Cross-country (Perth→Sydney)
      } else if (distanceKm > 1000) {
        distanceMultiplier = 2.0; // Very long (Brisbane→Melbourne)
      } else if (distanceKm > 500) {
        distanceMultiplier = 1.5; // Common interstate (Sydney→Melbourne, Brisbane→Sydney)
      } else if (distanceKm > 100) {
        distanceMultiplier = 1.2; // Regional (within state)
      }

      const baseCost = volumeCost * distanceMultiplier;

      // Fuel levy (common in Australia)
      const fuelLevy = distanceKm * 0.80; // A$0.80/km fuel surcharge

      const totalBeforeGST = baseCost + fuelLevy;
      const gst = totalBeforeGST * 0.10; // 10% GST

      return totalBeforeGST + gst;
    }
  }

  // OCEANIA (New Zealand only now)
  if (region === 'oceania') {
    // New Zealand: Hourly NZ$150 + GST
    const hourlyRate = 150; // NZD
    const hours = Math.max(4, Math.ceil(volumeM3 / 3));
    const baseCost = hourlyRate * hours;
    const gst = baseCost * 0.15; // 15% GST
    return baseCost + gst;
  }

  // Fallback
  return 1000;
};

/**
 * Estimate domestic moving costs with regional pricing support
 * Routes to appropriate calculator based on country
 */
export const estimateDomesticMovingCost = (
  fromCity: City,
  toCity: City,
  homeSize: HomeSize,
  movingMethod: MovingMethod,
  hasVehicle: boolean,
  hasPets: boolean,
  isRenting: boolean = true,
  userCurrency: string = 'USD' // User's home currency for conversion
): MovingEstimate => {
  const country = fromCity.country;
  const distance = calculateCityDistance(fromCity, toCity);

  // For US, use existing detailed formulas
  if (country === 'us') {
    return estimateMovingCost(distance, homeSize, movingMethod, hasVehicle, hasPets, isRenting);
  }

  // For all other countries, use regional pricing
  const region = COUNTRY_TO_REGION[country];
  if (!region) {
    // Fallback to US formulas if country not in mapping
    return estimateMovingCost(distance, homeSize, movingMethod, hasVehicle, hasPets, isRenting);
  }

  // Get local currency for this country
  const localCurrency = getCurrencyForCountry(country);

  // Calculate distance in km (most countries use km)
  const usesMiles = countryUsesMiles(country);
  const distanceKm = usesMiles ? distance * 1.60934 : distance;

  // Calculate moving cost in local currency using regional formulas
  const movingCostLocal = calculateRegionalMovingCost(region, country, distanceKm, homeSize, movingMethod);

  // Convert to user's home currency (or USD for now)
  const movingCostInUserCurrency = convertCurrency(movingCostLocal, localCurrency, userCurrency);

  // Create expense breakdown
  const expenses: RelocationExpense[] = [];

  // Main moving expense
  expenses.push({
    id: 'moving_company',
    category: 'moving_company',
    description: movingMethod === 'full_service'
      ? 'Professional movers'
      : movingMethod === 'hybrid'
        ? 'Moving container service'
        : 'Truck rental and moving costs',
    estimatedCost: movingCostInUserCurrency,
    isRequired: true,
  });

  let totalEstimate = movingCostInUserCurrency;

  // Add packing supplies (simplified, could be regionalized later)
  const volume = HOME_SIZE_VOLUME[homeSize];
  const packingCostLocal = movingMethod === 'full_service'
    ? volume * 0.15  // Higher for professional packing
    : volume * 0.08; // Lower for DIY
  const packingCost = convertCurrency(packingCostLocal, localCurrency, userCurrency);

  expenses.push({
    id: 'packing',
    category: 'packing_supplies',
    description: movingMethod === 'full_service' ? 'Professional packing services' : 'Packing supplies',
    estimatedCost: packingCost,
    isRequired: movingMethod === 'full_service',
  });
  totalEstimate += packingCost;

  // Travel expenses for long distances (if > ~50 miles / 80km)
  if (distanceKm > 80) {
    const travelDays = Math.ceil(distanceKm / 500) + 1;
    const travelCostLocal = travelDays * 80; // Rough estimate for meals/hotels
    const travelCost = convertCurrency(travelCostLocal, localCurrency, userCurrency);

    expenses.push({
      id: 'travel',
      category: 'travel',
      description: `Travel and accommodation (${travelDays} day${travelDays > 1 ? 's' : ''})`,
      estimatedCost: travelCost,
      isRequired: false,
    });
    totalEstimate += travelCost;
  }

  // Add vehicle transport if needed
  if (hasVehicle && distanceKm > 300) {
    const vehicleCostLocal = distanceKm * 0.70; // Rough per-km estimate
    const vehicleCost = convertCurrency(vehicleCostLocal, localCurrency, userCurrency);

    expenses.push({
      id: 'vehicle',
      category: 'auto_shipping',
      description: 'Vehicle transport',
      estimatedCost: vehicleCost,
      isRequired: false,
    });
    totalEstimate += vehicleCost;
  }

  // Add pet transport if needed
  if (hasPets && distanceKm > 300) {
    const petCostLocal = 150; // Flat estimate
    const petCost = convertCurrency(petCostLocal, localCurrency, userCurrency);

    expenses.push({
      id: 'pets',
      category: 'pet_relocation',
      description: 'Pet transportation',
      estimatedCost: petCost,
      isRequired: false,
    });
    totalEstimate += petCost;
  }

  // Add deposits/utilities if renting
  if (isRenting) {
    // Use destination city's median rent for realistic deposit calculation
    // Deposits vary by region: Japan (3-4 months), US/Europe (1-2 months), etc.

    // Scale median rent by home size (median rent is typically for 2BR)
    const rentMultipliers: Record<HomeSize, number> = {
      'studio': 0.6,       // Studio is ~60% of median 2BR rent
      '1br': 0.8,          // 1BR is ~80% of median 2BR rent
      '2br': 1.0,          // 2BR is baseline (what median rent represents)
      '3br': 1.4,          // 3BR is ~40% more than 2BR
      '4br': 1.8,          // 4BR is ~80% more than 2BR
      'house_small': 2.2,  // Small house ~2.2x median apartment
      'house_large': 3.0,  // Large house ~3x median apartment
    };

    const baseMedianRent = toCity.medianRent; // This is already in USD in our data
    const monthlyRent = baseMedianRent * (rentMultipliers[homeSize] || 1.0);

    // Regional deposit multipliers (months of rent)
    const depositMultipliers: Record<RegionalGroup, number> = {
      'north_america': 2.5,        // First + last + security = ~2.5 months
      'europe_high_cost': 2.0,     // Typically 2-3 months
      'europe_western': 2.0,       // 1-3 months average
      'europe_southern_eastern': 1.5, // Usually 1-2 months
      'asia_developed': 3.5,       // Japan/Korea: 3-4 months common
      'asia_emerging': 2.0,        // Varies, but typically 2-3 months
      'latin_america': 2.0,        // Usually 1-2 months
      'middle_east': 1.5,          // Often post-dated checks, lower deposits
      'africa': 2.0,               // Typically 2 months
      'oceania': 3.0,              // Australia/NZ: often 4 weeks + bond
    };

    const depositMonths = depositMultipliers[region] || 2.0;
    const depositInUSD = monthlyRent * depositMonths;

    // Convert to user's currency for display
    const depositCost = convertCurrency(depositInUSD, 'USD', userCurrency);

    expenses.push({
      id: 'deposits',
      category: 'deposits',
      description: `Security deposit and first month rent (${depositMonths} months of median rent)`,
      estimatedCost: depositCost,
      isRequired: true,
    });
    totalEstimate += depositCost;

    // Utility setup fees - vary by region and rental market
    // Make it proportional to rent (higher rent areas = higher utility setup costs)
    const utilityFeePercent = 0.15; // ~15% of monthly rent for utility setup/connection fees
    const utilityInUSD = monthlyRent * utilityFeePercent;
    const utilityCost = convertCurrency(utilityInUSD, 'USD', userCurrency);

    expenses.push({
      id: 'utilities',
      category: 'utilities_setup',
      description: 'Utility connection fees',
      estimatedCost: utilityCost,
      isRequired: true,
    });
    totalEstimate += utilityCost;
  }

  return {
    fromCity,
    toCity,
    moveType: 'domestic',
    distance: usesMiles ? distance : distance / 1.60934, // Convert back to miles for interface
    homeSize,
    movingMethod,
    hasVehicle,
    hasPets,
    isRenting,
    totalEstimate,
    breakdown: expenses,
  };
};

// ============================================================================
// INTERNATIONAL MOVING HELPERS
// ============================================================================

/**
 * Detect move type based on from/to cities
 */
export const detectMoveType = (fromCity: City, toCity: City): MoveType => {
  // Same country = domestic move
  if (fromCity.country === toCity.country) {
    return 'domestic';
  }

  // Get country regions
  const fromCountry = getCountryById(fromCity.country);
  const toCountry = getCountryById(toCity.country);

  if (!fromCountry || !toCountry) {
    return 'intercontinental'; // Default to safest assumption
  }

  // Same region = intra-regional move
  if (fromCountry.region === toCountry.region) {
    return 'intra_regional';
  }

  // Different regions = intercontinental
  return 'intercontinental';
};

/**
 * Determine if a country uses miles or kilometers for distance
 * Only US, UK, and Myanmar/Liberia use miles - rest of world uses km
 */
export const countryUsesMiles = (countryId: string): boolean => {
  const milesCountries = ['us', 'gb', 'mm', 'lr'];
  return milesCountries.includes(countryId);
};

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in miles (can be converted to km later)
 */
const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3959; // Earth's radius in miles

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Calculate actual distance between two cities
 * Uses Haversine formula with lat/long coordinates when available
 * Falls back to country averages if coordinates missing
 */
export const calculateCityDistance = (fromCity: City, toCity: City): number => {
  // If both cities have coordinates, calculate precise distance
  if (fromCity.latitude && fromCity.longitude && toCity.latitude && toCity.longitude) {
    const straightLineDistance = haversineDistance(
      fromCity.latitude,
      fromCity.longitude,
      toCity.latitude,
      toCity.longitude
    );

    const moveType = detectMoveType(fromCity, toCity);

    // For road moves (domestic and intra-regional), apply detour factor
    // Roads aren't straight lines, so actual driving distance is ~20-30% longer
    if (moveType === 'domestic' || moveType === 'intra_regional') {
      const detourFactor = 1.25; // 25% longer for road routes
      const roadDistance = straightLineDistance * detourFactor;

      // Convert to km for countries that use metric system
      if (!countryUsesMiles(fromCity.country)) {
        return Math.round(roadDistance * 1.60934); // Convert miles to km
      }

      return Math.round(roadDistance); // Return miles for US/UK
    }

    // For intercontinental, straight-line is fine (doesn't affect container pricing much)
    return Math.round(straightLineDistance);
  }

  // Fallback to country-based estimates if coordinates not available
  const moveType = detectMoveType(fromCity, toCity);

  if (moveType === 'domestic') {
    const country = fromCity.country;

    // Rough average domestic move distances based on country geography
    const countryAverages: Record<string, number> = {
      'us': 1200,      // US: large country, avg ~1200 miles
      'ca': 1500,      // Canada: very large, avg ~1500 miles
      'au': 1000,      // Australia: large, avg ~1000 miles
      'cn': 1000,      // China: large, avg ~1000 km
      'br': 1000,      // Brazil: large, avg ~1000 km
      'gb': 350,       // UK: smaller, avg ~350 miles
      'de': 400,       // Germany: avg ~400 km
      'fr': 500,       // France: avg ~500 km
      'es': 450,       // Spain: avg ~450 km
      'it': 400,       // Italy: avg ~400 km
      'jp': 500,       // Japan: avg ~500 km
      'kr': 300,       // South Korea: avg ~300 km
      'mx': 800,       // Mexico: avg ~800 km
      'ar': 800,       // Argentina: avg ~800 km
    };

    return countryAverages[country] || 500;
  } else if (moveType === 'intra_regional') {
    return 1200; // Avg ~1200 km for cross-border regional moves
  } else {
    return 5000; // Intercontinental placeholder
  }
};

/**
 * Calculate European truck-based professional moving costs
 */
export const calculateEuropeanTruckMove = (
  fromCity: City,
  toCity: City,
  homeSize: HomeSize,
  hasVehicle: boolean,
  hasPets: boolean,
  isRenting: boolean
): MovingEstimate => {
  const volume = HOME_SIZE_VOLUME[homeSize];
  const volumeCBM = volume * CUBIC_FEET_TO_CBM;
  const expenses: RelocationExpense[] = [];
  let totalEstimate = 0;

  // Distance in kilometers (rough estimate - should use real coordinates)
  const distanceKm = calculateCityDistance(fromCity, toCity);

  // European road freight: €0.50-€2.00 per km depending on volume
  // Larger loads = more efficient per km
  let costPerKm = 1.50; // Base rate
  if (volumeCBM < 10) costPerKm = 2.00; // Small load penalty
  if (volumeCBM > 30) costPerKm = 1.00; // Volume discount

  const baseMovingCost = distanceKm * costPerKm;

  // Loading/unloading fees
  const loadingFee = 300; // €300 flat fee for loading
  const unloadingFee = 300; // €300 flat fee for unloading

  const totalMovingCostEuro = baseMovingCost + loadingFee + unloadingFee;
  const totalMovingCostUSD = totalMovingCostEuro * 1.08; // EUR to USD conversion

  expenses.push({
    id: 'euro_movers',
    category: 'moving_company',
    description: 'Professional truck-based movers',
    estimatedCost: totalMovingCostUSD,
    isRequired: true,
  });
  totalEstimate += totalMovingCostUSD;

  // Packing services (common in Europe)
  const packingCost = volume * PACKING_COST_PER_CUBIC_FT * 2.0;
  expenses.push({
    id: 'packing',
    category: 'packing_supplies',
    description: 'Professional packing services',
    estimatedCost: packingCost,
    isRequired: false,
  });
  totalEstimate += packingCost;

  // Travel to destination
  const flightCost = 250; // Budget airline within Europe
  expenses.push({
    id: 'travel',
    category: 'travel',
    description: 'Flight to destination',
    estimatedCost: flightCost,
    isRequired: true,
  });
  totalEstimate += flightCost;

  // Temporary housing
  const tempHousingDays = 7; // Shorter for intra-European
  const tempHousingCost = tempHousingDays * 120;
  expenses.push({
    id: 'temp_housing',
    category: 'temporary_housing',
    description: 'Temporary housing (1 week avg)',
    estimatedCost: tempHousingCost,
    isRequired: false,
  });
  totalEstimate += tempHousingCost;

  // Security deposit (if renting)
  if (isRenting) {
    const depositAmount = 3500;
    expenses.push({
      id: 'deposits',
      category: 'deposits',
      description: 'Security deposit + first month rent',
      estimatedCost: depositAmount,
      isRequired: true,
    });
    totalEstimate += depositAmount;
  }

  // Utilities setup
  const utilityCost = 200;
  expenses.push({
    id: 'utilities',
    category: 'utilities_setup',
    description: 'Utility connection fees',
    estimatedCost: utilityCost,
    isRequired: true,
  });
  totalEstimate += utilityCost;

  // Pet transport (if applicable)
  if (hasPets) {
    const petCost = 400; // Ground transport within Europe
    expenses.push({
      id: 'pet_transport',
      category: 'pet_transport',
      description: 'Pet ground transport',
      estimatedCost: petCost,
      isRequired: true,
    });
    totalEstimate += petCost;
  }

  // Miscellaneous buffer
  const miscBuffer = totalEstimate * 0.08;
  expenses.push({
    id: 'misc',
    category: 'miscellaneous',
    description: 'Unexpected costs buffer',
    estimatedCost: miscBuffer,
    isRequired: false,
  });
  totalEstimate += miscBuffer;

  return {
    fromCity,
    toCity,
    moveType: 'intra_regional',
    distance: distanceKm,
    homeSize,
    movingMethod: 'euro_truck',
    hasVehicle,
    hasPets,
    isRenting,
    totalEstimate,
    breakdown: expenses,
  };
};

/**
 * Calculate intercontinental container shipping costs
 */
export const calculateIntercontinentalMove = (
  fromCity: City,
  toCity: City,
  homeSize: HomeSize,
  movingMethod: MovingMethod, // minimalist, lcl, fcl_20, fcl_40
  hasVehicle: boolean,
  hasPets: boolean,
  isRenting: boolean
): MovingEstimate => {
  const volume = HOME_SIZE_VOLUME[homeSize];
  const volumeCBM = volume * CUBIC_FEET_TO_CBM;
  const expenses: RelocationExpense[] = [];
  let totalEstimate = 0;

  // Determine container size
  let containerSize: ContainerSize;
  if (movingMethod === 'minimalist') containerSize = 'minimalist';
  else if (movingMethod === 'lcl') containerSize = 'lcl';
  else if (movingMethod === 'fcl_20') containerSize = '20ft';
  else containerSize = '40ft';

  // Container shipping costs (route-dependent)
  // Base costs by route (examples - would need route matrix)
  const routeCosts: Record<string, { base: number; lcl: number; fcl20: number; fcl40: number }> = {
    'us-europe': { base: 0, lcl: 2500, fcl20: 8000, fcl40: 14000 },
    'us-asia': { base: 0, lcl: 3000, fcl20: 10000, fcl40: 18000 },
    'europe-asia': { base: 0, lcl: 2800, fcl20: 9000, fcl40: 16000 },
    'default': { base: 0, lcl: 3500, fcl20: 12000, fcl40: 20000 },
  };

  // Determine route (simplified)
  const fromCountry = getCountryById(fromCity.country);
  const toCountry = getCountryById(toCity.country);
  const routeKey = `${fromCountry?.region || 'unknown'}-${toCountry?.region || 'unknown'}`;
  const routeCost = routeCosts[routeKey] || routeCosts['default'];

  // Shipping cost based on container size
  let shippingCost = 0;
  if (containerSize === 'minimalist') {
    // Air freight for suitcases only
    shippingCost = 150;
    expenses.push({
      id: 'air_freight',
      category: 'travel',
      description: 'Extra baggage / air freight',
      estimatedCost: shippingCost,
      isRequired: true,
    });
  } else if (containerSize === 'lcl') {
    shippingCost = routeCost.lcl;
    expenses.push({
      id: 'container_shipping',
      category: 'container_shipping',
      description: 'LCL container shipping (shared)',
      estimatedCost: shippingCost,
      isRequired: true,
    });
  } else if (containerSize === '20ft') {
    shippingCost = routeCost.fcl20;
    expenses.push({
      id: 'container_shipping',
      category: 'container_shipping',
      description: '20ft container shipping',
      estimatedCost: shippingCost,
      isRequired: true,
    });
  } else {
    shippingCost = routeCost.fcl40;
    expenses.push({
      id: 'container_shipping',
      category: 'container_shipping',
      description: '40ft container shipping',
      estimatedCost: shippingCost,
      isRequired: true,
    });
  }
  totalEstimate += shippingCost;

  // Port fees (origin + destination)
  if (containerSize !== 'minimalist') {
    const portFees = 600;
    expenses.push({
      id: 'port_fees',
      category: 'port_fees',
      description: 'Port handling fees',
      estimatedCost: portFees,
      isRequired: true,
    });
    totalEstimate += portFees;
  }

  // Customs clearance
  if (containerSize !== 'minimalist') {
    const customsCost = 350;
    expenses.push({
      id: 'customs',
      category: 'customs_clearance',
      description: 'Customs clearance',
      estimatedCost: customsCost,
      isRequired: true,
    });
    totalEstimate += customsCost;
  }

  // Destination delivery from port
  if (containerSize !== 'minimalist') {
    const deliveryCost = containerSize === 'lcl' ? 500 : containerSize === '20ft' ? 800 : 1200;
    expenses.push({
      id: 'delivery',
      category: 'moving_company',
      description: 'Delivery from port to residence',
      estimatedCost: deliveryCost,
      isRequired: true,
    });
    totalEstimate += deliveryCost;
  }

  // Packing services
  if (containerSize !== 'minimalist') {
    const packingCost = volume * PACKING_COST_PER_CUBIC_FT * 2.5;
    expenses.push({
      id: 'packing',
      category: 'packing_supplies',
      description: 'Professional packing for shipping',
      estimatedCost: packingCost,
      isRequired: false,
    });
    totalEstimate += packingCost;
  }

  // International flights
  const flightCost = 800; // Intercontinental flight
  expenses.push({
    id: 'flights',
    category: 'travel',
    description: 'International flight',
    estimatedCost: flightCost,
    isRequired: true,
  });
  totalEstimate += flightCost;

  // Visa/immigration fees
  const visaCost = 500; // Average visa application fee
  expenses.push({
    id: 'visa',
    category: 'visa_immigration',
    description: 'Visa & immigration fees',
    estimatedCost: visaCost,
    isRequired: true,
  });
  totalEstimate += visaCost;

  // Temporary housing (longer for international)
  const tempHousingDays = 21;
  const tempHousingCost = tempHousingDays * 150;
  expenses.push({
    id: 'temp_housing',
    category: 'temporary_housing',
    description: 'Temporary housing (3 weeks avg)',
    estimatedCost: tempHousingCost,
    isRequired: false,
  });
  totalEstimate += tempHousingCost;

  // Security deposit (if renting)
  if (isRenting) {
    const depositAmount = 5000;
    expenses.push({
      id: 'deposits',
      category: 'deposits',
      description: 'Security deposit + first month rent',
      estimatedCost: depositAmount,
      isRequired: true,
    });
    totalEstimate += depositAmount;
  }

  // Utilities setup
  const utilityCost = 250;
  expenses.push({
    id: 'utilities',
    category: 'utilities_setup',
    description: 'Utility connection fees',
    estimatedCost: utilityCost,
    isRequired: true,
  });
  totalEstimate += utilityCost;

  // Pet relocation (international)
  if (hasPets) {
    const petCost = 3500; // International pet relocation + quarantine
    expenses.push({
      id: 'pet_transport',
      category: 'pet_transport',
      description: 'International pet relocation',
      estimatedCost: petCost,
      isRequired: true,
    });

    // Quarantine fees (if required)
    const quarantineCost = 1500;
    expenses.push({
      id: 'quarantine',
      category: 'quarantine',
      description: 'Pet quarantine fees (if required)',
      estimatedCost: quarantineCost,
      isRequired: false,
    });
    totalEstimate += petCost + quarantineCost;
  }

  // Vehicle shipping (international)
  if (hasVehicle) {
    const vehicleShipping = 2500; // Base international vehicle shipping
    const importDuty = 3000; // Typical import duties (10-30% of value)
    expenses.push({
      id: 'vehicle_shipping',
      category: 'vehicle_transport',
      description: 'International vehicle shipping',
      estimatedCost: vehicleShipping,
      isRequired: false,
    });
    expenses.push({
      id: 'import_duty',
      category: 'import_duties',
      description: 'Vehicle import duties',
      estimatedCost: importDuty,
      isRequired: false,
    });
    totalEstimate += vehicleShipping + importDuty;
  }

  // Miscellaneous buffer
  const miscBuffer = totalEstimate * 0.10; // Higher buffer for international
  expenses.push({
    id: 'misc',
    category: 'miscellaneous',
    description: 'Unexpected costs buffer',
    estimatedCost: miscBuffer,
    isRequired: false,
  });
  totalEstimate += miscBuffer;

  return {
    fromCity,
    toCity,
    moveType: 'intercontinental',
    distance: 5000, // Not relevant for container shipping
    homeSize,
    movingMethod,
    containerSize,
    hasVehicle,
    hasPets,
    isRenting,
    totalEstimate,
    breakdown: expenses,
  };
};

// ============================================================================
// COUNTRY-SPECIFIC DOMESTIC COST CALCULATORS
// ============================================================================

/**
 * Calculate Australia domestic moving costs
 * Australia uses volume-based pricing ($/m³), not distance-based like US
 */
const estimateAustraliaDomesticCost = (
  distanceKm: number,
  homeSize: HomeSize,
  movingMethod: MovingMethod,
  hasVehicle: boolean,
  hasPets: boolean,
  isRenting: boolean
): MovingEstimate => {
  const volume = HOME_SIZE_VOLUME[homeSize];
  const volumeM3 = AUSTRALIA_VOLUME_M3[homeSize];
  const expenses: RelocationExpense[] = [];
  let totalEstimate = 0;

  if (movingMethod === 'full_service') {
    // Professional movers - volume-based pricing
    let baseCost = volumeM3 * AUSTRALIA_COST_PER_M3;

    // Add fuel levy for long distances (>80km)
    if (distanceKm > AUSTRALIA_FUEL_LEVY_THRESHOLD_KM) {
      baseCost *= (1 + AUSTRALIA_FUEL_LEVY_RATE);
    }

    expenses.push({
      id: 'moving_company',
      category: 'moving_company',
      description: `Professional removalists (${volumeM3}m³ @ $${AUSTRALIA_COST_PER_M3}/m³)`,
      estimatedCost: baseCost,
      isRequired: true,
    });
    totalEstimate += baseCost;

    // Packing (optional)
    const packingCost = volume * PACKING_COST_PER_CUBIC_FT * 2.5;
    expenses.push({
      id: 'packing',
      category: 'packing_supplies',
      description: 'Professional packing services',
      estimatedCost: packingCost,
      isRequired: false,
    });
    totalEstimate += packingCost;

  } else if (movingMethod === 'diy') {
    // DIY truck rental
    const days = distanceKm > 500 ? 2 : 1;
    const truckCost = AUSTRALIA_TRUCK_RENTAL_PER_DAY * days;

    expenses.push({
      id: 'truck_rental',
      category: 'transportation',
      description: `Truck rental (${days} day${days > 1 ? 's' : ''})`,
      estimatedCost: truckCost,
      isRequired: true,
    });
    totalEstimate += truckCost;

    // Fuel costs
    const fuelCost = (distanceKm / 100) * AUSTRALIA_FUEL_CONSUMPTION_L_PER_100KM * AUSTRALIA_DIESEL_PRICE_PER_L;
    expenses.push({
      id: 'fuel',
      category: 'transportation',
      description: `Fuel (${distanceKm}km @ ${AUSTRALIA_FUEL_CONSUMPTION_L_PER_100KM}L/100km)`,
      estimatedCost: fuelCost,
      isRequired: true,
    });
    totalEstimate += fuelCost;

    // Equipment rental
    const equipment = 100;
    expenses.push({
      id: 'equipment',
      category: 'moving_company',
      description: 'Trolley, blankets, straps',
      estimatedCost: equipment,
      isRequired: true,
    });
    totalEstimate += equipment;

    // Packing supplies
    const packingCost = volume * PACKING_COST_PER_CUBIC_FT;
    expenses.push({
      id: 'packing',
      category: 'packing_supplies',
      description: 'Packing supplies (boxes, tape, etc.)',
      estimatedCost: packingCost,
      isRequired: true,
    });
    totalEstimate += packingCost;
  }

  // Add common expenses (vehicle, pets, security deposit)
  if (hasVehicle) {
    const vehicleCost = distanceKm > 500 ? 1200 : 600;
    expenses.push({
      id: 'vehicle_transport',
      category: 'transportation',
      description: 'Vehicle shipping',
      estimatedCost: vehicleCost,
      isRequired: false,
    });
    totalEstimate += vehicleCost;
  }

  if (hasPets) {
    const petCost = 350;
    expenses.push({
      id: 'pet_transport',
      category: 'transportation',
      description: 'Pet relocation services',
      estimatedCost: petCost,
      isRequired: false,
    });
    totalEstimate += petCost;
  }

  return {
    distance: distanceKm,
    homeSize,
    movingMethod,
    hasVehicle,
    hasPets,
    isRenting,
    totalEstimate,
    breakdown: expenses,
  };
};

/**
 * Calculate Canada domestic moving costs
 * Canada uses per-km pricing for long distance, hourly for local
 */
const estimateCanadaDomesticCost = (
  distanceKm: number,
  homeSize: HomeSize,
  movingMethod: MovingMethod,
  hasVehicle: boolean,
  hasPets: boolean,
  isRenting: boolean
): MovingEstimate => {
  const volume = HOME_SIZE_VOLUME[homeSize];
  const expenses: RelocationExpense[] = [];
  let totalEstimate = 0;

  if (movingMethod === 'full_service') {
    let movingCost: number;

    if (distanceKm < 100) {
      // Local move - hourly pricing
      const crew = homeSize === 'studio' || homeSize === '1br' ? 2 : 3;
      const hourlyRate = crew === 2 ? CANADA_LOCAL_HOURLY_2_MOVERS : CANADA_LOCAL_HOURLY_3_MOVERS;
      const hours = Math.max(4, Math.ceil(volume / 250)); // Rough estimate
      movingCost = hours * hourlyRate;

      expenses.push({
        id: 'moving_company',
        category: 'moving_company',
        description: `Professional movers (${crew} movers, ${hours} hours)`,
        estimatedCost: movingCost,
        isRequired: true,
      });
    } else {
      // Long distance - per-km pricing
      const basePerKm = distanceKm * CANADA_COST_PER_KM_LONG_DISTANCE;
      const crossProvinceFee = distanceKm > 500 ? CANADA_CROSS_PROVINCE_FEE : 0;
      movingCost = basePerKm + crossProvinceFee;

      expenses.push({
        id: 'moving_company',
        category: 'moving_company',
        description: `Professional movers (${distanceKm}km @ $${CANADA_COST_PER_KM_LONG_DISTANCE}/km)`,
        estimatedCost: movingCost,
        isRequired: true,
      });
    }

    totalEstimate += movingCost;

    // Packing (optional)
    const packingCost = volume * PACKING_COST_PER_CUBIC_FT * 2.5;
    expenses.push({
      id: 'packing',
      category: 'packing_supplies',
      description: 'Professional packing services',
      estimatedCost: packingCost,
      isRequired: false,
    });
    totalEstimate += packingCost;

  } else if (movingMethod === 'hybrid') {
    // Container service (PODS available in Canada)
    let containerCost: number;

    if (distanceKm < 100) {
      containerCost = CANADA_CONTAINER_LOCAL;
    } else if (distanceKm < 1000) {
      containerCost = CANADA_CONTAINER_MEDIUM_DISTANCE;
    } else {
      containerCost = CANADA_CONTAINER_LONG_DISTANCE;
    }

    expenses.push({
      id: 'container',
      category: 'moving_company',
      description: 'PODS/container service',
      estimatedCost: containerCost,
      isRequired: true,
    });
    totalEstimate += containerCost;

    // Packing supplies
    const packingCost = volume * PACKING_COST_PER_CUBIC_FT;
    expenses.push({
      id: 'packing',
      category: 'packing_supplies',
      description: 'Packing supplies (boxes, tape, etc.)',
      estimatedCost: packingCost,
      isRequired: true,
    });
    totalEstimate += packingCost;

  } else if (movingMethod === 'diy') {
    // DIY truck rental
    const baseTruck = distanceKm > 1000 ? CANADA_TRUCK_RENTAL_LONG_DISTANCE : CANADA_TRUCK_RENTAL_BASE;

    expenses.push({
      id: 'truck_rental',
      category: 'transportation',
      description: 'Truck rental',
      estimatedCost: baseTruck,
      isRequired: true,
    });
    totalEstimate += baseTruck;

    // Fuel costs
    const fuelCost = (distanceKm / 100) * CANADA_FUEL_CONSUMPTION_L_PER_100KM * CANADA_FUEL_PRICE_PER_L;
    expenses.push({
      id: 'fuel',
      category: 'transportation',
      description: `Fuel (${distanceKm}km)`,
      estimatedCost: fuelCost,
      isRequired: true,
    });
    totalEstimate += fuelCost;

    // Fees (insurance, taxes)
    const fees = 300;
    expenses.push({
      id: 'fees',
      category: 'moving_company',
      description: 'Insurance & taxes',
      estimatedCost: fees,
      isRequired: true,
    });
    totalEstimate += fees;

    // Packing supplies
    const packingCost = volume * PACKING_COST_PER_CUBIC_FT;
    expenses.push({
      id: 'packing',
      category: 'packing_supplies',
      description: 'Packing supplies (boxes, tape, etc.)',
      estimatedCost: packingCost,
      isRequired: true,
    });
    totalEstimate += packingCost;
  }

  // Add common expenses
  if (hasVehicle) {
    const vehicleCost = distanceKm > 500 ? 1500 : 800;
    expenses.push({
      id: 'vehicle_transport',
      category: 'transportation',
      description: 'Vehicle shipping',
      estimatedCost: vehicleCost,
      isRequired: false,
    });
    totalEstimate += vehicleCost;
  }

  if (hasPets) {
    const petCost = 400;
    expenses.push({
      id: 'pet_transport',
      category: 'transportation',
      description: 'Pet relocation services',
      estimatedCost: petCost,
      isRequired: false,
    });
    totalEstimate += petCost;
  }

  return {
    distance: distanceKm,
    homeSize,
    movingMethod,
    hasVehicle,
    hasPets,
    isRenting,
    totalEstimate,
    breakdown: expenses,
  };
};

/**
 * Calculate UK domestic moving costs
 * UK uses per-mile pricing for professional moves, no real container market
 */
const estimateUKDomesticCost = (
  distanceMiles: number,
  homeSize: HomeSize,
  movingMethod: MovingMethod,
  hasVehicle: boolean,
  hasPets: boolean,
  isRenting: boolean
): MovingEstimate => {
  const volume = HOME_SIZE_VOLUME[homeSize];
  const expenses: RelocationExpense[] = [];
  let totalEstimate = 0;

  if (movingMethod === 'full_service') {
    // Professional removals - base cost + distance
    const baseCost = UK_BASE_COST_BY_HOME[homeSize];
    const perMileRate = distanceMiles < 50 ? UK_COST_PER_MILE_SHORT : UK_COST_PER_MILE_LONG;
    const distanceCost = distanceMiles > UK_LOCAL_THRESHOLD_MILES ? (distanceMiles * perMileRate) : 0;
    const movingCost = baseCost + distanceCost;

    expenses.push({
      id: 'moving_company',
      category: 'moving_company',
      description: distanceMiles > UK_LOCAL_THRESHOLD_MILES
        ? `Professional removals (${distanceMiles} miles @ £${perMileRate}/mile)`
        : 'Professional removals (local)',
      estimatedCost: movingCost,
      isRequired: true,
    });
    totalEstimate += movingCost;

    // Packing (optional)
    const packingCost = volume * PACKING_COST_PER_CUBIC_FT * 2.5;
    expenses.push({
      id: 'packing',
      category: 'packing_supplies',
      description: 'Professional packing services',
      estimatedCost: packingCost,
      isRequired: false,
    });
    totalEstimate += packingCost;

    // Insurance (typically 10% of removal cost)
    const insuranceCost = movingCost * 0.10;
    expenses.push({
      id: 'insurance',
      category: 'professional_services',
      description: 'Moving insurance',
      estimatedCost: insuranceCost,
      isRequired: false,
    });
    totalEstimate += insuranceCost;

  } else if (movingMethod === 'diy') {
    // DIY van hire
    const days = Math.ceil(distanceMiles / 200) || 1; // ~200 miles per day
    const vanCost = UK_VAN_HIRE_PER_DAY * days;

    expenses.push({
      id: 'van_hire',
      category: 'transportation',
      description: `Van hire (${days} day${days > 1 ? 's' : ''})`,
      estimatedCost: vanCost,
      isRequired: true,
    });
    totalEstimate += vanCost;

    // Fuel costs (UK uses miles and mpg)
    const gallons = distanceMiles / UK_VAN_MPG;
    const litres = gallons * 4.546; // Convert gallons to litres
    const fuelCost = litres * UK_DIESEL_PRICE_PER_L;

    expenses.push({
      id: 'fuel',
      category: 'transportation',
      description: `Diesel (${distanceMiles} miles @ ${UK_VAN_MPG} mpg)`,
      estimatedCost: fuelCost,
      isRequired: true,
    });
    totalEstimate += fuelCost;

    // Packing supplies
    const packingCost = volume * PACKING_COST_PER_CUBIC_FT;
    expenses.push({
      id: 'packing',
      category: 'packing_supplies',
      description: 'Packing supplies (boxes, tape, etc.)',
      estimatedCost: packingCost,
      isRequired: true,
    });
    totalEstimate += packingCost;
  }

  // Add common expenses
  if (hasVehicle) {
    const vehicleCost = distanceMiles > 100 ? 800 : 400;
    expenses.push({
      id: 'vehicle_transport',
      category: 'transportation',
      description: 'Vehicle shipping',
      estimatedCost: vehicleCost,
      isRequired: false,
    });
    totalEstimate += vehicleCost;
  }

  if (hasPets) {
    const petCost = 300;
    expenses.push({
      id: 'pet_transport',
      category: 'transportation',
      description: 'Pet relocation services',
      estimatedCost: petCost,
      isRequired: false,
    });
    totalEstimate += petCost;
  }

  return {
    distance: distanceMiles,
    homeSize,
    movingMethod,
    hasVehicle,
    hasPets,
    isRenting,
    totalEstimate,
    breakdown: expenses,
  };
};

// ============================================================================
// MAIN MOVING COST ESTIMATOR
// ============================================================================

export const estimateMovingCost = (
  distance: number,
  homeSize: HomeSize,
  movingMethod: MovingMethod,
  hasVehicle: boolean,
  hasPets: boolean,
  isRenting: boolean = true
): MovingEstimate => {
  const volume = HOME_SIZE_VOLUME[homeSize];
  const weight = HOME_SIZE_WEIGHT[homeSize]; // Use accurate weight estimates
  const expenses: RelocationExpense[] = [];
  let totalEstimate = 0;

  // Moving costs based on method
  if (movingMethod === 'full_service') {
    // Professional movers - pricing differs for local vs long-distance
    let movingCost: number;

    if (distance <= LOCAL_MOVE_THRESHOLD) {
      // Local move: hourly rate based on home size
      // Use actual industry time estimates by home size
      const moveTimeData = LOCAL_MOVE_HOURS[homeSize];
      const estimatedHours = (moveTimeData.min + moveTimeData.max) / 2; // Average time
      const crewSize = moveTimeData.crew;
      const hourlyRate = crewSize * LOCAL_MOVERS_HOURLY_PER_PERSON;

      // Enforce minimum hours (2-3 hours typical)
      const billableHours = Math.max(estimatedHours, LOCAL_MINIMUM_HOURS);

      // Calculate cost: (Hours × Hourly Rate) + Travel Time Charge
      movingCost = (billableHours * hourlyRate) + LOCAL_TRAVEL_TIME_CHARGE;
    } else {
      // Long-distance move: Per-pound pricing that scales with distance
      // Industry standard: $0.50-$0.80 per pound, rate increases with distance
      // Formula: weight × (baseRate + distanceScale × min(distance/scaleDistance, 1))
      const distanceFactor = Math.min(distance / FULL_SERVICE_DISTANCE_SCALE_MILES, 1);
      const ratePerPound = FULL_SERVICE_BASE_RATE_PER_LB + (FULL_SERVICE_DISTANCE_RATE_SCALE * distanceFactor);
      const weightCost = weight * ratePerPound;
      const fuelSurcharge = distance * FUEL_SURCHARGE_PER_MILE;
      movingCost = Math.max(weightCost + BASE_PICKUP_DELIVERY_FEE + fuelSurcharge, MINIMUM_FULL_SERVICE_COST);
    }

    expenses.push({
      id: 'moving_company',
      category: 'moving_company',
      description: distance <= LOCAL_MOVE_THRESHOLD
        ? `Full-service local movers (${LOCAL_MOVE_HOURS[homeSize].crew}-person crew, ~${Math.round((LOCAL_MOVE_HOURS[homeSize].min + LOCAL_MOVE_HOURS[homeSize].max) / 2)} hours)`
        : 'Full-service long-distance movers',
      estimatedCost: movingCost,
      isRequired: true,
    });
    totalEstimate += movingCost;

    // Professional packing services (optional)
    const packingCost = volume * PACKING_COST_PER_CUBIC_FT * 2.5; // Professional packing costs more
    expenses.push({
      id: 'packing',
      category: 'packing_supplies',
      description: 'Professional packing services',
      estimatedCost: packingCost,
      isRequired: false,
    });
    totalEstimate += packingCost;

    // Basic moving insurance (included)
    const insuranceValue = 15000; // Typical coverage
    const insuranceCost = insuranceValue * 0.01; // 1% of declared value
    expenses.push({
      id: 'insurance',
      category: 'professional_services',
      description: 'Basic moving insurance',
      estimatedCost: insuranceCost,
      isRequired: false,
    });
    totalEstimate += insuranceCost;

  } else if (movingMethod === 'hybrid') {
    // Moving container service (PODS, U-Pack, SMARTBOX, etc.)
    let containerCost: number;

    if (distance <= LOCAL_MOVE_THRESHOLD) {
      // Local move: Flat rate based on home size
      // Includes delivery, 30 days storage, transport, and pickup
      containerCost = CONTAINER_LOCAL_BASE_COSTS[homeSize];

      expenses.push({
        id: 'container',
        category: 'moving_company',
        description: 'Local PODS/container service (includes delivery, 30 days storage, transport)',
        estimatedCost: containerCost,
        isRequired: true,
      });
    } else {
      // Long-distance move: Container fees + single transport fee
      // KEY FIX: Transport cost is PER-SHIPMENT, not per-container!
      const containerInfo = CONTAINER_FEE_PER_UNIT[homeSize];
      const containersNeeded = containerInfo.containers;
      const perContainerFee = containerInfo.feePerContainer;

      // Container fees (per-container: delivery, pickup, 1 month storage)
      const containerFees = containersNeeded * perContainerFee;

      // Transport fee (single shipment cost - NOT multiplied by containers!)
      let transportCostPerMile = CONTAINER_TRANSPORT_PER_MILE_TIERS[0].costPerMile;
      for (const tier of CONTAINER_TRANSPORT_PER_MILE_TIERS) {
        if (distance <= tier.maxMiles) {
          transportCostPerMile = tier.costPerMile;
          break;
        }
      }
      const transportCost = CONTAINER_TRANSPORT_BASE + (distance * transportCostPerMile);

      containerCost = containerFees + transportCost;

      expenses.push({
        id: 'container',
        category: 'moving_company',
        description: `Moving container service (${containersNeeded} container${containersNeeded > 1 ? 's' : ''})`,
        estimatedCost: containerCost,
        isRequired: true,
      });
    }
    totalEstimate += containerCost;

    // DIY packing supplies
    const packingCost = volume * PACKING_COST_PER_CUBIC_FT;
    expenses.push({
      id: 'packing',
      category: 'packing_supplies',
      description: 'Packing supplies (boxes, tape, etc.)',
      estimatedCost: packingCost,
      isRequired: true,
    });
    totalEstimate += packingCost;

    // Loading/unloading help (optional but recommended)
    const laborHelp = (volume / 1000) * 2 * 50; // ~2 hours per 1000 cu ft at $50/hour
    expenses.push({
      id: 'loading_help',
      category: 'professional_services',
      description: 'Loading/unloading labor (optional)',
      estimatedCost: laborHelp,
      isRequired: false,
    });
    totalEstimate += laborHelp;

  } else {
    // DIY with rental truck
    let truckSize = 'small';
    let truckFtSize = '10-12 ft';
    if (volume > 2000) {
      truckSize = 'medium';
      truckFtSize = '15-17 ft';
    }
    if (volume > 4000) {
      truckSize = 'large';
      truckFtSize = '20-22 ft';
    }
    if (volume > 7000) {
      truckSize = 'xlarge';
      truckFtSize = '26 ft';
    }

    let truckCost: number;
    let truckDescription: string;

    if (distance <= LOCAL_MOVE_THRESHOLD) {
      // Local move: Daily rate + per-mile charge
      const dailyCost = TRUCK_RENTAL_LOCAL_COSTS[truckSize];
      const mileageCost = distance * TRUCK_MILEAGE_RATE_LOCAL;
      truckCost = dailyCost + mileageCost + ENVIRONMENTAL_FEE;
      truckDescription = `${truckFtSize} truck rental (1 day, local rate)`;
    } else {
      // Long-distance ONE-WAY move: Flat rate with mileage included
      // U-Haul one-way pricing: base rate + distance-based pricing
      const baseRate = TRUCK_ONEWAY_BASE[truckSize];
      const perMileRate = TRUCK_ONEWAY_PER_MILE[truckSize];
      truckCost = baseRate + (distance * perMileRate) + ENVIRONMENTAL_FEE;

      // Calculate rental days for display (driving ~450 miles/day + load/unload days)
      const rentalDays = Math.max(Math.ceil(distance / 450) + 2, 2);
      truckDescription = `${truckFtSize} truck rental (one-way, ~${rentalDays} days)`;
    }

    expenses.push({
      id: 'truck_rental',
      category: 'truck_rental',
      description: truckDescription,
      estimatedCost: truckCost,
      isRequired: true,
    });
    totalEstimate += truckCost;

    // Packing supplies (DIY packing)
    const packingCost = volume * PACKING_COST_PER_CUBIC_FT;
    expenses.push({
      id: 'packing',
      category: 'packing_supplies',
      description: 'Packing supplies (boxes, tape, etc.)',
      estimatedCost: packingCost,
      isRequired: true,
    });
    totalEstimate += packingCost;

    // Fuel costs (for the truck)
    const mpg = truckSize === 'xlarge' ? 8 : truckSize === 'large' ? 10 : truckSize === 'medium' ? 12 : 14;
    const gasCost = (distance / mpg) * 3.75; // Current average gas price
    expenses.push({
      id: 'fuel',
      category: 'travel',
      description: 'Truck fuel costs',
      estimatedCost: gasCost,
      isRequired: true,
    });
    totalEstimate += gasCost;

    // Moving equipment rental (dollies, blankets, straps)
    const equipmentCost = 75;
    expenses.push({
      id: 'equipment',
      category: 'truck_rental',
      description: 'Moving equipment (dolly, blankets, straps)',
      estimatedCost: equipmentCost,
      isRequired: true,
    });
    totalEstimate += equipmentCost;

    // Optional loading/unloading help
    const laborHelp = (volume / 1000) * 2 * 50; // ~2 hours per 1000 cu ft
    expenses.push({
      id: 'loading_help',
      category: 'professional_services',
      description: 'Loading/unloading labor (optional)',
      estimatedCost: laborHelp,
      isRequired: false,
    });
    totalEstimate += laborHelp;
  }

  // Travel expenses (for the move itself)
  const travelDays = Math.ceil(distance / 500) + 1;

  // Hotels during the move
  if (distance > 300) {
    const hotelNights = travelDays - 1;
    const hotelCost = hotelNights * 135; // Average budget hotel rate
    expenses.push({
      id: 'hotels',
      category: 'travel',
      description: `Hotels during move (${hotelNights} night${hotelNights > 1 ? 's' : ''})`,
      estimatedCost: hotelCost,
      isRequired: true,
    });
    totalEstimate += hotelCost;
  }

  // Meals during travel
  if (distance > LOCAL_MOVE_THRESHOLD) {
    // Only add meal costs for long-distance moves (>50 miles)
    const mealCost = travelDays * 60; // $20 breakfast, $15 lunch, $25 dinner
    expenses.push({
      id: 'meals',
      category: 'travel',
      description: `Travel meals (${travelDays} day${travelDays > 1 ? 's' : ''})`,
      estimatedCost: mealCost,
      isRequired: true,
    });
    totalEstimate += mealCost;
  }

  // Temporary housing (Airbnb/extended stay while looking for permanent housing)
  const tempHousingDays = 14;
  const tempHousingCost = tempHousingDays * 175; // Average extended stay / Airbnb rate
  expenses.push({
    id: 'temp_housing',
    category: 'temporary_housing',
    description: 'Temporary housing (2 weeks avg)',
    estimatedCost: tempHousingCost,
    isRequired: false,
  });
  totalEstimate += tempHousingCost;

  // Security deposit + first/last month's rent (only if renting)
  if (isRenting) {
    // This varies widely by market, but using realistic averages
    const depositAmount = 4500; // Typical: first month + last month + security deposit
    expenses.push({
      id: 'deposits',
      category: 'deposits',
      description: 'Security deposit + first/last month rent',
      estimatedCost: depositAmount,
      isRequired: true,
    });
    totalEstimate += depositAmount;
  }

  // Utility setup and connection fees
  const utilityCost = 300; // Electric, gas, water, internet setup fees
  expenses.push({
    id: 'utilities',
    category: 'utilities_setup',
    description: 'Utility connection fees',
    estimatedCost: utilityCost,
    isRequired: true,
  });
  totalEstimate += utilityCost;

  // Vehicle transport (auto shipping service)
  if (hasVehicle) {
    // Auto transport costs vary by distance
    let vehicleTransportCost: number;
    if (distance < 500) {
      vehicleTransportCost = 400 + (distance * 0.75);
    } else if (distance < 1500) {
      vehicleTransportCost = 600 + (distance * 0.60);
    } else {
      vehicleTransportCost = 800 + (distance * 0.50);
    }

    expenses.push({
      id: 'vehicle_transport',
      category: 'vehicle_transport',
      description: 'Auto transport service',
      estimatedCost: vehicleTransportCost,
      isRequired: false,
    });
    totalEstimate += vehicleTransportCost;
  }

  // Pet transport costs
  if (hasPets) {
    let petCost: number;
    if (distance < 500) {
      // Ground transport or DIY
      petCost = 150;
    } else if (distance < 1500) {
      // Professional pet transport ground service
      petCost = 400;
    } else {
      // Long-distance or potential air transport
      petCost = 650;
    }

    expenses.push({
      id: 'pet_transport',
      category: 'pet_transport',
      description: 'Pet transport & supplies',
      estimatedCost: petCost,
      isRequired: true,
    });
    totalEstimate += petCost;
  }

  // Address change and administrative costs
  const adminCost = 125; // USPS forwarding, license updates, address changes, etc.
  expenses.push({
    id: 'admin_costs',
    category: 'miscellaneous',
    description: 'Address changes & admin fees',
    estimatedCost: adminCost,
    isRequired: true,
  });
  totalEstimate += adminCost;

  // Miscellaneous buffer (7-10% for unexpected costs)
  const miscBuffer = totalEstimate * 0.08;
  expenses.push({
    id: 'misc',
    category: 'miscellaneous',
    description: 'Unexpected costs buffer',
    estimatedCost: miscBuffer,
    isRequired: false,
  });
  totalEstimate += miscBuffer;

  return {
    distance,
    homeSize,
    movingMethod,
    hasVehicle,
    hasPets,
    isRenting,
    totalEstimate,
    breakdown: expenses,
  };
};

export const getCategoryLabel = (category: ExpenseCategory): string => {
  const labels: Record<ExpenseCategory, string> = {
    moving_company: 'Moving Services',
    truck_rental: 'Truck Rental',
    packing_supplies: 'Packing',
    storage: 'Storage',
    travel: 'Travel',
    temporary_housing: 'Temporary Housing',
    deposits: 'Deposits',
    utilities_setup: 'Utilities',
    vehicle_transport: 'Vehicle Transport',
    pet_transport: 'Pet Transport',
    professional_services: 'Professional Services',
    miscellaneous: 'Miscellaneous',
    // International categories
    container_shipping: 'Container Shipping',
    customs_clearance: 'Customs',
    port_fees: 'Port Fees',
    visa_immigration: 'Visa & Immigration',
    quarantine: 'Quarantine',
    import_duties: 'Import Duties',
  };
  return labels[category];
};

export const getHomeSizeLabel = (size: HomeSize): string => {
  const labels: Record<HomeSize, string> = {
    studio: 'Studio Apartment',
    '1br': '1 BR Apartment',
    '2br': '2 BR Apartment',
    '3br': '3 BR Apartment',
    '4br': '4+ BR Apartment',
    house_small: 'Small House (2-3 BR)',
    house_large: 'Large House (4+ BR)',
  };
  return labels[size];
};

export const getMovingMethodLabel = (method: MovingMethod): string => {
  const labels: Record<MovingMethod, string> = {
    // US Domestic
    diy: 'DIY (Rental Truck)',
    hybrid: 'Hybrid (Moving Container)',
    full_service: 'Full Service Movers',
    // European intra-regional
    euro_truck: 'Professional Truck Movers',
    // Intercontinental
    minimalist: 'Minimalist (Suitcases Only)',
    lcl: 'Light Move (Shared Container)',
    fcl_20: 'Standard (20ft Container)',
    fcl_40: 'Full Household (40ft Container)',
  };
  return labels[method];
};

// Get recommended container size based on home size
export const getRecommendedContainerSize = (homeSize: HomeSize): ContainerSize => {
  const recommendations: Record<HomeSize, ContainerSize> = {
    studio: 'lcl',
    '1br': 'lcl',
    '2br': '20ft',
    '3br': '20ft',
    '4br': '40ft',
    house_small: '40ft',
    house_large: '40ft',
  };
  return recommendations[homeSize];
};

// Get container capacity in cubic feet
export const getContainerCapacity = (containerSize: ContainerSize): { cubicFeet: number; cbm: number; description: string } => {
  const capacities: Record<ContainerSize, { cubicFeet: number; cbm: number; description: string }> = {
    minimalist: {
      cubicFeet: 30,
      cbm: 0.85,
      description: '2-3 large suitcases',
    },
    lcl: {
      cubicFeet: 530,
      cbm: 15,
      description: '1-2 bedroom apartment (shared container)',
    },
    '20ft': {
      cubicFeet: 1060,
      cbm: 30,
      description: '2-3 bedroom apartment',
    },
    '40ft': {
      cubicFeet: 2389,
      cbm: 67.7,
      description: '4+ bedroom house or full household',
    },
  };
  return capacities[containerSize];
};

// Map container size to moving method
export const containerSizeToMethod = (containerSize: ContainerSize): MovingMethod => {
  const mapping: Record<ContainerSize, MovingMethod> = {
    minimalist: 'minimalist',
    lcl: 'lcl',
    '20ft': 'fcl_20',
    '40ft': 'fcl_40',
  };
  return mapping[containerSize];
};

// Map moving method to container size
export const methodToContainerSize = (method: MovingMethod): ContainerSize | null => {
  const mapping: Record<string, ContainerSize> = {
    minimalist: 'minimalist',
    lcl: 'lcl',
    fcl_20: '20ft',
    fcl_40: '40ft',
  };
  return mapping[method] || null;
};

// Validate if container size is appropriate for home size
export const isContainerSizeValid = (homeSize: HomeSize, containerSize: ContainerSize): {
  isValid: boolean;
  severity: 'error' | 'warning' | 'ok';
  message?: string;
} => {
  const homeVolume = HOME_SIZE_VOLUME[homeSize];
  const containerCapacity = getContainerCapacity(containerSize);

  // Error cases (incompatible)
  if ((homeSize === 'house_small' || homeSize === 'house_large') && containerSize === 'minimalist') {
    return {
      isValid: false,
      severity: 'error',
      message: `A ${getHomeSizeLabel(homeSize)} typically has ${homeVolume.toLocaleString()} cubic feet of belongings. Suitcases only hold ~30 cubic feet. Consider a 40ft Container.`,
    };
  }

  if ((homeSize === 'house_small' || homeSize === 'house_large' || homeSize === '4br') && containerSize === 'lcl') {
    return {
      isValid: false,
      severity: 'error',
      message: `A ${getHomeSizeLabel(homeSize)} is too large for shared container (530 cu ft max). Consider a 40ft Container.`,
    };
  }

  if ((homeSize === '3br' || homeSize === '4br') && containerSize === 'minimalist') {
    return {
      isValid: false,
      severity: 'error',
      message: `A ${getHomeSizeLabel(homeSize)} won't fit in suitcases. Consider a 20ft or 40ft Container.`,
    };
  }

  // Warning cases (inefficient but possible)
  if ((homeSize === 'studio' || homeSize === '1br') && containerSize === '40ft') {
    return {
      isValid: true,
      severity: 'warning',
      message: `A 40ft container may be too large for a ${getHomeSizeLabel(homeSize)}. You'll pay for unused space. Consider LCL (Shared Container) instead.`,
    };
  }

  if (homeSize === '2br' && containerSize === '40ft') {
    return {
      isValid: true,
      severity: 'warning',
      message: `A 40ft container may be larger than needed for a ${getHomeSizeLabel(homeSize)}. Consider a 20ft Container to save money.`,
    };
  }

  // All good
  return {
    isValid: true,
    severity: 'ok',
  };
};

// Helper function to determine intercontinental shipping route type
const getIntercontinentalRouteType = (fromCity: City, toCity: City): 'trans_pacific' | 'trans_atlantic' | 'oceania' | 'other' => {
  const fromCountry = fromCity.country;
  const toCountry = toCity.country;

  // Define regions
  const northAmerica = ['us', 'ca', 'mx'];
  const europe = ['gb', 'de', 'fr', 'es', 'pt', 'it', 'nl', 'se', 'no', 'pl', 'gr', 'ch', 'be', 'dk', 'at', 'ie', 'cz'];
  const asia = ['cn', 'jp', 'kr', 'sg', 'th', 'vn', 'id', 'ph', 'tw', 'in'];
  const oceania = ['au', 'nz'];
  const middleEast = ['ae', 'sa', 'il'];

  // Trans-Pacific: North America ↔ Asia
  if ((northAmerica.includes(fromCountry) && asia.includes(toCountry)) ||
      (asia.includes(fromCountry) && northAmerica.includes(toCountry))) {
    return 'trans_pacific';
  }

  // Trans-Atlantic: North America ↔ Europe
  if ((northAmerica.includes(fromCountry) && europe.includes(toCountry)) ||
      (europe.includes(fromCountry) && northAmerica.includes(toCountry))) {
    return 'trans_atlantic';
  }

  // Oceania: Australia/NZ ↔ anywhere
  if (oceania.includes(fromCountry) || oceania.includes(toCountry)) {
    return 'oceania';
  }

  // Everything else
  return 'other';
};

// Get estimated timeline for a move with distance-based accuracy
export const getEstimatedTimeline = (
  movingMethod: MovingMethod,
  moveType?: MoveType,
  distance?: number,
  fromCity?: City,
  toCity?: City
): { min: number; max: number; unit: 'days' | 'weeks'; description: string } => {
  // Domestic US/Canada/UK/Australia moves - distance-based
  if (moveType === 'domestic') {
    // Determine distance category
    const distanceMiles = distance || 500; // Fallback to medium distance

    switch (movingMethod) {
      case 'diy':
        if (distanceMiles < 100) {
          // Short: <100 miles
          return { min: 1, max: 1, unit: 'days', description: 'Load morning, drive 2-3 hours, unload afternoon' };
        } else if (distanceMiles < 1000) {
          // Medium: 100-1000 miles
          return { min: 2, max: 3, unit: 'days', description: '400 miles/day sustainable for moving trucks' };
        } else {
          // Long: 1000+ miles (cross-country)
          return { min: 5, max: 7, unit: 'days', description: '1 day loading + 3-5 days driving (350-400 mi/day) + 1 day unloading' };
        }

      case 'hybrid':
        if (distanceMiles < 500) {
          // Short: <500 miles
          return { min: 1, max: 2, unit: 'weeks', description: 'Container delivery (1-2 days) + your loading (3 days) + transit (3-5 days) + your unloading (3 days)' };
        } else if (distanceMiles < 1500) {
          // Medium: 500-1500 miles
          return { min: 2, max: 3, unit: 'weeks', description: 'Container delivery + loading time + 5-10 days transit + unloading time' };
        } else {
          // Long: 1500+ miles (cross-country)
          return { min: 3, max: 4, unit: 'weeks', description: 'Full cross-country timeline. PODS reports 10-21 days coast-to-coast transit once picked up' };
        }

      case 'full_service':
        if (distanceMiles < 500) {
          // Short: <500 miles
          return { min: 1, max: 2, unit: 'weeks', description: '2-4 days scheduling + 2-5 days transit. Standard delivery window: 5 days' };
        } else if (distanceMiles < 1500) {
          // Medium: 500-1500 miles
          return { min: 1, max: 2, unit: 'weeks', description: '3-7 days scheduling + 2-7 days transit' };
        } else {
          // Long: 1500+ miles (cross-country)
          return { min: 2, max: 3, unit: 'weeks', description: '1-2 weeks booking + 7-14 days transit. Coast-to-coast typically 10-14 days' };
        }

      default:
        return { min: 1, max: 2, unit: 'weeks', description: 'Typical moving timeline' };
    }
  }

  // European truck moves (intra-regional) - distance-based
  if (moveType === 'intra_regional') {
    const distanceKm = distance || 1500; // Fallback to medium distance

    if (distanceKm < 1000) {
      // Short: <1000 km (Germany → France, Spain → Portugal)
      return { min: 2, max: 3, unit: 'days', description: '1 day loading + 1 day transit + customs if applicable' };
    } else if (distanceKm < 2000) {
      // Medium: 1000-2000 km (UK → Germany, Sweden → Italy)
      return { min: 3, max: 6, unit: 'days', description: 'Professional truck transit across Europe. Add 1-3 days for post-Brexit customs (UK-EU)' };
    } else {
      // Long: 2000+ km (Spain → Poland, UK → Greece)
      return { min: 6, max: 9, unit: 'days', description: 'Long-distance European truck move. Add 1-3 days for customs if crossing UK-EU border' };
    }
  }

  // Intercontinental container shipping - route-based
  if (moveType === 'intercontinental') {
    // Determine shipping route type
    const routeType = fromCity && toCity ? getIntercontinentalRouteType(fromCity, toCity) : 'other';

    switch (movingMethod) {
      case 'minimalist':
        return { min: 1, max: 1, unit: 'days', description: 'Air travel with luggage' };

      case 'lcl':
        // LCL (Shared Container) - 2-4 weeks longer than FCL
        if (routeType === 'trans_pacific') {
          // US ↔ Asia: 8-12 weeks
          return { min: 8, max: 12, unit: 'weeks', description: '3-7 days consolidation + 18-35 days ocean + 3-7 days deconsolidation + customs. Current 2025-2026 times longer due to port congestion' };
        } else if (routeType === 'trans_atlantic') {
          // US/Europe ↔ Europe: 6-10 weeks
          return { min: 6, max: 10, unit: 'weeks', description: '3-7 days consolidation + 12-20 days ocean + 3-7 days deconsolidation + customs clearance' };
        } else if (routeType === 'oceania') {
          // UK ↔ Australia/NZ: 12-20 weeks
          return { min: 12, max: 20, unit: 'weeks', description: 'Consolidation + 45-84 days ocean transit (8-12 weeks) + deconsolidation + customs. Longest route' };
        } else {
          // Other routes: 8-14 weeks
          return { min: 8, max: 14, unit: 'weeks', description: 'Shared container shipping + consolidation + customs clearance' };
        }

      case 'fcl_20':
      case 'fcl_40':
        // FCL (Full Container) - faster than LCL
        if (routeType === 'trans_pacific') {
          // US ↔ Asia: 6-10 weeks
          return { min: 6, max: 10, unit: 'weeks', description: '18-35 days ocean transit + port handling + customs. LA→Shanghai 11-15 days, but add 2-4 weeks for inland transport and customs' };
        } else if (routeType === 'trans_atlantic') {
          // US/Europe ↔ Europe: 4-8 weeks
          return { min: 4, max: 8, unit: 'weeks', description: '12-20 days ocean transit + port handling + customs. NY→London 12-18 days port-to-port' };
        } else if (routeType === 'oceania') {
          // UK ↔ Australia/NZ: 10-14 weeks
          return { min: 10, max: 14, unit: 'weeks', description: '45-50 days ocean transit (6-9 weeks) + port handling + customs. Longest shipping route' };
        } else {
          // Other routes: 6-12 weeks
          return { min: 6, max: 12, unit: 'weeks', description: 'Full container ocean freight + customs clearance' };
        }

      default:
        return { min: 8, max: 12, unit: 'weeks', description: 'International shipping' };
    }
  }

  // Default fallback
  return { min: 1, max: 2, unit: 'weeks', description: 'Estimated moving time' };
};

// Format timeline for display
export const formatTimeline = (timeline: { min: number; max: number; unit: 'days' | 'weeks' }): string => {
  if (timeline.min === timeline.max) {
    return `${timeline.min} ${timeline.unit === 'days' ? (timeline.min === 1 ? 'day' : 'days') : (timeline.min === 1 ? 'week' : 'weeks')}`;
  }
  return `${timeline.min}-${timeline.max} ${timeline.unit}`;
};

// ============================================================================
// SMART RECOMMENDATIONS & COST COMPARISONS
// ============================================================================

export interface MovingMethodComparison {
  method: MovingMethod;
  label: string;
  totalCost: number;
  requiredCost: number;
  optionalCost: number;
  isRecommended: boolean;
  isCurrentSelection: boolean;
  savingsVsCurrent?: number; // Positive = savings, Negative = upgrade cost
  savingsPercentage?: number;
  popularityPercentage?: number; // What % of movers choose this method for this scenario
  physicalEffort: 'Low' | 'Medium' | 'High';
  timeline?: string;
}

/**
 * Get recommended moving method based on distance, home size, move type, and country
 * Uses country-specific research data and cost structures
 */
export const getRecommendedMovingMethod = (
  distance: number,
  homeSize: HomeSize,
  moveType: MoveType,
  countryId?: string
): MovingMethod => {
  // Intercontinental moves use container size recommendations
  if (moveType === 'intercontinental') {
    const containerSize = getRecommendedContainerSize(homeSize);
    return containerSizeToMethod(containerSize);
  }

  // Intra-regional (European truck moves) only have one option
  if (moveType === 'intra_regional') {
    return 'euro_truck';
  }

  // Domestic moves - country-specific recommendations

  // AUSTRALIA - Volume-based pricing, no container sweet spot
  if (countryId === 'au') {
    const distanceKm = distance * 1.60934; // Convert miles to km

    // Local (<200km): DIY practical for small homes
    if (distanceKm < 200) {
      if (homeSize === 'studio' || homeSize === '1br') {
        return 'diy';
      }
      // 2BR+: Professional often better value
      return 'full_service';
    }

    // Long distance (>200km): Professional recommended (volume-based is cost-effective)
    // No hybrid/container market in Australia like US PODS
    return 'full_service';
  }

  // CANADA - Similar to US but containers less prevalent
  if (countryId === 'ca') {
    const distanceKm = distance * 1.60934;

    // Local (<100km): DIY or professional hourly
    if (distanceKm < 100) {
      if (homeSize === 'studio' || homeSize === '1br' || homeSize === '2br') {
        return 'diy';
      }
      return 'full_service';
    }

    // Medium (100-500km): Containers start becoming viable
    if (distanceKm >= 100 && distanceKm < 500) {
      if (homeSize === 'studio' || homeSize === '1br') {
        return 'diy';
      }
      // 2BR+: Containers competitive
      return 'hybrid';
    }

    // Container sweet spot (500-3000km)
    if (distanceKm >= 500 && distanceKm <= 3000) {
      return 'hybrid'; // PODS most cost-effective
    }

    // Very long distance (>3000km): Compare containers vs professional
    // Containers still good for smaller homes
    if (homeSize === 'studio' || homeSize === '1br' || homeSize === '2br') {
      return 'hybrid';
    }
    return 'full_service';
  }

  // UK - No containers, just DIY van or professional removals
  if (countryId === 'gb') {
    // Local (<30 miles): DIY van hire viable for small homes
    if (distance < 30) {
      if (homeSize === 'studio' || homeSize === '1br') {
        return 'diy';
      }
      // 2BR+: Professional recommended
      return 'full_service';
    }

    // Medium distance (30-100 miles): Professional usually better
    if (distance >= 30 && distance < 100) {
      if (homeSize === 'studio') {
        return 'diy'; // Still manageable
      }
      return 'full_service';
    }

    // Long distance (>100 miles): Always professional
    return 'full_service';
  }

  // STRONG DIY MARKETS - Netherlands, Denmark, South Africa (based on research)
  if (countryId === 'nl' || countryId === 'dk' || countryId === 'za') {
    const distanceKm = distance * 1.60934;

    // Local (<50km): DIY viable for studio-2BR
    if (distanceKm < 50) {
      if (homeSize === 'studio' || homeSize === '1br' || homeSize === '2br') {
        return 'diy';
      }
      return 'full_service';
    }

    // Medium (50-200km): DIY still viable for small homes
    if (distanceKm >= 50 && distanceKm < 200) {
      if (homeSize === 'studio' || homeSize === '1br') {
        return 'diy';
      }
      return 'full_service';
    }

    // Long distance (>200km): Professional recommended
    return 'full_service';
  }

  // EMERGING DIY MARKETS - Germany, Czech Republic, Poland, Brazil (available but less common)
  if (countryId === 'de' || countryId === 'cz' || countryId === 'pl' || countryId === 'br') {
    const distanceKm = distance * 1.60934;

    // Local (<30km): DIY viable for studio/1BR
    if (distanceKm < 30) {
      if (homeSize === 'studio' || homeSize === '1br') {
        return 'diy';
      }
      return 'full_service';
    }

    // Everything else: Professional recommended (DIY uncommon)
    return 'full_service';
  }

  // PROFESSIONAL-ONLY MARKETS - All other countries
  // Includes: France, Spain, Italy, Portugal, Greece, Sweden, Norway, Switzerland, Belgium, Ireland,
  // Japan, South Korea, Singapore, UAE, India, China, all of Latin America except Brazil, etc.
  if (countryId && countryId !== 'us' && countryId !== 'ca') {
    // Professional movers only option
    return 'full_service';
  }

  // US and default logic - Original US-based logic (research: 78% DIY <50mi, containers 250-1000mi)
  // Local moves (<50 miles): 78% DIY, 22% professional
  if (distance < 50) {
    // Small apartments: DIY is practical and popular
    if (homeSize === 'studio' || homeSize === '1br' || homeSize === '2br') {
      return 'diy';
    }
    // Larger homes: Full service becomes more practical
    if (homeSize === '3br' || homeSize === '4br') {
      return 'full_service';
    }
    // Houses: Recommend full service
    return 'full_service';
  }

  // Medium distance (50-250 miles): DIY still popular but containers emerging
  if (distance >= 50 && distance < 250) {
    // Small homes: DIY cost-effective
    if (homeSize === 'studio' || homeSize === '1br') {
      return 'diy';
    }
    // 2BR: Hybrid becomes attractive
    if (homeSize === '2br') {
      return 'hybrid';
    }
    // Larger: Full service recommended
    return 'full_service';
  }

  // 250-1000 miles: Container sweet spot (PODS average distance: 500 miles)
  if (distance >= 250 && distance <= 1000) {
    // All home sizes: Container is most popular choice at this distance
    return 'hybrid';
  }

  // Long distance (1000+ miles): Professional becomes standard
  if (distance > 1000) {
    // Small apartments: Containers still viable
    if (homeSize === 'studio' || homeSize === '1br') {
      return 'hybrid';
    }
    // 3BR+: Full service recommended (research: "usually best for larger homes and greater distances")
    if (homeSize === '3br' || homeSize === '4br' || homeSize === 'house_small' || homeSize === 'house_large') {
      return 'full_service';
    }
    // 2BR: Hybrid still good choice
    return 'hybrid';
  }

  // Default fallback
  return 'hybrid';
};

/**
 * Get popularity percentage for a moving method based on distance and home size
 * Based on industry research data
 */
const getMethodPopularity = (
  method: MovingMethod,
  distance: number,
  homeSize: HomeSize
): number => {
  // Local moves (<50 mi): 78% DIY, 22% professional
  if (distance < 50) {
    if (method === 'diy') return 78;
    if (method === 'full_service') return 22;
    return 0;
  }

  // Medium (50-500 mi): Estimated DIY ~50%, Container ~20%, Full Service ~30%
  if (distance >= 50 && distance < 500) {
    if (method === 'diy') return 50;
    if (method === 'hybrid') return 20;
    if (method === 'full_service') return 30;
    return 0;
  }

  // Long (500-1000 mi): Estimated DIY ~40%, Container ~30%, Full Service ~30%
  if (distance >= 500 && distance <= 1000) {
    if (method === 'diy') return 40;
    if (method === 'hybrid') return 30;
    if (method === 'full_service') return 30;
    return 0;
  }

  // Very long (1000+ mi): Estimated DIY ~25%, Container ~30%, Full Service ~45%
  if (distance > 1000) {
    if (method === 'diy') return 25;
    if (method === 'hybrid') return 30;
    if (method === 'full_service') return 45;
    return 0;
  }

  return 0;
};

/**
 * Calculate and compare costs for all available moving methods
 * Returns comparison data for smart recommendations and cost displays
 */
export const compareMovingMethods = (
  distance: number,
  homeSize: HomeSize,
  currentMethod: MovingMethod,
  hasVehicle: boolean,
  hasPets: boolean,
  isRenting: boolean,
  moveType: MoveType,
  availableMethods: MovingMethod[],
  countryId?: string
): MovingMethodComparison[] => {
  const comparisons: MovingMethodComparison[] = [];
  const recommendedMethod = getRecommendedMovingMethod(distance, homeSize, moveType, countryId);

  // Calculate costs for each available method
  availableMethods.forEach((method) => {
    const estimate = estimateMovingCost(distance, homeSize, method, hasVehicle, hasPets, isRenting);

    const requiredTotal = estimate.breakdown
      .filter(e => e.isRequired)
      .reduce((sum, e) => sum + e.estimatedCost, 0);

    const optionalTotal = estimate.breakdown
      .filter(e => !e.isRequired)
      .reduce((sum, e) => sum + e.estimatedCost, 0);

    // Physical effort ratings based on method
    let physicalEffort: 'Low' | 'Medium' | 'High' = 'Medium';
    if (method === 'diy') {
      physicalEffort = 'High';
    } else if (method === 'full_service') {
      physicalEffort = 'Low';
    } else if (method === 'hybrid' || method === 'euro_truck') {
      physicalEffort = 'Medium';
    }

    // Get timeline
    const timeline = getEstimatedTimeline(method, moveType, distance);
    const timelineStr = formatTimeline(timeline);

    comparisons.push({
      method,
      label: getMovingMethodLabel(method),
      totalCost: estimate.totalEstimate,
      requiredCost: requiredTotal,
      optionalCost: optionalTotal,
      isRecommended: method === recommendedMethod,
      isCurrentSelection: method === currentMethod,
      popularityPercentage: getMethodPopularity(method, distance, homeSize),
      physicalEffort,
      timeline: timelineStr,
    });
  });

  // Sort by cost (lowest to highest) for comparison shopping
  comparisons.sort((a, b) => a.totalCost - b.totalCost);

  // Calculate savings/upgrade messaging relative to current selection
  const currentComparison = comparisons.find(c => c.isCurrentSelection);
  if (currentComparison) {
    comparisons.forEach((comparison) => {
      if (comparison.method !== currentMethod) {
        const diff = currentComparison.totalCost - comparison.totalCost;
        const percentage = Math.abs((diff / currentComparison.totalCost) * 100);

        if (diff > 0) {
          // This option is cheaper - show savings
          comparison.savingsVsCurrent = diff;
          comparison.savingsPercentage = percentage;
        } else {
          // This option is more expensive - show upgrade cost
          const upgradeCost = Math.abs(diff);

          // Store the upgrade cost - formatting will happen in the component
          comparison.savingsVsCurrent = -upgradeCost; // Negative indicates upgrade cost
          comparison.savingsPercentage = percentage;
        }
      }
    });
  }

  return comparisons;
};
