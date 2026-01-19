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
import { Button, Card, CardHeader, CardContent, Input, CityPicker, SliderInput } from '../components';
import { City, UserPreferences, CityRecommendation } from '../types';
import { getTopRecommendations } from '../utils/recommendations';
import { formatCurrency } from '../utils/taxCalculator';

interface RecommendationsScreenProps {
  navigation: any;
}

export const RecommendationsScreen: React.FC<RecommendationsScreenProps> = ({ navigation }) => {
  const [currentCity, setCurrentCity] = useState<City | null>(null);
  const [salary, setSalary] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({
    prioritizeCost: 5,
    prioritizeSafety: 5,
    prioritizeTransit: 5,
    prioritizeOutdoors: 5,
    prioritizeEntertainment: 5,
    prioritizeHealthcare: 5,
    prioritizeEducation: 5,
  });

  // Reset results when current city or salary changes
  React.useEffect(() => {
    if (showResults) {
      setShowResults(false);
    }
  }, [currentCity, salary]);

  const parsedSalary = useMemo(() => {
    const cleaned = salary.replace(/[^0-9]/g, '');
    return parseInt(cleaned, 10) || 0;
  }, [salary]);

  const recommendations = useMemo(() => {
    if (!showResults) return [];
    return getTopRecommendations(currentCity, parsedSalary, preferences, 10);
  }, [currentCity, parsedSalary, preferences, showResults]);

  const handleFindCities = () => {
    setShowResults(true);
  };

  const formatSalaryInput = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned === '') return '';
    const num = parseInt(cleaned, 10);
    return num.toLocaleString('en-US');
  };

  const updatePreference = (key: keyof UserPreferences, value: number) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  // Better importance scale with more granular labels
  const getImportanceLabel = (value: number): string => {
    if (value <= 2) return 'Not Important';
    if (value <= 4) return 'Somewhat Important';
    if (value <= 6) return 'Important';
    if (value <= 8) return 'Very Important';
    return 'Extremely Important';
  };

  // Color scale from cool (gray) to warm (red) showing increasing importance
  const getImportanceColor = (value: number): string => {
    if (value <= 2) return COLORS.mediumGray; // Not Important - neutral gray
    if (value <= 4) return COLORS.info; // Somewhat Important - blue
    if (value <= 6) return COLORS.warning; // Important - orange
    if (value <= 8) return '#E67E22'; // Very Important - darker orange
    return COLORS.error; // Extremely Important - red
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {/* Input Section */}
        <Card style={styles.inputCard}>
          <CardHeader 
            title="Your Profile" 
            subtitle="Tell us about yourself"
          />
          <CardContent>
            <CityPicker
              label="Current City (Optional)"
              value={currentCity}
              onChange={setCurrentCity}
              placeholder="Where do you live now?"
            />

            <Input
              label="Current Salary (Optional)"
              value={salary}
              onChangeText={(text) => setSalary(formatSalaryInput(text))}
              keyboardType="numeric"
              placeholder="100,000"
              prefix="$"
              helper="We'll calculate equivalent salaries"
            />

            <TouchableOpacity
              style={styles.preferencesToggle}
              onPress={() => setShowPreferences(!showPreferences)}
            >
              <View style={styles.preferencesToggleContent}>
                <Ionicons 
                  name="options-outline" 
                  size={20} 
                  color={COLORS.primary} 
                />
                <Text style={styles.preferencesToggleText}>
                  Customize Preferences
                </Text>
              </View>
              <Ionicons 
                name={showPreferences ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color={COLORS.mediumGray} 
              />
            </TouchableOpacity>

            {showPreferences && (
              <View style={styles.preferencesSection}>
                <SliderInput
                  label="Cost of Living"
                  icon="cash-outline"
                  value={preferences.prioritizeCost || 5}
                  onChange={(v) => updatePreference('prioritizeCost', v)}
                  min={1}
                  max={10}
                  formatValue={getImportanceLabel}
                  valueColor={getImportanceColor(preferences.prioritizeCost || 5)}
                />
                <SliderInput
                  label="Safety"
                  icon="shield-checkmark-outline"
                  value={preferences.prioritizeSafety || 5}
                  onChange={(v) => updatePreference('prioritizeSafety', v)}
                  min={1}
                  max={10}
                  formatValue={getImportanceLabel}
                  valueColor={getImportanceColor(preferences.prioritizeSafety || 5)}
                />
                <SliderInput
                  label="Public Transit"
                  icon="bus-outline"
                  value={preferences.prioritizeTransit || 5}
                  onChange={(v) => updatePreference('prioritizeTransit', v)}
                  min={1}
                  max={10}
                  formatValue={getImportanceLabel}
                  valueColor={getImportanceColor(preferences.prioritizeTransit || 5)}
                />
                <SliderInput
                  label="Outdoor Recreation"
                  icon="leaf-outline"
                  value={preferences.prioritizeOutdoors || 5}
                  onChange={(v) => updatePreference('prioritizeOutdoors', v)}
                  min={1}
                  max={10}
                  formatValue={getImportanceLabel}
                  valueColor={getImportanceColor(preferences.prioritizeOutdoors || 5)}
                />
                <SliderInput
                  label="Entertainment & Nightlife"
                  icon="musical-notes-outline"
                  value={preferences.prioritizeEntertainment || 5}
                  onChange={(v) => updatePreference('prioritizeEntertainment', v)}
                  min={1}
                  max={10}
                  formatValue={getImportanceLabel}
                  valueColor={getImportanceColor(preferences.prioritizeEntertainment || 5)}
                />
                <SliderInput
                  label="Healthcare Quality"
                  icon="medical-outline"
                  value={preferences.prioritizeHealthcare || 5}
                  onChange={(v) => updatePreference('prioritizeHealthcare', v)}
                  min={1}
                  max={10}
                  formatValue={getImportanceLabel}
                  valueColor={getImportanceColor(preferences.prioritizeHealthcare || 5)}
                />
                <SliderInput
                  label="Education"
                  icon="school-outline"
                  value={preferences.prioritizeEducation || 5}
                  onChange={(v) => updatePreference('prioritizeEducation', v)}
                  min={1}
                  max={10}
                  formatValue={getImportanceLabel}
                  valueColor={getImportanceColor(preferences.prioritizeEducation || 5)}
                />
              </View>
            )}

            <Button
              title="Find My Ideal Cities"
              onPress={handleFindCities}
              fullWidth
              style={styles.findButton}
            />
          </CardContent>
        </Card>

        {/* Results */}
        {showResults && recommendations.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>Top Recommendations</Text>

            {recommendations.map((rec, index) => (
              <RecommendationCard
                key={rec.city.id}
                recommendation={rec}
                rank={index + 1}
                showSalary={parsedSalary > 0}
              />
            ))}
          </View>
        )}

        {/* No results message */}
        {showResults && recommendations.length === 0 && (
          <Card style={styles.inputCard}>
            <CardContent>
              <Text style={styles.noResultsText}>
                No cities match your criteria. Try adjusting your preferences.
              </Text>
            </CardContent>
          </Card>
        )}

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
};

