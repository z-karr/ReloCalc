/**
 * Premium Feature Types
 * ReloFi Premium: Full Analysis Feature
 */

import { City } from './index';

// ============================================
// PREMIUM STATE
// ============================================

export interface PremiumState {
  isPremium: boolean;
  purchaseDate: Date | null;

  // Feature access flags
  canAccessMultiCity: boolean;
  canExportPDF: boolean;
  canAccessProjections: boolean;
  canAccessNegotiationTools: boolean;
  canAccessChecklist: boolean;
}

// ============================================
// FINANCIAL PROJECTION TYPES
// ============================================

export interface ProjectionAssumptions {
  salaryGrowthRate: number;      // Annual % (e.g., 0.03 = 3%)
  rentInflationRate: number;     // Annual % (e.g., 0.03 = 3%)
  homeAppreciationRate: number;  // Annual % (e.g., 0.04 = 4%)
  colInflationRate: number;      // Annual % (e.g., 0.025 = 2.5%)
  savingsRate: number;           // % of net income (e.g., 0.20 = 20%)
  investmentReturnRate: number;  // Annual % (e.g., 0.07 = 7%)
}

export interface YearlyProjection {
  year: number;
  grossSalary: number;
  netSalary: number;
  annualLivingExpenses: number;
  annualRent: number;
  annualSavings: number;
  cumulativeSavings: number;
  netWorth: number;
  homeEquity?: number;           // If buying
}

export interface CityProjection {
  city: City;
  projections: YearlyProjection[];
  totalNetWorthYear5: number;
  totalSavingsYear5: number;
  breakEvenMonth?: number;       // vs current city
  crossoverMonth?: number;       // When this city overtakes another
}

export interface ProjectionComparison {
  currentCity: CityProjection;
  targetCities: CityProjection[];
  assumptions: ProjectionAssumptions;
  recommendation: string;
  insights: string[];
}

// ============================================
// RENT VS BUY TYPES
// ============================================

export interface RentScenario {
  monthlyRent: number;
  annualRentIncrease: number;
  rentersInsurance: number;
  investedDownPayment: number;   // What they'd invest instead
  investmentReturn: number;

  // Projections
  totalRentPaid: number[];       // By year
  investmentValue: number[];     // By year
  totalCost: number[];           // By year (rent - investment gains)
}

export interface BuyScenario {
  purchasePrice: number;
  downPayment: number;
  downPaymentPercent: number;
  loanAmount: number;
  mortgageRate: number;
  mortgageTerm: number;          // Years
  monthlyMortgage: number;

  // Annual costs
  propertyTax: number;
  homeInsurance: number;
  maintenance: number;
  hoaFees: number;

  // Appreciation
  homeAppreciationRate: number;

  // Projections
  homeValue: number[];           // By year
  remainingLoan: number[];       // By year
  equity: number[];              // By year
  totalCost: number[];           // By year (all costs)
  totalPaid: number[];           // Cumulative payments
}

export interface RentVsBuyAnalysis {
  city: City;
  rentScenario: RentScenario;
  buyScenario: BuyScenario;
  breakEvenYear: number | null;  // When buying becomes cheaper, null if never
  recommendation: 'rent' | 'buy' | 'either';
  confidenceLevel: 'high' | 'medium' | 'low';
  reasoning: string;

  // Comparison at key milestones
  comparison5Year: {
    rentTotalCost: number;
    buyTotalCost: number;
    rentNetWorth: number;
    buyNetWorth: number;
    winner: 'rent' | 'buy';
    difference: number;
  };
  comparison10Year: {
    rentTotalCost: number;
    buyTotalCost: number;
    rentNetWorth: number;
    buyNetWorth: number;
    winner: 'rent' | 'buy';
    difference: number;
  };
}

// ============================================
// BREAK-EVEN TYPES
// ============================================

export interface BreakEvenScenario {
  name: 'best' | 'expected' | 'worst';
  salaryGrowth: number;
  colIncrease: number;
  breakEvenMonths: number;
  year5Advantage: number;
}

export interface BreakEvenAnalysis {
  currentCity: City;
  targetCity: City;
  movingCosts: number;

  // Monthly differences
  monthlySalaryDifference: number;
  monthlyColDifference: number;
  monthlyRentDifference: number;
  monthlyNetAdvantage: number;

  // Break-even calculation
  breakEvenMonths: number;
  breakEvenFormatted: string;    // "14 months" or "2 years, 3 months"

  // Scenarios
  scenarios: BreakEvenScenario[];

  // Cumulative advantage over time
  cumulativeAdvantage: {
    month6: number;
    year1: number;
    year2: number;
    year3: number;
    year5: number;
  };

  // Insights
  isFinanciallyBeneficial: boolean;
  recommendation: string;
  considerations: string[];
}

// ============================================
// MULTI-CITY COMPARISON TYPES
// ============================================

export interface CityScore {
  city: City;
  overallScore: number;         // 0-100

  // Category scores
  financialScore: number;
  qualityOfLifeScore: number;
  mobilityScore: number;
  careerScore: number;
  lifestyleScore: number;

  // Detailed metrics
  metrics: {
    netSalary: number;
    colAdjustedIncome: number;
    effectiveTaxRate: number;
    monthlyRent: number;
    homeAffordability: number;  // Months of salary to buy median home
    safetyScore: number;
    healthcareScore: number;
    educationScore: number;
    transitScore: number;
    jobGrowthScore: number;
  };

  // Rankings within comparison set
  rankings: {
    overall: number;
    financial: number;
    qualityOfLife: number;
    affordability: number;
    career: number;
  };

  // Highlights and considerations
  strengths: string[];
  weaknesses: string[];
}

