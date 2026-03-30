import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme';
import { CityProjection, BreakEvenScenario } from '../../types/premium';

// ============================================================================
// TYPES
// ============================================================================

interface ScenarioComparisonProps {
  scenarios: {
    best: CityProjection;
    expected: CityProjection;
    worst: CityProjection;
  };
  cityName: string;
  cityState?: string;
}

interface BreakEvenScenarioProps {
  scenarios: BreakEvenScenario[];
  movingCosts: number;
}

type ScenarioType = 'best' | 'expected' | 'worst';

// ============================================================================
// SCENARIO CONFIG
// ============================================================================

const SCENARIO_CONFIG = {
  best: {
    label: 'Best Case',
    icon: 'sunny' as const,
    color: COLORS.success,
    bgColor: COLORS.successLight,
    description: 'Higher raises, lower inflation',
  },
  expected: {
    label: 'Expected',
    icon: 'partly-sunny' as const,
    color: COLORS.info,
    bgColor: COLORS.infoLight,
    description: 'Standard assumptions',
  },
  worst: {
    label: 'Worst Case',
    icon: 'rainy' as const,
    color: COLORS.error,
    bgColor: COLORS.errorLight,
    description: 'Slower growth, higher costs',
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  scenarios,
  cityName,
  cityState,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('expected');
  const [showInfoModal, setShowInfoModal] = useState(false);

  const formatCurrency = (amount: number): string => {
    const sign = amount < 0 ? '-' : '';
    const absAmount = Math.abs(amount);
    if (absAmount >= 1000000) return `${sign}$${(absAmount / 1000000).toFixed(1)}M`;
    if (absAmount >= 1000) return `${sign}$${(absAmount / 1000).toFixed(1)}K`;
    return `${sign}$${Math.round(absAmount)}`;
  };

  const currentScenario = scenarios[selectedScenario];
  const config = SCENARIO_CONFIG[selectedScenario];

  // Calculate range
  const year5Range = {
    min: scenarios.worst.totalNetWorthYear5,
    max: scenarios.best.totalNetWorthYear5,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Scenario Analysis</Text>
          <Text style={styles.headerSubtitle}>
            {cityName}{cityState ? `, ${cityState}` : ''}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowInfoModal(true)}
          style={styles.infoButton}
        >
          <Ionicons name="information-circle-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Info Modal */}
      <Modal
        visible={showInfoModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={styles.infoModalOverlay}>
          <View style={styles.infoModalContent}>
            <View style={styles.infoModalHeader}>
              <Text style={styles.infoModalTitle}>How Scenarios Work</Text>
              <TouchableOpacity
                onPress={() => setShowInfoModal(false)}
                style={styles.infoModalClose}
              >
                <Ionicons name="close" size={24} color={COLORS.darkGray} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.infoModalBody}>
              {/* What You're Viewing */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <Ionicons name="eye-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.infoSectionTitle}>What You're Viewing</Text>
                </View>
                <Text style={styles.infoSectionText}>
                  Each year (Y1-Y5) shows your projected Net Worth in the target city under different economic conditions.
                </Text>
                <View style={styles.infoList}>
                  <Text style={styles.infoListItem}>• Net Worth = Cumulative Savings + Home Equity (if buying)</Text>
                  <Text style={styles.infoListItem}>• Savings = Net Salary - Living Expenses - Moving Costs (Y1)</Text>
                  <Text style={styles.infoListItem}>• Investment returns are applied to positive savings balances</Text>
                </View>
              </View>

              {/* The Three Scenarios */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <Ionicons name="sunny" size={20} color={COLORS.success} />
                  <Text style={styles.infoSectionTitle}>Best Case</Text>
                </View>
                <Text style={styles.infoSectionText}>
                  Optimistic economic conditions:
                </Text>
                <View style={styles.infoList}>
                  <Text style={styles.infoListItem}>• 5% annual salary raises</Text>
                  <Text style={styles.infoListItem}>• 2% rent/COL inflation</Text>
                  <Text style={styles.infoListItem}>• 6% home appreciation (if buying)</Text>
                  <Text style={styles.infoListItem}>• 10% investment returns</Text>
                </View>
              </View>

              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <Ionicons name="partly-sunny" size={20} color={COLORS.info} />
                  <Text style={styles.infoSectionTitle}>Expected Case</Text>
                </View>
                <Text style={styles.infoSectionText}>
                  Standard assumptions based on historical averages:
                </Text>
                <View style={styles.infoList}>
                  <Text style={styles.infoListItem}>• 3% annual salary raises</Text>
                  <Text style={styles.infoListItem}>• 3% rent inflation, 2.5% COL inflation</Text>
                  <Text style={styles.infoListItem}>• 4% home appreciation (if buying)</Text>
                  <Text style={styles.infoListItem}>• 7% investment returns</Text>
                </View>
              </View>

              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <Ionicons name="rainy" size={20} color={COLORS.error} />
                  <Text style={styles.infoSectionTitle}>Worst Case</Text>
                </View>
                <Text style={styles.infoSectionText}>
                  Challenging economic conditions:
                </Text>
                <View style={styles.infoList}>
                  <Text style={styles.infoListItem}>• 1% annual salary raises</Text>
                  <Text style={styles.infoListItem}>• 5% rent inflation, 4% COL inflation</Text>
                  <Text style={styles.infoListItem}>• 2% home appreciation (if buying)</Text>
                  <Text style={styles.infoListItem}>• 4% investment returns</Text>
                </View>
              </View>

              {/* Why Ranges Vary */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <Ionicons name="swap-horizontal" size={20} color={COLORS.primary} />
                  <Text style={styles.infoSectionTitle}>Why Buying Has Wider Ranges</Text>
                </View>
                <Text style={styles.infoSectionText}>
                  If you're buying, home appreciation varies significantly between scenarios (2% to 6%), creating larger swings in net worth. Renters have more predictable but typically smaller wealth accumulation.
                </Text>
              </View>

              {/* Note */}
              <View style={styles.infoNote}>
                <Ionicons name="information-circle" size={18} color={COLORS.info} />
                <Text style={styles.infoNoteText}>
                  The "5-Year Outcome Range" bar at the bottom shows the spread between worst and best case scenarios, helping you understand the potential variability in outcomes.
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowInfoModal(false)}
              style={styles.infoModalButton}
            >
              <Text style={styles.infoModalButtonText}>Got It</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Scenario Tabs */}
      <View style={styles.tabs}>
        {(['worst', 'expected', 'best'] as ScenarioType[]).map((type) => {
          const tabConfig = SCENARIO_CONFIG[type];
          const isSelected = selectedScenario === type;

          return (
            <TouchableOpacity
              key={type}
              style={[
                styles.tab,
                isSelected && { backgroundColor: tabConfig.bgColor, borderColor: tabConfig.color },
              ]}
              onPress={() => setSelectedScenario(type)}
            >
              <Ionicons
                name={tabConfig.icon}
                size={18}
                color={isSelected ? tabConfig.color : COLORS.mediumGray}
              />
              <Text
                style={[
                  styles.tabLabel,
                  isSelected && { color: tabConfig.color, fontWeight: '600' },
                ]}
              >
                {tabConfig.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected Scenario Details */}
      <View style={[styles.scenarioDetails, { borderColor: config.color }]}>
        <View style={styles.scenarioHeader}>
          <View style={[styles.scenarioBadge, { backgroundColor: config.bgColor }]}>
            <Ionicons name={config.icon} size={20} color={config.color} />
            <Text style={[styles.scenarioLabel, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
          <Text style={styles.scenarioDescription}>{config.description}</Text>
        </View>

        {/* 5-Year Projection */}
        <View style={styles.projectionGrid}>
          <View style={styles.projectionItem}>
            <Text style={styles.projectionLabel}>Year 5 Net Worth</Text>
            <Text style={[styles.projectionValue, { color: config.color }]}>
              {formatCurrency(currentScenario.totalNetWorthYear5)}
            </Text>
          </View>
          <View style={styles.projectionItem}>
            <Text style={styles.projectionLabel}>Total Savings</Text>
            <Text style={styles.projectionValue}>
              {formatCurrency(currentScenario.totalSavingsYear5)}
            </Text>
          </View>
        </View>

        {/* Year-by-Year Breakdown */}
        <View style={styles.yearlyBreakdown}>
          <Text style={styles.breakdownTitle}>Year-by-Year</Text>
          <View style={styles.yearGrid}>
            {currentScenario.projections.map((proj, index) => (
              <View key={proj.year} style={styles.yearItem}>
                <Text style={styles.yearLabel}>Y{proj.year}</Text>
                <Text style={[
                  styles.yearNetWorth,
                  proj.netWorth < 0 && { color: COLORS.error }
                ]}>
                  {formatCurrency(proj.netWorth)}
                </Text>
                <Text style={[
                  styles.yearSavings,
                  proj.annualSavings < 0 && { color: COLORS.error }
                ]}>
                  {proj.annualSavings >= 0 ? '+' : ''}{formatCurrency(proj.annualSavings)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Range Indicator */}
      <View style={styles.rangeContainer}>
        <Text style={styles.rangeTitle}>5-Year Outcome Range</Text>
        <View style={styles.rangeBar}>
          <View style={[styles.rangeFill, {
            left: '0%',
            right: '0%',
          }]}>
            <View style={styles.rangeWorst} />
            <View style={styles.rangeExpected} />
            <View style={styles.rangeBest} />
          </View>
        </View>
        <View style={styles.rangeLabels}>
          <View style={styles.rangeLabelItem}>
            <View style={[styles.rangeDot, { backgroundColor: COLORS.error }]} />
            <Text style={styles.rangeLabelText}>{formatCurrency(year5Range.min)}</Text>
          </View>
          <View style={styles.rangeLabelItem}>
            <View style={[styles.rangeDot, { backgroundColor: COLORS.info }]} />
            <Text style={styles.rangeLabelText}>
              {formatCurrency(scenarios.expected.totalNetWorthYear5)}
            </Text>
          </View>
          <View style={styles.rangeLabelItem}>
            <View style={[styles.rangeDot, { backgroundColor: COLORS.success }]} />
            <Text style={styles.rangeLabelText}>{formatCurrency(year5Range.max)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// ============================================================================
// BREAK-EVEN SCENARIOS COMPONENT
// ============================================================================

export const BreakEvenScenarios: React.FC<BreakEvenScenarioProps> = ({
  scenarios,
  movingCosts,
}) => {
  const formatCurrency = (amount: number): string => {
    const sign = amount < 0 ? '-' : '';
    const absAmount = Math.abs(amount);
    if (absAmount >= 1000000) return `${sign}$${(absAmount / 1000000).toFixed(1)}M`;
    if (absAmount >= 1000) return `${sign}$${(absAmount / 1000).toFixed(1)}K`;
    return `${sign}$${Math.round(absAmount)}`;
  };

  const formatMonths = (months: number): string => {
    if (months < 0) return 'Never';
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${months} months`;
    if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`;
    return `${years}y ${remainingMonths}m`;
  };

  const getScenarioConfig = (name: string) => {
    switch (name) {
      case 'best':
        return { color: COLORS.success, bgColor: COLORS.successLight, icon: 'sunny' as const };
      case 'expected':
        return { color: COLORS.info, bgColor: COLORS.infoLight, icon: 'partly-sunny' as const };
      case 'worst':
        return { color: COLORS.error, bgColor: COLORS.errorLight, icon: 'rainy' as const };
      default:
        return { color: COLORS.mediumGray, bgColor: COLORS.offWhite, icon: 'help' as const };
    }
  };

  return (
    <View style={styles.breakEvenContainer}>
      <View style={styles.breakEvenHeader}>
        <Text style={styles.breakEvenTitle}>Break-Even Scenarios</Text>
        <Text style={styles.breakEvenSubtitle}>
          Moving costs: {formatCurrency(movingCosts)}
        </Text>
      </View>

      <View style={styles.scenarioCards}>
        {scenarios.map((scenario) => {
          const config = getScenarioConfig(scenario.name);
          return (
            <View
              key={scenario.name}
              style={[styles.scenarioCard, { borderColor: config.color }]}
            >
              <View style={[styles.scenarioCardHeader, { backgroundColor: config.bgColor }]}>
                <Ionicons name={config.icon} size={16} color={config.color} />
                <Text style={[styles.scenarioCardTitle, { color: config.color }]}>
                  {scenario.name.charAt(0).toUpperCase() + scenario.name.slice(1)}
                </Text>
              </View>
              <View style={styles.scenarioCardContent}>
                <View style={styles.scenarioMetric}>
                  <Text style={styles.metricLabel}>Break-Even</Text>
                  <Text style={[styles.metricValue, { color: config.color }]}>
                    {formatMonths(scenario.breakEvenMonths)}
                  </Text>
                </View>
                <View style={styles.scenarioMetric}>
                  <Text style={styles.metricLabel}>5-Year Gain</Text>
                  <Text style={[
                    styles.metricValue,
                    { color: scenario.year5Advantage >= 0 ? COLORS.success : COLORS.error }
                  ]}>
                    {scenario.year5Advantage >= 0 ? '+' : ''}{formatCurrency(scenario.year5Advantage)}
                  </Text>
                </View>
              </View>
              <View style={styles.scenarioAssumptions}>
                <Text style={styles.assumptionText}>
                  {(scenario.salaryGrowth * 100).toFixed(0)}% raises, {(scenario.colIncrease * 100).toFixed(1)}% inflation
                </Text>
              </View>
            </View>
          );
        })}
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
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.offWhite,
  },
  infoButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.charcoal,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    marginTop: 2,
  },
  tabs: {
    flexDirection: 'row',
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    gap: SPACING.xs,
  },
  tabLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
  },
  scenarioDetails: {
    margin: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    backgroundColor: COLORS.offWhite,
  },
  scenarioHeader: {
    marginBottom: SPACING.md,
  },
  scenarioBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  scenarioLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
  },
  scenarioDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
  },
  projectionGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  projectionItem: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  projectionLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
  },
  projectionValue: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.charcoal,
    marginTop: 4,
  },
  yearlyBreakdown: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  breakdownTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
  },
  yearGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  yearItem: {
    alignItems: 'center',
  },
  yearLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    fontWeight: '600',
  },
  yearNetWorth: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.charcoal,
    marginTop: 4,
  },
  yearSavings: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.success,
  },
  rangeContainer: {
    padding: SPACING.md,
  },
  rangeTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
  },
  rangeBar: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  rangeFill: {
    flex: 1,
    flexDirection: 'row',
  },
  rangeWorst: {
    flex: 1,
    backgroundColor: COLORS.error,
    opacity: 0.3,
  },
  rangeExpected: {
    flex: 1,
    backgroundColor: COLORS.info,
    opacity: 0.5,
  },
  rangeBest: {
    flex: 1,
    backgroundColor: COLORS.success,
    opacity: 0.7,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  rangeLabelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  rangeDot: {
    width: 8,
    height: 8,
    borderRadius: RADIUS.full,
  },
  rangeLabelText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  // Break-Even Scenarios styles
  breakEvenContainer: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  breakEvenHeader: {
    padding: SPACING.md,
    backgroundColor: COLORS.offWhite,
  },
  breakEvenTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.charcoal,
  },
  breakEvenSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    marginTop: 2,
  },
  scenarioCards: {
    flexDirection: 'row',
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  scenarioCard: {
    flex: 1,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    overflow: 'hidden',
  },
  scenarioCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
    gap: SPACING.xs,
  },
  scenarioCardTitle: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
  },
  scenarioCardContent: {
    padding: SPACING.sm,
  },
  scenarioMetric: {
    marginBottom: SPACING.xs,
  },
  metricLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
  },
  metricValue: {
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
  },
  scenarioAssumptions: {
    backgroundColor: COLORS.offWhite,
    padding: SPACING.xs,
  },
  assumptionText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    textAlign: 'center',
  },
  // Info Modal Styles
  infoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  infoModalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.charcoal,
  },
  infoModalClose: {
    padding: SPACING.xs,
  },
  infoModalBody: {
    padding: SPACING.md,
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
    color: COLORS.charcoal,
  },
  infoSectionText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  infoList: {
    paddingLeft: SPACING.sm,
  },
  infoListItem: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
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
    color: COLORS.darkGray,
    lineHeight: 18,
  },
  infoModalButton: {
    backgroundColor: COLORS.primary,
    margin: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  infoModalButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default ScenarioComparison;
