/**
 * City Detail Selector
 * Tab/pill selector for choosing which city's detailed analysis to view
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';
import { City } from '../../types';

// ============================================================================
// TYPES
// ============================================================================

interface CityDetailSelectorProps {
  cities: City[];
  selectedIndex: number;
  onSelectCity: (index: number) => void;
  label?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CityDetailSelector: React.FC<CityDetailSelectorProps> = ({
  cities,
  selectedIndex,
  onSelectCity,
  label = 'View Detailed Analysis',
}) => {
  if (cities.length <= 1) {
    return null; // Don't show selector for single city
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {cities.map((city, index) => {
          const isSelected = index === selectedIndex;

          return (
            <TouchableOpacity
              key={city.id}
              style={[
                styles.tab,
                isSelected && styles.tabSelected,
              ]}
              onPress={() => onSelectCity(index)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isSelected ? 'location' : 'location-outline'}
                size={16}
                color={isSelected ? COLORS.white : COLORS.darkGray}
              />
              <Text
                style={[
                  styles.tabText,
                  isSelected && styles.tabTextSelected,
                ]}
                numberOfLines={1}
              >
                {city.name}
              </Text>
              {isSelected && (
                <View style={styles.activeDot} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.base,
    marginTop: SPACING.md,
  },
  label: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.offWhite,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    gap: SPACING.xs,
  },
  tabSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.darkGray,
  },
  tabTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.secondary,
    marginLeft: SPACING.xs,
  },
});

export default CityDetailSelector;
