import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../theme';
import { Card, CityPicker } from '../components';
import { City } from '../types';
import { getRegionalTaxLabel } from '../utils/taxLabels';
import { calculateSalary } from '../utils/taxCalculator';

interface CityComparisonScreenProps {
  navigation: any;
}

interface MetricRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  city1Value: string | number;
  city2Value: string | number;
  unit?: string;
  lowerIsBetter?: boolean;
  showDifference?: boolean;
  city1Color?: string;
  city2Color?: string;
}

const MetricRow: React.FC<MetricRowProps> = ({
  icon,
  label,
  city1Value,
  city2Value,
  unit = '',
  lowerIsBetter = false,
  showDifference = true,
  city1Color,
  city2Color,
}) => {
  const val1 = typeof city1Value === 'string' ? parseFloat(city1Value) : city1Value;
  const val2 = typeof city2Value === 'string' ? parseFloat(city2Value) : city2Value;

  let difference = 0;
  let percentDiff = 0;
  let betterCity: 'city1' | 'city2' | 'tie' = 'tie';

  // Always calculate which city is better (for highlighting), even if not showing difference
  if (!isNaN(val1) && !isNaN(val2)) {
    difference = val2 - val1;
    percentDiff = val1 !== 0 ? ((val2 - val1) / val1) * 100 : 0;

    if (difference > 0.01) {
      betterCity = lowerIsBetter ? 'city1' : 'city2';
    } else if (difference < -0.01) {
      betterCity = lowerIsBetter ? 'city2' : 'city1';
    }
  }

  return (
    <View style={styles.metricRow}>
      <View style={styles.metricHeader}>
        <Ionicons name={icon} size={18} color={COLORS.mediumGray} />
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
      <View style={styles.metricValues}>
        <View style={[
          styles.metricValueBox,
          betterCity === 'city1' && styles.metricValueBetter,
          city1Color && { borderLeftColor: city1Color, borderLeftWidth: 3 }
        ]}>
          <Text style={styles.metricValue}>{city1Value}{unit}</Text>
        </View>
        <View style={[
          styles.metricValueBox,
          betterCity === 'city2' && styles.metricValueBetter,
          city2Color && { borderRightColor: city2Color, borderRightWidth: 3 }
        ]}>
          <Text style={styles.metricValue}>{city2Value}{unit}</Text>
        </View>
      </View>
      {showDifference && !isNaN(difference) && Math.abs(difference) > 0.01 && (
        <View style={styles.metricDifference}>
          <Text style={[
            styles.differenceText,
            difference > 0 ? styles.differencePositive : styles.differenceNegative
          ]}>
            {difference > 0 ? '+' : ''}{difference.toFixed(1)}{unit}
            ({percentDiff > 0 ? '+' : ''}{percentDiff.toFixed(1)}%)
          </Text>
        </View>
      )}
    </View>
  );
};

