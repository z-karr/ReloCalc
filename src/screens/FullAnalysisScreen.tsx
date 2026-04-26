/**
 * Full Analysis Screen
 * Premium hub for comprehensive relocation analysis
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Platform,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../theme';
import { Card, CityPicker, Input, Button, DataDisclaimer } from '../components';
import { City } from '../types';
import { DEFAULT_ASSUMPTIONS, HousingIntent } from '../types/premium';
import { usePremium } from '../context/PremiumContext';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { CurrencyService } from '../utils/currency/exchangeRates';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Premium Components
import { PaywallModal } from '../components/premium/PaywallModal';
import { ProjectionChart } from '../components/premium/ProjectionChart';
import { RentVsBuyCard } from '../components/premium/RentVsBuyCard';
import { ScenarioComparison } from '../components/premium/ScenarioComparison';
import { NegotiationToolkit } from '../components/premium/NegotiationToolkit';
import { ChecklistSection } from '../components/premium/ChecklistSection';
import { PDFReportData, generateAndSharePDF, printPDFReport } from '../utils/premium/pdfGenerator';
import { MultiCitySummaryGrid } from '../components/premium/MultiCitySummaryGrid';
import { CityDetailSelector } from '../components/premium/CityDetailSelector';

// Premium Calculators
import {
  calculateCityProjection,
  compareProjections,
  calculateScenarios,
} from '../utils/premium/projectionCalculator';
import { calculateBreakEven } from '../utils/premium/breakEvenCalculator';
import { calculateRentVsBuy } from '../utils/premium/rentVsBuyCalculator';
import { calculateNegotiationToolkit } from '../utils/premium/negotiationCalculator';
import { generateChecklist, ChecklistOptions } from '../utils/premium/checklistGenerator';
import { classifyMove } from '../utils/premium/distanceCalculator';

// Existing calculators
import { calculateSalary } from '../utils/taxCalculator';

// ============================================================================
// TYPES
// ============================================================================

interface FullAnalysisScreenProps {
  navigation: any;
  route?: {
    params?: {
      returnedMovingCost?: number;
      forCityId?: string;
    };
  };
}

interface TargetCity {
  city: City | null;
  salary: string;
}

type TabId = 'overview' | 'projections' | 'housing' | 'negotiate' | 'checklist' | 'export';

interface TabConfig {
  id: TabId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  premiumOnly: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TABS: TabConfig[] = [
  { id: 'overview', label: 'Overview', icon: 'analytics-outline', premiumOnly: false },
  { id: 'projections', label: 'Projections', icon: 'trending-up-outline', premiumOnly: true },
  { id: 'housing', label: 'Housing', icon: 'home-outline', premiumOnly: true },
  { id: 'negotiate', label: 'Negotiate', icon: 'briefcase-outline', premiumOnly: true },
  { id: 'checklist', label: 'Checklist', icon: 'checkbox-outline', premiumOnly: true },
  { id: 'export', label: 'Export', icon: 'download-outline', premiumOnly: true },
];

const MAX_FREE_CITIES = 1;
const MAX_PREMIUM_CITIES = 5;
const FORM_STATE_STORAGE_KEY = '@FullAnalysis:formState';
const SAVED_INPUTS_KEY = '@FullAnalysis:savedInputs';
const ONBOARDING_SEEN_KEY = '@FullAnalysis:onboardingSeen';
const SAVED_CHECKLISTS_KEY = '@FullAnalysis:savedChecklists';

// Helper to parse currency string to whole-dollar number
// Handles commas, dollar signs, and decimals (e.g., "7,149.186" → 7149)
const parseSalary = (value: string): number => {
  // Strip dollar signs and commas, then parse as float to handle decimals correctly
  const cleaned = value.replace(/[$,]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.round(num);
};

// ============================================================================
// COMPONENT
// ============================================================================

export const FullAnalysisScreen: React.FC<FullAnalysisScreenProps> = ({ navigation, route }) => {
  // Premium state
  const { isPremium, canAccessProjections, canAccessChecklist } = usePremium();
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState<string>('');

  // User preferences for currency
  const { preferences } = useUserPreferences();
  const currencySymbol = CurrencyService.getCurrency(preferences.homeCurrency).symbol;

  // Input state
  const [currentCity, setCurrentCity] = useState<City | null>(null);
  const [currentSalary, setCurrentSalary] = useState('');
  const [targetCities, setTargetCities] = useState<TargetCity[]>([{ city: null, salary: '' }]);
  // Per-city moving costs (keyed by city ID)
  const [movingCosts, setMovingCosts] = useState<Record<string, string>>({});
  const [moveDate, setMoveDate] = useState<Date>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 2); // Default to 2 months from now
    return date;
  });

  // Circumstance toggles
  const [hasPets, setHasPets] = useState(false);
  const [hasChildren, setHasChildren] = useState(false);
  const [isHomeowner, setIsHomeowner] = useState(false);

  // Household & relocation details (for negotiation estimates)
  const [householdSize, setHouseholdSize] = useState('1');
  const [houseHuntingTrips, setHouseHuntingTrips] = useState('2');
  const [tempHousingDays, setTempHousingDays] = useState(''); // Empty = use smart default

  // Per-city travel mode overrides (key = city id, value = 'driving' | 'flying')
  const [travelModeOverrides, setTravelModeOverrides] = useState<Record<string, 'driving' | 'flying'>>({});

  // Housing intent in target city
  const [plansToBuy, setPlansToBuy] = useState(false);
  const [downPaymentPercent, setDownPaymentPercent] = useState('20');
  const [targetHomePrice, setTargetHomePrice] = useState(''); // Empty = use city median
  const [mortgageRate, setMortgageRate] = useState(''); // Empty = use default 6.8%

  // UI state
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [showCircumstances, setShowCircumstances] = useState(false);
  const [checklist, setChecklist] = useState<any>(null);
  const [savedChecklists, setSavedChecklists] = useState<Record<string, any>>({});
  const [showChecklistInfo, setShowChecklistInfo] = useState(false);
  const [showCalculationInfo, setShowCalculationInfo] = useState(false);
  const [showProjectionInfo, setShowProjectionInfo] = useState(false);
  const [showOnboardingNudge, setShowOnboardingNudge] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Selected city for detailed analysis (index into validTargetCities)
  const [selectedDetailCityIndex, setSelectedDetailCityIndex] = useState(0);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Restore saved inputs on mount (for returning users)
  useEffect(() => {
    const restoreSavedInputs = async () => {
      // Don't restore if we're returning from the moving estimator (that has its own flow)
      if (route?.params?.returnedMovingCost !== undefined) return;

      try {
        const saved = await AsyncStorage.getItem(SAVED_INPUTS_KEY);
        if (!saved) return;

        const parsed = JSON.parse(saved);
        if (parsed.currentCity) setCurrentCity(parsed.currentCity);
        if (parsed.currentSalary) setCurrentSalary(parsed.currentSalary);
        if (parsed.targetCities) setTargetCities(parsed.targetCities);
        if (parsed.movingCosts) setMovingCosts(parsed.movingCosts);
        if (parsed.moveDate) setMoveDate(new Date(parsed.moveDate));
        if (parsed.hasPets !== undefined) setHasPets(parsed.hasPets);
        if (parsed.hasChildren !== undefined) setHasChildren(parsed.hasChildren);
        if (parsed.isHomeowner !== undefined) setIsHomeowner(parsed.isHomeowner);
        if (parsed.householdSize) setHouseholdSize(parsed.householdSize);
        if (parsed.houseHuntingTrips) setHouseHuntingTrips(parsed.houseHuntingTrips);
        if (parsed.tempHousingDays) setTempHousingDays(parsed.tempHousingDays);
        if (parsed.plansToBuy !== undefined) setPlansToBuy(parsed.plansToBuy);
        if (parsed.downPaymentPercent) setDownPaymentPercent(parsed.downPaymentPercent);
        if (parsed.targetHomePrice) setTargetHomePrice(parsed.targetHomePrice);
        if (parsed.mortgageRate) setMortgageRate(parsed.mortgageRate);
        if (parsed.travelModeOverrides) setTravelModeOverrides(parsed.travelModeOverrides);
        if (parsed.showResults) setShowResults(true);
      } catch (error) {
        console.error('Failed to restore saved inputs:', error);
      }
    };
    restoreSavedInputs();
  }, []);

  // Auto-save inputs whenever they change (debounced via the dependency array)
  useEffect(() => {
    // Don't save until the user has at least entered a current city
    if (!currentCity) return;

    const saveInputs = async () => {
      try {
        const inputs = {
          currentCity,
          currentSalary,
          targetCities,
          movingCosts,
          moveDate: moveDate.toISOString(),
          hasPets,
          hasChildren,
          isHomeowner,
          householdSize,
          houseHuntingTrips,
          tempHousingDays,
          plansToBuy,
          downPaymentPercent,
          targetHomePrice,
          mortgageRate,
          travelModeOverrides,
          showResults,
        };
        await AsyncStorage.setItem(SAVED_INPUTS_KEY, JSON.stringify(inputs));
      } catch (error) {
        console.error('Failed to save inputs:', error);
      }
    };
    saveInputs();
  }, [
    currentCity, currentSalary, targetCities, movingCosts, moveDate,
    hasPets, hasChildren, isHomeowner, householdSize, houseHuntingTrips,
    tempHousingDays, plansToBuy, downPaymentPercent, targetHomePrice,
    mortgageRate, travelModeOverrides, showResults,
  ]);

  // Restore saved checklists on mount
  useEffect(() => {
    const restoreSavedChecklists = async () => {
      try {
        const saved = await AsyncStorage.getItem(SAVED_CHECKLISTS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Convert date strings back to Date objects
          for (const key of Object.keys(parsed)) {
            const cl = parsed[key];
            cl.moveDate = new Date(cl.moveDate);
            cl.items = cl.items.map((item: any) => ({
              ...item,
              completedDate: item.completedDate ? new Date(item.completedDate) : undefined,
            }));
          }
          setSavedChecklists(parsed);
        }
      } catch (error) {
        console.error('Failed to restore saved checklists:', error);
      }
    };
    restoreSavedChecklists();
  }, []);

  // Restore form state and apply returned moving cost when returning from Moving Estimator
  useEffect(() => {
    const restoreFormStateAndApplyCost = async () => {
      const returnedMovingCost = route?.params?.returnedMovingCost;
      const forCityId = route?.params?.forCityId;

      if (returnedMovingCost === undefined || !forCityId) return;

      try {
        const savedState = await AsyncStorage.getItem(FORM_STATE_STORAGE_KEY);
        if (savedState) {
          const parsed = JSON.parse(savedState);
          // Restore all form state
          if (parsed.currentCity) setCurrentCity(parsed.currentCity);
          if (parsed.currentSalary) setCurrentSalary(parsed.currentSalary);
          if (parsed.targetCities) setTargetCities(parsed.targetCities);
          if (parsed.hasPets !== undefined) setHasPets(parsed.hasPets);
          if (parsed.hasChildren !== undefined) setHasChildren(parsed.hasChildren);
          if (parsed.isHomeowner !== undefined) setIsHomeowner(parsed.isHomeowner);
          if (parsed.householdSize) setHouseholdSize(parsed.householdSize);
          if (parsed.houseHuntingTrips) setHouseHuntingTrips(parsed.houseHuntingTrips);
          if (parsed.tempHousingDays) setTempHousingDays(parsed.tempHousingDays);
          if (parsed.plansToBuy !== undefined) setPlansToBuy(parsed.plansToBuy);
          if (parsed.downPaymentPercent) setDownPaymentPercent(parsed.downPaymentPercent);
          if (parsed.targetHomePrice) setTargetHomePrice(parsed.targetHomePrice);
          if (parsed.mortgageRate) setMortgageRate(parsed.mortgageRate);
          if (parsed.travelModeOverrides) setTravelModeOverrides(parsed.travelModeOverrides);

          // Restore old moving costs AND apply the new calculated cost
          const restoredMovingCosts = parsed.movingCosts || {};
          restoredMovingCosts[forCityId] = returnedMovingCost.toLocaleString();
          setMovingCosts(restoredMovingCosts);

          // Clear stored state after restoring
          await AsyncStorage.removeItem(FORM_STATE_STORAGE_KEY);
        } else {
          // No saved state, just apply the moving cost
          setMovingCosts(prev => ({
            ...prev,
            [forCityId]: returnedMovingCost.toLocaleString(),
          }));
        }

        // Clear the params to prevent re-applying on re-render
        navigation.setParams({ returnedMovingCost: undefined, forCityId: undefined });
      } catch (error) {
        console.error('Failed to restore form state:', error);
        // Still try to apply the moving cost even if restore fails
        setMovingCosts(prev => ({
          ...prev,
          [forCityId]: returnedMovingCost.toLocaleString(),
        }));
        navigation.setParams({ returnedMovingCost: undefined, forCityId: undefined });
      }
    };

    restoreFormStateAndApplyCost();
  }, [route?.params?.returnedMovingCost, route?.params?.forCityId, navigation]);

  // ============================================================================
  // HELPERS
  // ============================================================================

  // Save form state before navigating to calculator
  const saveFormStateAndNavigate = useCallback(async (toCityId: string, toCityName: string) => {
    try {
      const formState = {
        currentCity,
        currentSalary,
        targetCities,
        movingCosts,
        hasPets,
        hasChildren,
        isHomeowner,
        householdSize,
        houseHuntingTrips,
        tempHousingDays,
        plansToBuy,
        downPaymentPercent,
        targetHomePrice,
        mortgageRate,
        travelModeOverrides,
      };
      await AsyncStorage.setItem(FORM_STATE_STORAGE_KEY, JSON.stringify(formState));

      // Navigate to Moving Estimator
      navigation.navigate('MovingEstimator', {
        fromFullAnalysis: true,
        fromCityId: currentCity?.id,
        fromCityName: currentCity?.name,
        toCityId,
        toCityName,
      });
    } catch (error) {
      console.error('Failed to save form state:', error);
      // Navigate anyway even if save fails
      navigation.navigate('MovingEstimator', {
        fromFullAnalysis: true,
        fromCityId: currentCity?.id,
        fromCityName: currentCity?.name,
        toCityId,
        toCityName,
      });
    }
  }, [
    currentCity, currentSalary, targetCities, movingCosts,
    hasPets, hasChildren, isHomeowner, householdSize,
    houseHuntingTrips, tempHousingDays, plansToBuy,
    downPaymentPercent, targetHomePrice, mortgageRate,
    travelModeOverrides, navigation
  ]);

  const maxCities = isPremium ? MAX_PREMIUM_CITIES : MAX_FREE_CITIES;

  const validTargetCities = useMemo(() => {
    return targetCities.filter(t => t.city !== null && t.salary !== '');
  }, [targetCities]);

  const canCalculate = useMemo(() => {
    // Check if all target cities have moving costs entered
    const allCitiesHaveMovingCosts = validTargetCities.every(
      t => t.city && movingCosts[t.city.id] && movingCosts[t.city.id] !== ''
    );
    return currentCity !== null &&
           currentSalary !== '' &&
           validTargetCities.length > 0 &&
           allCitiesHaveMovingCosts;
  }, [currentCity, currentSalary, validTargetCities, movingCosts]);

  const triggerPaywall = useCallback((feature: string) => {
    setPaywallFeature(feature);
    setShowPaywall(true);
  }, []);

  // Format currency with commas, no decimals (e.g., "7149.186" -> "7,149")
  const formatSalaryValue = useCallback((value: string): string => {
    const cleaned = value.replace(/[$,]/g, '');
    if (cleaned === '') return '';
    const num = Math.round(parseFloat(cleaned));
    if (isNaN(num)) return '';
    return num.toLocaleString('en-US');
  }, []);

  const handleTabPress = useCallback((tab: TabConfig) => {
    if (tab.premiumOnly && !isPremium) {
      triggerPaywall(tab.label);
    } else {
      setActiveTab(tab.id);
    }
  }, [isPremium, triggerPaywall]);

  const addTargetCity = useCallback(() => {
    if (targetCities.length >= maxCities) {
      if (!isPremium) {
        triggerPaywall('Multi-City Comparison');
      }
      return;
    }
    setTargetCities(prev => [...prev, { city: null, salary: '' }]);
  }, [targetCities.length, maxCities, isPremium, triggerPaywall]);

  const removeTargetCity = useCallback((index: number) => {
    if (targetCities.length > 1) {
      setTargetCities(prev => prev.filter((_, i) => i !== index));
    }
  }, [targetCities.length]);

  const updateTargetCity = useCallback((index: number, city: City | null) => {
    setTargetCities(prev => prev.map((t, i) => i === index ? { ...t, city } : t));
  }, []);

  const updateTargetSalary = useCallback((index: number, salary: string) => {
    setTargetCities(prev => prev.map((t, i) => i === index ? { ...t, salary } : t));
  }, []);

  // ============================================================================
  // AUTO-DETECTED VALUES
  // ============================================================================

  // Auto-detect if any target city is international
  const hasAnyInternational = useMemo(() => {
    if (!currentCity) return false;
    return validTargetCities.some(t => t.city && t.city.country !== currentCity.country);
  }, [currentCity, validTargetCities]);

  // Auto-detect travel modes per city based on distance
  // Auto-detect travel modes per city, but allow overrides
  const cityTravelModes = useMemo(() => {
    if (!currentCity) return {};
    const modes: Record<string, { auto: 'driving' | 'flying'; effective: 'driving' | 'flying'; distance: number }> = {};
    validTargetCities.forEach(t => {
      if (t.city) {
        const classification = classifyMove(currentCity, t.city);
        const autoMode = classification.requiresFlight ? 'flying' : 'driving';
        // Use override if set, otherwise use auto-detected
        const effectiveMode = travelModeOverrides[t.city.id] || autoMode;
        modes[t.city.id] = {
          auto: autoMode,
          effective: effectiveMode,
          distance: classification.distanceMiles,
        };
      }
    });
    return modes;
  }, [currentCity, validTargetCities, travelModeOverrides]);

  // Toggle travel mode override for a city
  const toggleTravelMode = useCallback((cityId: string) => {
    setTravelModeOverrides(prev => {
      const currentMode = prev[cityId] || cityTravelModes[cityId]?.auto || 'driving';
      const newMode = currentMode === 'driving' ? 'flying' : 'driving';
      return { ...prev, [cityId]: newMode };
    });
  }, [cityTravelModes]);

  // ============================================================================
  // CALCULATIONS
  // ============================================================================

  const analysis = useMemo(() => {
    if (!canCalculate || !currentCity) return null;

    const currentSalaryNum = parseSalary(currentSalary);
    const primaryTarget = validTargetCities[0];

    if (!primaryTarget.city) return null;

    // Build housing intent from user inputs
    const housingIntentObj: HousingIntent = {
      plansToBuy,
      downPaymentPercent: parseFloat(downPaymentPercent) / 100 || 0.20,
      targetHomePrice: targetHomePrice ? parseFloat(targetHomePrice) : undefined,
      mortgageRate: mortgageRate ? parseFloat(mortgageRate) / 100 : undefined,
      mortgageTerm: 30,
    };

    // Basic calculations for current city
    const currentCalc = calculateSalary(currentSalaryNum, currentCity);

    // Calculate baseline expenses from current city (65% of net income)
    // This is used to scale expenses in target cities by COL ratio
    const baselineExpenses = currentCalc.netSalary * 0.65;
    const baselineCOL = currentCity.costOfLivingIndex;

    // Current city projection (no baseline needed - it IS the baseline, assumes renting)
    const currentProjection = calculateCityProjection(
      currentCity,
      currentSalaryNum,
      DEFAULT_ASSUMPTIONS,
      0
    );

    // Calculate analyses for ALL target cities
    const allCityAnalyses = validTargetCities.map((target) => {
      const targetSalaryNum = parseSalary(target.salary);
      const targetMovingCostNum = parseSalary(movingCosts[target.city!.id] || '0');
      const targetCalc = calculateSalary(targetSalaryNum, target.city!);

      // Break-even analysis
      const breakEven = calculateBreakEven(
        currentCity,
        currentSalaryNum,
        target.city!,
        targetSalaryNum,
        targetMovingCostNum,
        DEFAULT_ASSUMPTIONS,
        housingIntentObj
      );

      // Target city projection
      const projection = calculateCityProjection(
        target.city!,
        targetSalaryNum,
        DEFAULT_ASSUMPTIONS,
        targetMovingCostNum,
        baselineExpenses,
        baselineCOL,
        housingIntentObj
      );

      // Scenario analysis
      const scenarios = calculateScenarios(
        target.city!,
        targetSalaryNum,
        targetMovingCostNum,
        baselineExpenses,
        baselineCOL,
        housingIntentObj
      );

      // Rent vs Buy analysis
      const rentVsBuy = calculateRentVsBuy(
        target.city!,
        10,
        {
          purchasePrice: housingIntentObj.targetHomePrice,
          downPaymentPercent: housingIntentObj.downPaymentPercent,
          mortgageRate: housingIntentObj.mortgageRate,
        }
      );

      // Move classification - calculate first for travel mode
      const moveClassification = classifyMove(currentCity, target.city!);

      // Negotiation toolkit - use per-city travel mode (respects user overrides)
      const autoMode = moveClassification.requiresFlight ? 'flying' : 'driving';
      const cityTravelMode = travelModeOverrides[target.city!.id] || autoMode;
      const negotiation = calculateNegotiationToolkit(
        currentCity,
        currentSalaryNum,
        target.city!,
        targetSalaryNum,
        targetMovingCostNum,
        {
          householdSize: parseInt(householdSize, 10) || 1,
          houseHuntingTrips: parseInt(houseHuntingTrips, 10) || 2,
          temporaryHousingDays: tempHousingDays ? parseInt(tempHousingDays, 10) : undefined,
          moveTravelMode: cityTravelMode,
          plansToBuy,
        }
      );

      // Checklist
      const checklistOptions: ChecklistOptions = {
        moveDate,
        fromCity: currentCity,
        toCity: target.city!,
        isInternational: target.city!.country !== currentCity.country,
        hasPets,
        hasChildren,
        isCurrentlyHomeowner: isHomeowner,
        isCurrentlyRenter: !isHomeowner,
      };
      const cityChecklist = generateChecklist(checklistOptions);

      return {
        city: target.city!,
        salary: targetSalaryNum,
        targetCalc,
        breakEven,
        projection,
        scenarios,
        rentVsBuy,
        negotiation,
        checklist: cityChecklist,
        moveClassification,
        isPositive: breakEven.breakEvenMonths !== Infinity && breakEven.breakEvenMonths > 0,
      };
    });

    // Multi-city comparison for projection chart
    const projectionComparison = validTargetCities.length > 0
      ? compareProjections(
          currentCity,
          currentSalaryNum,
          validTargetCities.map(t => ({
            city: t.city!,
            salary: parseSalary(t.salary),
          })),
          DEFAULT_ASSUMPTIONS,
          validTargetCities.map(t => parseSalary(movingCosts[t.city!.id] || '0')),
          housingIntentObj
        )
      : null;

    // Primary target for backward compatibility
    const primaryAnalysis = allCityAnalyses[0];

    return {
      // Current city data
      currentCalc,
      currentProjection,
      currentCity,

      // All target cities analyses
      allCityAnalyses,

      // Primary target (backward compatibility)
      primaryTarget: primaryTarget.city,
      targetCalc: primaryAnalysis.targetCalc,
      breakEven: primaryAnalysis.breakEven,
      projection: primaryAnalysis.projection,
      scenarios: primaryAnalysis.scenarios,
      rentVsBuy: primaryAnalysis.rentVsBuy,
      negotiation: primaryAnalysis.negotiation,
      checklist: primaryAnalysis.checklist,
      moveClassification: primaryAnalysis.moveClassification,
      isPositive: primaryAnalysis.isPositive,

      // Shared data
      projectionComparison,
      housingIntent: housingIntentObj,
      householdSizeNum: parseInt(householdSize, 10) || 1,
    };
  }, [
    canCalculate, currentCity, currentSalary, validTargetCities, movingCosts,
    moveDate, hasPets, hasChildren, isHomeowner,
    plansToBuy, downPaymentPercent, targetHomePrice, mortgageRate,
    householdSize, houseHuntingTrips, tempHousingDays, travelModeOverrides
  ]);

  // Show onboarding nudge on first analysis view
  useEffect(() => {
    if (showResults && analysis && isPremium) {
      const checkOnboarding = async () => {
        try {
          const seen = await AsyncStorage.getItem(ONBOARDING_SEEN_KEY);
          if (!seen) {
            setShowOnboardingNudge(true);
            await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
          }
        } catch (e) {
          // Silently fail
        }
      };
      checkOnboarding();
    }
  }, [showResults, analysis]);

  // ============================================================================
  // FORMATTERS
  // ============================================================================

  const formatCurrency = (value: number, showSign: boolean = false): string => {
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : (showSign ? '+' : '');
    if (absValue >= 1000000) {
      return `${sign}$${(absValue / 1000000).toFixed(1)}M`;
    }
    if (absValue >= 1000) {
      return `${sign}$${(absValue / 1000).toFixed(1)}K`;
    }
    return `${sign}$${Math.round(absValue)}`;
  };

  const formatMonths = (months: number): string => {
    if (months === Infinity || months < 0) return 'Never';
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''}`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) return `${years} year${years !== 1 ? 's' : ''}`;
    return `${years}y ${remainingMonths}m`;
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderInputSection = () => (
    <Card style={styles.inputSection}>
      <View style={styles.sectionHeader}>
        <Ionicons name="person-outline" size={24} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>Your Current Situation</Text>
      </View>

      <CityPicker
        label="Current City"
        value={currentCity}
        onChange={setCurrentCity}
        placeholder="Where do you live now?"
      />

      <Input
        label="Current Annual Salary"
        value={currentSalary}
        onChangeText={setCurrentSalary}
        onBlur={() => setCurrentSalary(formatSalaryValue(currentSalary))}
        placeholder="e.g., 85,000"
        keyboardType="numeric"
        prefix={currencySymbol}
      />

      <View style={styles.divider} />

      <View style={styles.sectionHeader}>
        <Ionicons name="location-outline" size={24} color={COLORS.secondary} />
        <Text style={styles.sectionTitle}>Target Destination{validTargetCities.length > 1 ? 's' : ''}</Text>
        {isPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>PRO</Text>
          </View>
        )}
      </View>

      {targetCities.map((target, index) => (
        <View key={index} style={styles.targetCityRow}>
          <View style={styles.targetCityInputs}>
            <CityPicker
              label={targetCities.length > 1 ? `City ${index + 1}` : 'Target City'}
              value={target.city}
              onChange={(city) => updateTargetCity(index, city)}
              placeholder="Where are you moving?"
            />
            <Input
              label="Expected Salary"
              value={target.salary}
              onChangeText={(salary) => updateTargetSalary(index, salary)}
              onBlur={() => updateTargetSalary(index, formatSalaryValue(target.salary))}
              placeholder="e.g., 95,000"
              keyboardType="numeric"
              prefix={currencySymbol}
            />
          </View>
          {targetCities.length > 1 && (
            <TouchableOpacity
              style={styles.removeCityButton}
              onPress={() => removeTargetCity(index)}
            >
              <Ionicons name="close-circle" size={24} color={COLORS.error} />
            </TouchableOpacity>
          )}
        </View>
      ))}

      {targetCities.length < maxCities && (
        <TouchableOpacity style={styles.addCityButton} onPress={addTargetCity}>
          <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.addCityText}>Add Another City to Compare</Text>
          {!isPremium && targetCities.length >= MAX_FREE_CITIES && (
            <View style={styles.proBadgeSmall}>
              <Ionicons name="lock-closed" size={12} color={COLORS.accent} />
            </View>
          )}
        </TouchableOpacity>
      )}

      <View style={styles.divider} />

      {/* Per-City Moving Costs */}
      <View style={styles.sectionLabelRow}>
        <Ionicons name="cube-outline" size={18} color={COLORS.primary} />
        <Text style={styles.sectionLabel}>Estimated Moving Costs</Text>
        {targetCities.some(t => t.city) && (
          <Text style={styles.calculatorHintText}>Not sure? Use the calculators below</Text>
        )}
      </View>
      {targetCities.map((target, index) => {
        if (!target.city) return null;
        const cityId = target.city.id;
        return (
          <View key={`moving-cost-${cityId}`} style={styles.perCityMovingCostRow}>
            <View style={styles.perCityMovingCostInput}>
              <Input
                label={target.city.name}
                value={movingCosts[cityId] || ''}
                onChangeText={(value) => setMovingCosts(prev => ({ ...prev, [cityId]: value }))}
                onBlur={() => {
                  if (movingCosts[cityId]) {
                    setMovingCosts(prev => ({
                      ...prev,
                      [cityId]: formatSalaryValue(movingCosts[cityId])
                    }));
                  }
                }}
                placeholder="e.g., 8,000"
                keyboardType="numeric"
                prefix={currencySymbol}
              />
            </View>
            <TouchableOpacity
              style={styles.perCityCalculatorButton}
              onPress={() => saveFormStateAndNavigate(target.city!.id, target.city!.name)}
            >
              <Ionicons name="calculator-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        );
      })}

      {/* Circumstances Toggle */}
      <TouchableOpacity
        style={styles.circumstancesToggle}
        onPress={() => setShowCircumstances(!showCircumstances)}
      >
        <Ionicons name="options-outline" size={18} color={COLORS.mediumGray} />
        <Text style={styles.circumstancesToggleText}>
          {showCircumstances ? 'Hide' : 'Show'} Additional Options
        </Text>
        <Ionicons
          name={showCircumstances ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={COLORS.mediumGray}
        />
      </TouchableOpacity>

      {showCircumstances && (
        <View style={styles.circumstancesSection}>
          {/* Housing Intent Section */}
          <View style={styles.optionsSectionHeader}>
            <Ionicons name="home" size={16} color={COLORS.accent} />
            <Text style={styles.optionsSectionTitle}>Housing Plan</Text>
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Ionicons name="key-outline" size={18} color={COLORS.mediumGray} />
              <Text style={styles.switchText}>I plan to buy a home in my new city</Text>
            </View>
            <Switch value={plansToBuy} onValueChange={setPlansToBuy} />
          </View>

          {plansToBuy && (
            <View style={styles.buyOptionsContainer}>
              <View style={styles.buyOptionRow}>
                <Text style={styles.buyOptionLabel}>Down Payment</Text>
                <View style={styles.buyOptionInputContainer}>
                  <TextInput
                    style={styles.buyOptionInput}
                    value={downPaymentPercent}
                    onChangeText={setDownPaymentPercent}
                    keyboardType="numeric"
                    placeholder="20"
                    placeholderTextColor={COLORS.mediumGray}
                  />
                  <Text style={styles.buyOptionSuffix}>%</Text>
                </View>
              </View>

              <View style={styles.buyOptionRow}>
                <Text style={styles.buyOptionLabel}>Home Price (optional)</Text>
                <View style={styles.buyOptionInputContainer}>
                  <Text style={styles.buyOptionPrefix}>$</Text>
                  <TextInput
                    style={styles.buyOptionInput}
                    value={targetHomePrice}
                    onChangeText={setTargetHomePrice}
                    keyboardType="numeric"
                    placeholder="Use city median"
                    placeholderTextColor={COLORS.mediumGray}
                  />
                </View>
              </View>

              <View style={styles.buyOptionRow}>
                <Text style={styles.buyOptionLabel}>Mortgage Rate (optional)</Text>
                <View style={styles.buyOptionInputContainer}>
                  <TextInput
                    style={styles.buyOptionInput}
                    value={mortgageRate}
                    onChangeText={setMortgageRate}
                    keyboardType="numeric"
                    placeholder="6.8"
                    placeholderTextColor={COLORS.mediumGray}
                  />
                  <Text style={styles.buyOptionSuffix}>%</Text>
                </View>
              </View>

              <Text style={styles.buyOptionsNote}>
                Leave blank to use city median home price and current market rates
              </Text>
            </View>
          )}

          <View style={styles.optionsDivider} />

          {/* Personal Circumstances Section */}
          <View style={styles.optionsSectionHeader}>
            <Ionicons name="person" size={16} color={COLORS.secondary} />
            <Text style={styles.optionsSectionTitle}>Personal Circumstances</Text>
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Ionicons name="paw-outline" size={18} color={COLORS.mediumGray} />
              <Text style={styles.switchText}>I have pets</Text>
            </View>
            <Switch value={hasPets} onValueChange={setHasPets} />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Ionicons name="people-outline" size={18} color={COLORS.mediumGray} />
              <Text style={styles.switchText}>I have children</Text>
            </View>
            <Switch value={hasChildren} onValueChange={setHasChildren} />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Ionicons name="home-outline" size={18} color={COLORS.mediumGray} />
              <Text style={styles.switchText}>I currently own a home</Text>
            </View>
            <Switch value={isHomeowner} onValueChange={setIsHomeowner} />
          </View>

          <View style={styles.optionsDivider} />

          {/* Auto-Detected Move Info */}
          {validTargetCities.length > 0 && currentCity && (
            <View style={styles.autoDetectedSection}>
              <View style={styles.optionsSectionHeader}>
                <Ionicons name="sparkles" size={16} color={COLORS.info} />
                <Text style={styles.optionsSectionTitle}>Auto-Detected Move Details</Text>
              </View>

              {/* International Status */}
              <View style={styles.autoDetectedRow}>
                <View style={styles.autoDetectedLabel}>
                  <Ionicons
                    name={hasAnyInternational ? 'globe' : 'flag'}
                    size={16}
                    color={hasAnyInternational ? COLORS.info : COLORS.mediumGray}
                  />
                  <Text style={styles.autoDetectedText}>
                    {hasAnyInternational ? 'International move detected' : 'Domestic move'}
                  </Text>
                </View>
                {hasAnyInternational && (
                  <View style={styles.autoDetectedBadge}>
                    <Text style={styles.autoDetectedBadgeText}>Auto</Text>
                  </View>
                )}
              </View>

              {/* Per-City Travel Modes */}
              {validTargetCities.map((target, idx) => {
                if (!target.city) return null;
                const travelModeData = cityTravelModes[target.city.id];
                if (!travelModeData) return null;
                const effectiveMode = travelModeData.effective;
                const isOverridden = travelModeOverrides[target.city.id] !== undefined;
                return (
                  <TouchableOpacity
                    key={target.city.id}
                    style={styles.travelModeRow}
                    onPress={() => toggleTravelMode(target.city!.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.autoDetectedLabel}>
                      <Ionicons
                        name={effectiveMode === 'flying' ? 'airplane' : 'car'}
                        size={16}
                        color={effectiveMode === 'flying' ? COLORS.info : COLORS.success}
                      />
                      <Text style={styles.autoDetectedText}>
                        {target.city.name}: {effectiveMode === 'flying' ? 'Flying' : 'Driving'}
                        {travelModeData.distance > 0 && (
                          <Text style={styles.autoDetectedSubtext}>
                            {' '}({Math.round(travelModeData.distance).toLocaleString()} mi)
                          </Text>
                        )}
                      </Text>
                    </View>
                    <View style={styles.travelModeToggleContainer}>
                      {isOverridden && (
                        <View style={styles.overrideBadge}>
                          <Text style={styles.overrideBadgeText}>Custom</Text>
                        </View>
                      )}
                      <Ionicons
                        name="swap-horizontal"
                        size={18}
                        color={COLORS.info}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}

              <Text style={styles.autoDetectedHint}>
                Tap to switch between driving/flying for each city
              </Text>
            </View>
          )}

          <View style={styles.optionsDivider} />

          {/* Household & Relocation Details Section */}
          <View style={styles.optionsSectionHeader}>
            <Ionicons name="people" size={16} color={COLORS.info} />
            <Text style={styles.optionsSectionTitle}>Household & Relocation Details</Text>
          </View>

          <View style={styles.householdInputRow}>
            <View style={styles.householdInputItem}>
              <Text style={styles.householdInputLabel}>Household Size</Text>
              <View style={styles.householdInputContainer}>
                <TextInput
                  style={styles.householdInput}
                  value={householdSize}
                  onChangeText={setHouseholdSize}
                  keyboardType="numeric"
                  placeholder="1"
                  placeholderTextColor={COLORS.mediumGray}
                />
                <Text style={styles.householdInputSuffix}>people</Text>
              </View>
            </View>
            <View style={styles.householdInputItem}>
              <Text style={styles.householdInputLabel}>House Hunting Trips</Text>
              <View style={styles.householdInputContainer}>
                <TextInput
                  style={styles.householdInput}
                  value={houseHuntingTrips}
                  onChangeText={setHouseHuntingTrips}
                  keyboardType="numeric"
                  placeholder="2"
                  placeholderTextColor={COLORS.mediumGray}
                />
                <Text style={styles.householdInputSuffix}>trips</Text>
              </View>
            </View>
          </View>

          <View style={styles.householdInputRow}>
            <View style={styles.householdInputItemFull}>
              <Text style={styles.householdInputLabel}>Temporary Housing Duration</Text>
              <View style={styles.householdInputContainer}>
                <TextInput
                  style={styles.householdInput}
                  value={tempHousingDays}
                  onChangeText={setTempHousingDays}
                  keyboardType="numeric"
                  placeholder="Auto (based on distance)"
                  placeholderTextColor={COLORS.mediumGray}
                />
                <Text style={styles.householdInputSuffix}>days</Text>
              </View>
            </View>
          </View>

          <Text style={styles.householdNote}>
            These details help calculate more accurate negotiation estimates
          </Text>
        </View>
      )}

      <Button
        title="Analyze My Move"
        onPress={() => setShowResults(true)}
        disabled={!canCalculate}
        icon={<Ionicons name="analytics-outline" size={18} color={COLORS.white} />}
      />
    </Card>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabScroll}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const isLocked = tab.premiumOnly && !isPremium;

          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, isActive && styles.tabActive, isLocked && styles.tabLocked]}
              onPress={() => !isLocked && handleTabPress(tab)}
              activeOpacity={isLocked ? 1 : 0.7}
            >
              <View style={styles.tabContent}>
                <Ionicons
                  name={isLocked ? 'lock-closed' : tab.icon}
                  size={isLocked ? 14 : 18}
                  color={isLocked ? COLORS.accent : isActive ? COLORS.primary : COLORS.mediumGray}
                />
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive, isLocked && styles.tabLabelLocked]}>
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  // Get selected city's analysis for detail views
  const selectedCityAnalysis = useMemo(() => {
    if (!analysis || !analysis.allCityAnalyses) return null;
    const safeIndex = Math.min(selectedDetailCityIndex, analysis.allCityAnalyses.length - 1);
    return analysis.allCityAnalyses[safeIndex];
  }, [analysis, selectedDetailCityIndex]);

  // Get all target cities for the selector
  const targetCitiesForSelector = useMemo(() => {
    if (!analysis || !analysis.allCityAnalyses) return [];
    return analysis.allCityAnalyses.map(a => a.city);
  }, [analysis]);

  const renderOverviewTab = () => {
    if (!analysis) return null;

    // Use selected city's analysis for the hero card
    const displayAnalysis = selectedCityAnalysis || analysis.allCityAnalyses[0];
    const hasMultipleCities = analysis.allCityAnalyses.length > 1;

    return (
      <View style={styles.tabPane}>
        {/* Multi-City Summary Grid (for premium users with multiple cities) */}
        {isPremium && hasMultipleCities && (
          <MultiCitySummaryGrid
            currentCity={currentCity!}
            currentCalc={analysis.currentCalc}
            currentProjection={analysis.currentProjection}
            cityAnalyses={analysis.allCityAnalyses}
            housingIntent={analysis.housingIntent}
          />
        )}

        {/* City Selector (for multiple cities) */}
        {hasMultipleCities && (
          <CityDetailSelector
            cities={targetCitiesForSelector}
            selectedIndex={selectedDetailCityIndex}
            onSelectCity={setSelectedDetailCityIndex}
            label="View Details For"
          />
        )}

        {/* Break-Even Hero */}
        <Card style={StyleSheet.flatten([styles.heroCard, displayAnalysis.isPositive ? styles.heroPositive : styles.heroNegative])}>
          {/* Housing intent badge */}
          {analysis.housingIntent.plansToBuy && (
            <View style={styles.housingBadge}>
              <Ionicons name="home" size={12} color={COLORS.white} />
              <Text style={styles.housingBadgeText}>Buying</Text>
            </View>
          )}

          {/* City name badge for multi-city */}
          {hasMultipleCities && (
            <View style={[styles.housingBadge, { left: SPACING.sm, right: 'auto' as any }]}>
              <Ionicons name="location" size={12} color={COLORS.white} />
              <Text style={styles.housingBadgeText}>{displayAnalysis.city.name}</Text>
            </View>
          )}

          <View style={styles.heroIcon}>
            <Ionicons
              name={displayAnalysis.isPositive ? 'trending-up' : 'alert-circle'}
              size={40}
              color={displayAnalysis.isPositive ? COLORS.white : COLORS.charcoal}
            />
          </View>
          <Text style={[styles.heroTitle, !displayAnalysis.isPositive && { color: COLORS.charcoal }]}>
            {displayAnalysis.isPositive ? 'This Move Makes Sense!' : 'Consider Negotiating'}
          </Text>
          <Text style={[styles.heroSubtitle, !displayAnalysis.isPositive && { color: COLORS.darkGray }]}>
            {displayAnalysis.isPositive
              ? `You'll break even in ${formatMonths(displayAnalysis.breakEven.breakEvenMonths)}`
              : 'Higher cost of living outweighs salary increase'}
          </Text>

          <View style={[styles.heroStats, !displayAnalysis.isPositive && { borderTopColor: 'rgba(0,0,0,0.15)' }]}>
            <View style={styles.heroStat}>
              <Text style={[
                styles.heroStatValue,
                !displayAnalysis.isPositive && { color: COLORS.charcoal },
                displayAnalysis.projection.totalNetWorthYear5 < 0 && { color: COLORS.error }
              ]}>
                {formatCurrency(displayAnalysis.projection.totalNetWorthYear5, true)}
              </Text>
              <Text style={[styles.heroStatLabel, !displayAnalysis.isPositive && { color: COLORS.darkGray }]}>
                5-Year Net Worth{analysis.housingIntent.plansToBuy ? '*' : ''}
              </Text>
            </View>
            <View style={[styles.heroStatDivider, !displayAnalysis.isPositive && { backgroundColor: 'rgba(0,0,0,0.15)' }]} />
            <View style={styles.heroStat}>
              <Text style={[
                styles.heroStatValue,
                !displayAnalysis.isPositive && { color: COLORS.charcoal },
              ]}>
                {formatCurrency(displayAnalysis.targetCalc.netSalary - analysis.currentCalc.netSalary, true)}
              </Text>
              <Text style={[styles.heroStatLabel, !displayAnalysis.isPositive && { color: COLORS.darkGray }]}>Yearly Salary Diff</Text>
            </View>
          </View>

          {/* Home equity note for buyers */}
          {analysis.housingIntent.plansToBuy && displayAnalysis.projection.projections[4]?.homeEquity && (
            <Text style={[styles.heroEquityNote, !displayAnalysis.isPositive && { color: COLORS.darkGray }]}>
              *Includes {formatCurrency(displayAnalysis.projection.projections[4].homeEquity)} in home equity
            </Text>
          )}

          {/* Info button */}
          <TouchableOpacity
            style={[styles.heroInfoButton, !displayAnalysis.isPositive && { borderColor: 'rgba(0,0,0,0.2)' }]}
            onPress={() => setShowCalculationInfo(true)}
          >
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={displayAnalysis.isPositive ? COLORS.white : COLORS.darkGray}
            />
            <Text style={[styles.heroInfoText, !displayAnalysis.isPositive && { color: COLORS.darkGray }]}>
              How is this calculated?
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Quick Stats */}
        <Card style={styles.section}>
          <Text style={styles.cardTitle}>At a Glance — {displayAnalysis.city.name}</Text>

          <View style={styles.statGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatCurrency(analysis.currentCalc.netSalary)}</Text>
              <Text style={styles.statLabel}>Current Net Salary (after taxes)</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatCurrency(displayAnalysis.targetCalc.netSalary)}</Text>
              <Text style={styles.statLabel}>Target Net Salary (after taxes)</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{displayAnalysis.city.costOfLivingIndex}</Text>
              <Text style={styles.statLabel}>COL Index</Text>
            </View>
            <View style={styles.statItem}>
              {analysis.housingIntent.plansToBuy ? (
                <>
                  <Text style={styles.statValue}>
                    {formatCurrency(analysis.housingIntent.targetHomePrice || displayAnalysis.city.medianHomePrice)}
                  </Text>
                  <Text style={styles.statLabel}>Home Price</Text>
                </>
              ) : (
                <>
                  <Text style={styles.statValue}>{formatCurrency(displayAnalysis.city.medianRent)}/mo</Text>
                  <Text style={styles.statLabel}>Median Rent</Text>
                </>
              )}
            </View>
          </View>
        </Card>

        {/* Premium Upsell (for free users) */}
        {!isPremium && (
          <View style={styles.upsellCard}>
            <View style={styles.upsellSparkleRow}>
              <Ionicons name="sparkles" size={18} color={COLORS.accent} />
              <Ionicons name="sparkles" size={12} color={COLORS.accentLight} />
            </View>

            <Text style={styles.upsellTitle}>See the Full Picture</Text>
            <Text style={styles.upsellSubtitle}>
              Your data is ready — unlock the complete analysis to make your move with confidence.
            </Text>

            <View style={styles.upsellBenefits}>
              <View style={styles.upsellBenefitRow}>
                <View style={[styles.upsellBenefitIcon, { backgroundColor: '#D4EDDA' }]}>
                  <Ionicons name="trending-up" size={16} color={COLORS.success} />
                </View>
                <View style={styles.upsellBenefitContent}>
                  <Text style={styles.upsellBenefitTitle}>5-Year Financial Projections</Text>
                  <Text style={styles.upsellBenefitDesc}>See exactly how your net worth grows in each city</Text>
                </View>
              </View>
              <View style={styles.upsellBenefitRow}>
                <View style={[styles.upsellBenefitIcon, { backgroundColor: '#D1ECF1' }]}>
                  <Ionicons name="home" size={16} color={COLORS.info} />
                </View>
                <View style={styles.upsellBenefitContent}>
                  <Text style={styles.upsellBenefitTitle}>Rent vs. Buy Analysis</Text>
                  <Text style={styles.upsellBenefitDesc}>Data-driven housing recommendation with 10-year comparison</Text>
                </View>
              </View>
              <View style={styles.upsellBenefitRow}>
                <View style={[styles.upsellBenefitIcon, { backgroundColor: '#FFF3CD' }]}>
                  <Ionicons name="briefcase" size={16} color="#856404" />
                </View>
                <View style={styles.upsellBenefitContent}>
                  <Text style={styles.upsellBenefitTitle}>Negotiation Toolkit</Text>
                  <Text style={styles.upsellBenefitDesc}>Ready-to-use scripts and talking points for your employer</Text>
                </View>
              </View>
              <View style={styles.upsellBenefitRow}>
                <View style={[styles.upsellBenefitIcon, { backgroundColor: '#D6E4F0' }]}>
                  <Ionicons name="checkbox" size={16} color={COLORS.primary} />
                </View>
                <View style={styles.upsellBenefitContent}>
                  <Text style={styles.upsellBenefitTitle}>90-Day Moving Checklist</Text>
                  <Text style={styles.upsellBenefitDesc}>Personalized step-by-step plan tailored to your move</Text>
                </View>
              </View>
              <View style={styles.upsellBenefitRow}>
                <View style={[styles.upsellBenefitIcon, { backgroundColor: '#E0F0E9' }]}>
                  <Ionicons name="download" size={16} color={COLORS.secondary} />
                </View>
                <View style={styles.upsellBenefitContent}>
                  <Text style={styles.upsellBenefitTitle}>Exportable PDF Report</Text>
                  <Text style={styles.upsellBenefitDesc}>Share with your partner, realtor, or financial advisor</Text>
                </View>
              </View>
            </View>

            <View style={styles.upsellDivider} />

            <View style={styles.upsellPriceRow}>
              <Text style={styles.upsellPrice}>$3.99</Text>
              <View style={styles.upsellPriceBadge}>
                <Text style={styles.upsellPriceBadgeText}>ONE-TIME</Text>
              </View>
            </View>

            <Text style={styles.upsellValueNote}>
              Relocation consultants charge $200+ for similar reports
            </Text>

            <TouchableOpacity
              style={styles.upsellCTA}
              onPress={() => triggerPaywall('Full Analysis')}
              activeOpacity={0.85}
            >
              <Ionicons name="lock-open" size={20} color={COLORS.white} />
              <Text style={styles.upsellCTAText}>Unlock Full Analysis</Text>
            </TouchableOpacity>

            <Text style={styles.upsellFootnote}>No subscription. Pay once, keep forever.</Text>
          </View>
        )}

        {/* Recommendation */}
        <Card style={styles.section}>
          <Text style={styles.cardTitle}>Recommendation — {displayAnalysis.city.name}</Text>
          <Text style={styles.recommendationText}>{displayAnalysis.breakEven.recommendation}</Text>

          {displayAnalysis.breakEven.considerations.slice(0, 3).map((consideration, index) => (
            <View key={index} style={styles.considerationRow}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.considerationText}>{consideration}</Text>
            </View>
          ))}
        </Card>

        <DataDisclaimer variant="inline" />
      </View>
    );
  };

  const renderProjectionsTab = () => {
    if (!analysis || !isPremium || !analysis.projectionComparison) return null;

    return (
      <View style={styles.tabPane}>
        <Card style={styles.section}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>5-Year Financial Projection</Text>
            <TouchableOpacity
              onPress={() => setShowProjectionInfo(true)}
              style={styles.cardInfoButton}
            >
              <Ionicons name="information-circle-outline" size={22} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <ProjectionChart
            comparison={analysis.projectionComparison}
            breakEvenMonths={selectedCityAnalysis?.breakEven.breakEvenMonths !== Infinity ? selectedCityAnalysis?.breakEven.breakEvenMonths : undefined}
          />
        </Card>

        {/* Projection Info Modal */}
        <Modal
          visible={showProjectionInfo}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowProjectionInfo(false)}
        >
          <View style={styles.infoModalOverlay}>
            <View style={styles.infoModalContent}>
              <View style={styles.infoModalHeader}>
                <Text style={styles.infoModalTitle}>Understanding This Chart</Text>
                <TouchableOpacity
                  onPress={() => setShowProjectionInfo(false)}
                  style={styles.infoModalClose}
                >
                  <Ionicons name="close" size={24} color={COLORS.darkGray} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.infoModalBody}>
                {/* What the Chart Shows */}
                <View style={styles.infoSection}>
                  <View style={styles.infoSectionHeader}>
                    <Ionicons name="analytics-outline" size={20} color={COLORS.primary} />
                    <Text style={styles.infoSectionTitle}>What You're Viewing</Text>
                  </View>
                  <Text style={styles.infoSectionText}>
                    This chart compares your projected Net Worth over 5 years between your current city and target city.
                  </Text>
                  <View style={styles.infoList}>
                    <Text style={styles.infoListItem}>• Each line represents a city's wealth trajectory</Text>
                    <Text style={styles.infoListItem}>• Higher lines indicate greater accumulated wealth</Text>
                    <Text style={styles.infoListItem}>• Tap any data point to see exact values for that year</Text>
                  </View>
                </View>

                {/* Net Worth Calculation */}
                <View style={styles.infoSection}>
                  <View style={styles.infoSectionHeader}>
                    <Ionicons name="calculator-outline" size={20} color={COLORS.primary} />
                    <Text style={styles.infoSectionTitle}>How Net Worth is Calculated</Text>
                  </View>
                  <Text style={styles.infoSectionText}>
                    Net Worth = Cumulative Savings + Home Equity (if buying)
                  </Text>
                  <View style={styles.infoList}>
                    <Text style={styles.infoListItem}>• Starts with your net salary (after taxes)</Text>
                    <Text style={styles.infoListItem}>• Subtracts living expenses (housing + other costs)</Text>
                    <Text style={styles.infoListItem}>• Applies 7% annual investment returns on savings</Text>
                    <Text style={styles.infoListItem}>• Includes 3% annual salary growth</Text>
                    {analysis?.housingIntent?.plansToBuy && (
                      <Text style={styles.infoListItem}>• Adds home equity (home value minus mortgage balance)</Text>
                    )}
                  </View>
                </View>

                {/* Break-Even Line */}
                <View style={styles.infoSection}>
                  <View style={styles.infoSectionHeader}>
                    <Ionicons name="time-outline" size={20} color={COLORS.warning} />
                    <Text style={styles.infoSectionTitle}>Break-Even Point</Text>
                  </View>
                  <Text style={styles.infoSectionText}>
                    The amber dashed line (if visible) marks when your move "pays for itself" — when your financial gains offset all upfront costs including moving expenses{analysis?.housingIntent?.plansToBuy ? ' and down payment' : ''}.
                  </Text>
                </View>

                {/* Reading the Legend */}
                <View style={styles.infoSection}>
                  <View style={styles.infoSectionHeader}>
                    <Ionicons name="color-palette-outline" size={20} color={COLORS.primary} />
                    <Text style={styles.infoSectionTitle}>Reading the Chart</Text>
                  </View>
                  <View style={styles.infoList}>
                    <Text style={styles.infoListItem}>• <Text style={{ color: '#2563eb', fontWeight: '600' }}>Blue line</Text> = Your current city (baseline)</Text>
                    <Text style={styles.infoListItem}>• <Text style={{ color: '#16a34a', fontWeight: '600' }}>Green line</Text> = Your target city</Text>
                    <Text style={styles.infoListItem}>• When green is above blue, the move is financially beneficial</Text>
                  </View>
                </View>

                {/* Note */}
                <View style={styles.infoNote}>
                  <Ionicons name="information-circle" size={18} color={COLORS.info} />
                  <Text style={styles.infoNoteText}>
                    The Year 5 Summary below the chart shows final net worth values for easy comparison. These projections use expected-case assumptions.
                  </Text>
                </View>
              </ScrollView>

              <TouchableOpacity
                onPress={() => setShowProjectionInfo(false)}
                style={styles.infoModalButton}
              >
                <Text style={styles.infoModalButtonText}>Got It</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* City Selector for Scenario Details */}
        {analysis.allCityAnalyses.length > 1 && (
          <CityDetailSelector
            cities={targetCitiesForSelector}
            selectedIndex={selectedDetailCityIndex}
            onSelectCity={setSelectedDetailCityIndex}
            label="View Scenario Details For"
          />
        )}

        {selectedCityAnalysis && (
          <Card style={styles.section}>
            <ScenarioComparison
              scenarios={selectedCityAnalysis.scenarios}
              cityName={selectedCityAnalysis.city.name}
              cityState={selectedCityAnalysis.city.state}
            />
          </Card>
        )}

        <DataDisclaimer variant="inline" />
      </View>
    );
  };

  const renderHousingTab = () => {
    if (!analysis || !isPremium) return null;

    const displayAnalysis = selectedCityAnalysis || analysis.allCityAnalyses[0];
    const hasMultipleCities = analysis.allCityAnalyses.length > 1;

    return (
      <View style={styles.tabPane}>
        {/* City Selector */}
        {hasMultipleCities && (
          <CityDetailSelector
            cities={targetCitiesForSelector}
            selectedIndex={selectedDetailCityIndex}
            onSelectCity={setSelectedDetailCityIndex}
            label="View Housing Analysis For"
          />
        )}

        <RentVsBuyCard analysis={displayAnalysis.rentVsBuy} expanded={true} />
        <DataDisclaimer variant="inline" />
      </View>
    );
  };

  const renderNegotiateTab = () => {
    if (!analysis || !isPremium) return null;

    const displayAnalysis = selectedCityAnalysis || analysis.allCityAnalyses[0];
    const hasMultipleCities = analysis.allCityAnalyses.length > 1;

    return (
      <View style={styles.tabPane}>
        {/* City Selector */}
        {hasMultipleCities && (
          <CityDetailSelector
            cities={targetCitiesForSelector}
            selectedIndex={selectedDetailCityIndex}
            onSelectCity={setSelectedDetailCityIndex}
            label="View Negotiation Tools For"
          />
        )}

        <NegotiationToolkit
          toolkit={displayAnalysis.negotiation}
          currentCityName={currentCity!.name}
          targetCityName={displayAnalysis.city.name}
          moveClassification={displayAnalysis.moveClassification}
          householdSize={analysis.householdSizeNum}
          moveTravelMode={displayAnalysis.moveClassification.requiresFlight ? 'flying' : 'driving'}
          plansToBuy={analysis.housingIntent.plansToBuy}
        />

        <DataDisclaimer variant="inline" />
      </View>
    );
  };

  const handleChecklistUpdate = useCallback(async (updatedChecklist: any) => {
    setChecklist(updatedChecklist);

    // Persist to savedChecklists and AsyncStorage
    const displayAnalysis = selectedCityAnalysis || analysis?.allCityAnalyses[0];
    if (displayAnalysis) {
      const cityId = displayAnalysis.city.id;
      const updated = { ...savedChecklists, [cityId]: updatedChecklist };
      setSavedChecklists(updated);
      try {
        await AsyncStorage.setItem(SAVED_CHECKLISTS_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save checklist:', error);
      }
    }
  }, [selectedCityAnalysis, analysis, savedChecklists]);

  const renderChecklistTab = () => {
    if (!analysis || !isPremium) return null;

    const displayAnalysis = selectedCityAnalysis || analysis.allCityAnalyses[0];
    const hasMultipleCities = analysis.allCityAnalyses.length > 1;
    const cityId = displayAnalysis.city.id;

    // Priority: local edit state > saved persistent checklist > freshly generated
    const currentChecklist = checklist || savedChecklists[cityId] || displayAnalysis.checklist;

    return (
      <View style={styles.tabPane}>
        {/* City Selector + Info Button Row */}
        <View style={styles.checklistTopRow}>
          <View style={styles.checklistTopRowLeft}>
            {hasMultipleCities && (
              <CityDetailSelector
                cities={targetCitiesForSelector}
                selectedIndex={selectedDetailCityIndex}
                onSelectCity={(index) => {
                  setSelectedDetailCityIndex(index);
                  // Reset local checklist — will fall back to saved or generated
                  setChecklist(null);
                }}
                label="View Checklist For"
              />
            )}
          </View>
          <TouchableOpacity
            onPress={() => setShowChecklistInfo(true)}
            style={styles.checklistInfoButton}
          >
            <Ionicons name="information-circle-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <ChecklistSection
          checklist={currentChecklist}
          onChecklistUpdate={handleChecklistUpdate}
          showInfo={showChecklistInfo}
          onCloseInfo={() => setShowChecklistInfo(false)}
        />
        <DataDisclaimer variant="inline" />
      </View>
    );
  };

  const buildReportData = (): PDFReportData | null => {
    if (!analysis || !currentCity) return null;
    return {
      currentCity,
      currentSalary: parseSalary(currentSalary),
      currentProjection: analysis.currentProjection,
      allCityAnalyses: analysis.allCityAnalyses.map((a: any) => ({
        city: a.city,
        salary: a.salary,
        movingCost: parseSalary(movingCosts[a.city.id] || '0'),
        breakEven: a.breakEven,
        projection: a.projection,
        rentVsBuy: a.rentVsBuy,
        negotiation: a.negotiation,
        checklist: a.checklist,
        moveClassification: a.moveClassification,
        isPositive: a.isPositive,
      })),
      housingIntent: analysis.housingIntent,
      householdSize: analysis.householdSizeNum,
      houseHuntingTrips: parseInt(houseHuntingTrips, 10) || 2,
      tempHousingDays,
      moveDate,
      hasPets,
      hasChildren,
      isHomeowner,
      savedChecklists,
      generatedDate: new Date(),
    };
  };

  const renderExportTab = () => {
    if (!analysis || !isPremium) return null;

    const reportData = buildReportData();
    if (!reportData) return null;

    return (
      <View style={styles.tabPane}>
        <Card style={styles.exportCard}>
          <View style={styles.exportHeader}>
            <Ionicons name="document-text-outline" size={40} color={COLORS.primary} />
            <Text style={styles.exportTitle}>Export Full Analysis</Text>
            <Text style={styles.exportDescription}>
              Download a comprehensive PDF report containing all of your analysis data — overview, projections, housing analysis, negotiation toolkit, and your personalized moving checklist.
            </Text>
          </View>

          <View style={styles.exportFeatures}>
            <View style={styles.exportFeatureItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.exportFeatureText}>All city comparisons & metrics</Text>
            </View>
            <View style={styles.exportFeatureItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.exportFeatureText}>5-year financial projections</Text>
            </View>
            <View style={styles.exportFeatureItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.exportFeatureText}>Rent vs. buy analysis</Text>
            </View>
            <View style={styles.exportFeatureItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.exportFeatureText}>Negotiation scripts & talking points</Text>
            </View>
            <View style={styles.exportFeatureItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.exportFeatureText}>Personalized moving checklist</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.exportButton, isExporting && styles.exportButtonDisabled]}
            onPress={async () => {
              if (isExporting) return;
              setIsExporting(true);
              try {
                await printPDFReport(reportData);
              } catch (error) {
                console.error('Export failed:', error);
              } finally {
                setIsExporting(false);
              }
            }}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Ionicons name="download-outline" size={22} color={COLORS.white} />
            )}
            <Text style={styles.exportButtonText}>
              {isExporting ? 'Generating Report...' : 'Save as PDF'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.exportButtonSecondary, isExporting && styles.exportButtonDisabled]}
            onPress={async () => {
              if (isExporting) return;
              setIsExporting(true);
              try {
                await generateAndSharePDF(reportData);
              } catch (error) {
                console.error('Preview failed:', error);
              } finally {
                setIsExporting(false);
              }
            }}
            disabled={isExporting}
          >
            <Ionicons name="eye-outline" size={20} color={COLORS.primary} />
            <Text style={styles.exportButtonSecondaryText}>Preview Report</Text>
          </TouchableOpacity>
        </Card>
      </View>
    );
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'projections':
        return renderProjectionsTab();
      case 'housing':
        return renderHousingTab();
      case 'negotiate':
        return renderNegotiateTab();
      case 'checklist':
        return renderChecklistTab();
      case 'export':
        return renderExportTab();
      default:
        return renderOverviewTab();
    }
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {renderInputSection()}

        {showResults && analysis && (
          <>
            {renderTabs()}
            {renderActiveTab()}
          </>
        )}

        {!showResults && (
          <Card style={styles.emptyState}>
            <Ionicons name="analytics-outline" size={64} color={COLORS.mediumGray} />
            <Text style={styles.emptyStateTitle}>Full Relocation Analysis</Text>
            <Text style={styles.emptyStateText}>
              Enter your details above to get a comprehensive financial analysis of your move,
              including break-even timelines, 5-year projections, and personalized recommendations.
            </Text>
          </Card>
        )}

        <View style={styles.footer} />
      </ScrollView>

      {/* Paywall Modal */}
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature={paywallFeature}
      />

      {/* Calculation Info Modal */}
      <Modal
        visible={showCalculationInfo}
        animationType="fade"
        transparent
        onRequestClose={() => setShowCalculationInfo(false)}
      >
        <View style={styles.infoModalOverlay}>
          <View style={styles.infoModalContent}>
            <View style={styles.infoModalHeader}>
              <Text style={styles.infoModalTitle}>How We Calculate This</Text>
              <TouchableOpacity
                onPress={() => setShowCalculationInfo(false)}
                style={styles.infoModalClose}
              >
                <Ionicons name="close" size={24} color={COLORS.darkGray} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.infoModalBody}>
              {/* Break-Even Timeline */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <Ionicons name="timer-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.infoSectionTitle}>Break-Even Timeline</Text>
                </View>
                <Text style={styles.infoSectionText}>
                  The time it takes for your financial advantage in the new city to offset your upfront costs. This includes:
                </Text>
                <View style={styles.infoList}>
                  <Text style={styles.infoListItem}>• Moving costs</Text>
                  {analysis?.housingIntent?.plansToBuy ? (
                    <>
                      <Text style={styles.infoListItem}>• Down payment (a significant upfront cost)</Text>
                      <Text style={styles.infoListItem}>• Monthly salary advantage vs. cost of living</Text>
                      <Text style={styles.infoListItem}>• Mortgage + housing costs vs. current rent</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.infoListItem}>• Monthly salary advantage vs. cost of living</Text>
                      <Text style={styles.infoListItem}>• Rent difference between cities</Text>
                    </>
                  )}
                </View>
                {analysis?.housingIntent?.plansToBuy ? (
                  <Text style={[styles.infoSectionText, { marginTop: 8, fontStyle: 'italic' }]}>
                    Note: Buying a home typically results in a longer break-even timeline because the down payment is a large upfront cost, even though you're building equity.
                  </Text>
                ) : (
                  <Text style={[styles.infoSectionText, { marginTop: 8, fontStyle: 'italic' }]}>
                    A shorter break-even means you'll recover your moving costs faster and start benefiting financially from the move sooner.
                  </Text>
                )}
              </View>

              {/* Yearly Salary Diff */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <Ionicons name="cash-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.infoSectionTitle}>Yearly Salary Diff</Text>
                </View>
                <Text style={styles.infoSectionText}>
                  The difference in take-home pay (after taxes) between your current and target cities. This factors in:
                </Text>
                <View style={styles.infoList}>
                  <Text style={styles.infoListItem}>• Federal income tax</Text>
                  <Text style={styles.infoListItem}>• State income tax (if applicable)</Text>
                  <Text style={styles.infoListItem}>• Local income tax (if applicable)</Text>
                  <Text style={styles.infoListItem}>• FICA (Social Security & Medicare)</Text>
                </View>
              </View>

              {/* 5-Year Net Worth */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <Ionicons name="trending-up" size={20} color={COLORS.primary} />
                  <Text style={styles.infoSectionTitle}>5-Year Net Worth</Text>
                </View>
                <Text style={styles.infoSectionText}>
                  Your projected total wealth position after 5 years. This accounts for:
                </Text>
                <View style={styles.infoList}>
                  <Text style={styles.infoListItem}>• Net salary (after taxes)</Text>
                  {analysis?.housingIntent?.plansToBuy ? (
                    <>
                      <Text style={styles.infoListItem}>• Mortgage, property tax, insurance & maintenance</Text>
                      <Text style={styles.infoListItem}>• Home equity (from principal payments + appreciation)</Text>
                      <Text style={styles.infoListItem}>• Down payment ({((analysis.housingIntent.downPaymentPercent || 0.20) * 100).toFixed(0)}%)</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.infoListItem}>• Rent payments (with 3% annual increases)</Text>
                      <Text style={styles.infoListItem}>• Renter's insurance</Text>
                    </>
                  )}
                  <Text style={styles.infoListItem}>• Non-housing living expenses (food, transport, etc.)</Text>
                  <Text style={styles.infoListItem}>• Moving costs (one-time)</Text>
                  <Text style={styles.infoListItem}>• 3% annual salary growth</Text>
                  <Text style={styles.infoListItem}>• 7% investment returns on savings</Text>
                </View>
                {analysis?.housingIntent?.plansToBuy ? (
                  <Text style={[styles.infoSectionText, { marginTop: 8, fontStyle: 'italic' }]}>
                    Buying vs. renting often results in similar 5-year net worth because home equity offsets the higher monthly costs. The real advantage of buying typically shows over 10-15+ years.
                  </Text>
                ) : (
                  <Text style={[styles.infoSectionText, { marginTop: 8, fontStyle: 'italic' }]}>
                    As a renter, your net worth is your accumulated savings and investments. Lower housing costs can mean more money to invest.
                  </Text>
                )}
              </View>

              {/* Home Purchase - only for buyers */}
              {analysis?.housingIntent?.plansToBuy && (
                <View style={styles.infoSection}>
                  <View style={styles.infoSectionHeader}>
                    <Ionicons name="home" size={20} color={COLORS.primary} />
                    <Text style={styles.infoSectionTitle}>Home Purchase Details</Text>
                  </View>
                  <Text style={styles.infoSectionText}>
                    Your home equity is calculated using:
                  </Text>
                  <View style={styles.infoList}>
                    <Text style={styles.infoListItem}>• Down payment: {((analysis.housingIntent.downPaymentPercent || 0.20) * 100).toFixed(0)}%</Text>
                    <Text style={styles.infoListItem}>• Mortgage rate: {((analysis.housingIntent.mortgageRate || 0.068) * 100).toFixed(1)}%</Text>
                    <Text style={styles.infoListItem}>• Home appreciation: 4% annually</Text>
                    <Text style={styles.infoListItem}>• Property tax, insurance & maintenance</Text>
                  </View>
                </View>
              )}

              {/* Renting Details - only for renters */}
              {!analysis?.housingIntent?.plansToBuy && (
                <View style={styles.infoSection}>
                  <View style={styles.infoSectionHeader}>
                    <Ionicons name="key-outline" size={20} color={COLORS.primary} />
                    <Text style={styles.infoSectionTitle}>Renting Details</Text>
                  </View>
                  <Text style={styles.infoSectionText}>
                    Your housing costs as a renter include:
                  </Text>
                  <View style={styles.infoList}>
                    <Text style={styles.infoListItem}>• Monthly rent (based on city median: ${selectedCityAnalysis?.city?.medianRent?.toLocaleString() || analysis?.primaryTarget?.medianRent?.toLocaleString() || 'N/A'})</Text>
                    <Text style={styles.infoListItem}>• Renter's insurance (~$25/month)</Text>
                    <Text style={styles.infoListItem}>• 3% annual rent increases</Text>
                  </View>
                  <Text style={[styles.infoSectionText, { marginTop: 8, fontStyle: 'italic' }]}>
                    Renting offers flexibility and lower upfront costs, allowing you to invest the money you'd otherwise put toward a down payment.
                  </Text>
                </View>
              )}

              {/* Cost of Living */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <Ionicons name="cart-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.infoSectionTitle}>Cost of Living (COL)</Text>
                </View>
                <Text style={styles.infoSectionText}>
                  {analysis?.housingIntent?.plansToBuy
                    ? "Non-housing expenses (food, transportation, utilities, etc.) are estimated at 40% of income and scaled by each city's COL index. Housing costs are calculated separately using your mortgage details."
                    : "Living expenses including rent are estimated at 65% of income, scaled by each city's COL index. If your target city has a higher COL, expenses increase proportionally—even with a higher salary, you may have less left over."
                  }
                </Text>
              </View>

              {/* Disclaimer */}
              <View style={[styles.infoSection, styles.infoNote]}>
                <Ionicons name="information-circle" size={16} color={COLORS.info} />
                <Text style={styles.infoNoteText}>
                  All projections are estimates based on current data and assumptions. Actual results will vary based on market conditions, personal spending, and other factors.
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.infoModalButton}
              onPress={() => setShowCalculationInfo(false)}
            >
              <Text style={styles.infoModalButtonText}>Got It</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Onboarding Nudge Modal */}
      <Modal
        visible={showOnboardingNudge}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowOnboardingNudge(false)}
      >
        <View style={styles.onboardingOverlay}>
          <View style={styles.onboardingCard}>
            <View style={styles.onboardingIconRow}>
              <View style={styles.onboardingIconCircle}>
                <Ionicons name="information-circle-outline" size={32} color={COLORS.primary} />
              </View>
            </View>
            <Text style={styles.onboardingTitle}>Welcome to Your Full Analysis</Text>
            <Text style={styles.onboardingText}>
              Look for the{' '}
              <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
              {' '}icons throughout each section of your analysis. Tap them anytime for a detailed explanation of what you're looking at and how to use the data.
              {'\n\n'}
              When you're ready, head to the Export tab to download your complete analysis as a PDF — perfect for sharing with a partner, realtor, financial advisor, or employer during negotiations.
            </Text>
            <TouchableOpacity
              style={styles.onboardingButton}
              onPress={() => setShowOnboardingNudge(false)}
            >
              <Text style={styles.onboardingButtonText}>Got It, Let's Go</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
  },
  inputSection: {
    margin: SPACING.base,
  },
  section: {
    marginHorizontal: SPACING.base,
    marginTop: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  sectionTitle: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  premiumBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  premiumBadgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: SPACING.base,
  },
  sectionLabel: {
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 0,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  calculatorHintText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  perCityMovingCostRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  perCityMovingCostInput: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  perCityCalculatorButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.offWhite,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24, // Align with input field (accounting for label)
  },
  targetCityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  targetCityInputs: {
    flex: 1,
  },
  removeCityButton: {
    padding: SPACING.sm,
    marginTop: SPACING.xl,
  },
  addCityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  addCityText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  proBadgeSmall: {
    marginLeft: SPACING.xs,
  },
  circumstancesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.xs,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: SPACING.sm,
  },
  circumstancesToggleText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    fontWeight: '500',
  },
  circumstancesSection: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  switchText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
  },

  // Housing Options
  optionsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  optionsSectionTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  optionsDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: SPACING.md,
  },
  buyOptionsContainer: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  buyOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  buyOptionLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    flex: 1,
  },
  buyOptionInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    minWidth: 120,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  buyOptionInput: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.charcoal,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    textAlign: 'right',
  },
  buyOptionPrefix: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    marginRight: 4,
  },
  buyOptionSuffix: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    marginLeft: 4,
  },
  buyOptionsNote: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
  },

  // Household & Relocation Details
  householdInputRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  householdInputItem: {
    flex: 1,
  },
  householdInputItemFull: {
    flex: 1,
  },
  householdInputLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    marginBottom: SPACING.xs,
  },
  householdInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    paddingHorizontal: SPACING.sm,
  },
  householdInput: {
    flex: 1,
    fontSize: FONTS.sizes.base,
    color: COLORS.charcoal,
    paddingVertical: SPACING.sm,
    paddingLeft: SPACING.xs,
  },
  householdInputSuffix: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    marginLeft: 4,
  },
  householdNote: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
  },

  // Auto-Detected Section
  autoDetectedSection: {
    marginBottom: SPACING.sm,
  },
  autoDetectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  autoDetectedLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  autoDetectedText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.charcoal,
  },
  autoDetectedSubtext: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray,
  },
  autoDetectedBadge: {
    backgroundColor: COLORS.infoLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  autoDetectedBadgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.info,
  },
  autoDetectedHint: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    fontStyle: 'italic',
    marginTop: SPACING.sm,
  },
  travelModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    marginVertical: 2,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  travelModeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  overrideBadge: {
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  overrideBadgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.warning,
  },

  // Travel Mode Toggle (legacy - keeping for reference)
  travelModeSection: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  travelModeToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  travelModeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.xs,
    gap: SPACING.xs,
  },
  travelModeOptionActive: {
    backgroundColor: COLORS.primary,
  },
  travelModeText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.gray,
  },
  travelModeTextActive: {
    color: COLORS.white,
  },
  travelModeHint: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },

  // Tabs
  tabContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    marginTop: SPACING.md,
  },
  tabScroll: {
    paddingHorizontal: SPACING.base,
  },
  tab: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.accent,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  tabLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.mediumGray,
  },
  tabLabelActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  tabLocked: {
    opacity: 0.45,
  },
  tabLabelLocked: {
    color: COLORS.mediumGray,
  },
  tabPane: {
    paddingBottom: SPACING.lg,
  },
  checklistTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  checklistTopRowLeft: {
    flex: 1,
  },
  checklistInfoButton: {
    padding: SPACING.sm,
    marginTop: SPACING.xs,
  },

  // Hero Card
  heroCard: {
    margin: SPACING.base,
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  heroPositive: {
    backgroundColor: COLORS.success,
  },
  heroNegative: {
    backgroundColor: COLORS.warning,
  },
  heroIcon: {
    marginBottom: SPACING.md,
  },
  heroTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: FONTS.sizes.base,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  heroStats: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  heroStat: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  heroStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  heroStatValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  heroStatLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: 2,
  },
  housingBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  housingBadgeText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    fontWeight: '600',
  },
  heroEquityNote: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },

  // Card Header with Info Button
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardInfoButton: {
    padding: SPACING.xs,
  },

  // Stats Grid
  cardTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    paddingVertical: SPACING.sm,
  },
  statValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.accent,
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    marginTop: 2,
  },

  // Upsell Card
  upsellCard: {
    marginHorizontal: SPACING.base,
    marginTop: SPACING.md,
    backgroundColor: COLORS.primaryDark,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.large,
  },
  upsellSparkleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  upsellTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  upsellSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.lightGray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  upsellBenefits: {
    width: '100%',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  upsellBenefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  upsellBenefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upsellBenefitContent: {
    flex: 1,
  },
  upsellBenefitTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  upsellBenefitDesc: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    marginTop: 1,
  },
  upsellDivider: {
    width: '60%',
    height: 1,
    backgroundColor: COLORS.primaryLight,
    marginBottom: SPACING.md,
  },
  upsellPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  upsellPrice: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.white,
  },
  upsellPriceBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  upsellPriceBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 1,
  },
  upsellValueNote: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  upsellCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md + 2,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    width: '100%',
    gap: SPACING.sm,
    ...SHADOWS.medium,
  },
  upsellCTAText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  upsellFootnote: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },

  // Recommendations
  recommendationText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.white,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  considerationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  considerationText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    lineHeight: 20,
  },

  // Empty State
  emptyState: {
    marginHorizontal: SPACING.base,
    marginTop: SPACING.xl,
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyStateTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: SPACING.base,
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.mediumGray,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.lg,
  },


  // Hero info button
  heroInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    gap: SPACING.xs,
  },
  heroInfoText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    opacity: 0.9,
  },

  // Info Modal
  infoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.base,
  },
  infoModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  infoModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  infoModalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  infoModalClose: {
    padding: SPACING.xs,
  },
  infoModalBody: {
    padding: SPACING.base,
  },
  infoSection: {
    marginBottom: SPACING.lg,
  },
  infoSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  infoSectionTitle: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.white,
  },
  infoSectionText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  infoList: {
    paddingLeft: SPACING.sm,
  },
  infoListItem: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    lineHeight: 22,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.infoLight,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
    gap: SPACING.sm,
  },
  infoNoteText: {
    flex: 1,
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    lineHeight: 18,
  },
  infoModalButton: {
    backgroundColor: COLORS.primary,
    margin: SPACING.base,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  infoModalButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.white,
  },

  footer: {
    height: SPACING.xxxl,
  },

  // Onboarding Nudge
  onboardingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  onboardingCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    ...SHADOWS.large,
  },
  onboardingIconRow: {
    marginBottom: SPACING.md,
  },
  onboardingIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardingTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  onboardingText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  onboardingButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.sm,
    width: '100%',
    alignItems: 'center',
  },
  onboardingButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Export Tab
  exportCard: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  exportHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  exportTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  exportDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 400,
  },
  exportFeatures: {
    width: '100%',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  exportFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  exportFeatureText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.sm,
    width: '100%',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.white,
  },
  exportButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.offWhite,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.sm,
    width: '100%',
    gap: SPACING.sm,
  },
  exportButtonSecondaryText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.mediumGray,
  },
});

export default FullAnalysisScreen;
