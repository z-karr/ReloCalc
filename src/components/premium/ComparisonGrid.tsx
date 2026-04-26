import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';
import { CityScore, MultiCityComparison } from '../../types/premium';

// ============================================================================
// TYPES
// ============================================================================

interface ComparisonGridProps {
  comparison: MultiCityComparison;
  highlightCurrentCity?: boolean;
}

interface MetricRow {
  label: string;
  key: keyof CityScore['metrics'] | 'overallScore' | 'financialScore' | 'qualityOfLifeScore' | 'mobilityScore' | 'careerScore' | 'lifestyleScore';
  format: 'currency' | 'percent' | 'score' | 'number' | 'years';
  higherIsBetter: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

// ============================================================================
// METRIC DEFINITIONS
// ============================================================================

const METRIC_ROWS: MetricRow[] = [
  { label: 'Overall Score', key: 'overallScore', format: 'score', higherIsBetter: true, icon: 'trophy-outline' },
  { label: 'Financial', key: 'financialScore', format: 'score', higherIsBetter: true, icon: 'cash-outline' },
  { label: 'Quality of Life', key: 'qualityOfLifeScore', format: 'score', higherIsBetter: true, icon: 'heart-outline' },
  { label: 'Mobility', key: 'mobilityScore', format: 'score', higherIsBetter: true, icon: 'walk-outline' },
  { label: 'Career', key: 'careerScore', format: 'score', higherIsBetter: true, icon: 'briefcase-outline' },
  { label: 'Lifestyle', key: 'lifestyleScore', format: 'score', higherIsBetter: true, icon: 'cafe-outline' },
];

const DETAIL_METRICS: MetricRow[] = [
  { label: 'Net Salary', key: 'netSalary', format: 'currency', higherIsBetter: true },
  { label: 'COL-Adjusted Income', key: 'colAdjustedIncome', format: 'currency', higherIsBetter: true },
  { label: 'Effective Tax Rate', key: 'effectiveTaxRate', format: 'percent', higherIsBetter: false },
  { label: 'Monthly Rent', key: 'monthlyRent', format: 'currency', higherIsBetter: false },
  { label: 'Home Affordability', key: 'homeAffordability', format: 'years', higherIsBetter: false },
  { label: 'Safety Score', key: 'safetyScore', format: 'score', higherIsBetter: true },
  { label: 'Transit Score', key: 'transitScore', format: 'score', higherIsBetter: true },
  { label: 'Healthcare', key: 'healthcareScore', format: 'score', higherIsBetter: true },
  { label: 'Education', key: 'educationScore', format: 'score', higherIsBetter: true },
  { label: 'Job Growth', key: 'jobGrowthScore', format: 'score', higherIsBetter: true },
];

// ============================================================================
// COMPONENT
// ============================================================================

export const ComparisonGrid: React.FC<ComparisonGridProps> = ({
  comparison,
  highlightCurrentCity = true,
}) => {
  const { cities, currentCity } = comparison;

  // Find best value for each metric to highlight
  const findBestIndex = (values: number[], higherIsBetter: boolean): number => {
    if (higherIsBetter) {
      return values.indexOf(Math.max(...values));
    }
    return values.indexOf(Math.min(...values));
  };

  const getValue = (cityScore: CityScore, key: MetricRow['key']): number => {
    if (key in cityScore) {
      return (cityScore as any)[key];
    }
    if (key in cityScore.metrics) {
      return (cityScore.metrics as any)[key];
    }
    return 0;
  };

  const formatValue = (value: number, format: MetricRow['format']): string => {
    switch (format) {
      case 'currency':
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
        return `$${Math.round(value)}`;
      case 'percent':
        return `${(value * 100).toFixed(1)}%`;
      case 'score':
        return Math.round(value).toString();
      case 'years':
        return `${value.toFixed(1)}x`;
      case 'number':
      default:
        return Math.round(value).toString();
    }
  };

  const renderMetricRow = (metric: MetricRow, isHeader: boolean = false) => {
    const values = cities.map(c => getValue(c, metric.key));
    const bestIndex = findBestIndex(values, metric.higherIsBetter);

    return (
      <View key={metric.key} style={[styles.row, isHeader && styles.headerRow]}>
        {/* Metric Label */}
        <View style={styles.labelCell}>
          {metric.icon && (
            <Ionicons
              name={metric.icon}
              size={14}
              color={COLORS.darkGray}
              style={styles.labelIcon}
            />
          )}
          <Text style={[styles.labelText, isHeader && styles.headerLabel]}>
            {metric.label}
          </Text>
        </View>

        {/* City Values */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.valuesScroll}
          contentContainerStyle={styles.valuesContainer}
        >
          {cities.map((cityScore, index) => {
            const isCurrentCity = cityScore.city.id === currentCity.id;
            const isBest = index === bestIndex;
            const value = values[index];

            return (
              <View
                key={cityScore.city.id}
                style={[
                  styles.valueCell,
                  highlightCurrentCity && isCurrentCity && styles.currentCityCell,
                ]}
              >
                <Text
                  style={[
                    styles.valueText,
                    isHeader && styles.headerValue,
                    isBest && styles.bestValue,
                  ]}
                >
                  {formatValue(value, metric.format)}
                </Text>
                {isBest && (
                  <View style={styles.bestBadge}>
                    <Ionicons name="checkmark" size={10} color={COLORS.white} />
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* City Headers */}
      <View style={styles.cityHeaders}>
        <View style={styles.labelCell}>
          <Text style={styles.sectionLabel}>City</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.valuesScroll}
          contentContainerStyle={styles.valuesContainer}
        >
          {cities.map((cityScore) => {
            const isCurrentCity = cityScore.city.id === currentCity.id;
            return (
              <View
                key={cityScore.city.id}
                style={[
                  styles.cityHeaderCell,
                  highlightCurrentCity && isCurrentCity && styles.currentCityHeader,
                ]}
              >
                <Text style={styles.cityName} numberOfLines={1}>
                  {cityScore.city.name}
                </Text>
                {isCurrentCity && (
                  <Text style={styles.currentLabel}>Current</Text>
                )}
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{cityScore.rankings.overall}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Scores Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Scores</Text>
        {METRIC_ROWS.map((metric) => renderMetricRow(metric, metric.key === 'overallScore'))}
      </View>

      {/* Detailed Metrics Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detailed Metrics</Text>
        {DETAIL_METRICS.map((metric) => renderMetricRow(metric))}
      </View>

      {/* Strengths & Weaknesses */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Highlights</Text>
        <View style={styles.highlightsRow}>
          <View style={styles.labelCell}>
            <Text style={styles.labelText}>Strengths</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.valuesScroll}
            contentContainerStyle={styles.valuesContainer}
          >
            {cities.map((cityScore) => (
              <View key={cityScore.city.id} style={styles.highlightCell}>
                {cityScore.strengths.slice(0, 2).map((strength, i) => (
                  <View key={i} style={styles.highlightItem}>
                    <Ionicons name="add-circle" size={12} color={COLORS.success} />
                    <Text style={styles.highlightText} numberOfLines={1}>
                      {strength}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
        <View style={styles.highlightsRow}>
          <View style={styles.labelCell}>
            <Text style={styles.labelText}>Considerations</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.valuesScroll}
            contentContainerStyle={styles.valuesContainer}
          >
            {cities.map((cityScore) => (
              <View key={cityScore.city.id} style={styles.highlightCell}>
                {cityScore.weaknesses.slice(0, 2).map((weakness, i) => (
                  <View key={i} style={styles.highlightItem}>
                    <Ionicons name="remove-circle" size={12} color={COLORS.warning} />
                    <Text style={styles.highlightText} numberOfLines={1}>
                      {weakness}
                    </Text>
                  </View>
                ))}
                {cityScore.weaknesses.length === 0 && (
                  <Text style={styles.noWeaknesses}>No major concerns</Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const CELL_WIDTH = 110;
const LABEL_WIDTH = 120;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  cityHeaders: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  cityHeaderCell: {
    width: CELL_WIDTH,
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  currentCityHeader: {
    backgroundColor: COLORS.infoLight,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.xs,
  },
  cityName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  currentLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.info,
    fontWeight: '500',
    marginTop: 2,
  },
  rankBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    marginTop: SPACING.xs,
  },
  rankText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    fontWeight: '600',
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.info,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  sectionLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.mediumGray,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerRow: {
    backgroundColor: COLORS.offWhite,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  highlightsRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  labelCell: {
    width: LABEL_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: SPACING.xs,
  },
  labelIcon: {
    marginRight: SPACING.xs,
  },
  labelText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    fontWeight: '500',
  },
  headerLabel: {
    fontWeight: '700',
    color: COLORS.white,
  },
  valuesScroll: {
    flex: 1,
  },
  valuesContainer: {
    flexDirection: 'row',
  },
  valueCell: {
    width: CELL_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  currentCityCell: {
    backgroundColor: COLORS.infoLight,
    borderRadius: RADIUS.xs,
    marginHorizontal: 2,
  },
  valueText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    fontWeight: '500',
    textAlign: 'center',
  },
  headerValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
  },
  bestValue: {
    color: COLORS.success,
    fontWeight: '700',
  },
  bestBadge: {
    position: 'absolute',
    top: -4,
    right: 20,
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.full,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightCell: {
    width: CELL_WIDTH,
    paddingHorizontal: SPACING.xs,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  highlightText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    flex: 1,
  },
  noWeaknesses: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.success,
    fontStyle: 'italic',
  },
});

export default ComparisonGrid;
