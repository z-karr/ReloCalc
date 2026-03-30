import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  LayoutChangeEvent,
} from 'react-native';
import Svg, { Path, Line, Circle, G, Text as SvgText, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';
import { ProjectionComparison, CityProjection } from '../../types/premium';

// ============================================================================
// TYPES
// ============================================================================

interface ProjectionChartProps {
  comparison: ProjectionComparison;
  width?: number;
  height?: number;
  showMilestones?: boolean;
  breakEvenMonths?: number; // When moving costs are recovered
}

interface ChartDataset {
  label: string;
  data: number[];
  color: string;
  isCurrentCity: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CHART_COLORS = [
  '#2563eb', // Blue (current city)
  '#16a34a', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
];

const PADDING = { top: 20, right: 40, bottom: 40, left: 60 };

// ============================================================================
// COMPONENT
// ============================================================================

export const ProjectionChart: React.FC<ProjectionChartProps> = ({
  comparison,
  width: propWidth,
  height = 250,
  showMilestones = true,
  breakEvenMonths,
}) => {
  const [containerWidth, setContainerWidth] = useState(propWidth || 300);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width: measuredWidth } = event.nativeEvent.layout;
    if (measuredWidth > 0) {
      setContainerWidth(measuredWidth);
    }
  };

  const handlePointPress = (yearIndex: number) => {
    // Toggle selection - tap again to dismiss
    setSelectedYear(selectedYear === yearIndex ? null : yearIndex);
  };

  // Use prop width if provided, otherwise use measured container width
  const width = propWidth || containerWidth;

  const chartWidth = width - PADDING.left - PADDING.right;
  const chartHeight = height - PADDING.top - PADDING.bottom;

  // Prepare datasets
  const datasets: ChartDataset[] = [
    {
      label: comparison.currentCity.city.name,
      data: comparison.currentCity.projections.map(p => p.netWorth),
      color: CHART_COLORS[0],
      isCurrentCity: true,
    },
    ...comparison.targetCities.map((target, index) => ({
      label: target.city.name,
      data: target.projections.map(p => p.netWorth),
      color: CHART_COLORS[(index + 1) % CHART_COLORS.length],
      isCurrentCity: false,
    })),
  ];

  // Calculate scales
  const allValues = datasets.flatMap(d => d.data);
  const minValue = Math.min(0, ...allValues);
  const maxValue = Math.max(...allValues);
  const valueRange = maxValue - minValue || 1;

  // Add 10% padding to max
  const adjustedMax = maxValue + valueRange * 0.1;
  const adjustedMin = minValue - valueRange * 0.05;
  const adjustedRange = adjustedMax - adjustedMin;

  // Scale functions
  const scaleX = (index: number): number => {
    return PADDING.left + (index / 4) * chartWidth;
  };

  const scaleY = (value: number): number => {
    return PADDING.top + chartHeight - ((value - adjustedMin) / adjustedRange) * chartHeight;
  };

  // Generate path for a dataset
  const generatePath = (data: number[]): string => {
    return data.map((value, index) => {
      const x = scaleX(index);
      const y = scaleY(value);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');
  };

  // Generate area path (for gradient fill)
  const generateAreaPath = (data: number[]): string => {
    const linePath = generatePath(data);
    const lastX = scaleX(data.length - 1);
    const firstX = scaleX(0);
    const bottomY = scaleY(adjustedMin);
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  // Format currency for axis
  const formatAxisValue = (value: number): string => {
    const sign = value < 0 ? '-' : '';
    const absValue = Math.abs(value);
    if (absValue >= 1000000) {
      return `${sign}$${(absValue / 1000000).toFixed(1)}M`;
    }
    if (absValue >= 1000) {
      return `${sign}$${(absValue / 1000).toFixed(1)}K`;
    }
    return `${sign}$${Math.round(absValue)}`;
  };

  // Y-axis ticks
  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks }, (_, i) => {
    return adjustedMin + (adjustedRange * i) / (yTicks - 1);
  });

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <View>
        <Svg width={width} height={height}>
            <Defs>
              {datasets.map((dataset, index) => (
                <LinearGradient
                  key={`gradient-${index}`}
                  id={`gradient-${index}`}
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <Stop offset="0%" stopColor={dataset.color} stopOpacity={0.3} />
                  <Stop offset="100%" stopColor={dataset.color} stopOpacity={0.05} />
                </LinearGradient>
              ))}
            </Defs>

            {/* Background touch area to dismiss tooltip */}
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill="transparent"
              onPress={() => setSelectedYear(null)}
            />

            {/* Grid lines */}
            <G>
              {yTickValues.map((value, index) => (
                <G key={`grid-${index}`}>
                  <Line
                    x1={PADDING.left}
                    y1={scaleY(value)}
                    x2={width - PADDING.right}
                    y2={scaleY(value)}
                    stroke={COLORS.lightGray}
                    strokeWidth={1}
                    strokeDasharray="4,4"
                  />
                  <SvgText
                    x={PADDING.left - 8}
                    y={scaleY(value) + 4}
                    fontSize={10}
                    fill={COLORS.mediumGray}
                    textAnchor="end"
                  >
                    {formatAxisValue(value)}
                  </SvgText>
                </G>
              ))}
            </G>

            {/* Zero line if visible */}
            {adjustedMin < 0 && adjustedMax > 0 && (
              <Line
                x1={PADDING.left}
                y1={scaleY(0)}
                x2={width - PADDING.right}
                y2={scaleY(0)}
                stroke={COLORS.darkGray}
                strokeWidth={1}
              />
            )}

            {/* X-axis labels */}
            {[1, 2, 3, 4, 5].map((year, index) => (
              <SvgText
                key={`year-${year}`}
                x={scaleX(index)}
                y={height - 10}
                fontSize={11}
                fill={COLORS.darkGray}
                textAnchor="middle"
                fontWeight="500"
              >
                Year {year}
              </SvgText>
            ))}

            {/* Area fills (only for current city) */}
            <Path
              d={generateAreaPath(datasets[0].data)}
              fill={`url(#gradient-0)`}
            />

            {/* Lines */}
            {datasets.map((dataset, index) => (
              <Path
                key={`line-${index}`}
                d={generatePath(dataset.data)}
                fill="none"
                stroke={dataset.color}
                strokeWidth={dataset.isCurrentCity ? 3 : 2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {/* Data points */}
            {datasets.map((dataset, datasetIndex) => (
              <G key={`points-${datasetIndex}`}>
                {dataset.data.map((value, pointIndex) => (
                  <G key={`point-${datasetIndex}-${pointIndex}`}>
                    {/* Larger invisible touch target */}
                    <Circle
                      cx={scaleX(pointIndex)}
                      cy={scaleY(value)}
                      r={16}
                      fill="transparent"
                      onPress={() => handlePointPress(pointIndex)}
                    />
                    {/* Visible point */}
                    <Circle
                      cx={scaleX(pointIndex)}
                      cy={scaleY(value)}
                      r={selectedYear === pointIndex ? 6 : 4}
                      fill={selectedYear === pointIndex ? dataset.color : COLORS.white}
                      stroke={dataset.color}
                      strokeWidth={2}
                      onPress={() => handlePointPress(pointIndex)}
                    />
                  </G>
                ))}
              </G>
            ))}

            {/* Tooltip for selected year */}
            {selectedYear !== null && (() => {
              // Sort datasets by value at selected year (highest first) to match graph visual
              const sortedDatasets = [...datasets].sort(
                (a, b) => b.data[selectedYear] - a.data[selectedYear]
              );

              const tooltipWidth = 140;
              const pointX = scaleX(selectedYear);

              // Adjust tooltip position to stay within bounds
              // If tooltip would extend past right edge, shift it left
              let tooltipX = pointX - tooltipWidth / 2;
              if (tooltipX + tooltipWidth > width - 10) {
                tooltipX = width - tooltipWidth - 10;
              }
              // If tooltip would extend past left edge, shift it right
              if (tooltipX < 10) {
                tooltipX = 10;
              }

              // Calculate center of tooltip for text positioning
              const tooltipCenterX = tooltipX + tooltipWidth / 2;

              return (
                <G>
                  {/* Vertical line at selected year */}
                  <Line
                    x1={pointX}
                    y1={PADDING.top}
                    x2={pointX}
                    y2={height - PADDING.bottom}
                    stroke={COLORS.mediumGray}
                    strokeWidth={1}
                    strokeDasharray="4,4"
                  />
                  {/* Tooltip box - added extra padding at bottom */}
                  <Rect
                    x={tooltipX}
                    y={PADDING.top + 10}
                    width={tooltipWidth}
                    height={30 + sortedDatasets.length * 22}
                    rx={8}
                    fill={COLORS.charcoal}
                    opacity={0.9}
                  />
                  {/* Tooltip title */}
                  <SvgText
                    x={tooltipCenterX}
                    y={PADDING.top + 28}
                    fontSize={11}
                    fill={COLORS.white}
                    textAnchor="middle"
                    fontWeight="600"
                  >
                    Year {selectedYear + 1}
                  </SvgText>
                  {/* Tooltip values for each city - sorted by value */}
                  {sortedDatasets.map((dataset, index) => (
                    <G key={`tooltip-${index}`}>
                      <Circle
                        cx={tooltipX + 15}
                        cy={PADDING.top + 45 + index * 22}
                        r={4}
                        fill={dataset.color}
                      />
                      <SvgText
                        x={tooltipX + 25}
                        y={PADDING.top + 49 + index * 22}
                        fontSize={10}
                        fill={COLORS.lightGray}
                        textAnchor="start"
                      >
                        {dataset.label}
                      </SvgText>
                      <SvgText
                        x={tooltipX + tooltipWidth - 10}
                        y={PADDING.top + 49 + index * 22}
                        fontSize={11}
                        fill={COLORS.white}
                        textAnchor="end"
                        fontWeight="600"
                      >
                        {formatAxisValue(dataset.data[selectedYear])}
                      </SvgText>
                    </G>
                  ))}
                </G>
              );
            })()}

            {/* Break-even marker - simple line when within chart range */}
            {breakEvenMonths !== undefined && breakEvenMonths > 0 && breakEvenMonths <= 60 && (() => {
              // Convert months to year index (0-4 for years 1-5)
              const breakEvenYearIndex = (breakEvenMonths / 12) - 1;

              // Only show if within chart range
              if (breakEvenYearIndex < 0 || breakEvenYearIndex > 4) return null;

              const x = scaleX(breakEvenYearIndex);

              return (
                <G key="break-even">
                  {/* Simple vertical dashed line - color matches the note below */}
                  <Line
                    x1={x}
                    y1={PADDING.top}
                    x2={x}
                    y2={height - PADDING.bottom}
                    stroke={COLORS.warning}
                    strokeWidth={2}
                    strokeDasharray="6,4"
                  />
                </G>
              );
            })()}
          </Svg>

        {/* Legend */}
        <View style={styles.legend}>
          {datasets.map((dataset, index) => (
            <View key={dataset.label} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: dataset.color }]} />
              <Text style={styles.legendText}>{dataset.label}</Text>
              {dataset.isCurrentCity && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>Current</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Break-even note - always show when we have break-even data */}
        {breakEvenMonths !== undefined && breakEvenMonths > 0 && (() => {
          const breakEvenYears = Math.floor(breakEvenMonths / 12);
          const breakEvenRemainingMonths = breakEvenMonths % 12;
          const breakEvenLabel = breakEvenYears > 0
            ? (breakEvenRemainingMonths > 0 ? `${breakEvenYears} years ${breakEvenRemainingMonths} months` : `${breakEvenYears} years`)
            : `${breakEvenMonths} months`;

          const isBeyondChart = breakEvenMonths > 60;

          return (
            <View style={styles.breakEvenNote}>
              <Ionicons name="time-outline" size={16} color={COLORS.warning} />
              <Text style={styles.breakEvenNoteText}>
                Break-even point: <Text style={styles.breakEvenNoteHighlight}>{breakEvenLabel}</Text>
                {isBeyondChart && (
                  <>
                    {'\n'}
                    <Text style={styles.breakEvenNoteSubtext}>
                      This includes your down payment as an upfront cost. While it takes longer to "break even," you're building home equity from day one.
                    </Text>
                  </>
                )}
              </Text>
            </View>
          );
        })()}
      </View>

      {/* Year 5 Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Year 5 Net Worth</Text>
        <View style={styles.summaryGrid}>
          {datasets.map((dataset, index) => (
            <View key={dataset.label} style={styles.summaryItem}>
              <View style={[styles.summaryDot, { backgroundColor: dataset.color }]} />
              <View style={styles.summaryContent}>
                <Text style={styles.summaryCity}>{dataset.label}</Text>
                <Text style={[
                  styles.summaryValue,
                  dataset.data[4] < 0 && { color: COLORS.error }
                ]}>
                  {formatAxisValue(dataset.data[4])}
                </Text>
              </View>
            </View>
          ))}
        </View>
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
    padding: SPACING.md,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    gap: SPACING.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: RADIUS.xs,
  },
  legendText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  currentBadge: {
    backgroundColor: COLORS.infoLight,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 1,
    borderRadius: RADIUS.xs,
  },
  currentBadgeText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.info,
    fontWeight: '600',
  },
  summary: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  summaryTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    minWidth: 120,
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: RADIUS.full,
  },
  summaryContent: {
    flex: 1,
  },
  summaryCity: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
  },
  summaryValue: {
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
    color: COLORS.charcoal,
  },
  breakEvenNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.warningLight,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  breakEvenNoteText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  breakEvenNoteHighlight: {
    fontWeight: '700',
    color: COLORS.charcoal,
  },
  breakEvenNoteSubtext: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    fontStyle: 'italic',
  },
});

export default ProjectionChart;