export interface MultiCityComparison {
  cities: CityScore[];
  currentCity: City;
  currentSalary: number;

  // Best city by category
  bestOverall: City;
  bestFinancial: City;
  bestQualityOfLife: City;
  bestCareer: City;
  mostAffordable: City;

  // Comparison insights
  insights: string[];
  recommendation: string;
}

// ============================================
// NEGOTIATION TOOLKIT TYPES
// ============================================

export interface RelocationCostBreakdown {
  movingExpenses: number;
  temporaryHousing: number;      // 30-60 days
  houseHuntingTrips: number;     // 2-3 trips
  duplicateHousing: number;      // Overlap period
  travelCosts: number;
  storageIfNeeded: number;

  // Tax-related
  colAdjustmentNeeded: number;
  taxBurdenDifference: number;
  grossUpAmount: number;         // To cover tax on relocation benefits

  // Total
  totalRelocationCost: number;
}

export interface IndustryBenchmark {
  component: string;
  typicalCoverage: string;
  percentCovered: number;
  dollarRange: {
    low: number;
    high: number;
  };
}

export interface NegotiationToolkit {
  costBreakdown: RelocationCostBreakdown;
  benchmarks: IndustryBenchmark[];

  // Gap analysis
  typicalPackageValue: number;
  actualCosts: number;
  gap: number;

  // Recommended asks
  recommendedAsk: number;
  negotiationPoints: string[];

  // Scripts/templates
  scripts: {
    colAdjustment: string;
    grossUp: string;
    temporaryHousing: string;
    homeSaleAssistance: string;
  };
}

// ============================================
// CHECKLIST TYPES
// ============================================

export interface ChecklistItem {
  id: string;
  task: string;
  category: 'planning' | 'preparation' | 'execution' | 'countdown' | 'settling';
  daysBeforeMove: number;        // Negative for after move
  completed: boolean;
  completedDate?: Date;
  notes?: string;

  // Conditional display
  showIf?: {
    isInternational?: boolean;
    hasPets?: boolean;
    hasChildren?: boolean;
    isHomeowner?: boolean;
    isRenter?: boolean;
  };
}

export interface MovingChecklist {
  moveDate: Date;
  fromCity: City;
  toCity: City;

  // User circumstances
  isInternational: boolean;
  hasPets: boolean;
  hasChildren: boolean;
  isCurrentlyHomeowner: boolean;

  // Checklist items
  items: ChecklistItem[];

  // Progress
  totalItems: number;
  completedItems: number;
  percentComplete: number;

  // Current phase
  currentPhase: 'planning' | 'preparation' | 'execution' | 'countdown' | 'settling';
  daysUntilMove: number;
}

// ============================================
// PDF REPORT TYPES
// ============================================

export interface PDFReportData {
  generatedAt: Date;

  // User info
  currentCity: City;
  currentSalary: number;
  targetCities: City[];
  targetSalaries: number[];

  // Analysis results
  multiCityComparison: MultiCityComparison;
  projections: ProjectionComparison;
  rentVsBuyAnalyses: RentVsBuyAnalysis[];
  breakEvenAnalyses: BreakEvenAnalysis[];
  negotiationToolkit: NegotiationToolkit;
  checklist: MovingChecklist;

  // Summary
  topRecommendation: City;
  executiveSummary: string;
  keyInsights: string[];
}

export interface PDFExportOptions {
  includeProjections: boolean;
  includeRentVsBuy: boolean;
  includeNegotiation: boolean;
  includeChecklist: boolean;
  paperSize: 'letter' | 'a4';
  includeCharts: boolean;
}

// ============================================
// HOUSING INTENT OPTIONS
// ============================================

export interface HousingIntent {
  plansToBuy: boolean;
  downPaymentPercent: number;     // e.g., 0.20 = 20%
  targetHomePrice?: number;       // Optional - use city median if not provided
  mortgageRate?: number;          // Optional - use default if not provided
  mortgageTerm?: number;          // Years, default 30
}

export const DEFAULT_HOUSING_INTENT: HousingIntent = {
  plansToBuy: false,
  downPaymentPercent: 0.20,
  mortgageTerm: 30,
};

// ============================================
// PREMIUM CITY DATA EXTENSIONS
// ============================================

export interface CityPremiumData {
  // Housing costs
  propertyTaxRate: number;       // Annual % of home value
  homeInsuranceRate: number;     // Annual % of home value
  avgMaintenanceCost: number;    // Annual % of home value
  avgHOAFees?: number;           // Monthly average, optional

  // Economic trends
  rentInflationRate: number;     // Annual %
  homeAppreciationRate: number;  // Annual %
  salaryGrowthRate: number;      // Annual %

  // Mortgage
  currentMortgageRate: number;   // Annual %
  typicalDownPayment: number;    // % required
}

// Default values when city-specific data is unavailable
export const PREMIUM_DEFAULTS: CityPremiumData = {
  propertyTaxRate: 0.011,        // US average ~1.1%
  homeInsuranceRate: 0.005,      // ~0.5% average
  avgMaintenanceCost: 0.01,      // 1% rule of thumb
  rentInflationRate: 0.03,       // 3% historical average
  homeAppreciationRate: 0.04,    // 4% long-term average
  salaryGrowthRate: 0.03,        // 3% average
  currentMortgageRate: 0.068,    // Current market ~6.8%
  typicalDownPayment: 0.20,      // 20% conventional
};

// Default projection assumptions
export const DEFAULT_ASSUMPTIONS: ProjectionAssumptions = {
  salaryGrowthRate: 0.03,
  rentInflationRate: 0.03,
  homeAppreciationRate: 0.04,
  colInflationRate: 0.025,
  savingsRate: 0.20,
  investmentReturnRate: 0.07,
};
