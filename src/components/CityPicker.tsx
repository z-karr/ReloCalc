import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SectionList,
  Modal,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { City } from '../types';
import { cities, searchCities, getCitiesByCountry } from '../data/cities';
import { getCountryById } from '../data/countries';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS, LAYOUT } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { isVisaRequired } from '../utils/visaRequirements';

interface CityPickerProps {
  label?: string;
  value: City | null;
  onChange: (city: City) => void;
  placeholder?: string;
}

interface CitySection {
  title: string;
  countryId: string;
  countryCode: string;
  data: City[];
}

export const CityPicker: React.FC<CityPickerProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Select a city...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set(['us']));

  // Get user's home country for dynamic visa requirements
  const { preferences, isLoading } = useUserPreferences();

  // Group cities by country
  const citySections = useMemo((): CitySection[] => {
    const citiesData = searchQuery.trim() ? searchCities(searchQuery) : cities;

    // Group by country
    const grouped = citiesData.reduce((acc, city) => {
      const countryId = city.country || 'us';
      if (!acc[countryId]) {
        acc[countryId] = [];
      }
      acc[countryId].push(city);
      return acc;
    }, {} as Record<string, City[]>);

    // Convert to sections
    return Object.entries(grouped).map(([countryId, cities]) => {
      const country = getCountryById(countryId);
      return {
        title: country?.name || 'Unknown',
        countryId,
        countryCode: country?.code || 'US',
        data: cities.sort((a, b) => a.name.localeCompare(b.name)),
      };
    }).sort((a, b) => a.title.localeCompare(b.title));
  }, [searchQuery]);

  const handleSelect = (city: City) => {
    onChange(city);
    setIsOpen(false);
    setSearchQuery('');
  };

  const toggleCountry = (countryId: string) => {
    setExpandedCountries(prev => {
      const next = new Set(prev);
      if (next.has(countryId)) {
        next.delete(countryId);
      } else {
        next.add(countryId);
      }
      return next;
    });
  };

  const getLocationLabel = (city: City) => {
    // For US cities, show state. For international, show country
    const country = getCountryById(city.country || 'us');
    if (country?.id === 'us' && city.state) {
      return city.state;
    }
    return country?.name || 'Unknown';
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={styles.selector}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.8}
      >
        <View style={styles.selectorContent}>
          {value ? (
            <View style={styles.selectedTextContainer}>
              <Text style={styles.selectedCity}>{value.name}</Text>
              <Text style={styles.selectedState}>{getLocationLabel(value)}</Text>
            </View>
          ) : (
            <Text style={styles.placeholder}>{placeholder}</Text>
          )}
        </View>
        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-down" size={20} color={COLORS.mediumGray} />
        </View>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        animationType={Platform.OS === 'web' ? 'fade' : 'slide'}
        presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
        transparent={Platform.OS === 'web'}
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={[styles.modal, Platform.OS === 'web' && styles.webModalOverlay]}>
          <View style={[Platform.OS === 'web' && styles.webModalContent]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select City</Text>
            <TouchableOpacity
              onPress={() => setIsOpen(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={COLORS.darkGray} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.mediumGray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search cities..."
              placeholderTextColor={COLORS.mediumGray}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={COLORS.mediumGray} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.explainerBanner}>
            <Ionicons name="information-circle-outline" size={16} color={COLORS.info} style={styles.explainerIcon} />
            <Text style={styles.explainerText}>
              <Text style={styles.explainerBold}>COL = Cost of Living Index.</Text> 100 is global average. Higher numbers = more expensive cities.{'\n'}
              <Text style={styles.explainerBold}>Visa badge</Text> indicates a visa may be required based on your home country.
            </Text>
          </View>

          <SectionList
            sections={citySections}
            keyExtractor={(item) => item.id}
            renderSectionHeader={({ section }) => (
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleCountry(section.countryId)}
              >
                <View style={styles.sectionHeaderContent}>
                  <Text style={styles.countryFlag}>{section.countryCode}</Text>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <Text style={styles.sectionCount}>({section.data.length})</Text>
                </View>
                <Ionicons
                  name={expandedCountries.has(section.countryId) ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={COLORS.darkGray}
                />
              </TouchableOpacity>
            )}
            renderItem={({ item, section }) => {
              if (!expandedCountries.has(section.countryId)) {
                return null;
              }

              const country = getCountryById(item.country || 'us');
              const isUS = country?.id === 'us';

              // Check if visa is required based on user's home country
              // Only check if preferences are loaded and we have a home country
              const visaNeeded = !isLoading && preferences.homeCountry
                ? isVisaRequired(preferences.homeCountry, item.country || 'us')
                : false;

              return (
                <TouchableOpacity
                  style={[
                    styles.cityItem,
                    value?.id === item.id && styles.cityItemSelected,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <View style={styles.cityInfo}>
                    <Text style={styles.cityName}>{item.name}</Text>
                    <Text style={styles.cityState}>
                      {isUS ? item.state : country?.name}
                    </Text>
                  </View>
                  <View style={styles.cityStats}>
                    <Text style={styles.colIndex}>
                      COL: {item.costOfLivingIndex.toFixed(0)}
                    </Text>
                    {isUS && (item.stateTaxRate === 0 || item.taxRates.type === 'us_federal_state' && item.taxRates.stateTaxRate === 0) && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>No State Tax</Text>
                      </View>
                    )}
                    {visaNeeded && (
                      <View style={[styles.badge, styles.badgeInfo]}>
                        <Text style={styles.badgeTextInfo}>Visa</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={({ section, leadingItem }) =>
              expandedCountries.has(section.countryId) && leadingItem ? (
                <View style={styles.separator} />
              ) : null
            }
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No cities found</Text>
              </View>
            )}
            stickySectionHeadersEnabled={false}
          />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.base,
  },
  label: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.offWhite,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  selectorContent: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  selectedTextContainer: {
    flexDirection: 'column',
  },
  chevronContainer: {
    alignSelf: 'center',
  },
  selectedCity: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.charcoal,
  },
  selectedState: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    marginTop: 2,
  },
  placeholder: {
    fontSize: FONTS.sizes.base,
    color: COLORS.mediumGray,
  },
  modal: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  webModalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webModalContent: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.charcoal,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.offWhite,
    marginHorizontal: SPACING.base,
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.sizes.base,
    color: COLORS.charcoal,
    paddingVertical: SPACING.md,
    paddingLeft: SPACING.sm,
  },
  explainerBanner: {
    backgroundColor: COLORS.infoLight,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  explainerIcon: {
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  explainerText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    lineHeight: 18,
  },
  explainerBold: {
    fontWeight: '600',
    color: COLORS.info,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  cityItemSelected: {
    backgroundColor: COLORS.infoLight,
  },
  cityInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.charcoal,
  },
  cityState: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    marginTop: 2,
  },
  cityStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  colIndex: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: COLORS.successLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.success,
    fontWeight: '600',
  },
  badgeInfo: {
    backgroundColor: COLORS.infoLight,
  },
  badgeTextInfo: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.info,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginLeft: SPACING.base,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.mediumGray,
  },
  sectionHeader: {
    backgroundColor: COLORS.offWhite,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  countryFlag: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
    color: COLORS.charcoal,
  },
  sectionCount: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    fontWeight: '500',
  },
});
