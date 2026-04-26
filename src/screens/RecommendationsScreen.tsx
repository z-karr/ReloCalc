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
import { Button, Card, CardHeader, CardContent, Input, CityPicker, SliderInput, DataDisclaimer } from '../components';
import { City, UserPreferences, CityRecommendation, Region, Country } from '../types';
import { getTopRecommendations } from '../utils/recommendations';
import { formatCurrency } from '../utils/taxCalculator';
import { getAllCountries } from '../data/countries';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { CurrencyService } from '../utils/currency/exchangeRates';

interface RecommendationsScreenProps {
  navigation: any;
}

export const RecommendationsScreen: React.FC<RecommendationsScreenProps> = ({ navigation }) => {
  // Get currency symbol from user preferences
  const { preferences: userPrefs } = useUserPreferences();
  const currencySymbol = CurrencyService.getCurrency(userPrefs.homeCurrency).symbol;

  const [currentCity, setCurrentCity] = useState<City | null>(null);
  const [salary, setSalary] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showRegionFilter, setShowRegionFilter] = useState(false);
  const [showCountryFilter, setShowCountryFilter] = useState(false);
  const [displayCount, setDisplayCount] = useState(10);

  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({
    prioritizeCost: 5,
    prioritizeSafety: 5,
    prioritizeTransit: 5,
    prioritizeOutdoors: 5,
    prioritizeEntertainment: 5,
    prioritizeHealthcare: 5,
    prioritizeEducation: 5,
    regionFilter: 'all',
    countryFilter: 'all',
  });

  // Reset results when current city or salary changes
  React.useEffect(() => {
    if (showResults) {
      setShowResults(false);
      setDisplayCount(10);
    }
  }, [currentCity, salary]);

  const parsedSalary = useMemo(() => {
    const cleaned = salary.replace(/[^0-9]/g, '');
    return parseInt(cleaned, 10) || 0;
  }, [salary]);

  const allRecommendations = useMemo(() => {
    if (!showResults) return [];
    // Get all recommendations (up to a reasonable max like 50)
    return getTopRecommendations(currentCity, parsedSalary, preferences, 50);
  }, [currentCity, parsedSalary, preferences, showResults]);

  const displayedRecommendations = allRecommendations.slice(0, displayCount);
  const hasMoreResults = displayCount < allRecommendations.length;

  const handleFindCities = () => {
    setShowResults(true);
    setDisplayCount(10); // Reset to initial 10 results
  };

  const handleShowMore = () => {
    setDisplayCount(prev => prev + 10);
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

  // Region filter management
  const toggleRegion = (region: Region) => {
    setPreferences(prev => {
      const currentFilter = prev.regionFilter;

      // If 'all', switch to array with just this region
      if (currentFilter === 'all' || !currentFilter) {
        return { ...prev, regionFilter: [region], countryFilter: 'all' }; // Reset country filter
      }

      // If array, toggle the region
      if (Array.isArray(currentFilter)) {
        const newFilter = currentFilter.includes(region)
          ? currentFilter.filter(r => r !== region)
          : [...currentFilter, region];

        // If empty after removal, set to 'all' and reset country filter
        if (newFilter.length === 0) {
          return { ...prev, regionFilter: 'all', countryFilter: 'all' };
        }

        return { ...prev, regionFilter: newFilter, countryFilter: 'all' }; // Reset country filter on change
      }

      return prev;
    });
  };

  const isRegionSelected = (region: Region): boolean => {
    const filter = preferences.regionFilter;
    if (filter === 'all' || !filter) return true;
    return Array.isArray(filter) && filter.includes(region);
  };

  const clearRegionFilter = () => {
    setPreferences(prev => ({ ...prev, regionFilter: 'all', countryFilter: 'all' }));
  };

  // Country filter management
  const toggleCountry = (countryId: string) => {
    setPreferences(prev => {
      const currentFilter = prev.countryFilter;

      // If 'all', switch to array with just this country
      if (currentFilter === 'all' || !currentFilter) {
        return { ...prev, countryFilter: [countryId] };
      }

      // If array, toggle the country
      if (Array.isArray(currentFilter)) {
        const newFilter = currentFilter.includes(countryId)
          ? currentFilter.filter(c => c !== countryId)
          : [...currentFilter, countryId];

        // If empty after removal, set to 'all'
        return { ...prev, countryFilter: newFilter.length === 0 ? 'all' : newFilter };
      }

      return prev;
    });
  };

  const isCountrySelected = (countryId: string): boolean => {
    const filter = preferences.countryFilter;
    if (filter === 'all' || !filter) return true;
    return Array.isArray(filter) && filter.includes(countryId);
  };

  const clearCountryFilter = () => {
    setPreferences(prev => ({ ...prev, countryFilter: 'all' }));
  };

  // Region labels and icons
  const regionInfo: Record<Region, { label: string; icon: string }> = {
    north_america: { label: 'North America', icon: 'location' },
    europe: { label: 'Europe', icon: 'earth' },
    asia_pacific: { label: 'Asia Pacific', icon: 'partly-sunny' },
    latin_america: { label: 'Latin America', icon: 'leaf' },
    middle_east: { label: 'Middle East', icon: 'moon' },
    africa: { label: 'Africa', icon: 'sunny' },
    oceania: { label: 'Oceania', icon: 'water' },
  };

  // Get available countries based on selected regions
  const getAvailableCountries = (): Country[] => {
    const regionFilter = preferences.regionFilter;

    // If 'all' or no filter, don't show country filter
    if (regionFilter === 'all' || !regionFilter) {
      return [];
    }

    // Get all countries
    const allCountries = getAllCountries();

    // Filter by selected regions
    if (Array.isArray(regionFilter) && regionFilter.length > 0) {
      return allCountries.filter(country => regionFilter.includes(country.region));
    }

    return [];
  };

  const availableCountries = getAvailableCountries();
  const shouldShowCountryFilter = availableCountries.length > 0;

  // Country flag emoji mapping
  const countryFlags: Record<string, string> = {
    us: '🇺🇸', ca: '🇨🇦', mx: '🇲🇽',
    gb: '🇬🇧', de: '🇩🇪', fr: '🇫🇷', es: '🇪🇸', it: '🇮🇹', pt: '🇵🇹',
    nl: '🇳🇱', be: '🇧🇪', ie: '🇮🇪', ch: '🇨🇭', se: '🇸🇪', no: '🇳🇴',
    dk: '🇩🇰', pl: '🇵🇱', cz: '🇨🇿', gr: '🇬🇷',
    au: '🇦🇺', nz: '🇳🇿',
    jp: '🇯🇵', kr: '🇰🇷', cn: '🇨🇳', sg: '🇸🇬', tw: '🇹🇼', th: '🇹🇭',
    in: '🇮🇳', vn: '🇻🇳', id: '🇮🇩', ph: '🇵🇭',
    ar: '🇦🇷', br: '🇧🇷', cl: '🇨🇱', cr: '🇨🇷', sv: '🇸🇻', gt: '🇬🇹',
    ae: '🇦🇪', za: '🇿🇦', ma: '🇲🇦',
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
              prefix={currencySymbol}
              helper="We'll calculate equivalent salaries"
            />

            <TouchableOpacity
              style={styles.preferencesToggle}
              onPress={() => setShowRegionFilter(!showRegionFilter)}
            >
              <View style={styles.preferencesToggleContent}>
                <Ionicons
                  name="earth-outline"
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.preferencesToggleText}>
                  Filter by Region
                </Text>
                {preferences.regionFilter !== 'all' && Array.isArray(preferences.regionFilter) && preferences.regionFilter.length > 0 && (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>{preferences.regionFilter.length}</Text>
                  </View>
                )}
              </View>
              <Ionicons
                name={showRegionFilter ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={COLORS.mediumGray}
              />
            </TouchableOpacity>

            {showRegionFilter && (
              <View style={styles.regionFilterSection}>
                <View style={styles.regionFilterHeader}>
                  <Text style={styles.regionFilterTitle}>Select Regions</Text>
                  {preferences.regionFilter !== 'all' && (
                    <TouchableOpacity onPress={clearRegionFilter}>
                      <Text style={styles.clearFilterText}>Show All</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.regionChips}>
                  {(Object.keys(regionInfo) as Region[]).map(region => {
                    const selected = isRegionSelected(region);
                    const allSelected = preferences.regionFilter === 'all';
                    return (
                      <TouchableOpacity
                        key={region}
                        style={[
                          styles.regionChip,
                          (selected && !allSelected) && styles.regionChipSelected,
                        ]}
                        onPress={() => toggleRegion(region)}
                      >
                        <Ionicons
                          name={regionInfo[region].icon as any}
                          size={16}
                          color={(selected && !allSelected) ? COLORS.white : COLORS.mediumGray}
                        />
                        <Text
                          style={[
                            styles.regionChipText,
                            (selected && !allSelected) && styles.regionChipTextSelected,
                          ]}
                        >
                          {regionInfo[region].label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {shouldShowCountryFilter && (
              <>
                <TouchableOpacity
                  style={styles.preferencesToggle}
                  onPress={() => setShowCountryFilter(!showCountryFilter)}
                >
                  <View style={styles.preferencesToggleContent}>
                    <Ionicons
                      name="flag-outline"
                      size={20}
                      color={COLORS.primary}
                    />
                    <Text style={styles.preferencesToggleText}>
                      Filter by Country
                    </Text>
                    {preferences.countryFilter !== 'all' && Array.isArray(preferences.countryFilter) && preferences.countryFilter.length > 0 && (
                      <View style={styles.filterBadge}>
                        <Text style={styles.filterBadgeText}>{preferences.countryFilter.length}</Text>
                      </View>
                    )}
                  </View>
                  <Ionicons
                    name={showCountryFilter ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={COLORS.mediumGray}
                  />
                </TouchableOpacity>

                {showCountryFilter && (
                  <View style={styles.regionFilterSection}>
                    <View style={styles.regionFilterHeader}>
                      <Text style={styles.regionFilterTitle}>Select Countries</Text>
                      {preferences.countryFilter !== 'all' && (
                        <TouchableOpacity onPress={clearCountryFilter}>
                          <Text style={styles.clearFilterText}>Show All</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={styles.regionChips}>
                      {availableCountries.map(country => {
                        const selected = isCountrySelected(country.id);
                        const allSelected = preferences.countryFilter === 'all';
                        return (
                          <TouchableOpacity
                            key={country.id}
                            style={[
                              styles.regionChip,
                              (selected && !allSelected) && styles.regionChipSelected,
                            ]}
                            onPress={() => toggleCountry(country.id)}
                          >
                            <Text style={styles.countryFlag}>{countryFlags[country.id] || '🏳️'}</Text>
                            <Text
                              style={[
                                styles.regionChipText,
                                (selected && !allSelected) && styles.regionChipTextSelected,
                              ]}
                            >
                              {country.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}
              </>
            )}

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
        {showResults && allRecommendations.length > 0 && (
          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>Top Recommendations</Text>
              <Text style={styles.resultsCount}>
                Showing {displayedRecommendations.length} of {allRecommendations.length}
              </Text>
            </View>

            {displayedRecommendations.map((rec, index) => (
              <RecommendationCard
                key={rec.city.id}
                recommendation={rec}
                rank={index + 1}
                showSalary={parsedSalary > 0}
              />
            ))}

            {hasMoreResults && (
              <View style={styles.showMoreContainer}>
                <Button
                  title="Show 10 More Cities"
                  onPress={handleShowMore}
                  variant="secondary"
                  fullWidth
                />
              </View>
            )}
          </View>
        )}

        {/* No results message */}
        {showResults && allRecommendations.length === 0 && (
          <Card style={styles.inputCard}>
            <CardContent>
              <Text style={styles.noResultsText}>
                No cities match your criteria. Try adjusting your preferences.
              </Text>
            </CardContent>
          </Card>
        )}

        {/* Data Disclaimer - show when results are displayed */}
        {showResults && allRecommendations.length > 0 && (
          <View style={styles.disclaimerContainer}>
            <DataDisclaimer variant="inline" />
          </View>
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
    backgroundColor: COLORS.primaryDark,
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
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
    color: COLORS.info,
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
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginLeft: SPACING.xs,
    marginRight: SPACING.xs,
  },
  resultsTitle: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: COLORS.mediumGray,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  resultsCount: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.info,
  },
  showMoreContainer: {
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
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
    color: COLORS.white,
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
    color: COLORS.info,
  },
  matchScoreLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.info,
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
    color: COLORS.white,
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
    color: COLORS.mediumGray,
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
  disclaimerContainer: {
    marginHorizontal: SPACING.base,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  filterBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: SPACING.xs,
  },
  filterBadgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
  regionFilterSection: {
    marginTop: SPACING.base,
    paddingTop: SPACING.base,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  regionFilterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  regionFilterTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  clearFilterText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.info,
  },
  regionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  regionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.offWhite,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  regionChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  regionChipText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.mediumGray,
  },
  regionChipTextSelected: {
    color: COLORS.white,
  },
  countryFlag: {
    fontSize: 16,
  },
});
