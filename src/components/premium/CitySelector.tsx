import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme';
import { City } from '../../types';
import { CityPicker } from '../CityPicker';
import { Input } from '../Input';
import { useUserPreferences } from '../../context/UserPreferencesContext';
import { CurrencyService } from '../../utils/currency/exchangeRates';

// ============================================================================
// TYPES
// ============================================================================

interface SelectedCity {
  city: City;
  salary: number;
}

interface CitySelectorProps {
  currentCity: City | null;
  currentSalary: number;
  selectedCities: SelectedCity[];
  onCurrentCityChange: (city: City) => void;
  onCurrentSalaryChange: (salary: number) => void;
  onAddCity: (city: City, salary: number) => void;
  onRemoveCity: (index: number) => void;
  onUpdateSalary: (index: number, salary: number) => void;
  maxCities?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CitySelector: React.FC<CitySelectorProps> = ({
  currentCity,
  currentSalary,
  selectedCities,
  onCurrentCityChange,
  onCurrentSalaryChange,
  onAddCity,
  onRemoveCity,
  onUpdateSalary,
  maxCities = 5,
}) => {
  const [showAddCity, setShowAddCity] = useState(false);
  const [newCity, setNewCity] = useState<City | null>(null);
  const [newSalary, setNewSalary] = useState<string>('');

  // Get currency symbol from user preferences
  const { preferences } = useUserPreferences();
  const currencySymbol = CurrencyService.getCurrency(preferences.homeCurrency).symbol;

  const canAddMore = selectedCities.length < maxCities - 1; // -1 because current city counts

  const handleAddCity = () => {
    if (newCity && newSalary) {
      const salary = parseInt(newSalary.replace(/,/g, ''), 10);
      if (salary > 0) {
        onAddCity(newCity, salary);
        setNewCity(null);
        setNewSalary('');
        setShowAddCity(false);
      }
    }
  };

  const formatSalary = (value: string): string => {
    const num = value.replace(/\D/g, '');
    return num ? parseInt(num, 10).toLocaleString() : '';
  };

  const renderCityCard = (
    city: City,
    salary: number,
    index: number,
    isCurrent: boolean = false
  ) => (
    <View key={city.id} style={[styles.cityCard, isCurrent && styles.currentCityCard]}>
      <View style={styles.cityCardHeader}>
        <View style={styles.cityInfo}>
          {isCurrent && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>Current</Text>
            </View>
          )}
          <Text style={styles.cityName}>{city.name}</Text>
          <Text style={styles.cityLocation}>
            {city.state || city.country.toUpperCase()}
          </Text>
        </View>
        {!isCurrent && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => onRemoveCity(index)}
          >
            <Ionicons name="close-circle" size={24} color={COLORS.error} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.salaryRow}>
        <Text style={styles.salaryLabel}>
          {isCurrent ? 'Current Salary' : 'Expected Salary'}
        </Text>
        <View style={styles.salaryInputContainer}>
          <Text style={styles.currencySymbol}>{currencySymbol}</Text>
          <Input
            value={salary.toLocaleString()}
            onChangeText={(text) => {
              const num = parseInt(text.replace(/\D/g, ''), 10) || 0;
              if (isCurrent) {
                onCurrentSalaryChange(num);
              } else {
                onUpdateSalary(index, num);
              }
            }}
            keyboardType="numeric"
            style={styles.salaryInput}
          />
        </View>
      </View>

