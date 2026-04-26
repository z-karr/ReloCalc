import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';
import { ProjectionAssumptions, DEFAULT_ASSUMPTIONS } from '../../types/premium';

// ============================================================================
// TYPES
// ============================================================================

interface AssumptionsEditorProps {
  assumptions: ProjectionAssumptions;
  onUpdate: (assumptions: ProjectionAssumptions) => void;
  collapsible?: boolean;
}

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: 'percent' | 'number';
  onChange: (value: number) => void;
  description?: string;
}

// ============================================================================
// SLIDER ROW COMPONENT
// ============================================================================

const SliderRow: React.FC<SliderRowProps> = ({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
  description,
}) => {
  const formatValue = (val: number): string => {
    if (format === 'percent') {
      return `${(val * 100).toFixed(1)}%`;
    }
    return val.toFixed(1);
  };

  const handleDecrease = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const handleIncrease = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  // Calculate fill percentage for visual bar
  const fillPercent = ((value - min) / (max - min)) * 100;

  return (
    <View style={styles.sliderRow}>
      <View style={styles.sliderHeader}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <Text style={styles.sliderValue}>{formatValue(value)}</Text>
      </View>

      {description && (
        <Text style={styles.sliderDescription}>{description}</Text>
      )}

      <View style={styles.sliderControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleDecrease}
          disabled={value <= min}
        >
          <Ionicons
            name="remove"
            size={18}
            color={value <= min ? COLORS.lightGray : COLORS.primary}
          />
        </TouchableOpacity>

        <View style={styles.sliderTrack}>
          <View style={[styles.sliderFill, { width: `${fillPercent}%` }]} />
          <View style={[styles.sliderThumb, { left: `${fillPercent}%` }]} />
        </View>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleIncrease}
          disabled={value >= max}
        >
          <Ionicons
            name="add"
            size={18}
            color={value >= max ? COLORS.lightGray : COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.rangeLabels}>
        <Text style={styles.rangeLabel}>{formatValue(min)}</Text>
        <Text style={styles.rangeLabel}>{formatValue(max)}</Text>
      </View>
    </View>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AssumptionsEditor: React.FC<AssumptionsEditorProps> = ({
  assumptions,
  onUpdate,
  collapsible = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(!collapsible);

  const updateField = (field: keyof ProjectionAssumptions, value: number) => {
    onUpdate({
      ...assumptions,
      [field]: value,
    });
  };

  const resetToDefaults = () => {
    onUpdate(DEFAULT_ASSUMPTIONS);
  };

  const hasChanges = JSON.stringify(assumptions) !== JSON.stringify(DEFAULT_ASSUMPTIONS);

  return (
    <View style={styles.container}>
      {/* Header */}
      {collapsible ? (
        <TouchableOpacity
          style={styles.header}
          onPress={() => setIsExpanded(!isExpanded)}
          activeOpacity={0.7}
        >
          <View style={styles.headerLeft}>
            <Ionicons name="settings-outline" size={20} color={COLORS.primary} />
            <Text style={styles.headerTitle}>Projection Assumptions</Text>
          </View>
          <View style={styles.headerRight}>
            {hasChanges && (
              <View style={styles.changedBadge}>
                <Text style={styles.changedText}>Modified</Text>
              </View>
            )}
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={COLORS.mediumGray}
            />
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.headerStatic}>
          <Ionicons name="settings-outline" size={20} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Projection Assumptions</Text>
        </View>
      )}

      {/* Content */}
      {isExpanded && (
        <View style={styles.content}>
          <Text style={styles.sectionLabel}>Income & Growth</Text>

          <SliderRow
            label="Annual Salary Growth"
            value={assumptions.salaryGrowthRate}
            min={0}
            max={0.10}
            step={0.005}
            format="percent"
            onChange={(v) => updateField('salaryGrowthRate', v)}
            description="Expected yearly raise percentage"
          />

          <SliderRow
            label="Savings Rate"
            value={assumptions.savingsRate}
            min={0.05}
            max={0.50}
            step={0.01}
            format="percent"
            onChange={(v) => updateField('savingsRate', v)}
            description="Percentage of net income saved"
          />

          <SliderRow
            label="Investment Return"
            value={assumptions.investmentReturnRate}
            min={0.02}
            max={0.12}
            step={0.005}
            format="percent"
            onChange={(v) => updateField('investmentReturnRate', v)}
            description="Expected annual market return"
          />

          <Text style={[styles.sectionLabel, { marginTop: SPACING.md }]}>
            Cost of Living
          </Text>

          <SliderRow
            label="Rent Inflation"
            value={assumptions.rentInflationRate}
            min={0}
            max={0.08}
            step={0.005}
            format="percent"
            onChange={(v) => updateField('rentInflationRate', v)}
            description="Annual rent increase"
          />

          <SliderRow
            label="COL Inflation"
            value={assumptions.colInflationRate}
            min={0}
            max={0.06}
            step={0.005}
            format="percent"
            onChange={(v) => updateField('colInflationRate', v)}
            description="General cost of living increase"
          />

          <Text style={[styles.sectionLabel, { marginTop: SPACING.md }]}>
            Housing Market
          </Text>

          <SliderRow
            label="Home Appreciation"
            value={assumptions.homeAppreciationRate}
            min={-0.02}
            max={0.10}
            step={0.005}
            format="percent"
            onChange={(v) => updateField('homeAppreciationRate', v)}
            description="Annual home value increase"
          />

          {/* Reset Button */}
          {hasChanges && (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetToDefaults}
            >
              <Ionicons name="refresh" size={16} color={COLORS.primary} />
              <Text style={styles.resetText}>Reset to Defaults</Text>
            </TouchableOpacity>
          )}

          {/* Disclaimer */}
          <View style={styles.disclaimer}>
            <Ionicons name="information-circle" size={14} color={COLORS.mediumGray} />
            <Text style={styles.disclaimerText}>
              These assumptions affect your 5-year projections. Adjust based on your expectations and local market conditions.
            </Text>
          </View>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.offWhite,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  headerStatic: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.offWhite,
    gap: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.white,
  },
  changedBadge: {
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  changedText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.warning,
    fontWeight: '500',
  },
  content: {
    padding: SPACING.md,
  },
  sectionLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.info,
    marginBottom: SPACING.sm,
  },
  sliderRow: {
    marginBottom: SPACING.md,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sliderLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  sliderValue: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.info,
  },
  sliderDescription: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    marginBottom: SPACING.sm,
  },
  sliderControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  sliderTrack: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: RADIUS.full,
    position: 'relative',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },
  sliderThumb: {
    position: 'absolute',
    top: -4,
    width: 16,
    height: 16,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 3,
    borderColor: COLORS.primary,
    marginLeft: -8,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 40,
  },
  rangeLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  resetText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.info,
    fontWeight: '600',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.offWhite,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  disclaimerText: {
    flex: 1,
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    lineHeight: 16,
  },
});

export default AssumptionsEditor;
