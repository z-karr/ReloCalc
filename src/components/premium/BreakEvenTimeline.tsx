import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Svg, { Line, Circle, Rect, G, Text as SvgText, Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme';
import { BreakEvenAnalysis } from '../../types/premium';

// ============================================================================
// TYPES
// ============================================================================

interface BreakEvenTimelineProps {
  analysis: BreakEvenAnalysis;
  width?: number;
  height?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const BreakEvenTimeline: React.FC<BreakEvenTimelineProps> = ({
  analysis,
  width = 350,
  height = 200,
}) => {
  const formatCurrency = (amount: number): string => {
    const prefix = amount < 0 ? '-' : '+';
    const absAmount = Math.abs(amount);
    if (absAmount >= 1000000) return `${prefix}$${(absAmount / 1000000).toFixed(1)}M`;
    if (absAmount >= 1000) return `${prefix}$${(absAmount / 1000).toFixed(1)}K`;
    return `${prefix}$${Math.round(absAmount)}`;
  };

  // Timeline milestones
  const milestones = [
    { month: 0, label: 'Move', value: -analysis.movingCosts, type: 'start' },
    { month: 6, label: '6 mo', value: analysis.cumulativeAdvantage.month6, type: 'milestone' },
    { month: 12, label: '1 yr', value: analysis.cumulativeAdvantage.year1, type: 'milestone' },
    { month: 24, label: '2 yr', value: analysis.cumulativeAdvantage.year2, type: 'milestone' },
    { month: 36, label: '3 yr', value: analysis.cumulativeAdvantage.year3, type: 'milestone' },
    { month: 60, label: '5 yr', value: analysis.cumulativeAdvantage.year5, type: 'end' },
  ];

  // Find break-even point
  const breakEvenMonth = analysis.breakEvenMonths > 0 ? analysis.breakEvenMonths : null;

  // Calculate scales
  const padding = { top: 30, bottom: 50, left: 20, right: 20 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const allValues = milestones.map(m => m.value);
  const minValue = Math.min(0, ...allValues);
  const maxValue = Math.max(0, ...allValues);
  const valueRange = maxValue - minValue || 1;

  const scaleX = (month: number): number => {
    return padding.left + (month / 60) * chartWidth;
  };

  const scaleY = (value: number): number => {
    return padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;
  };

  // Generate path for cumulative advantage line
  const generatePath = (): string => {
    return milestones.map((m, i) => {
      const x = scaleX(m.month);
      const y = scaleY(m.value);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');
  };

  // Zero line Y position
  const zeroY = scaleY(0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="timer-outline" size={20} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Break-Even Timeline</Text>
        </View>
        {breakEvenMonth && (
          <View style={styles.breakEvenBadge}>
            <Text style={styles.breakEvenBadgeText}>
              {analysis.breakEvenFormatted}
            </Text>
          </View>
        )}
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Moving Costs</Text>
          <Text style={[styles.summaryValue, { color: COLORS.error }]}>
            {formatCurrency(-analysis.movingCosts)}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Monthly Advantage</Text>
          <Text style={[styles.summaryValue, {
            color: analysis.monthlyNetAdvantage >= 0 ? COLORS.success : COLORS.error
          }]}>
            {formatCurrency(analysis.monthlyNetAdvantage)}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>5-Year Gain</Text>
          <Text style={[styles.summaryValue, {
            color: analysis.cumulativeAdvantage.year5 >= 0 ? COLORS.success : COLORS.error
          }]}>
            {formatCurrency(analysis.cumulativeAdvantage.year5)}
          </Text>
        </View>
      </View>

      {/* Chart */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Svg width={width} height={height}>
          {/* Zero line */}
          <Line
            x1={padding.left}
            y1={zeroY}
            x2={width - padding.right}
            y2={zeroY}
            stroke={COLORS.darkGray}
            strokeWidth={1}
            strokeDasharray="4,4"
          />
          <SvgText
            x={padding.left - 5}
            y={zeroY + 4}
            fontSize={10}
            fill={COLORS.darkGray}
            textAnchor="end"
          >
            $0
          </SvgText>

          {/* Shaded areas */}
          {/* Negative area (below zero) */}
          <Path
            d={`M ${scaleX(0)} ${zeroY} L ${scaleX(0)} ${scaleY(milestones[0].value)} ${generatePath().replace('M', 'L')} L ${scaleX(60)} ${zeroY} Z`}
            fill={COLORS.errorLight}
            fillOpacity={0.3}
          />

          {/* Positive area (above zero) - only if there's positive value */}
          {maxValue > 0 && (
            <Path
              d={`M ${scaleX(breakEvenMonth || 0)} ${zeroY} L ${scaleX(breakEvenMonth || 0)} ${scaleY(0)} ${milestones.filter(m => m.month >= (breakEvenMonth || 0)).map(m => `L ${scaleX(m.month)} ${scaleY(m.value)}`).join(' ')} L ${scaleX(60)} ${zeroY} Z`}
              fill={COLORS.successLight}
              fillOpacity={0.3}
            />
          )}

          {/* Main line */}
          <Path
            d={generatePath()}
            fill="none"
            stroke={analysis.isFinanciallyBeneficial ? COLORS.success : COLORS.error}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Break-even marker */}
          {breakEvenMonth && breakEvenMonth <= 60 && (
            <G>
              <Line
                x1={scaleX(breakEvenMonth)}
                y1={padding.top}
                x2={scaleX(breakEvenMonth)}
                y2={height - padding.bottom}
                stroke={COLORS.success}
                strokeWidth={2}
                strokeDasharray="4,4"
              />
              <Circle
                cx={scaleX(breakEvenMonth)}
                cy={zeroY}
                r={8}
                fill={COLORS.success}
              />
              <Rect
                x={scaleX(breakEvenMonth) - 35}
                y={padding.top - 5}
                width={70}
                height={20}
                rx={4}
                fill={COLORS.success}
              />
              <SvgText
                x={scaleX(breakEvenMonth)}
                y={padding.top + 9}
                fontSize={10}
                fill={COLORS.white}
                textAnchor="middle"
                fontWeight="600"
              >
                Break-Even
              </SvgText>
            </G>
          )}

          {/* Milestone points */}
          {milestones.map((milestone, index) => (
            <G key={milestone.month}>
              <Circle
                cx={scaleX(milestone.month)}
                cy={scaleY(milestone.value)}
                r={6}
                fill={COLORS.white}
                stroke={milestone.value >= 0 ? COLORS.success : COLORS.error}
                strokeWidth={2}
              />
              <SvgText
                x={scaleX(milestone.month)}
                y={height - 10}
                fontSize={10}
                fill={COLORS.darkGray}
                textAnchor="middle"
                fontWeight="500"
              >
                {milestone.label}
              </SvgText>
              {/* Value label */}
              <SvgText
                x={scaleX(milestone.month)}
                y={scaleY(milestone.value) - 12}
                fontSize={9}
                fill={milestone.value >= 0 ? COLORS.success : COLORS.error}
                textAnchor="middle"
                fontWeight="600"
              >
                {formatCurrency(milestone.value)}
              </SvgText>
            </G>
          ))}
        </Svg>
      </ScrollView>

      {/* Status Message */}
      <View style={[
        styles.statusBar,
        { backgroundColor: analysis.isFinanciallyBeneficial ? COLORS.successLight : COLORS.warningLight }
      ]}>
        <Ionicons
          name={analysis.isFinanciallyBeneficial ? 'checkmark-circle' : 'alert-circle'}
          size={18}
          color={analysis.isFinanciallyBeneficial ? COLORS.success : COLORS.warning}
        />
        <Text style={[
          styles.statusText,
          { color: analysis.isFinanciallyBeneficial ? COLORS.success : COLORS.warning }
        ]}>
          {analysis.isFinanciallyBeneficial
            ? `This move pays for itself in ${analysis.breakEvenFormatted}`
            : 'This move may not be financially beneficial'}
        </Text>
      </View>

      {/* Considerations */}
      {analysis.considerations.length > 0 && (
        <View style={styles.considerations}>
          <Text style={styles.considerationsTitle}>Key Considerations</Text>
          {analysis.considerations.slice(0, 3).map((consideration, index) => (
            <View key={index} style={styles.considerationItem}>
              <Ionicons name="arrow-forward" size={12} color={COLORS.primary} />
              <Text style={styles.considerationText}>{consideration}</Text>
            </View>
          ))}
        </View>
      )}
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.charcoal,
  },
  breakEvenBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  breakEvenBadgeText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  summaryRow: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: COLORS.lightGray,
  },
  summaryLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  statusText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  considerations: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  considerationsTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
  },
  considerationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  considerationText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.charcoal,
    lineHeight: 18,
  },
});

export default BreakEvenTimeline;
