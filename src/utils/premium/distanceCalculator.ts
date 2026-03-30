/**
 * Distance Calculator
 * Calculates distance between cities and classifies move types
 */

import { City } from '../../types';

// ============================================================================
// TYPES
// ============================================================================

export type MoveType = 'local' | 'regional' | 'long-distance' | 'cross-country' | 'international';

export interface MoveClassification {
  type: MoveType;
  distanceMiles: number;
  requiresFlight: boolean;
  estimatedDrivingHours: number | null;
}

export interface RelocationCostFactors {
  houseHuntingCostPerTrip: number;
  houseHuntingPeopleDefault: number;
  travelCostPerPerson: number;
  tempHousingDays: number;
  storageCostMultiplier: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Distance thresholds in miles
const DISTANCE_THRESHOLDS = {
  local: 100,
  regional: 400,
  longDistance: 1000,
  // Anything over 1000 miles is cross-country
};

// Average driving speed for time estimates (accounting for stops, traffic)
const AVG_DRIVING_SPEED_MPH = 55;

// Cost factors by move type
const COST_FACTORS: Record<MoveType, RelocationCostFactors> = {
  local: {
    houseHuntingCostPerTrip: 150,      // Day trips, gas only
    houseHuntingPeopleDefault: 2,
    travelCostPerPerson: 50,            // Gas for final move
    tempHousingDays: 14,
    storageCostMultiplier: 0.8,
  },
  regional: {
    houseHuntingCostPerTrip: 450,      // Overnight trip: gas + 1 hotel night
    houseHuntingPeopleDefault: 2,
    travelCostPerPerson: 200,           // Gas + food + possibly one night
    tempHousingDays: 30,
    storageCostMultiplier: 1.0,
  },
  'long-distance': {
    houseHuntingCostPerTrip: 900,      // Flights or long drive + 2 hotel nights
    houseHuntingPeopleDefault: 1,       // Often just one person scouts
    travelCostPerPerson: 500,           // Flights or multi-day drive
    tempHousingDays: 45,
    storageCostMultiplier: 1.2,
  },
  'cross-country': {
    houseHuntingCostPerTrip: 1400,     // Round-trip flights + 2-3 hotel nights + car rental
    houseHuntingPeopleDefault: 1,
    travelCostPerPerson: 800,           // One-way flights or week-long drive
    tempHousingDays: 60,
    storageCostMultiplier: 1.5,
  },
  international: {
    houseHuntingCostPerTrip: 2500,     // International flights + multiple nights + expenses
    houseHuntingPeopleDefault: 1,
    travelCostPerPerson: 1500,          // International flights + shipping
    tempHousingDays: 90,
    storageCostMultiplier: 2.0,
  },
};

// ============================================================================
// DISTANCE CALCULATION
// ============================================================================

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in miles
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance);
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate distance between two cities
 * Returns null if coordinates are missing
 */
export function calculateCityDistance(
  fromCity: City,
  toCity: City
): number | null {
  if (
    fromCity.latitude === undefined ||
    fromCity.longitude === undefined ||
    toCity.latitude === undefined ||
    toCity.longitude === undefined
  ) {
    return null;
  }

  return calculateDistance(
    fromCity.latitude,
    fromCity.longitude,
    toCity.latitude,
    toCity.longitude
  );
}

// ============================================================================
// MOVE CLASSIFICATION
// ============================================================================

/**
 * Classify the type of move based on cities
 */
export function classifyMove(
  fromCity: City,
  toCity: City
): MoveClassification {
  // Check for international move first
  if (fromCity.country !== toCity.country) {
    const distanceMiles = calculateCityDistance(fromCity, toCity) ?? 5000;
    return {
      type: 'international',
      distanceMiles,
      requiresFlight: true,
      estimatedDrivingHours: null,
    };
  }

  // Calculate distance
  const distanceMiles = calculateCityDistance(fromCity, toCity);

  // If we can't calculate distance, estimate based on state
  if (distanceMiles === null) {
    // Same state = regional, different state = long-distance
    const isSameState = fromCity.state === toCity.state;
    return {
      type: isSameState ? 'regional' : 'long-distance',
      distanceMiles: isSameState ? 200 : 800,
      requiresFlight: !isSameState,
      estimatedDrivingHours: isSameState ? 4 : 14,
    };
  }

  // Classify based on distance
  let type: MoveType;
  if (distanceMiles < DISTANCE_THRESHOLDS.local) {
    type = 'local';
  } else if (distanceMiles < DISTANCE_THRESHOLDS.regional) {
    type = 'regional';
  } else if (distanceMiles < DISTANCE_THRESHOLDS.longDistance) {
    type = 'long-distance';
  } else {
    type = 'cross-country';
  }

  const requiresFlight = distanceMiles > 500; // ~8-9 hour drive threshold
  const estimatedDrivingHours = distanceMiles / AVG_DRIVING_SPEED_MPH;

  return {
    type,
    distanceMiles,
    requiresFlight,
    estimatedDrivingHours: requiresFlight ? null : Math.round(estimatedDrivingHours * 10) / 10,
  };
}

/**
 * Get cost factors for a move type
 */
