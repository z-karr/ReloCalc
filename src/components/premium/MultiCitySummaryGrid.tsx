/**
 * Multi-City Summary Grid
 * Shows key metrics comparison across all cities in a scrollable grid
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  LayoutChangeEvent,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme';
import { City } from '../../types';
import { BreakEvenAnalysis, CityProjection } from '../../types/premium';

// ============================================================================
// TYPES
// ============================================================================

interface CityAnalysisSummary {
  city: City;
  salary: number;
  breakEven: BreakEvenAnalysis;
  projection: CityProjection;
  targetCalc: {
    netSalary: number;
    effectiveTaxRate: number;
  };
  isPositive: boolean;
}

interface MultiCitySummaryGridProps {
  currentCity: City;
  currentCalc: {
    netSalary: number;
    effectiveTaxRate: number;
  };
  currentProjection: CityProjection;
  cityAnalyses: CityAnalysisSummary[];
  housingIntent: {
    plansToBuy: boolean;
  };
}

interface MetricConfig {
  label: string;
  getValue: (city: City, analysis: CityAnalysisSummary | null, currentData: { calc: any; projection: CityProjection } | null) => string | number;
  getNumericValue: (city: City, analysis: CityAnalysisSummary | null, currentData: { calc: any; projection: CityProjection } | null) => number;
  higherIsBetter: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  showForCurrent?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const LABEL_WIDTH = 110;

const METRICS: MetricConfig[] = [
  {
    label: 'Break-Even',
    getValue: (city, analysis, currentData) => {
      if (!analysis) return '--';
      const months = analysis.breakEven.breakEvenMonths;
      if (months === Infinity || months < 0) return 'Never';
      if (months < 12) return `${months}mo`;
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return remainingMonths > 0 ? `${years}y ${remainingMonths}mo` : `${years}y`;
    },
    getNumericValue: (city, analysis) => {
      const months = analysis?.breakEven.breakEvenMonths ?? Infinity;
      // Treat negative break-even (never) the same as Infinity
      return months < 0 ? Infinity : months;
    },
    higherIsBetter: false,
    icon: 'time-outline',
    showForCurrent: false,
  },
  {
    label: '5yr Net Worth',
    getValue: (city, analysis, currentData) => {
      const netWorth = analysis
        ? analysis.projection.totalNetWorthYear5
        : currentData?.projection.totalNetWorthYear5;
      if (netWorth === undefined) return '--';
      return formatCurrency(netWorth);
    },
    getNumericValue: (city, analysis, currentData) =>
      analysis?.projection.totalNetWorthYear5 ?? currentData?.projection.totalNetWorthYear5 ?? 0,
    higherIsBetter: true,
    icon: 'trending-up-outline',
    showForCurrent: true,
  },
  {
    label: 'Net Salary',
    getValue: (city, analysis, currentData) => {
      const netSalary = analysis
        ? analysis.targetCalc.netSalary
        : currentData?.calc.netSalary;
      if (netSalary === undefined) return '--';
      return formatCurrency(netSalary);
    },
    getNumericValue: (city, analysis, currentData) =>
      analysis?.targetCalc.netSalary ?? currentData?.calc.netSalary ?? 0,
    higherIsBetter: true,
    icon: 'cash-outline',
    showForCurrent: true,
  },
  {
    label: 'COL Index',
    getValue: (city) => city.costOfLivingIndex.toString(),
    getNumericValue: (city) => city.costOfLivingIndex,
    higherIsBetter: false,
    icon: 'cart-outline',
    showForCurrent: true,
  },
  {
    label: 'Median Rent',
    getValue: (city) => `$${city.medianRent.toLocaleString()}`,
    getNumericValue: (city) => city.medianRent,
    higherIsBetter: false,
    icon: 'home-outline',
    showForCurrent: true,
  },
  {
    label: 'Tax Rate',
    getValue: (city, analysis, currentData) => {
      const rate = analysis
        ? analysis.targetCalc.effectiveTaxRate
        : currentData?.calc.effectiveTaxRate;
      if (rate === undefined) return '--';
      return `${(rate * 100).toFixed(1)}%`;
    },
    getNumericValue: (city, analysis, currentData) =>
      analysis?.targetCalc.effectiveTaxRate ?? currentData?.calc.effectiveTaxRate ?? 0,
    higherIsBetter: false,
    icon: 'receipt-outline',
    showForCurrent: true,
  },
];

// ============================================================================
// HELPERS
// ============================================================================

function formatCurrency(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  const absAmount = Math.abs(amount);
  if (absAmount >= 1000000) {
    return `${sign}$${(absAmount / 1000000).toFixed(1)}M`;
  }
  if (absAmount >= 1000) {
    return `${sign}$${(absAmount / 1000).toFixed(1)}K`;
  }
  return `${sign}$${Math.round(absAmount)}`;
}

function findBestIndex(values: number[], higherIsBetter: boolean): number {
  if (values.length === 0) return -1;

  // Filter out Infinity values for "lower is better" metrics
  const validValues = values.map((v, i) => ({ value: v, index: i }))
    .filter(({ value }) => value !== Infinity && !isNaN(value));

  if (validValues.length === 0) return -1;

  if (higherIsBetter) {
    return validValues.reduce((best, curr) =>
      curr.value > best.value ? curr : best
    ).index;
  } else {
    return validValues.reduce((best, curr) =>
      curr.value < best.value ? curr : best
    ).index;
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export const MultiCitySummaryGrid: React.FC<MultiCitySummaryGridProps> = ({
  currentCity,
  currentCalc,
  currentProjection,
  cityAnalyses,
  housingIntent,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(windowWidth - SPACING.base * 2);
  const [showOverviewInfo, setShowOverviewInfo] = useState(false);

  // Build array of all cities for display
  const allCities = [
    { city: currentCity, analysis: null as CityAnalysisSummary | null, isCurrent: true },
    ...cityAnalyses.map(a => ({ city: a.city, analysis: a, isCurrent: false })),
  ];

  const currentData = { calc: currentCalc, projection: currentProjection };

  // Calculate dynamic cell widths based on container and number of cities
  const numCities = allCities.length;
  const padding = SPACING.md * 2; // Container padding
  const availableWidth = containerWidth - padding - LABEL_WIDTH;
  // Minimum cell width of 100, or distribute evenly if space allows
  const calculatedCellWidth = Math.max(110, Math.floor(availableWidth / numCities));
  // Use calculated width but cap at 140 for readability
  const dynamicCellWidth = Math.min(calculatedCellWidth, 150);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0) {
      setContainerWidth(width);
    }
  };

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="grid-outline" size={18} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Compare All Cities</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowOverviewInfo(true)}
          style={styles.headerInfoButton}
        >
          <Ionicons name="information-circle-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Overview Info Modal */}
      <Modal
        visible={showOverviewInfo}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowOverviewInfo(false)}
      >
        <View style={styles.infoModalOverlay}>
          <View style={styles.infoModalContent}>
            <View style={styles.infoModalHeader}>
              <Text style={styles.infoModalTitle}>Understanding the Overview</Text>
              <TouchableOpacity
                onPress={() => setShowOverviewInfo(false)}
                style={styles.infoModalClose}
              >
                <Ionicons name="close" size={24} color={COLORS.mediumGray} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.infoModalBody}>
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <Ionicons name="grid-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.infoSectionTitle}>Compare All Cities</Text>
                </View>
                <Text style={styles.infoSectionText}>
                  This grid shows key financial metrics side by side for your current city and all target cities. Green highlighted values indicate the best option for each metric.
                </Text>
              </View>

              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <Ionicons name="list-outline" size={20} color={COLORS.info} />
                  <Text style={styles.infoSectionTitle}>What Each Metric Means</Text>
                </View>
                <View style={styles.infoList}>
                  <Text style={styles.infoListItem}>• <Text style={styles.infoListBold}>Break-Even:</Text> How long until the financial benefits of moving offset the costs. Shorter is better.</Text>
                  <Text style={styles.infoListItem}>• <Text style={styles.infoListBold}>5yr Net Worth:</Text> Projected total net worth after 5 years, including savings, investments, and home equity if buying. Higher is better.</Text>
                  <Text style={styles.infoListItem}>• <Text style={styles.infoListBold}>Net Salary:</Text> Your take-home pay after federal, state, and local taxes. Higher is better.</Text>
                  <Text style={styles.infoListItem}>• <Text style={styles.infoListBold}>COL Index:</Text> Cost of living index relative to the national average (100). Lower means your money goes further.</Text>
                  <Text style={styles.infoListItem}>• <Text style={styles.infoListBold}>Median Rent:</Text> Typical monthly rent in that city. Lower is better for affordability.</Text>
                  <Text style={styles.infoListItem}>• <Text style={styles.infoListBold}>Tax Rate:</Text> Your effective combined tax rate in that location. Lower means you keep more of your salary.</Text>
                </View>
              </View>

              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <Ionicons name="analytics-outline" size={20} color={COLORS.success} />
                  <Text style={styles.infoSectionTitle}>The Detail Cards</Text>
                </View>
                <Text style={styles.infoSectionText}>
                  Below the comparison grid, you'll find a detailed breakdown for the selected city including the break-even timeline, salary comparison, and key financial highlights. Use the city selector to switch between target cities.
                </Text>
              </View>

              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <Ionicons name="bulb-outline" size={20} color={COLORS.warning} />
                  <Text style={styles.infoSectionTitle}>How to Use This</Text>
                </View>
                <Text style={styles.infoSectionText}>
                  Start with the comparison grid to identify which city looks strongest overall. Then use the other tabs — Projections, Housing, Negotiate, and Checklist — to dive deeper into the details for your top choice.
                </Text>
              </View>

              <View style={styles.infoNote}>
                <Ionicons name="information-circle" size={18} color={COLORS.info} />
                <Text style={styles.infoNoteText}>
                  All calculations are based on the salary, moving costs, and household details you entered. Adjust your inputs to see how different scenarios affect the comparison.
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowOverviewInfo(false)}
              style={styles.infoModalButton}
            >
              <Text style={styles.infoModalButtonText}>Got It</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { minWidth: containerWidth - padding }]}
      >
        <View style={styles.grid}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={[styles.labelCell, { width: LABEL_WIDTH }]} />
            {allCities.map(({ city, isCurrent }, index) => (
              <View
                key={city.id}
                style={[
                  styles.cityHeaderCell,
                  { width: dynamicCellWidth },
                  isCurrent && styles.currentCityCell,
                ]}
              >
                <Text style={styles.cityName} numberOfLines={1}>
                  {city.name}
                </Text>
                {isCurrent && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>Current</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Metric Rows */}
          {METRICS.map((metric) => {
            // Get values for finding best
            const values = allCities.map(({ city, analysis, isCurrent }) => {
              if (!metric.showForCurrent && isCurrent) return Infinity;
              return metric.getNumericValue(city, analysis, isCurrent ? currentData : null);
            });

            const bestIndex = findBestIndex(
              // Only compare target cities for break-even
              metric.showForCurrent === false
                ? values.slice(1).map((v, i) => ({ v, i: i + 1 })).map(x => x.v)
                : values,
              metric.higherIsBetter
            );

            // Adjust bestIndex for break-even (offset by 1 since we sliced)
            const adjustedBestIndex = metric.showForCurrent === false
              ? bestIndex + 1
              : bestIndex;

            return (
              <View key={metric.label} style={styles.metricRow}>
                <View style={[styles.labelCell, { width: LABEL_WIDTH }]}>
                  <Ionicons
                    name={metric.icon}
                    size={16}
                    color={COLORS.mediumGray}
                    style={styles.labelIcon}
                  />
                  <Text style={styles.labelText}>{metric.label}</Text>
                </View>

                {allCities.map(({ city, analysis, isCurrent }, index) => {
                  const showValue = metric.showForCurrent !== false || !isCurrent;
                  const value = showValue
                    ? metric.getValue(city, analysis, isCurrent ? currentData : null)
                    : '--';
                  const isBest = showValue && index === adjustedBestIndex && allCities.length > 1;

                  return (
                    <View
                      key={city.id}
                      style={[
                        styles.valueCell,
                        { width: dynamicCellWidth },
                        isCurrent && styles.currentCityCell,
                        isBest && styles.bestValueCell,
                      ]}
                    >
                      <Text
                        style={[
                          styles.valueText,
                          isBest && styles.bestValueText,
                          value === 'Never' && styles.negativeValueText,
                        ]}
                        numberOfLines={1}
                      >
                        {value}
                      </Text>
                      {isBest && (
                        <Ionicons
                          name="checkmark-circle"
                          size={14}
                          color={COLORS.success}
                          style={styles.bestIcon}
                        />
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.legend}>
        <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
        <Text style={styles.legendText}>Best value for metric</Text>
      </View>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
    marginHorizontal: SPACING.base,
    marginTop: SPACING.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.offWhite,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
    color: COLORS.white,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  grid: {
    flexDirection: 'column',
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  labelCell: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: SPACING.md,
  },
  labelIcon: {
    marginRight: SPACING.sm,
  },
  labelText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    fontWeight: '600',
    flex: 1,
  },
  cityHeaderCell: {
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  currentCityCell: {
    backgroundColor: COLORS.infoLight,
    borderRadius: RADIUS.sm,
  },
  cityName: {
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  currentBadge: {
    backgroundColor: COLORS.info,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 1,
    borderRadius: RADIUS.xs,
    marginTop: 2,
  },
  currentBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.white,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.offWhite,
  },
  valueCell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
    minHeight: 44,
  },
  bestValueCell: {
    backgroundColor: COLORS.successLight,
    borderRadius: RADIUS.sm,
  },
  valueText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  bestValueText: {
    color: COLORS.success,
    fontWeight: '700',
  },
  negativeValueText: {
    color: COLORS.error,
  },
  bestIcon: {
    marginLeft: 4,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    backgroundColor: COLORS.offWhite,
  },
  legendText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
  },

  // Header layout
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerInfoButton: {
    padding: SPACING.xs,
  },

  // Info Modal
  infoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  infoModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    ...SHADOWS.large,
  },
  infoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
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
    padding: SPACING.lg,
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
  },
  infoList: {
    gap: SPACING.sm,
  },
  infoListItem: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    lineHeight: 20,
  },
  infoListBold: {
    fontWeight: '600',
    color: COLORS.white,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.offWhite,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.sm,
  },
  infoNoteText: {
    flex: 1,
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    lineHeight: 18,
  },
  infoModalButton: {
    backgroundColor: COLORS.primary,
    margin: SPACING.lg,
    marginTop: 0,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  infoModalButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default MultiCitySummaryGrid;
