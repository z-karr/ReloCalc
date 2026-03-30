import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  SectionList,
} from 'react-native';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { getAllCountries, getCountryById } from '../data/countries';
import { COLORS, FONTS, SPACING, RADIUS } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { DATA_LAST_UPDATED } from '../components/DataDisclaimer';

export const SettingsScreen = () => {
  const { preferences, updateHomeCountry, updateCurrencyDisplayMode, resetToAutoDetected } = useUserPreferences();
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const currentCountry = getCountryById(preferences.homeCountry);
  const allCountries = getAllCountries();

  // Group countries by region for the picker
  const countryByRegion = allCountries.reduce((acc, country) => {
    if (!acc[country.region]) {
      acc[country.region] = [];
    }
    acc[country.region].push(country);
    return acc;
  }, {} as Record<string, typeof allCountries>);

  const countrySections = Object.entries(countryByRegion).map(([region, countries]) => ({
    title: region.replace(/_/g, ' ').toUpperCase(),
    data: countries.sort((a, b) => a.name.localeCompare(b.name)),
  }));

  const handleCountrySelect = async (countryId: string) => {
    await updateHomeCountry(countryId);
    setShowCountryPicker(false);
  };

  const handleReset = async () => {
    await resetToAutoDetected();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Home Country</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setShowCountryPicker(true)}
        >
          <View style={styles.selectorContent}>
            <Text style={styles.countryFlag}>{currentCountry?.code}</Text>
            <Text style={styles.countryName}>{currentCountry?.name}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
        </TouchableOpacity>
        {preferences.autoDetected && (
          <Text style={styles.helperText}>
            Auto-detected from your device
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Currency Display</Text>
        <TouchableOpacity
          style={styles.radioOption}
          onPress={() => updateCurrencyDisplayMode('usd_first')}
        >
          <View style={styles.radioButton}>
            {preferences.currencyDisplayMode === 'usd_first' && (
              <View style={styles.radioButtonInner} />
            )}
          </View>
          <View style={styles.radioContent}>
            <Text style={styles.radioLabel}>USD first</Text>
            <Text style={styles.radioDescription}>
              Show $75,000 (€69,000)
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.radioOption}
          onPress={() => updateCurrencyDisplayMode('home_first')}
        >
          <View style={styles.radioButton}>
            {preferences.currencyDisplayMode === 'home_first' && (
              <View style={styles.radioButtonInner} />
            )}
          </View>
          <View style={styles.radioContent}>
            <Text style={styles.radioLabel}>My currency first</Text>
            <Text style={styles.radioDescription}>
              Show {currentCountry?.currency.symbol}69,000 ($75,000)
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Info</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Home Currency: {currentCountry?.currency.name} ({currentCountry?.currency.code})
          </Text>
          <Text style={styles.infoText}>
            Visa badges will reflect requirements for {currentCountry?.name} citizens
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Sources</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Data as of {DATA_LAST_UPDATED}
          </Text>
          <Text style={styles.infoText}>
            Cost of living data sourced from Numbeo. Tax rates reflect current federal, state, and local regulations. Housing prices based on median market data.
          </Text>
          <Text style={[styles.infoText, styles.disclaimerNote]}>
            All figures are estimates for planning purposes.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.resetButton}
        onPress={handleReset}
      >
        <Ionicons name="refresh" size={20} color={COLORS.primary} />
        <Text style={styles.resetButtonText}>Reset to Auto-Detected</Text>
      </TouchableOpacity>

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Home Country</Text>
            <TouchableOpacity
              onPress={() => setShowCountryPicker(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={COLORS.darkGray} />
            </TouchableOpacity>
          </View>

          <SectionList
            sections={countrySections}
            keyExtractor={(item) => item.id}
            renderSectionHeader={({ section }) => (
              <View style={styles.regionHeader}>
                <Text style={styles.regionTitle}>{section.title}</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.countryItem,
                  item.id === preferences.homeCountry && styles.countryItemSelected,
                ]}
                onPress={() => handleCountrySelect(item.id)}
              >
                <Text style={styles.countryItemFlag}>{item.code}</Text>
                <Text style={styles.countryItemName}>{item.name}</Text>
                {item.id === preferences.homeCountry && (
                  <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            )}
            stickySectionHeadersEnabled={false}
          />
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  section: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.offWhite,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  countryFlag: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
  },
  countryName: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.charcoal,
  },
  helperText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    marginTop: SPACING.sm,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  radioContent: {
    flex: 1,
  },
  radioLabel: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.charcoal,
    marginBottom: 2,
  },
  radioDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
  },
  infoBox: {
    backgroundColor: COLORS.infoLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  infoText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  disclaimerNote: {
    fontStyle: 'italic',
    marginTop: SPACING.xs,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.base,
    marginVertical: SPACING.lg,
    paddingVertical: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
  },
  resetButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.primary,
  },
  modal: {
    flex: 1,
    backgroundColor: COLORS.white,
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
  regionHeader: {
    backgroundColor: COLORS.offWhite,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  regionTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.darkGray,
    letterSpacing: 0.5,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  countryItemSelected: {
    backgroundColor: COLORS.infoLight,
  },
  countryItemFlag: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
  },
  countryItemName: {
    flex: 1,
    fontSize: FONTS.sizes.base,
    color: COLORS.charcoal,
  },
});