export const CityComparisonScreen: React.FC<CityComparisonScreenProps> = ({ navigation }) => {
  const [city1, setCity1] = useState<City | null>(null);
  const [city2, setCity2] = useState<City | null>(null);

  const formatCurrency = (value: number): string => {
    return `$${value.toLocaleString()}`;
  };

  const formatPercent = (value: number): string => {
    return `${(value * 100).toFixed(2)}%`;
  };

  // Calculate effective tax rate for comparison (using $75k as standard salary)
  const getEffectiveTaxRate = (city: City): number => {
    const SAMPLE_SALARY = 75000;
    try {
      const calculation = calculateSalary(SAMPLE_SALARY, city);
      return calculation.effectiveTaxRate;
    } catch (error) {
      console.warn(`Failed to calculate tax rate for ${city.name}:`, error);
      return 0;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* City Selectors */}
        <View style={styles.selectorContainer}>
          <View style={styles.citySelector}>
            <CityPicker
              label="City 1"
              value={city1}
              onChange={setCity1}
              placeholder="Select first city"
            />
          </View>
          <View style={styles.vsIcon}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          <View style={styles.citySelector}>
            <CityPicker
              label="City 2"
              value={city2}
              onChange={setCity2}
              placeholder="Select second city"
            />
          </View>
        </View>

        {city1 && city2 ? (
          <>
            {/* City Headers */}
            <View style={styles.cityHeaders}>
              <View style={[styles.cityHeader, { backgroundColor: COLORS.primary + '10' }]}>
                <Text style={styles.cityHeaderName}>{city1.name}</Text>
                <Text style={styles.cityHeaderState}>
                  {city1.state || (city1.countryCode !== 'US' ? city1.countryCode : '')}
                </Text>
              </View>
              <View style={[styles.cityHeader, { backgroundColor: COLORS.secondary + '10' }]}>
                <Text style={styles.cityHeaderName}>{city2.name}</Text>
                <Text style={styles.cityHeaderState}>
                  {city2.state || (city2.countryCode !== 'US' ? city2.countryCode : '')}
                </Text>
              </View>
            </View>

            {/* Cost of Living Section */}
            <Card style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="cash-outline" size={24} color={COLORS.accent} />
                <Text style={styles.sectionTitle}>Cost of Living</Text>
              </View>

              <MetricRow
                icon="analytics-outline"
                label="Cost of Living Index"
                city1Value={city1.costOfLivingIndex.toFixed(0)}
                city2Value={city2.costOfLivingIndex.toFixed(0)}
                lowerIsBetter
                city1Color={COLORS.primary}
                city2Color={COLORS.secondary}
              />

              <MetricRow
                icon="home-outline"
                label="Median Rent"
                city1Value={formatCurrency(city1.medianRent)}
                city2Value={formatCurrency(city2.medianRent)}
                lowerIsBetter
                showDifference={false}
              />

              <MetricRow
                icon="business-outline"
                label="Median Home Price"
                city1Value={formatCurrency(city1.medianHomePrice)}
                city2Value={formatCurrency(city2.medianHomePrice)}
                lowerIsBetter
                showDifference={false}
              />
            </Card>

            {/* Taxes Section */}
            <Card style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="receipt-outline" size={24} color={COLORS.error} />
                <Text style={styles.sectionTitle}>Taxes</Text>
              </View>

              {/* Effective Tax Rate Comparison */}
              <MetricRow
                icon="calculator-outline"
                label="Estimated Tax Burden"
                city1Value={(getEffectiveTaxRate(city1) * 100).toFixed(2)}
                city2Value={(getEffectiveTaxRate(city2) * 100).toFixed(2)}
                unit="%"
                lowerIsBetter
                showDifference={false}
              />
              <Text style={styles.taxCalculationNote}>
                Based on $75,000 annual salary (includes Federal, State, Local & FICA)
              </Text>

              {/* Show detailed breakdown only for US city vs US city comparisons */}
              {city1.taxRates.type === 'us_federal_state' && city2.taxRates.type === 'us_federal_state' && (
                <>
                  <MetricRow
                    icon="document-text-outline"
                    label="State Tax Rate"
                    city1Value={formatPercent(city1.stateTaxRate || 0)}
                    city2Value={formatPercent(city2.stateTaxRate || 0)}
                    lowerIsBetter
                    showDifference={false}
                  />
                  <MetricRow
                    icon="document-outline"
                    label="Local Tax Rate"
                    city1Value={formatPercent(city1.localTaxRate || 0)}
                    city2Value={formatPercent(city2.localTaxRate || 0)}
                    lowerIsBetter
                    showDifference={false}
                  />
                  <View style={styles.taxSummary}>
                    <Text style={styles.taxSummaryLabel}>State + Local Tax Rate (excluding Federal):</Text>
                    <View style={styles.taxSummaryValues}>
                      <Text style={styles.taxSummaryValue}>
                        {formatPercent((city1.stateTaxRate || 0) + (city1.localTaxRate || 0))}
                      </Text>
                      <Text style={styles.taxSummaryValue}>
                        {formatPercent((city2.stateTaxRate || 0) + (city2.localTaxRate || 0))}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </Card>

            {/* Transportation Section */}
            <Card style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="car-outline" size={24} color={COLORS.info} />
                <Text style={styles.sectionTitle}>Transportation</Text>
              </View>

              <MetricRow
                icon="walk-outline"
                label="Walk Score"
                city1Value={city1.walkScore}
                city2Value={city2.walkScore}
              />

              <MetricRow
                icon="subway-outline"
                label="Transit Score"
                city1Value={city1.transitScore}
                city2Value={city2.transitScore}
              />

              <MetricRow
                icon="time-outline"
                label="Average Commute"
                city1Value={city1.averageCommute}
                city2Value={city2.averageCommute}
                unit=" min"
                lowerIsBetter
              />
            </Card>

            {/* Quality of Life Section */}
            <Card style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="heart-outline" size={24} color={COLORS.accent} />
                <Text style={styles.sectionTitle}>Quality of Life</Text>
              </View>

              <MetricRow
                icon="shield-checkmark-outline"
                label="Safety (Crime Index)"
                city1Value={city1.crimeIndex}
                city2Value={city2.crimeIndex}
                lowerIsBetter
              />

              <MetricRow
                icon="medical-outline"
                label="Healthcare Index"
                city1Value={city1.healthcareIndex}
                city2Value={city2.healthcareIndex}
              />

              <MetricRow
                icon="school-outline"
                label="Education Index"
                city1Value={city1.educationIndex}
                city2Value={city2.educationIndex}
              />

              <MetricRow
                icon="musical-notes-outline"
                label="Entertainment Index"
                city1Value={city1.entertainmentIndex}
                city2Value={city2.entertainmentIndex}
              />

              <MetricRow
                icon="leaf-outline"
                label="Outdoor Index"
                city1Value={city1.outdoorIndex}
                city2Value={city2.outdoorIndex}
              />
            </Card>

            {/* Demographics Section */}
            <Card style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="people-outline" size={24} color={COLORS.secondary} />
                <Text style={styles.sectionTitle}>Demographics & Economy</Text>
              </View>

              <MetricRow
                icon="people-circle-outline"
                label="Population"
                city1Value={city1.population.toLocaleString()}
                city2Value={city2.population.toLocaleString()}
                showDifference={false}
              />

              <MetricRow
                icon="trending-up-outline"
                label="Job Growth Rate"
                city1Value={(city1.jobGrowthRate * 100).toFixed(1)}
                city2Value={(city2.jobGrowthRate * 100).toFixed(1)}
                unit="%"
              />

              <View style={styles.climateRow}>
                <Text style={styles.climateLabel}>Climate:</Text>
                <View style={styles.climateValues}>
                  <View style={styles.climateBadge}>
                    <Text style={styles.climateText}>{city1.climate}</Text>
                  </View>
                  <View style={styles.climateBadge}>
                    <Text style={styles.climateText}>{city2.climate}</Text>
                  </View>
                </View>
              </View>
            </Card>

            {/* Winner Summary */}
            <Card style={[styles.section, styles.summaryCard]}>
              <View style={styles.summaryHeader}>
                <Ionicons name="trophy-outline" size={28} color={COLORS.warning} />
                <Text style={styles.summaryTitle}>Quick Summary</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>More Affordable:</Text>
                <Text style={styles.summaryValue}>
                  {city1.costOfLivingIndex < city2.costOfLivingIndex ? city1.name : city2.name}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Better Transit:</Text>
                <Text style={styles.summaryValue}>
                  {city1.transitScore > city2.transitScore ? city1.name : city2.name}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Safer:</Text>
                <Text style={styles.summaryValue}>
                  {city1.crimeIndex < city2.crimeIndex ? city1.name : city2.name}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Better Job Growth:</Text>
                <Text style={styles.summaryValue}>
                  {city1.jobGrowthRate > city2.jobGrowthRate ? city1.name : city2.name}
                </Text>
              </View>
            </Card>
          </>
        ) : (
          <Card style={styles.emptyState}>
            <Ionicons name="git-compare-outline" size={64} color={COLORS.mediumGray} />
            <Text style={styles.emptyStateTitle}>Select Two Cities</Text>
            <Text style={styles.emptyStateText}>
              Choose two cities above to see a detailed side-by-side comparison of cost of living,
              taxes, quality of life, and more.
            </Text>
          </Card>
        )}

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  selectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.base,
    backgroundColor: COLORS.white,
    gap: SPACING.md,
  },
  citySelector: {
    flex: 1,
  },
  vsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  vsText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONTS.sizes.sm,
  },
  cityHeaders: {
    flexDirection: 'row',
    marginHorizontal: SPACING.base,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  cityHeader: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  cityHeaderName: {
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
    color: COLORS.charcoal,
  },
  cityHeaderState: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    marginTop: 2,
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
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.charcoal,
  },
  metricRow: {
    marginBottom: SPACING.md,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  metricLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  metricValues: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  metricValueBox: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  metricValueBetter: {
    backgroundColor: COLORS.successLight,
  },
  metricValue: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.charcoal,
  },
  metricDifference: {
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  differenceText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
  differencePositive: {
    color: COLORS.success,
  },
  differenceNegative: {
    color: COLORS.error,
  },
  taxSummary: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.infoLight,
    borderRadius: RADIUS.sm,
  },
  taxSummaryLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.info,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  taxSummaryValues: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  taxSummaryValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.info,
  },
  taxInfoBox: {
    padding: SPACING.md,
    backgroundColor: COLORS.offWhite,
    borderRadius: RADIUS.sm,
  },
  taxInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  taxInfoCity: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  taxInfoType: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  taxNote: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    fontStyle: 'italic',
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  taxCalculationNote: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  climateRow: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.offWhite,
    borderRadius: RADIUS.sm,
  },
  climateLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  climateValues: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  climateBadge: {
    backgroundColor: COLORS.secondaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  climateText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.white,
    textTransform: 'capitalize',
  },
  summaryCard: {
    backgroundColor: COLORS.warningLight,
    borderColor: COLORS.warning + '30',
    borderWidth: 1,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.base,
    gap: SPACING.sm,
  },
  summaryTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.charcoal,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.warning + '20',
  },
  summaryLabel: {
    fontSize: FONTS.sizes.base,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyState: {
    marginHorizontal: SPACING.base,
    marginTop: SPACING.xxxl,
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyStateTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.charcoal,
    marginTop: SPACING.base,
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.darkGray,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.lg,
  },
  footer: {
    height: SPACING.xxxl,
  },
});
