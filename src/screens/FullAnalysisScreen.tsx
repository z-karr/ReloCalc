import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../theme';
import { Card, CityPicker, Input, Button } from '../components';
import { City } from '../types';
import { calculateSalary, formatCurrency as formatCurrencyUtil } from '../utils/taxCalculator';

interface FullAnalysisScreenProps {
  navigation: any;
}

interface TimelineData {
  months: number;
  movingCosts: number;
  cumulativeSavings: number;
  netPosition: number;
}

export const FullAnalysisScreen: React.FC<FullAnalysisScreenProps> = ({ navigation }) => {
  const [currentCity, setCurrentCity] = useState<City | null>(null);
  const [targetCity, setTargetCity] = useState<City | null>(null);
  const [currentSalary, setCurrentSalary] = useState('');
  const [targetSalary, setTargetSalary] = useState('');
  const [movingCosts, setMovingCosts] = useState('');
  const [showResults, setShowResults] = useState(false);

  const analysis = useMemo(() => {
    if (!currentCity || !targetCity || !currentSalary || !targetSalary || !movingCosts) {
      return null;
    }

    const currentSalaryNum = parseFloat(currentSalary);
    const targetSalaryNum = parseFloat(targetSalary);
    const movingCostsNum = parseFloat(movingCosts);

    if (isNaN(currentSalaryNum) || isNaN(targetSalaryNum) || isNaN(movingCostsNum)) {
      return null;
    }

    // Calculate net salaries using full tax calculation
    const currentNet = calculateSalary(currentSalaryNum, currentCity);
    const targetNet = calculateSalary(targetSalaryNum, targetCity);

    // Adjust for cost of living
    const currentAdjustedNet = currentNet.netSalary;
    const targetAdjustedNet = targetNet.netSalary * (100 / targetCity.costOfLivingIndex);
    const currentCOLAdjusted = currentNet.netSalary * (100 / currentCity.costOfLivingIndex);

    // Monthly differences
    const monthlyNetDifference = targetNet.netSalary - currentNet.netSalary;
    const monthlyCOLDifference = (targetCity.costOfLivingIndex - currentCity.costOfLivingIndex) / 100 * targetNet.netSalary;
    const monthlyRentDifference = targetCity.medianRent - currentCity.medianRent;
    const adjustedMonthlySavings = monthlyNetDifference - monthlyCOLDifference;

    // Break-even calculation
    let breakEvenMonths = 0;
    if (adjustedMonthlySavings > 0) {
      breakEvenMonths = Math.ceil(movingCostsNum / adjustedMonthlySavings);
    }

    // Timeline projections
    const timeline: TimelineData[] = [];
    const timePoints = [6, 12, 24, 36, 60]; // 6mo, 1yr, 2yr, 3yr, 5yr

    timePoints.forEach(months => {
      const cumulativeSavings = adjustedMonthlySavings * months;
      const netPosition = cumulativeSavings - movingCostsNum;
      timeline.push({
        months,
        movingCosts: movingCostsNum,
        cumulativeSavings,
        netPosition,
      });
    });

    return {
      currentNet,
      targetNet,
      currentAdjustedNet,
      targetAdjustedNet,
      currentCOLAdjusted,
      monthlyNetDifference,
      monthlyCOLDifference,
      monthlyRentDifference,
      adjustedMonthlySavings,
      breakEvenMonths,
      timeline,
      isPositive: adjustedMonthlySavings > 0,
    };
  }, [currentCity, targetCity, currentSalary, targetSalary, movingCosts]);

  const handleCalculate = () => {
    if (analysis) {
      setShowResults(true);
    }
  };

  const formatCurrency = (value: number): string => {
    return `$${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatMonths = (months: number): string => {
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''}`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) return `${years} year${years !== 1 ? 's' : ''}`;
    return `${years}y ${remainingMonths}m`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Input Section */}
        <Card style={styles.inputSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calculator-outline" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Your Information</Text>
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
            placeholder="$75,000"
            keyboardType="numeric"
            icon="cash-outline"
          />

          <View style={styles.divider} />

          <CityPicker
            label="Target City"
            value={targetCity}
            onChange={setTargetCity}
            placeholder="Where are you moving?"
          />

          <Input
            label="Target Annual Salary"
            value={targetSalary}
            onChangeText={setTargetSalary}
            placeholder="$85,000"
            keyboardType="numeric"
            icon="cash-outline"
          />

          <Input
            label="Estimated Moving Costs"
            value={movingCosts}
            onChangeText={setMovingCosts}
            placeholder="$5,000"
            keyboardType="numeric"
            icon="car-outline"
          />

          <Button
            title="Calculate Full Analysis"
            onPress={handleCalculate}
            disabled={!analysis}
            icon="analytics-outline"
          />
        </Card>

        {showResults && analysis && (
          <>
            {/* Break-Even Summary */}
            <Card style={[styles.section, styles.breakEvenCard]}>
              <View style={styles.breakEvenHeader}>
                <Ionicons
                  name={analysis.isPositive ? 'trending-up' : 'trending-down'}
                  size={32}
                  color={analysis.isPositive ? COLORS.success : COLORS.error}
                />
                <Text style={styles.breakEvenTitle}>Break-Even Analysis</Text>
              </View>

              {analysis.isPositive ? (
                <>
                  <Text style={styles.breakEvenSubtitle}>
                    Your move will pay for itself in:
                  </Text>
                  <Text style={styles.breakEvenMonths}>
                    {formatMonths(analysis.breakEvenMonths)}
                  </Text>
                  <Text style={styles.breakEvenDetail}>
                    Monthly net savings: {formatCurrency(analysis.adjustedMonthlySavings)}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.breakEvenSubtitle}>
                    This move will cost you money each month
                  </Text>
                  <Text style={[styles.breakEvenMonths, { color: COLORS.error }]}>
                    {formatCurrency(analysis.adjustedMonthlySavings)} / month
                  </Text>
                  <Text style={styles.breakEvenDetail}>
                    Higher cost of living outweighs salary increase
                  </Text>
                </>
              )}
            </Card>

            {/* Monthly Breakdown */}
            <Card style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="calendar-outline" size={24} color={COLORS.accent} />
                <Text style={styles.sectionTitle}>Monthly Breakdown</Text>
              </View>

              <View style={styles.breakdownRow}>
                <View style={styles.breakdownLabel}>
                  <Ionicons name="arrow-up" size={16} color={COLORS.success} />
                  <Text style={styles.breakdownText}>Salary Increase</Text>
                </View>
                <Text style={[styles.breakdownValue, { color: COLORS.success }]}>
                  +{formatCurrency(analysis.monthlyNetDifference)}
                </Text>
              </View>

              <View style={styles.breakdownRow}>
                <View style={styles.breakdownLabel}>
                  <Ionicons name="arrow-down" size={16} color={COLORS.error} />
                  <Text style={styles.breakdownText}>Cost of Living Diff</Text>
                </View>
                <Text style={[styles.breakdownValue, { color: COLORS.error }]}>
                  -{formatCurrency(analysis.monthlyCOLDifference)}
                </Text>
              </View>

              <View style={styles.breakdownRow}>
                <View style={styles.breakdownLabel}>
                  <Ionicons name="home" size={16} color={COLORS.info} />
                  <Text style={styles.breakdownText}>Rent Difference</Text>
                </View>
                <Text style={[
                  styles.breakdownValue,
                  { color: analysis.monthlyRentDifference > 0 ? COLORS.error : COLORS.success }
                ]}>
                  {analysis.monthlyRentDifference > 0 ? '-' : '+'}
                  {formatCurrency(analysis.monthlyRentDifference)}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.breakdownRow}>
                <View style={styles.breakdownLabel}>
                  <Ionicons name="cash" size={16} color={COLORS.primary} />
                  <Text style={[styles.breakdownText, { fontWeight: '700' }]}>Net Monthly Change</Text>
                </View>
                <Text style={[
                  styles.breakdownValue,
                  styles.breakdownTotal,
                  { color: analysis.adjustedMonthlySavings > 0 ? COLORS.success : COLORS.error }
                ]}>
                  {analysis.adjustedMonthlySavings > 0 ? '+' : '-'}
                  {formatCurrency(analysis.adjustedMonthlySavings)}
                </Text>
              </View>
            </Card>

            {/* Timeline Projections */}
            <Card style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="time-outline" size={24} color={COLORS.secondary} />
                <Text style={styles.sectionTitle}>Financial Timeline</Text>
              </View>

              {analysis.timeline.map((point, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineHeader}>
                    <Text style={styles.timelineMonth}>{formatMonths(point.months)}</Text>
                    <Text style={[
                      styles.timelineNet,
                      { color: point.netPosition >= 0 ? COLORS.success : COLORS.error }
                    ]}>
                      {point.netPosition >= 0 ? '+' : '-'}{formatCurrency(point.netPosition)}
                    </Text>
                  </View>
                  <View style={styles.timelineBar}>
                    <View style={[
                      styles.timelineBarFill,
                      {
                        width: `${Math.min((Math.abs(point.cumulativeSavings) / (point.movingCosts * 3)) * 100, 100)}%`,
                        backgroundColor: point.netPosition >= 0 ? COLORS.success : COLORS.secondary,
                      }
                    ]} />
                  </View>
                  <View style={styles.timelineDetails}>
                    <Text style={styles.timelineDetail}>
                      Savings: {formatCurrency(point.cumulativeSavings)}
                    </Text>
                    <Text style={styles.timelineDetail}>
                      Moving costs: {formatCurrency(point.movingCosts)}
                    </Text>
                  </View>
                </View>
              ))}
            </Card>

            {/* Recommendations */}
            <Card style={[styles.section, styles.recommendationCard]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="bulb-outline" size={24} color={COLORS.warning} />
                <Text style={styles.sectionTitle}>Recommendations</Text>
              </View>

              {analysis.isPositive ? (
                <>
                  <Text style={styles.recommendationText}>
                    ✓ This move makes financial sense! You'll break even in {formatMonths(analysis.breakEvenMonths)}.
                  </Text>
                  <Text style={styles.recommendationText}>
                    ✓ After 5 years, you'll be ahead by approximately {formatCurrency(analysis.timeline[4].netPosition)}.
                  </Text>
                  {analysis.breakEvenMonths > 12 && (
                    <Text style={styles.recommendationText}>
                      ⚠ Consider negotiating a higher salary or relocation package to reach break-even faster.
                    </Text>
                  )}
                </>
              ) : (
                <>
                  <Text style={styles.recommendationText}>
                    ⚠ This move will cost you {formatCurrency(Math.abs(analysis.adjustedMonthlySavings))} per month.
                  </Text>
                  <Text style={styles.recommendationText}>
                    • Negotiate a higher salary in {targetCity?.name}
                  </Text>
                  <Text style={styles.recommendationText}>
                    • Request a relocation bonus or signing bonus
                  </Text>
                  <Text style={styles.recommendationText}>
                    • Consider the quality of life benefits beyond finances
                  </Text>
                </>
              )}
            </Card>

            {/* Compare Cities Button */}
            <Card style={styles.section}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('CityComparison')}
              >
                <Ionicons name="git-compare-outline" size={24} color={COLORS.primary} />
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Compare Cities in Detail</Text>
                  <Text style={styles.actionSubtitle}>
                    See side-by-side metrics for {currentCity?.name} and {targetCity?.name}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
              </TouchableOpacity>
            </Card>
          </>
        )}

        {!showResults && (
          <Card style={styles.emptyState}>
            <Ionicons name="bar-chart-outline" size={64} color={COLORS.mediumGray} />
            <Text style={styles.emptyStateTitle}>Full Relocation Analysis</Text>
            <Text style={styles.emptyStateText}>
              Get a complete financial breakdown of your move including break-even timelines,
              5-year projections, and personalized recommendations.
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
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.charcoal,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: SPACING.base,
  },
  breakEvenCard: {
    backgroundColor: COLORS.successLight,
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  breakEvenHeader: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  breakEvenTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.charcoal,
    marginTop: SPACING.sm,
  },
  breakEvenSubtitle: {
    fontSize: FONTS.sizes.base,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  breakEvenMonths: {
    fontSize: FONTS.sizes.hero,
    fontWeight: '800',
    color: COLORS.success,
    marginVertical: SPACING.sm,
  },
  breakEvenDetail: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  breakdownLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  breakdownText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.darkGray,
  },
  breakdownValue: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
  },
  breakdownTotal: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
  },
  timelineItem: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.offWhite,
    borderRadius: RADIUS.md,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  timelineMonth: {
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
    color: COLORS.primary,
  },
  timelineNet: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
  },
  timelineBar: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  timelineBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  timelineDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelineDetail: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
  },
  recommendationCard: {
    backgroundColor: COLORS.warningLight,
  },
  recommendationText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.darkGray,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.base,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
    color: COLORS.charcoal,
  },
  actionSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  emptyState: {
    marginHorizontal: SPACING.base,
    marginTop: SPACING.xl,
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