export function getCostFactors(moveType: MoveType): RelocationCostFactors {
  return COST_FACTORS[moveType];
}

/**
 * Get cost factors based on city pair
 */
export function getCostFactorsForCities(
  fromCity: City,
  toCity: City
): RelocationCostFactors & { moveClassification: MoveClassification } {
  const classification = classifyMove(fromCity, toCity);
  const factors = getCostFactors(classification.type);

  return {
    ...factors,
    moveClassification: classification,
  };
}

// ============================================================================
// FORMATTED OUTPUT
// ============================================================================

/**
 * Get human-readable move type label
 */
export function getMoveTypeLabel(type: MoveType): string {
  switch (type) {
    case 'local':
      return 'Local Move';
    case 'regional':
      return 'Regional Move';
    case 'long-distance':
      return 'Long-Distance Move';
    case 'cross-country':
      return 'Cross-Country Move';
    case 'international':
      return 'International Move';
  }
}

/**
 * Format distance for display
 */
export function formatDistance(miles: number): string {
  if (miles >= 1000) {
    return `${(miles / 1000).toFixed(1)}K miles`;
  }
  return `${miles} miles`;
}

// ============================================================================
// TRAVEL COST CALCULATIONS
// ============================================================================

// Driving cost constants
const DRIVING_COSTS = {
  gasPerMile: 0.15,           // ~$3.50/gallon, ~25 MPG = $0.14/mile, plus some buffer
  foodPerPersonPerDay: 50,    // Meals on the road
  hotelPerNight: 120,         // Average hotel cost
  maxDrivingHoursPerDay: 10,  // Max comfortable driving hours per day
};

// Flying cost constants
const FLYING_COSTS = {
  domesticFlightBase: 250,    // Base one-way domestic flight
  flightPerMile: 0.05,        // Additional cost scaling with distance
  maxDomesticFlight: 500,     // Cap for domestic flights
  carShippingBase: 800,       // Base car shipping cost
  carShippingPerMile: 0.30,   // Additional per mile for car shipping
  maxCarShipping: 1500,       // Cap for domestic car shipping
};

export interface TravelCostBreakdown {
  mode: 'driving' | 'flying';
  totalCost: number;
  breakdown: {
    label: string;
    amount: number;
  }[];
  drivingDays?: number;
  drivingHours?: number;
}

/**
 * Calculate driving costs for the move
 */
export function calculateDrivingCosts(
  distanceMiles: number,
  householdSize: number
): TravelCostBreakdown {
  const drivingHours = distanceMiles / AVG_DRIVING_SPEED_MPH;
  const drivingDays = Math.ceil(drivingHours / DRIVING_COSTS.maxDrivingHoursPerDay);
  const hotelNights = Math.max(0, drivingDays - 1); // No hotel on last day

  const gasCost = Math.round(distanceMiles * DRIVING_COSTS.gasPerMile);
  const foodCost = Math.round(drivingDays * householdSize * DRIVING_COSTS.foodPerPersonPerDay);
  const hotelCost = Math.round(hotelNights * DRIVING_COSTS.hotelPerNight);

  const breakdown: { label: string; amount: number }[] = [
    { label: 'Gas', amount: gasCost },
    { label: `Food (${drivingDays} day${drivingDays > 1 ? 's' : ''}, ${householdSize} people)`, amount: foodCost },
  ];

  if (hotelNights > 0) {
    breakdown.push({ label: `Hotels (${hotelNights} night${hotelNights > 1 ? 's' : ''})`, amount: hotelCost });
  }

  return {
    mode: 'driving',
    totalCost: gasCost + foodCost + hotelCost,
    breakdown,
    drivingDays,
    drivingHours: Math.round(drivingHours * 10) / 10,
  };
}

/**
 * Calculate flying costs for the move
 */
export function calculateFlyingCosts(
  distanceMiles: number,
  householdSize: number
): TravelCostBreakdown {
  // Flight cost per person (scales with distance, with caps)
  const flightCostPerPerson = Math.min(
    FLYING_COSTS.domesticFlightBase + (distanceMiles * FLYING_COSTS.flightPerMile),
    FLYING_COSTS.maxDomesticFlight
  );
  const totalFlightCost = Math.round(flightCostPerPerson * householdSize);

  // Car shipping cost
  const carShippingCost = Math.min(
    Math.round(FLYING_COSTS.carShippingBase + (distanceMiles * FLYING_COSTS.carShippingPerMile)),
    FLYING_COSTS.maxCarShipping
  );

  const breakdown: { label: string; amount: number }[] = [
    { label: `Flights (${householdSize} ${householdSize === 1 ? 'person' : 'people'})`, amount: totalFlightCost },
    { label: 'Car shipping', amount: carShippingCost },
  ];

  return {
    mode: 'flying',
    totalCost: totalFlightCost + carShippingCost,
    breakdown,
  };
}

/**
 * Calculate travel costs based on mode preference
 */
export function calculateTravelCosts(
  distanceMiles: number,
  householdSize: number,
  mode: 'driving' | 'flying'
): TravelCostBreakdown {
  if (mode === 'driving') {
    return calculateDrivingCosts(distanceMiles, householdSize);
  } else {
    return calculateFlyingCosts(distanceMiles, householdSize);
  }
}
