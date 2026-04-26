import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Svg, { Polygon, Circle, Line, Text as SvgText, G } from 'react-native-svg';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';
import { CityScore } from '../../types/premium';

// ============================================================================
// TYPES
// ============================================================================

interface RadarChartProps {
  cityScores: CityScore[];
  size?: number;
  showLegend?: boolean;
}

interface RadarDataPoint {
  label: string;
  key: keyof Pick<CityScore, 'financialScore' | 'qualityOfLifeScore' | 'mobilityScore' | 'careerScore' | 'lifestyleScore'>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DATA_POINTS: RadarDataPoint[] = [
  { label: 'Financial', key: 'financialScore' },
  { label: 'Quality of Life', key: 'qualityOfLifeScore' },
  { label: 'Mobility', key: 'mobilityScore' },
  { label: 'Career', key: 'careerScore' },
  { label: 'Lifestyle', key: 'lifestyleScore' },
];

const CHART_COLORS = [
  '#2563eb', // Blue
  '#16a34a', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
];

// ============================================================================
// COMPONENT
// ============================================================================

export const RadarChart: React.FC<RadarChartProps> = ({
  cityScores,
  size = 250,
  showLegend = true,
}) => {
  const numPoints = DATA_POINTS.length;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size / 2) - 30; // Leave room for labels

  // Calculate point position on the radar
  const getPoint = (index: number, value: number): { x: number; y: number } => {
    const angle = (Math.PI * 2 * index) / numPoints - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
    };
  };

  // Get polygon points string for a city
  const getPolygonPoints = (cityScore: CityScore): string => {
    return DATA_POINTS.map((dp, i) => {
      const value = cityScore[dp.key];
      const point = getPoint(i, value);
      return `${point.x},${point.y}`;
    }).join(' ');
  };

  // Get label position
  const getLabelPosition = (index: number): { x: number; y: number; anchor: string } => {
    const angle = (Math.PI * 2 * index) / numPoints - Math.PI / 2;
    const labelRadius = radius + 20;
    const x = centerX + labelRadius * Math.cos(angle);
    const y = centerY + labelRadius * Math.sin(angle);

    let anchor = 'middle';
    if (Math.cos(angle) < -0.1) anchor = 'end';
    if (Math.cos(angle) > 0.1) anchor = 'start';

    return { x, y, anchor };
  };

  // Draw reference circles (20, 40, 60, 80, 100)
  const referenceCircles = [20, 40, 60, 80, 100];

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background grid */}
        <G>
          {/* Reference circles */}
          {referenceCircles.map((level) => (
            <Circle
              key={level}
              cx={centerX}
              cy={centerY}
              r={(level / 100) * radius}
              fill="none"
              stroke={COLORS.lightGray}
              strokeWidth={1}
              strokeDasharray={level === 100 ? '0' : '4,4'}
            />
          ))}

          {/* Axis lines */}
          {DATA_POINTS.map((_, index) => {
            const point = getPoint(index, 100);
            return (
              <Line
                key={index}
                x1={centerX}
                y1={centerY}
                x2={point.x}
                y2={point.y}
                stroke={COLORS.lightGray}
                strokeWidth={1}
              />
            );
          })}
        </G>

        {/* Data polygons */}
        {cityScores.map((cityScore, cityIndex) => (
          <Polygon
            key={cityScore.city.id}
            points={getPolygonPoints(cityScore)}
            fill={CHART_COLORS[cityIndex % CHART_COLORS.length]}
            fillOpacity={0.2}
            stroke={CHART_COLORS[cityIndex % CHART_COLORS.length]}
            strokeWidth={2}
          />
        ))}

        {/* Data points (dots) */}
        {cityScores.map((cityScore, cityIndex) => (
          <G key={`dots-${cityScore.city.id}`}>
            {DATA_POINTS.map((dp, pointIndex) => {
              const value = cityScore[dp.key];
              const point = getPoint(pointIndex, value);
              return (
                <Circle
                  key={pointIndex}
                  cx={point.x}
                  cy={point.y}
                  r={4}
                  fill={CHART_COLORS[cityIndex % CHART_COLORS.length]}
                />
              );
            })}
          </G>
        ))}

        {/* Labels */}
        {DATA_POINTS.map((dp, index) => {
          const pos = getLabelPosition(index);
          return (
            <SvgText
              key={dp.key}
              x={pos.x}
              y={pos.y}
              fontSize={11}
              fill={COLORS.darkGray}
              textAnchor={pos.anchor}
              alignmentBaseline="middle"
              fontWeight="500"
            >
              {dp.label}
            </SvgText>
          );
        })}
      </Svg>

      {/* Legend */}
      {showLegend && (
        <View style={styles.legend}>
          {cityScores.map((cityScore, index) => (
            <View key={cityScore.city.id} style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: CHART_COLORS[index % CHART_COLORS.length] },
                ]}
              />
              <Text style={styles.legendText}>{cityScore.city.name}</Text>
              <Text style={styles.legendScore}>{cityScore.overallScore}</Text>
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
    alignItems: 'center',
  },
  legend: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
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
    color: COLORS.mediumGray,
    fontWeight: '500',
  },
  legendScore: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    fontWeight: '600',
  },
});

export default RadarChart;
