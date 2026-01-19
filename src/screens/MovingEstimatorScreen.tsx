import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Switch,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../theme';
import { Button, Card, CardHeader, CardContent, Input, Select, SliderInput, CityPicker } from '../components';
import { HomeSize, MovingMethod, City, MoveType } from '../types';
import {
  estimateMovingCost,
  estimateDomesticMovingCost,
  getHomeSizeLabel,
  getMovingMethodLabel,
  getCategoryLabel,
  detectMoveType,
  calculateEuropeanTruckMove,
  calculateIntercontinentalMove,
  calculateCityDistance,
  getRecommendedContainerSize,
  getContainerCapacity,
  isContainerSizeValid,
  methodToContainerSize,
  containerSizeToMethod,
  getEstimatedTimeline,
  formatTimeline,
  compareMovingMethods,
  getRecommendedMovingMethod,
} from '../utils/movingCalculator';
import { formatCurrency } from '../utils/taxCalculator';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { countryUsesMiles } from '../utils/movingCalculator';

interface MovingEstimatorScreenProps {
  navigation: any;
}

const HOME_SIZE_OPTIONS = [
  { label: 'Studio Apartment', value: 'studio' },
  { label: '1 BR Apartment', value: '1br' },
  { label: '2 BR Apartment', value: '2br' },
  { label: '3 BR Apartment', value: '3br' },
  { label: '4+ BR Apartment', value: '4br' },
  { label: 'Small House (2-3 BR)', value: 'house_small' },
  { label: 'Large House (4+ BR)', value: 'house_large' },
];

const MOVING_METHOD_OPTIONS = [
  { label: 'DIY (Truck Rental)', value: 'diy' },
  { label: 'Hybrid (Container)', value: 'hybrid' },
  { label: 'Full Service', value: 'full_service' },
];

const MOVING_METHOD_INFO: Partial<Record<MovingMethod, { title: string; description: string; pros: string[]; cons: string[] }>> = {
  diy: {
    title: 'DIY (Truck Rental)',
    description: 'Rent a truck and handle everything yourself. You pack, load, drive, and unload.',
    pros: ['Most affordable option', 'Complete control over timing', 'Flexible schedule'],
    cons: ['Most labor-intensive', 'Requires driving a large truck', 'Must organize helpers'],
  },
  hybrid: {
    title: 'Hybrid (Container)',
    description: 'A portable storage container (like PODS or U-Pack) is delivered to your home. You pack and load it, they drive it to your new location.',
    pros: ['No need to drive a truck', 'Flexible loading timeline', 'Can serve as temporary storage', 'Middle-ground cost'],
    cons: ['Limited space', 'Still requires packing & loading', 'Driveway space needed'],
  },
  full_service: {
    title: 'Full-Service Movers',
    description: 'Professional movers handle everything: packing, loading, driving, and unloading at your new home.',
    pros: ['Least stressful option', 'No heavy lifting', 'Faster move', 'Insurance coverage', 'Professional packing'],
    cons: ['Most expensive', 'Less flexibility on timing', 'Must coordinate schedules'],
  },
  euro_truck: {
    title: 'Professional Truck Movers',
    description: 'Professional moving companies transport your belongings by truck across Europe. They handle loading, transport, and unloading.',
    pros: ['Common and reliable in Europe', 'Door-to-door service', 'Faster than container shipping', 'Professional handling'],
    cons: ['More expensive than DIY', 'Limited flexibility', 'Scheduling required'],
  },
  minimalist: {
    title: 'Minimalist Move',
    description: 'Travel light with just suitcases. Sell or donate most belongings and buy essentials at your destination.',
    pros: ['Ultra-low cost', 'Fast and flexible', 'Fresh start', 'No customs hassles'],
    cons: ['Must replace everything', 'No sentimental items', 'Not for families', 'Emotional letting go'],
  },
  lcl: {
    title: 'Light Move (LCL)',
    description: 'Less than Container Load - your belongings share a container with others. Good for 1-2 bedroom moves.',
    pros: ['Affordable for small loads', 'More than suitcases', 'Professional handling', 'Door-to-door options'],
    cons: ['4-8 week transit time', 'Limited space (5-15 CBM)', 'Multiple handling points', 'Coordination needed'],
  },
  fcl_20: {
    title: 'Standard (20ft Container)',
    description: 'A dedicated 20ft container fits a 2-3 bedroom apartment. Your belongings travel alone.',
    pros: ['Secure dedicated container', 'Fits most apartments', 'One-time handling', 'Cost-effective for medium loads'],
    cons: ['6-10 week transit time', 'Higher cost than LCL', 'Port fees apply', 'Advance planning needed'],
  },
  fcl_40: {
    title: 'Full Household (40ft Container)',
    description: 'A dedicated 40ft container for large households. Fits 4+ bedrooms or a full house.',
    pros: ['Maximum capacity', 'Bring everything', 'Secure shipping', 'Best for families'],
    cons: ['Highest cost', '6-12 week transit', 'Significant port/customs fees', 'Long-term planning required'],
  },
};

