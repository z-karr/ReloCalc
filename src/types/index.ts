// Core data types for the Relocation Calculator

// ============================================================================
// INTERNATIONAL SUPPORT TYPES
// ============================================================================

export type Region =
  | 'north_america'
  | 'europe'
  | 'asia_pacific'
  | 'latin_america'
  | 'middle_east'
  | 'africa'
  | 'oceania';

export type LanguageBarrier = 'none' | 'low' | 'medium' | 'high';

export type TaxSystemType =
  | 'us_federal_state'
  | 'progressive_national'  // Canada, UK, Australia, most European countries
  | 'flat_national'          // Some Eastern European countries
  | 'territorial'            // Singapore, Hong Kong
  | 'vat_based'             // UAE
  | 'hybrid';               // Complex systems like Japan

export interface Currency {
  code: string;              // ISO 4217: 'USD', 'EUR', 'GBP', 'JPY', etc.
  symbol: string;            // '$', '€', '£', '¥', etc.
  name: string;              // 'US Dollar', 'Euro', etc.
  exchangeRate: number;      // Relative to USD (USD = 1.0)
  lastUpdated: string;       // ISO date string
}

export interface Country {
  id: string;                // 'us', 'ca', 'uk', 'de', 'au', etc.
  name: string;              // 'United States', 'Canada', etc.
  code: string;              // ISO 3166-1 alpha-2 country code
  region: Region;
  currency: Currency;
  taxSystem: TaxSystemType;
  requiresVisa: boolean;     // For US citizens
  languageBarrier: LanguageBarrier;
}

// Tax rate structures for different systems
export interface USTaxRates {
  type: 'us_federal_state';
  stateTaxRate: number;
  localTaxRate: number;
}

export interface ProgressiveTaxRates {
  type: 'progressive_national';
  regionalRate: number; // Provincial/state/regional tax rate
  socialContributions: number; // Social security, CPP, EI, etc.
  vatRate?: number; // For countries with VAT/GST
}

export interface FlatTaxRates {
  type: 'flat_national';
  flatRate: number;
  socialInsuranceRate?: number;
  vatRate?: number;
}

export interface VATBasedRates {
  type: 'vat_based';
  vatRate: number;
  corporateTaxOnly: boolean;
}

export interface TaxBracket {
  min: number;               // In local currency
  max: number;               // Infinity for top bracket
  rate: number;              // Decimal (e.g., 0.15 = 15%)
}

export type TaxRateInfo = USTaxRates | ProgressiveTaxRates | FlatTaxRates | VATBasedRates;

// ============================================================================
// CITY TYPES
// ============================================================================

export interface City {
  id: string;
  name: string;
  state?: string;            // Optional for international cities

  // NEW: Country information
  country: string;           // Country ID ('us', 'ca', 'uk', etc.)
  countryCode: string;       // ISO 3166-1 alpha-2 country code

  // NEW: Coordinates for distance calculation
  latitude?: number;         // Latitude coordinate
  longitude?: number;        // Longitude coordinate

  // Cost of Living (100 = global average, stored in USD)
  costOfLivingIndex: number;
  medianRent: number;        // In USD
  medianRentLocal?: number;  // NEW: In local currency (optional)
  medianHomePrice: number;   // In USD
  medianHomePriceLocal?: number; // NEW: In local currency (optional)

  // Tax rates - flexible structure for different systems
  // DEPRECATED: stateTaxRate and localTaxRate (kept for backward compatibility)
  stateTaxRate?: number;
  localTaxRate?: number;
  // NEW: Flexible tax rate structure
  taxRates: TaxRateInfo;

  // Climate and demographics (universal)
  climate: ClimateType;
  population: number;
  crimeIndex: number;        // lower is better
  walkScore: number;
  transitScore: number;
  jobGrowthRate: number;
  averageCommute: number;    // minutes
  healthcareIndex: number;
  educationIndex: number;
  entertainmentIndex: number;
  outdoorIndex: number;

  // NEW: International-specific fields
  visaRequired?: boolean;    // For US citizens (optional, defaults to false for US cities)
  languageBarrier?: LanguageBarrier; // Optional, defaults to 'none' for US/UK/AU/etc.
  timeZoneOffset?: number;   // Hours from UTC (optional)
  expatCommunitySize?: 'small' | 'medium' | 'large'; // Optional

  // PREMIUM: Optional city-specific premium data
  // If not provided, defaults from PREMIUM_DEFAULTS in types/premium.ts are used
  premiumData?: {
    propertyTaxRate?: number;       // Annual % of home value
    homeInsuranceRate?: number;     // Annual % of home value
    avgMaintenanceCost?: number;    // Annual % of home value
    avgHOAFees?: number;            // Monthly average
    rentInflationRate?: number;     // Annual %
    homeAppreciationRate?: number;  // Annual %
    salaryGrowthRate?: number;      // Annual %
    currentMortgageRate?: number;   // Annual %
    typicalDownPayment?: number;    // % required
  };
}