      <View style={styles.cityStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>COL Index</Text>
          <Text style={styles.statValue}>{city.costOfLivingIndex}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Rent</Text>
          <Text style={styles.statValue}>${city.medianRent.toLocaleString()}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Home Price</Text>
          <Text style={styles.statValue}>
            ${(city.medianHomePrice / 1000).toFixed(0)}K
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Current City */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Current Location</Text>
        {currentCity ? (
          renderCityCard(currentCity, currentSalary, -1, true)
        ) : (
          <View style={styles.addCityPrompt}>
            <CityPicker
              label="Select your current city"
              value={null}
              onChange={onCurrentCityChange}
              placeholder="Choose your current city..."
            />
          </View>
        )}
      </View>

      {/* Target Cities */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Cities to Compare</Text>
          <Text style={styles.cityCount}>
            {selectedCities.length + 1}/{maxCities}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.citiesScroll}
        >
          {selectedCities.map((item, index) =>
            renderCityCard(item.city, item.salary, index)
          )}

          {/* Add City Button */}
          {canAddMore && !showAddCity && (
            <TouchableOpacity
              style={styles.addCityCard}
              onPress={() => setShowAddCity(true)}
            >
              <View style={styles.addIconContainer}>
                <Ionicons name="add" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.addCityText}>Add City</Text>
              <Text style={styles.addCitySubtext}>
                Compare up to {maxCities} cities
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Add City Form */}
      {showAddCity && (
        <View style={styles.addCityForm}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Add City to Compare</Text>
            <TouchableOpacity onPress={() => setShowAddCity(false)}>
              <Ionicons name="close" size={24} color={COLORS.darkGray} />
            </TouchableOpacity>
          </View>

          <CityPicker
            label="City"
            value={newCity}
            onChange={setNewCity}
            placeholder="Search for a city..."
          />

          <View style={styles.salaryInputRow}>
            <Text style={styles.inputLabel}>Expected Salary</Text>
            <View style={styles.salaryInputContainer}>
              <Text style={styles.currencySymbol}>{currencySymbol}</Text>
              <Input
                value={newSalary}
                onChangeText={(text) => setNewSalary(formatSalary(text))}
                keyboardType="numeric"
                placeholder="e.g., 120,000"
                style={styles.salaryInput}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.addButton,
              (!newCity || !newSalary) && styles.addButtonDisabled,
            ]}
            onPress={handleAddCity}
            disabled={!newCity || !newSalary}
          >
            <Ionicons name="add-circle" size={20} color={COLORS.white} />
            <Text style={styles.addButtonText}>Add to Comparison</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Minimum cities warning */}
      {selectedCities.length === 0 && currentCity && (
        <View style={styles.warningBanner}>
          <Ionicons name="information-circle" size={20} color={COLORS.info} />
          <Text style={styles.warningText}>
            Add at least one city to compare against your current location
          </Text>
        </View>
      )}
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const CARD_WIDTH = 200;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.charcoal,
  },
  cityCount: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    fontWeight: '500',
  },
  citiesScroll: {
    paddingRight: SPACING.base,
    gap: SPACING.md,
  },
  cityCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    ...SHADOWS.sm,
  },
  currentCityCard: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: COLORS.infoLight,
  },
  cityCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
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
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.charcoal,
  },
  cityLocation: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    marginTop: 2,
  },
  removeButton: {
    padding: SPACING.xs,
    marginTop: -SPACING.xs,
    marginRight: -SPACING.xs,
  },
  salaryRow: {
    marginBottom: SPACING.sm,
  },
  salaryLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    marginBottom: SPACING.xs,
  },
  salaryInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.offWhite,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
  },
  currencySymbol: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  salaryInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.charcoal,
    paddingVertical: SPACING.sm,
  },
  cityStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: SPACING.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
  },
  statValue: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.charcoal,
    marginTop: 2,
  },
  addCityCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.offWhite,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  addIconContainer: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  addCityText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  addCitySubtext: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    marginTop: SPACING.xs,
  },
  addCityForm: {
    backgroundColor: COLORS.offWhite,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    marginBottom: SPACING.md,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  formTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.charcoal,
  },
  salaryInputRow: {
    marginTop: SPACING.md,
  },
  inputLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  addButtonDisabled: {
    backgroundColor: COLORS.mediumGray,
  },
  addButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.white,
  },
  addCityPrompt: {
    backgroundColor: COLORS.offWhite,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.infoLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  warningText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.info,
  },
});

export default CitySelector;