export const MovingEstimatorScreen: React.FC<MovingEstimatorScreenProps> = ({ navigation }) => {
  // Get user preferences for distance unit display and currency
  const { preferences } = useUserPreferences();
  const userHomeCountry = preferences?.homeCountry || 'us';
  const userHomeCurrency = preferences?.homeCurrency || 'USD';

  // City-based move (international support)
  const [fromCity, setFromCity] = useState<City | null>(null);
  const [toCity, setToCity] = useState<City | null>(null);

  // Legacy distance-based (for US domestic)
  const [distance, setDistance] = useState(500);

  const [homeSize, setHomeSize] = useState<HomeSize>('2br');
  const [movingMethod, setMovingMethod] = useState<MovingMethod>('hybrid');
  const [hasVehicle, setHasVehicle] = useState(false);
  const [hasPets, setHasPets] = useState(false);
  const [isRenting, setIsRenting] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [includeOptional, setIncludeOptional] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false); // Starts hidden, shows after calculate

  // Dismiss disclaimer for this session only (resets when page is reopened)
  const dismissDisclaimer = () => {
    setShowDisclaimer(false);
  };

  // Detect move type based on selected cities
  const moveType: MoveType | null = useMemo(() => {
    if (!fromCity || !toCity) return null;
    return detectMoveType(fromCity, toCity);
  }, [fromCity, toCity]);

  // Get appropriate moving method options based on move type
  const movingMethodOptions = useMemo(() => {
    if (!moveType) {
      // Default US domestic options
      return [
        { label: 'DIY (Truck Rental)', value: 'diy' },
        { label: 'Hybrid (Container)', value: 'hybrid' },
        { label: 'Full Service', value: 'full_service' },
      ];
    }

    if (moveType === 'domestic') {
      // Domestic moves within the same country
      const country = fromCity?.country;

      // Calculate recommended method for domestic moves
      const calculatedDistance = fromCity && toCity ? calculateCityDistance(fromCity, toCity) : 0;
      const recommendedMethod = calculatedDistance > 0
        ? getRecommendedMovingMethod(calculatedDistance, homeSize, 'domestic', country)
        : null;

      // NORTH AMERICA: DIY + Container (PODS) + Professional (based on research)
      if (country === 'us' || country === 'ca') {
        return [
          {
            label: `DIY (Truck Rental)${recommendedMethod === 'diy' ? ' ⭐ Recommended' : ''}`,
            value: 'diy'
          },
          {
            label: `Hybrid (Container/PODS)${recommendedMethod === 'hybrid' ? ' ⭐ Recommended' : ''}`,
            value: 'hybrid'
          },
          {
            label: `Full Service${recommendedMethod === 'full_service' ? ' ⭐ Recommended' : ''}`,
            value: 'full_service'
          },
        ];
      }

      // STRONG DIY MARKETS: Netherlands, Denmark, South Africa (based on research)
      // UK & Australia also have DIY available
      else if (country === 'nl' || country === 'dk' || country === 'za' || country === 'gb' || country === 'au') {
        return [
          {
            label: `DIY (${country === 'gb' ? 'Van Rental' : 'Truck Rental'})${recommendedMethod === 'diy' ? ' ⭐ Recommended' : ''}`,
            value: 'diy'
          },
          {
            label: `Professional Movers${recommendedMethod === 'full_service' ? ' ⭐ Recommended' : ''}`,
            value: 'full_service'
          },
        ];
      }

      // EMERGING DIY MARKETS: Germany, Czech Republic, Poland, Brazil (available but less common)
      else if (country === 'de' || country === 'cz' || country === 'pl' || country === 'br') {
        return [
          {
            label: `DIY (Truck Rental)${recommendedMethod === 'diy' ? ' ⭐ Recommended' : ''}`,
            value: 'diy'
          },
          {
            label: `Professional Movers${recommendedMethod === 'full_service' ? ' ⭐ Recommended' : ''}`,
            value: 'full_service'
          },
        ];
      }

      // PROFESSIONAL-ONLY MARKETS: All other countries (based on research)
      // Includes: France, Spain, Italy, Portugal, Greece, Sweden, Norway, Switzerland, Belgium, Ireland,
      // Japan, South Korea, Singapore, UAE, India, China, all of Latin America except Brazil, etc.
      else {
        return [
          { label: 'Professional Movers', value: 'full_service' },
        ];
      }
    }

    if (moveType === 'intra_regional') {
      // Within Europe or within another region
      return [
        { label: 'Professional Truck Movers', value: 'euro_truck' },
      ];
    }

    // Intercontinental moves - add recommended badge
    const recommendedContainer = getRecommendedContainerSize(homeSize);
    const recommendedMethod = containerSizeToMethod(recommendedContainer);

    return [
      {
        label: `Minimalist (Suitcases Only)${recommendedMethod === 'minimalist' ? ' ⭐ Recommended' : ''}`,
        value: 'minimalist'
      },
      {
        label: `Light Move (Shared Container)${recommendedMethod === 'lcl' ? ' ⭐ Recommended' : ''}`,
        value: 'lcl'
      },
      {
        label: `Standard (20ft Container)${recommendedMethod === 'fcl_20' ? ' ⭐ Recommended' : ''}`,
        value: 'fcl_20'
      },
      {
        label: `Full Household (40ft Container)${recommendedMethod === 'fcl_40' ? ' ⭐ Recommended' : ''}`,
        value: 'fcl_40'
      },
    ];
  }, [moveType, fromCity, toCity, homeSize]);

  // Auto-select first option when move type changes OR smart recommend for intercontinental
  useMemo(() => {
    if (movingMethodOptions.length > 0) {
      const currentMethodValid = movingMethodOptions.some(opt => opt.value === movingMethod);

      // For intercontinental moves, auto-select recommended container size
      if (!currentMethodValid || (moveType === 'intercontinental' && fromCity && toCity)) {
        // Get recommended container based on home size
        const recommendedContainer = getRecommendedContainerSize(homeSize);
        const recommendedMethod = containerSizeToMethod(recommendedContainer);

        // Check if recommended method is available in options
        const recommendedAvailable = movingMethodOptions.some(opt => opt.value === recommendedMethod);

        if (recommendedAvailable) {
          setMovingMethod(recommendedMethod);
        } else {
          setMovingMethod(movingMethodOptions[0].value as MovingMethod);
        }
      }
    }
  }, [movingMethodOptions, homeSize, moveType, fromCity, toCity]);

  const estimate = useMemo(() => {
    // If cities are selected, use city-based calculation
    if (fromCity && toCity && moveType) {
      if (moveType === 'intra_regional') {
        return calculateEuropeanTruckMove(fromCity, toCity, homeSize, hasVehicle, hasPets, isRenting);
      } else if (moveType === 'intercontinental') {
        return calculateIntercontinentalMove(fromCity, toCity, homeSize, movingMethod, hasVehicle, hasPets, isRenting);
      } else {
        // Domestic move - use regional pricing with currency conversion
        return estimateDomesticMovingCost(fromCity, toCity, homeSize, movingMethod, hasVehicle, hasPets, isRenting, userHomeCurrency);
      }
    }

    // Fallback to legacy distance-based calculation (when no cities selected)
    return estimateMovingCost(distance, homeSize, movingMethod, hasVehicle, hasPets, isRenting);
  }, [fromCity, toCity, moveType, distance, homeSize, movingMethod, hasVehicle, hasPets, isRenting, userHomeCurrency]);

  const handleCalculate = () => {
    setShowResults(true);

    // Show disclaimer for domestic and intra-regional moves (both use regional pricing)
    if (moveType === 'domestic' || moveType === 'intra_regional') {
      setShowDisclaimer(true);
    }
  };

  const requiredExpenses = estimate.breakdown.filter(e => e.isRequired);
  const optionalExpenses = estimate.breakdown.filter(e => !e.isRequired);

  const requiredTotal = requiredExpenses.reduce((sum, e) => sum + e.estimatedCost, 0);
  const optionalTotal = optionalExpenses.reduce((sum, e) => sum + e.estimatedCost, 0);
  const displayTotal = includeOptional ? requiredTotal + optionalTotal : requiredTotal;

  // Calculate method comparisons for domestic moves only (not intercontinental/regional)
  const methodComparisons = useMemo(() => {
    if (!moveType || moveType !== 'domestic') return null;
    if (!fromCity || !toCity) return null;

    const calculatedDistance = calculateCityDistance(fromCity, toCity);
    const availableMethods = movingMethodOptions.map(opt => opt.value as MovingMethod);

    return compareMovingMethods(
      calculatedDistance,
      homeSize,
      movingMethod,
      hasVehicle,
      hasPets,
      isRenting,
      moveType,
      availableMethods,
      fromCity.country
    );
  }, [moveType, fromCity, toCity, homeSize, movingMethod, hasVehicle, hasPets, isRenting, movingMethodOptions]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.inputCard}>
          <CardHeader
            title="Move Details"
            subtitle="Tell us about your relocation"
          />
          <CardContent>
            {/* City Pickers for International Moves */}
            <CityPicker
              label="From City"
              value={fromCity}
              onChange={(city: City) => setFromCity(city)}
              placeholder="Select starting city"
            />

            <CityPicker
              label="To City"
              value={toCity}
              onChange={(city: City) => setToCity(city)}
              placeholder="Select destination city"
            />

            {/* Move Type Badge and Distance Display */}
            {moveType && fromCity && toCity && (
              <View style={styles.moveInfoContainer}>
                <View style={styles.moveTypeBadge}>
                  <Ionicons
                    name={
                      moveType === 'domestic' ? 'home' :
                      moveType === 'intra_regional' ? 'airplane' :
                      'globe'
                    }
                    size={16}
                    color={COLORS.info}
                  />
                  <Text style={styles.moveTypeText}>
                    {moveType === 'domestic' ? 'Domestic Move' :
                     moveType === 'intra_regional' ? 'Regional Move' :
                     'International Move'}
                  </Text>
                </View>

                {/* Show calculated distance for domestic moves */}
                {moveType === 'domestic' && (() => {
                  // Get the calculated distance (in the move country's unit)
                  const calculatedDistance = estimate.distance;
                  const moveCountryUsesMiles = countryUsesMiles(fromCity.country);
                  const userPrefersMiles = countryUsesMiles(userHomeCountry);

                  // Convert distance to user's preferred unit if needed
                  let displayDistance = calculatedDistance;
                  let displayUnit = moveCountryUsesMiles ? 'miles' : 'km';

                  if (moveCountryUsesMiles && !userPrefersMiles) {
                    // Move is in miles, user wants km
                    displayDistance = Math.round(calculatedDistance * 1.60934);
                    displayUnit = 'km';
                  } else if (!moveCountryUsesMiles && userPrefersMiles) {
                    // Move is in km, user wants miles
                    displayDistance = Math.round(calculatedDistance / 1.60934);
                    displayUnit = 'miles';
                  }

                  return (
                    <View style={styles.distanceBadge}>
                      <Ionicons name="navigate" size={16} color={COLORS.mediumGray} />
                      <Text style={styles.distanceText}>
                        ~{displayDistance.toLocaleString()} {displayUnit}
                      </Text>
                    </View>
                  );
                })()}
              </View>
            )}

            {/* Distance slider - ONLY show if no cities selected (legacy mode) */}
            {!fromCity && !toCity && (
              <SliderInput
                label="Distance"
                value={distance}
                onChange={setDistance}
                min={50}
                max={3000}
                step={50}
                formatValue={(v) => `${v.toLocaleString()} miles`}
              />
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Home Size</Text>
              <Select
                options={HOME_SIZE_OPTIONS}
                value={homeSize}
                onChange={(v) => setHomeSize(v as HomeSize)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Moving Method</Text>
              <Select
                options={movingMethodOptions}
                value={movingMethod}
                onChange={(v) => setMovingMethod(v as MovingMethod)}
              />

              {/* Recommended Badge for International Moves */}
              {moveType === 'intercontinental' && (() => {
                const recommendedContainer = getRecommendedContainerSize(homeSize);
                const recommendedMethod = containerSizeToMethod(recommendedContainer);

                if (movingMethod === recommendedMethod) {
                  return (
                    <View style={styles.recommendedMethodBadge}>
                      <Ionicons name="star" size={14} color={COLORS.secondary} />
                      <Text style={styles.recommendedMethodText}>
                        Recommended for {getHomeSizeLabel(homeSize)}
                      </Text>
                    </View>
                  );
                }
                return null;
              })()}
            </View>

            {/* Container Size Validation Warning */}
            {moveType === 'intercontinental' && (() => {
              const containerSize = methodToContainerSize(movingMethod);
              if (!containerSize) return null;

              const validation = isContainerSizeValid(homeSize, containerSize);

              if (validation.severity === 'error') {
                return (
                  <View style={styles.validationError}>
                    <Ionicons name="warning" size={20} color={COLORS.error} />
                    <Text style={styles.validationErrorText}>{validation.message}</Text>
                  </View>
                );
              }

              if (validation.severity === 'warning') {
                return (
                  <View style={styles.validationWarning}>
                    <Ionicons name="alert-circle" size={20} color={COLORS.warning} />
                    <Text style={styles.validationWarningText}>{validation.message}</Text>
                  </View>
                );
              }

              return null;
            })()}

            {/* Moving Method Info Card */}
            {MOVING_METHOD_INFO[movingMethod] && (
              <View style={styles.methodInfoCard}>
                <View style={styles.methodInfoHeader}>
                  <Ionicons name="information-circle" size={20} color={COLORS.info} />
                  <Text style={styles.methodInfoTitle}>
                    {MOVING_METHOD_INFO[movingMethod]!.title}
                  </Text>
                </View>
                <Text style={styles.methodInfoDescription}>
                  {MOVING_METHOD_INFO[movingMethod]!.description}
                </Text>

                {/* Timeline Display */}
                {(() => {
                  // Calculate distance for accurate timeline
                  let calculatedDistance = distance;
                  if (fromCity && toCity) {
                    calculatedDistance = calculateCityDistance(fromCity, toCity);
                  }

                  const timeline = getEstimatedTimeline(
                    movingMethod,
                    moveType || undefined,
                    calculatedDistance,
                    fromCity || undefined,
                    toCity || undefined
                  );
                  return (
                    <View style={styles.timelineContainer}>
                      <Ionicons name="time-outline" size={16} color={COLORS.mediumGray} />
                      <Text style={styles.timelineText}>
                        Estimated delivery: <Text style={styles.timelineBold}>{formatTimeline(timeline)}</Text>
                      </Text>
                    </View>
                  );
                })()}

                <View style={styles.methodInfoLists}>
                  <View style={styles.methodInfoColumn}>
                    <Text style={styles.methodInfoLabel}>Pros:</Text>
                    {MOVING_METHOD_INFO[movingMethod]!.pros.map((pro, index) => (
                      <View key={index} style={styles.methodInfoItem}>
                        <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                        <Text style={styles.methodInfoText}>{pro}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.methodInfoColumn}>
                    <Text style={styles.methodInfoLabel}>Cons:</Text>
                    {MOVING_METHOD_INFO[movingMethod]!.cons.map((con, index) => (
                      <View key={index} style={styles.methodInfoItem}>
                        <Ionicons name="close-circle" size={14} color={COLORS.error} />
                        <Text style={styles.methodInfoText}>{con}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* Timeline Warning for Long Waits (>6 weeks) */}
            {moveType && (() => {
              // Calculate distance for accurate timeline
              let calculatedDistance = distance;
              if (fromCity && toCity) {
                calculatedDistance = calculateCityDistance(fromCity, toCity);
              }

              const timeline = getEstimatedTimeline(
                movingMethod,
                moveType,
                calculatedDistance,
                fromCity || undefined,
                toCity || undefined
              );
              const isLongWait = timeline.unit === 'weeks' && timeline.min >= 6;

              if (isLongWait) {
                return (
                  <View style={styles.timelineWarning}>
                    <Ionicons name="time" size={20} color={COLORS.warning} />
                    <View style={styles.timelineWarningContent}>
                      <Text style={styles.timelineWarningTitle}>Long Transit Time</Text>
                      <Text style={styles.timelineWarningText}>
                        Your belongings will take {formatTimeline(timeline)} to arrive. {timeline.description}.
                        Plan accordingly for this gap - consider bringing essentials or purchasing temporary furniture.
                      </Text>
                    </View>
                  </View>
                );
              }
              return null;
            })()}

            <View style={styles.switchGroup}>
              <View style={styles.switchRow}>
                <View style={styles.switchLabel}>
                  <Ionicons name="car-outline" size={20} color={COLORS.darkGray} />
                  <Text style={styles.switchText}>Shipping a vehicle?</Text>
                </View>
                <Switch
                  value={hasVehicle}
                  onValueChange={setHasVehicle}
                  trackColor={{ false: COLORS.lightGray, true: COLORS.primary + '50' }}
                  thumbColor={hasVehicle ? COLORS.primary : COLORS.mediumGray}
                />
              </View>

              <View style={styles.switchRow}>
                <View style={styles.switchLabel}>
                  <Ionicons name="paw-outline" size={20} color={COLORS.darkGray} />
                  <Text style={styles.switchText}>Moving with pets?</Text>
                </View>
                <Switch
                  value={hasPets}
                  onValueChange={setHasPets}
                  trackColor={{ false: COLORS.lightGray, true: COLORS.primary + '50' }}
                  thumbColor={hasPets ? COLORS.primary : COLORS.mediumGray}
                />
              </View>

              <View style={styles.switchRow}>
                <View style={styles.switchLabel}>
                  <Ionicons name="home-outline" size={20} color={COLORS.darkGray} />
                  <Text style={styles.switchText}>Renting your new home?</Text>
                </View>
                <Switch
                  value={isRenting}
                  onValueChange={setIsRenting}
                  trackColor={{ false: COLORS.lightGray, true: COLORS.primary + '50' }}
                  thumbColor={isRenting ? COLORS.primary : COLORS.mediumGray}
                />
              </View>
            </View>

            <Button
              title="Estimate Moving Costs"
              onPress={handleCalculate}
              fullWidth
              style={styles.calculateButton}
            />
          </CardContent>
        </Card>

        {showResults && (
          <View style={styles.resultsSection}>
            {/* Regional Pricing Disclaimer - shown for domestic and intra-regional moves */}
            {showDisclaimer && (
              <View style={styles.disclaimerBanner}>
                <View style={styles.disclaimerContent}>
                  <Ionicons name="information-circle" size={20} color={COLORS.primary} style={styles.disclaimerIcon} />
                  <View style={styles.disclaimerTextContainer}>
                    <Text style={styles.disclaimerTitle}>Regional Pricing Estimates</Text>
                    <Text style={styles.disclaimerText}>
                      Moving costs shown use regional averages and may vary significantly by location, season, and specific providers. We recommend contacting local moving companies for accurate quotes in your area.
                    </Text>
                  </View>
                </View>
                <Pressable onPress={dismissDisclaimer} style={styles.disclaimerCloseButton}>
                  <Ionicons name="close" size={20} color={COLORS.darkGray} />
                </Pressable>
              </View>
            )}

            {/* Total Estimate */}
            <Card style={styles.totalCard}>
              <View style={styles.totalContent}>
                <Text style={styles.totalLabel}>
                  {includeOptional ? 'Total with Optional' : 'Base Cost (Required)'}
                </Text>
                <Text style={styles.totalValue}>{formatCurrency(displayTotal)}</Text>
                <View style={styles.totalMeta}>
                  <Text style={styles.metaText}>
                    {getHomeSizeLabel(homeSize)} • {(() => {
                      // Display distance in user's preferred unit
                      if (fromCity && toCity) {
                        const calculatedDistance = estimate.distance;
                        const moveCountryUsesMiles = countryUsesMiles(fromCity.country);
                        const userPrefersMiles = countryUsesMiles(userHomeCountry);

                        let displayDistance = calculatedDistance;
                        let displayUnit = moveCountryUsesMiles ? 'miles' : 'km';

                        if (moveCountryUsesMiles && !userPrefersMiles) {
                          displayDistance = Math.round(calculatedDistance * 1.60934);
                          displayUnit = 'km';
                        } else if (!moveCountryUsesMiles && userPrefersMiles) {
                          displayDistance = Math.round(calculatedDistance / 1.60934);
                          displayUnit = 'miles';
                        }

                        return `${displayDistance.toLocaleString()} ${displayUnit}`;
                      }
                      // Legacy distance slider
                      return `${distance.toLocaleString()} miles`;
                    })()} • {getMovingMethodLabel(movingMethod)}
                  </Text>
                  {/* Timeline Display */}
                  {moveType && (() => {
                    // Calculate distance for accurate timeline
                    let calculatedDistance = distance;
                    if (fromCity && toCity) {
                      calculatedDistance = calculateCityDistance(fromCity, toCity);
                    }

                    const timeline = getEstimatedTimeline(
                      movingMethod,
                      moveType,
                      calculatedDistance,
                      fromCity || undefined,
                      toCity || undefined
                    );
                    return (
                      <Text style={styles.metaText}>
                        Delivery: {formatTimeline(timeline)}
                      </Text>
                    );
                  })()}
                </View>

                {/* Toggle for including optional expenses */}
                <View style={styles.optionalToggle}>
                  <Text style={styles.optionalToggleLabel}>Include optional expenses</Text>
                  <Switch
                    value={includeOptional}
                    onValueChange={setIncludeOptional}
                    trackColor={{ false: COLORS.white + '40', true: COLORS.secondary }}
                    thumbColor={COLORS.white}
                  />
                </View>

                {/* Cost breakdown preview */}
                <View style={styles.costBreakdown}>
                  <View style={styles.costBreakdownRow}>
                    <Text style={styles.costBreakdownLabel}>Required:</Text>
                    <Text style={styles.costBreakdownValue}>{formatCurrency(requiredTotal)}</Text>
                  </View>
                  <View style={styles.costBreakdownRow}>
                    <Text style={styles.costBreakdownLabel}>Optional:</Text>
                    <Text style={styles.costBreakdownValue}>{formatCurrency(optionalTotal)}</Text>
                  </View>
                </View>
              </View>
            </Card>

            {/* Cost Comparison (Domestic Moves Only) */}
            {methodComparisons && methodComparisons.length > 1 && (
              <Card style={styles.comparisonCard}>
                <CardHeader
                  title="Compare Moving Methods"
                  subtitle="See how much you could save or upgrade"
                />
                <CardContent>
                  <View style={styles.comparisonContainer}>
                    {methodComparisons.map((comparison, index) => (
                      <View
                        key={comparison.method}
                        style={[
                          styles.comparisonOption,
                          comparison.isCurrentSelection && styles.comparisonOptionSelected,
                          comparison.isRecommended && styles.comparisonOptionRecommended,
                        ]}
                      >
                        {/* Recommended Badge */}
                        {comparison.isRecommended && (
                          <View style={styles.recommendedBadge}>
                            <Ionicons name="star" size={12} color={COLORS.white} />
                            <Text style={styles.recommendedBadgeText}>Recommended</Text>
                          </View>
                        )}

                        {/* Method Name */}
                        <Text style={[
                          styles.comparisonMethodName,
                          comparison.isCurrentSelection && styles.comparisonMethodNameSelected
                        ]}>
                          {comparison.label}
                        </Text>

                        {/* Cost */}
                        <Text style={[
                          styles.comparisonCost,
                          comparison.isCurrentSelection && styles.comparisonCostSelected
                        ]}>
                          {formatCurrency(comparison.totalCost)}
                        </Text>

                        {/* Savings or Upgrade Message */}
                        {!comparison.isCurrentSelection && comparison.savingsVsCurrent && (
                          <>
                            {comparison.savingsVsCurrent > 0 ? (
                              <View style={styles.savingsContainer}>
                                <Ionicons name="arrow-down" size={14} color={COLORS.success} />
                                <Text style={styles.savingsText}>
                                  Save {formatCurrency(comparison.savingsVsCurrent)}
                                </Text>
                              </View>
                            ) : (
                              <Text style={styles.upgradeText}>
                                {(() => {
                                  const upgradeCost = Math.abs(comparison.savingsVsCurrent);
                                  if (upgradeCost < 500) {
                                    return `Upgrade for just ${formatCurrency(upgradeCost)} more`;
                                  } else if (upgradeCost < 1000) {
                                    return `Upgrade for ${formatCurrency(upgradeCost)} more`;
                                  } else {
                                    return `${formatCurrency(upgradeCost)} more expensive`;
                                  }
                                })()}
                              </Text>
                            )}
                          </>
                        )}

                        {/* Current Selection Indicator */}
                        {comparison.isCurrentSelection && (
                          <View style={styles.currentBadge}>
                            <Text style={styles.currentBadgeText}>Current Selection</Text>
                          </View>
                        )}

                        {/* Details Grid */}
                        <View style={styles.comparisonDetails}>
                          <View style={styles.comparisonDetailRow}>
                            <Ionicons name="time-outline" size={14} color={COLORS.mediumGray} />
                            <Text style={styles.comparisonDetailText}>{comparison.timeline}</Text>
                          </View>
                          <View style={styles.comparisonDetailRow}>
                            <Ionicons name="fitness-outline" size={14} color={COLORS.mediumGray} />
                            <Text style={styles.comparisonDetailText}>
                              {comparison.physicalEffort} effort
                            </Text>
                          </View>
                          {comparison.popularityPercentage && comparison.popularityPercentage > 0 && (
                            <View style={styles.comparisonDetailRow}>
                              <Ionicons name="people-outline" size={14} color={COLORS.mediumGray} />
                              <Text style={styles.comparisonDetailText}>
                                {comparison.popularityPercentage}% choose this
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Tap to Select (for non-current options) */}
                        {!comparison.isCurrentSelection && (
                          <Button
                            title="Select This Option"
                            onPress={() => setMovingMethod(comparison.method)}
                            variant="outline"
                            size="sm"
                            style={styles.selectButton}
                          />
                        )}
                      </View>
                    ))}
                  </View>
                </CardContent>
              </Card>
            )}

            {/* Required Expenses */}
            <Card style={styles.breakdownCard}>
              <CardHeader 
                title="Required Expenses" 
                subtitle="Essential costs for your move"
              />
              <CardContent>
                {requiredExpenses.map((expense) => (
                  <View key={expense.id} style={styles.expenseRow}>
                    <View style={styles.expenseInfo}>
                      <Text style={styles.expenseDescription}>{expense.description}</Text>
                      <Text style={styles.expenseCategory}>{getCategoryLabel(expense.category)}</Text>
                    </View>
                    <Text style={styles.expenseAmount}>
                      {formatCurrency(expense.estimatedCost)}
                    </Text>
                  </View>
                ))}
                <View style={styles.subtotalRow}>
                  <Text style={styles.subtotalLabel}>Required Subtotal</Text>
                  <Text style={styles.subtotalValue}>
                    {formatCurrency(requiredExpenses.reduce((sum, e) => sum + e.estimatedCost, 0))}
                  </Text>
                </View>
              </CardContent>
            </Card>

            {/* Optional Expenses */}
            {optionalExpenses.length > 0 && (
              <Card style={styles.breakdownCard}>
                <CardHeader 
                  title="Optional Expenses" 
                  subtitle="Additional costs to consider"
                />
                <CardContent>
                  {optionalExpenses.map((expense) => (
                    <View key={expense.id} style={styles.expenseRow}>
                      <View style={styles.expenseInfo}>
                        <Text style={styles.expenseDescription}>{expense.description}</Text>
                        <Text style={styles.expenseCategory}>{getCategoryLabel(expense.category)}</Text>
                      </View>
                      <Text style={styles.expenseAmountOptional}>
                        {formatCurrency(expense.estimatedCost)}
                      </Text>
                    </View>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Tips Card */}
            <Card style={styles.tipsCard} variant="outlined">
              <View style={styles.tipsHeader}>
                <Ionicons name="bulb-outline" size={24} color={COLORS.warning} />
                <Text style={styles.tipsTitle}>Money-Saving Tips</Text>
              </View>
              <View style={styles.tipsList}>
                <Text style={styles.tip}>• Book movers 4-6 weeks in advance for better rates</Text>
                <Text style={styles.tip}>• Move mid-month or mid-week for lower prices</Text>
                <Text style={styles.tip}>• Get at least 3 quotes from different companies</Text>
                <Text style={styles.tip}>• Declutter before moving - less stuff = lower costs</Text>
                <Text style={styles.tip}>• Use free boxes from grocery stores or online marketplaces</Text>
              </View>
            </Card>
          </View>
        )}

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.base,
  },
  // Disclaimer Banner Styles
  disclaimerBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary + '15', // Light blue background
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.base,
    alignItems: 'flex-start',
  },
  disclaimerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  disclaimerIcon: {
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  disclaimerTextContainer: {
    flex: 1,
  },
  disclaimerTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.charcoal,
    marginBottom: SPACING.xs,
  },
  disclaimerText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.darkGray,
    lineHeight: 18,
  },
  disclaimerCloseButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  inputCard: {
    marginBottom: SPACING.base,
  },
  inputGroup: {
    marginBottom: SPACING.base,
  },
  inputLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
  },
  switchGroup: {
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.offWhite,
    borderRadius: RADIUS.md,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  switchText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.charcoal,
  },
  methodInfoCard: {
    backgroundColor: COLORS.infoLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.info + '30',
  },
  methodInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  methodInfoTitle: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.info,
  },
  methodInfoDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  methodInfoLists: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  methodInfoColumn: {
    flex: 1,
  },
  methodInfoLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: COLORS.charcoal,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  methodInfoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  methodInfoText: {
    flex: 1,
    fontSize: FONTS.sizes.xs,
    color: COLORS.darkGray,
    lineHeight: 16,
  },
  calculateButton: {
    marginTop: SPACING.lg,
  },
  resultsSection: {
    gap: SPACING.base,
  },
  totalCard: {
    backgroundColor: COLORS.primary,
  },
  totalContent: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  totalLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    opacity: 0.8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  totalValue: {
    fontSize: FONTS.sizes.hero,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: SPACING.xs,
    letterSpacing: -1,
  },
  totalMeta: {
    marginTop: SPACING.sm,
  },
  metaText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    opacity: 0.7,
  },
  optionalToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.white + '30',
  },
  optionalToggleLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    fontWeight: '500',
  },
  costBreakdown: {
    width: '100%',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.white + '30',
  },
  costBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  costBreakdownLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    opacity: 0.8,
  },
  costBreakdownValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  breakdownCard: {
    marginBottom: SPACING.base,
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  expenseInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  expenseDescription: {
    fontSize: FONTS.sizes.base,
    color: COLORS.charcoal,
    fontWeight: '500',
  },
  expenseCategory: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.charcoal,
  },
  expenseAmountOptional: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.mediumGray,
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    marginTop: SPACING.sm,
  },
  subtotalLabel: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.charcoal,
  },
  subtotalValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  tipsCard: {
    backgroundColor: COLORS.warningLight,
    borderColor: COLORS.warning + '30',
    marginBottom: SPACING.base,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tipsTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.charcoal,
  },
  tipsList: {
    gap: SPACING.sm,
  },
  tip: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  footer: {
    height: SPACING.xxl,
  },
  // Move Info Container
  moveInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.base,
    marginTop: SPACING.base,
    flexWrap: 'wrap',
  },
  // Move Type Badge
  moveTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.infoLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  moveTypeText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.info,
    fontWeight: '600',
  },
  // Distance Badge
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.offWhite,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  distanceText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  // Validation Banners
  validationError: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.errorLight,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.base,
  },
  validationErrorText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.error,
    lineHeight: 20,
  },
  validationWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.warningLight,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.base,
  },
  validationWarningText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: '#8B6914', // Darker warning text for readability
    lineHeight: 20,
  },
  // Timeline Display
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.white + '60',
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
  },
  timelineText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
  },
  timelineBold: {
    fontWeight: '600',
    color: COLORS.charcoal,
  },
  // Timeline Warning Banner
  timelineWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.warningLight,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.base,
  },
  timelineWarningContent: {
    flex: 1,
  },
  timelineWarningTitle: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.charcoal,
    marginBottom: SPACING.xs,
  },
  timelineWarningText: {
    fontSize: FONTS.sizes.sm,
    color: '#8B6914', // Darker warning text for readability
    lineHeight: 20,
  },
  // Cost Comparison Styles
  comparisonCard: {
    marginBottom: SPACING.base,
  },
  comparisonContainer: {
    gap: SPACING.md,
  },
  comparisonOption: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    position: 'relative',
  },
  comparisonOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  comparisonOptionRecommended: {
    borderColor: COLORS.secondary,
  },
  recommendedBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
  },
  recommendedBadgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currentBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
  },
  currentBadgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  comparisonMethodName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.charcoal,
    marginBottom: SPACING.xs,
  },
  comparisonMethodNameSelected: {
    color: COLORS.primary,
  },
  comparisonCost: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.charcoal,
    marginBottom: SPACING.sm,
  },
  comparisonCostSelected: {
    color: COLORS.primary,
  },
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.successLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
    marginBottom: SPACING.xs,
  },
  savingsText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.success,
  },
  upgradeText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    fontStyle: 'italic',
    marginBottom: SPACING.xs,
  },
  comparisonDetails: {
    marginTop: SPACING.md,
    gap: SPACING.xs,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  comparisonDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  comparisonDetailText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
  },
  selectButton: {
    marginTop: SPACING.md,
  },
  // Recommended Method Badge (International Moves)
  recommendedMethodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
    alignSelf: 'flex-start',
    marginTop: SPACING.sm,
  },
  recommendedMethodText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