interface RecommendationCardProps {
  recommendation: CityRecommendation;
  rank: number;
  showSalary: boolean;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ 
  recommendation, 
  rank,
  showSalary 
}) => {
  const { city, matchScore, highlights, considerations, salaryNeeded } = recommendation;

  const getRankColor = () => {
    if (rank === 1) return COLORS.warning;
    if (rank === 2) return COLORS.mediumGray;
    if (rank === 3) return '#CD7F32';
    return COLORS.lightGray;
  };

  return (
    <Card style={styles.recCard}>
      <View style={styles.recHeader}>
        <View style={[styles.rankBadge, { backgroundColor: getRankColor() + '20' }]}>
          <Text style={[styles.rankText, { color: getRankColor() }]}>#{rank}</Text>
        </View>
        <View style={styles.recTitleSection}>
          <Text style={styles.recCityName}>{city.name}</Text>
          {city.state && <Text style={styles.recState}>{city.state}</Text>}
          {city.countryCode && city.countryCode !== 'US' && (
            <Text style={styles.recState}>{city.countryCode}</Text>
          )}
        </View>
        <View style={styles.matchScore}>
          <Text style={styles.matchScoreValue}>{Math.round(matchScore)}</Text>
          <Text style={styles.matchScoreLabel}>Match</Text>
        </View>
      </View>

      <View style={styles.recStats}>
        <View style={styles.recStatItem}>
          <Text style={styles.recStatLabel}>COL Index</Text>
          <Text style={styles.recStatValue}>{city.costOfLivingIndex.toFixed(0)}</Text>
        </View>
        <View style={styles.recStatItem}>
          <Text style={styles.recStatLabel}>Walk Score</Text>
          <Text style={styles.recStatValue}>{city.walkScore}</Text>
        </View>
        <View style={styles.recStatItem}>
          <Text style={styles.recStatLabel}>Transit</Text>
          <Text style={styles.recStatValue}>{city.transitScore}</Text>
        </View>
        <View style={styles.recStatItem}>
          <Text style={styles.recStatLabel}>Median Rent</Text>
          <Text style={styles.recStatValue}>${city.medianRent.toLocaleString()}</Text>
        </View>
      </View>

      {showSalary && (
        <View style={styles.salaryNeeded}>
          <Ionicons name="cash-outline" size={16} color={COLORS.info} />
          <Text style={styles.salaryNeededText}>
            Equivalent salary needed: <Text style={styles.salaryNeededValue}>{formatCurrency(salaryNeeded)}</Text>
          </Text>
        </View>
      )}

      {highlights.length > 0 && (
        <View style={styles.highlights}>
          {highlights.map((highlight, i) => (
            <View key={i} style={styles.highlightTag}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
              <Text style={styles.highlightText}>{highlight}</Text>
            </View>
          ))}
        </View>
      )}

      {considerations.length > 0 && (
        <View style={styles.considerations}>
          {considerations.map((consideration, i) => (
            <View key={i} style={styles.considerationTag}>
              <Ionicons name="alert-circle" size={14} color={COLORS.warning} />
              <Text style={styles.considerationText}>{consideration}</Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.base,
  },
  inputCard: {
    marginBottom: SPACING.base,
  },
  preferencesToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.offWhite,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },
  preferencesToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  preferencesToggleText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.primary,
  },
  preferencesSection: {
    marginTop: SPACING.base,
    paddingTop: SPACING.base,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  findButton: {
    marginTop: SPACING.lg,
  },
  resultsSection: {
    marginTop: SPACING.sm,
  },
  resultsTitle: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: COLORS.mediumGray,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: SPACING.md,
    marginLeft: SPACING.xs,
  },
  recCard: {
    marginBottom: SPACING.md,
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  rankText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
  },
  recTitleSection: {
    flex: 1,
  },
  recCityName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.charcoal,
  },
  recState: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
  },
  matchScore: {
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  matchScoreValue: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  matchScoreLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    opacity: 0.8,
  },
  recStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  recStatItem: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: COLORS.offWhite,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  recStatLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
  },
  recStatValue: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.charcoal,
    marginTop: 2,
  },
  salaryNeeded: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.infoLight,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
  },
  salaryNeededText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
  },
  salaryNeededValue: {
    fontWeight: '700',
    color: COLORS.info,
  },
  highlights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  highlightTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: COLORS.successLight,
    borderRadius: RADIUS.sm,
  },
  highlightText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.success,
    fontWeight: '500',
  },
  considerations: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  considerationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: COLORS.warningLight,
    borderRadius: RADIUS.sm,
  },
  considerationText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.warning,
    fontWeight: '500',
  },
  noResultsText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.mediumGray,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
  footer: {
    height: SPACING.xxl,
  },
});
