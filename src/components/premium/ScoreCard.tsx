import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme';
import { CityScore } from '../../types/premium';

// ============================================================================
// TYPES
// ============================================================================

interface ScoreCardProps {
  cityScore: CityScore;
  isCurrentCity?: boolean;
  rank?: number;
  compact?: boolean;
}

interface ScoreBarProps {
  label: string;
  score: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

// ============================================================================
// SCORE BAR COMPONENT
// ============================================================================

const ScoreBar: React.FC<ScoreBarProps> = ({ label, score, icon, color }) => {
  return (
    <View style={styles.scoreBarContainer}>
      <View style={styles.scoreBarHeader}>
        <View style={styles.scoreBarLabel}>
          <Ionicons name={icon} size={14} color={color} />
          <Text style={styles.scoreBarLabelText}>{label}</Text>
        </View>
        <Text style={[styles.scoreValue, { color }]}>{score}</Text>
      </View>
      <View style={styles.scoreBarTrack}>
        <View
          style={[
            styles.scoreBarFill,
            { width: `${score}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ScoreCard: React.FC<ScoreCardProps> = ({
  cityScore,
  isCurrentCity = false,
  rank,
  compact = false,
}) => {
  const getScoreColor = (score: number): string => {
    if (score >= 75) return COLORS.success;
    if (score >= 50) return COLORS.warning;
    return COLORS.error;
  };

  const overallColor = getScoreColor(cityScore.overallScore);

  if (compact) {
    return (
      <View style={[styles.compactCard, isCurrentCity && styles.currentCity]}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactCityName}>{cityScore.city.name}</Text>
          {rank && (
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>#{rank}</Text>
            </View>
          )}
        </View>
        <View style={styles.compactScoreRow}>
          <View style={[styles.compactScoreCircle, { borderColor: overallColor }]}>
            <Text style={[styles.compactScoreText, { color: overallColor }]}>
              {cityScore.overallScore}
            </Text>
          </View>
          <View style={styles.compactBars}>
            <View style={styles.miniBar}>
              <View style={[styles.miniBarFill, { width: `${cityScore.financialScore}%`, backgroundColor: COLORS.primary }]} />
            </View>
            <View style={styles.miniBar}>
              <View style={[styles.miniBarFill, { width: `${cityScore.qualityOfLifeScore}%`, backgroundColor: COLORS.secondary }]} />
            </View>
            <View style={styles.miniBar}>
              <View style={[styles.miniBarFill, { width: `${cityScore.careerScore}%`, backgroundColor: COLORS.accent }]} />
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, isCurrentCity && styles.currentCity]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.cityInfo}>
          {isCurrentCity && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>Current</Text>
            </View>
          )}
          <Text style={styles.cityName}>{cityScore.city.name}</Text>
          <Text style={styles.cityLocation}>
            {cityScore.city.state || cityScore.city.country.toUpperCase()}
          </Text>
        </View>
        {rank && (
          <View style={[styles.rankCircle, { borderColor: overallColor }]}>
            <Text style={[styles.rankNumber, { color: overallColor }]}>#{rank}</Text>
          </View>
        )}
      </View>

      {/* Overall Score */}
      <View style={styles.overallScoreContainer}>
        <View style={[styles.overallScoreCircle, { borderColor: overallColor }]}>
          <Text style={[styles.overallScore, { color: overallColor }]}>
            {cityScore.overallScore}
          </Text>
          <Text style={styles.overallScoreLabel}>Overall</Text>
        </View>
      </View>

      {/* Category Scores */}
      <View style={styles.scoresContainer}>
        <ScoreBar
          label="Financial"
          score={cityScore.financialScore}
          icon="cash-outline"
          color={COLORS.primary}
        />
        <ScoreBar
          label="Quality of Life"
          score={cityScore.qualityOfLifeScore}
          icon="heart-outline"
          color={COLORS.secondary}
        />
        <ScoreBar
          label="Mobility"
          score={cityScore.mobilityScore}
          icon="walk-outline"
          color="#8B5CF6"
        />
        <ScoreBar
          label="Career"
          score={cityScore.careerScore}
          icon="briefcase-outline"
          color={COLORS.accent}
        />
        <ScoreBar
          label="Lifestyle"
          score={cityScore.lifestyleScore}
          icon="cafe-outline"
          color="#F59E0B"
        />
      </View>

      {/* Strengths */}
      {cityScore.strengths.length > 0 && (
        <View style={styles.highlights}>
          <Text style={styles.highlightsTitle}>Strengths</Text>
          {cityScore.strengths.map((strength, index) => (
            <View key={index} style={styles.highlightItem}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
              <Text style={styles.highlightText}>{strength}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Weaknesses */}
      {cityScore.weaknesses.length > 0 && (
        <View style={styles.highlights}>
          <Text style={styles.highlightsTitle}>Considerations</Text>
          {cityScore.weaknesses.map((weakness, index) => (
            <View key={index} style={styles.highlightItem}>
              <Ionicons name="alert-circle" size={14} color={COLORS.warning} />
              <Text style={styles.highlightText}>{weakness}</Text>
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
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    ...SHADOWS.md,
  },
  currentCity: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  cityInfo: {
    flex: 1,
  },
  currentBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    marginBottom: SPACING.xs,
  },
  currentBadgeText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    fontWeight: '600',
  },
  cityName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  cityLocation: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    marginTop: 2,
  },
  rankCircle: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
  },
  overallScoreContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  overallScoreCircle: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.offWhite,
  },
  overallScore: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '700',
  },
  overallScoreLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    fontWeight: '500',
  },
  scoresContainer: {
    gap: SPACING.sm,
  },
  scoreBarContainer: {
    marginBottom: SPACING.xs,
  },
  scoreBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  scoreBarLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  scoreBarLabelText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    fontWeight: '500',
  },
  scoreValue: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
  },
  scoreBarTrack: {
    height: 6,
    backgroundColor: COLORS.lightGray,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  highlights: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  highlightsTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.mediumGray,
    marginBottom: SPACING.sm,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  highlightText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    flex: 1,
  },
  // Compact styles
  compactCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  compactCityName: {
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
    color: COLORS.white,
  },
  rankBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  rankText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    fontWeight: '600',
  },
  compactScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  compactScoreCircle: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.offWhite,
  },
  compactScoreText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
  },
  compactBars: {
    flex: 1,
    gap: 4,
  },
  miniBar: {
    height: 4,
    backgroundColor: COLORS.lightGray,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
});

export default ScoreCard;