export type ClimateType = 'tropical' | 'dry' | 'temperate' | 'continental' | 'polar';

export interface UserPreferences {
  prioritizeWeather: number; // 1-10
  prioritizeCost: number;
  prioritizeSafety: number;
  prioritizeTransit: number;
  prioritizeOutdoors: number;
  prioritizeEntertainment: number;
  prioritizeEducation: number;
  prioritizeHealthcare: number;
  preferredClimate: ClimateType[];
  maxCommute: number;
  minWalkScore: number;

  // Global user context
  homeCountry: string;           // Country ID ('us', 'gb', 'de', etc.)
  homeCurrency: string;          // Currency code ('USD', 'GBP', 'EUR')
  currencyDisplayMode: 'home_first' | 'usd_first';  // Display preference
  autoDetected: boolean;         // Whether values were auto-detected

  // Regional filtering (for recommendations)
  regionFilter?: Region[] | 'all';  // Array of regions to include, or 'all' for no filter
  countryFilter?: string[] | 'all';  // Array of country codes to include, or 'all' for no filter
}

export interface SalaryCalculation {
  // All amounts in USD (for consistency and comparison)
  grossSalary: number;
  federalTax: number;
  stateTax: number;
  localTax: number;
  fica: number;
  netSalary: number;
  adjustedNetSalary: number; // after COL adjustment
  monthlyTakeHome: number;
  effectiveTaxRate: number;

  // NEW: Local currency support (optional for international cities)
  currency?: Currency;
  grossSalaryLocal?: number;
  netSalaryLocal?: number;
  monthlyTakeHomeLocal?: number;

  // NEW: Detailed tax breakdown for international systems
  taxBreakdown?: {
    incomeTax: number;      // National/federal income tax
    regionalTax?: number;   // State/provincial/local tax
    socialInsurance?: number; // Social security, pension contributions
    vat?: number;           // VAT (estimated on spending)
    otherTaxes?: number;    // Health insurance levy, etc.
    totalTax: number;
  };
}

export interface RelocationExpense {
  id: string;
  category: ExpenseCategory;
  description: string;
  estimatedCost: number;
  actualCost?: number;
  isRequired: boolean;
}

export type ExpenseCategory =
  | 'moving_company'
  | 'truck_rental'
  | 'packing_supplies'
  | 'storage'
  | 'travel'
  | 'temporary_housing'
  | 'deposits'
  | 'utilities_setup'
  | 'vehicle_transport'
  | 'pet_transport'
  | 'professional_services'
  | 'miscellaneous'
  // NEW: International categories
  | 'container_shipping'
  | 'customs_clearance'
  | 'port_fees'
  | 'visa_immigration'
  | 'quarantine'
  | 'import_duties';

export interface MovingEstimate {
  // NEW: City-based moves (international support)
  fromCity?: City;
  toCity?: City;
  moveType?: MoveType;

  // Legacy distance-based (kept for backward compatibility)
  distance: number;

  homeSize: HomeSize;
  movingMethod: MovingMethod;

  // NEW: International-specific options
  containerSize?: ContainerSize;

  hasVehicle: boolean;
  hasPets: boolean;
  isRenting: boolean;

  totalEstimate: number;
  breakdown: RelocationExpense[];
}

export type HomeSize = 'studio' | '1br' | '2br' | '3br' | '4br' | 'house_small' | 'house_large';

// NEW: Move type detection
export type MoveType = 'domestic' | 'intra_regional' | 'intercontinental';

// NEW: International moving methods
export type MovingMethod =
  // US Domestic
  | 'diy'           // DIY truck rental
  | 'hybrid'        // PODS/portable container
  | 'full_service'  // Professional movers
  // European intra-regional
  | 'euro_truck'    // Professional truck-based movers
  // Intercontinental
  | 'minimalist'    // Suitcases only
  | 'lcl'           // Less than Container Load (shared)
  | 'fcl_20'        // 20ft Full Container Load
  | 'fcl_40';       // 40ft Full Container Load

// NEW: Container sizes for intercontinental moves
export type ContainerSize =
  | 'minimalist'    // 0 CBM - suitcases only
  | 'lcl'           // 5-15 CBM - shared container
  | '20ft'          // 30 CBM - small apartment
  | '40ft';         // 67.7 CBM - full household

export interface ComparisonResult {
  currentCity: City;
  targetCity: City;
  salaryComparison: {
    current: SalaryCalculation;
    target: SalaryCalculation;
    difference: number;
    percentChange: number;
  };
  costComparison: {
    rentDifference: number;
    overallCOLDifference: number;
    monthlyNetDifference: number;
  };
  qualityOfLife: {
    currentScore: number;
    targetScore: number;
    recommendations: string[];
  };
  movingCosts: MovingEstimate;
  breakEvenMonths: number;
}

export interface CityRecommendation {
  city: City;
  matchScore: number;
  highlights: string[];
  considerations: string[];
  salaryNeeded: number; // to maintain current lifestyle
}
