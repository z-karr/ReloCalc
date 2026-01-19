import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { UserPreferences } from '../types';
import { getCountryById } from '../data/countries';

// ============================================================================
// TYPES
// ============================================================================

interface UserPreferencesContextType {
  preferences: UserPreferences;
  updateHomeCountry: (countryId: string) => Promise<void>;
  updateCurrencyDisplayMode: (mode: 'home_first' | 'usd_first') => Promise<void>;
  resetToAutoDetected: () => Promise<void>;
  isLoading: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = '@relocate_user_prefs';

// Map ISO 3166-1 alpha-2 codes to our country IDs
const REGION_TO_COUNTRY_MAP: Record<string, string> = {
  // North America
  'US': 'us',
  'CA': 'ca',
  'MX': 'mx',

  // Europe
  'GB': 'gb',
  'UK': 'gb', // Alternative code
  'DE': 'de',
  'PT': 'pt',
  'FR': 'fr',
  'ES': 'es',
  'IT': 'it',
  'NL': 'nl',
  'IE': 'ie',
  'CH': 'ch',
  'BE': 'be',
  'SE': 'se',
  'DK': 'dk',
  'NO': 'no',
  'PL': 'pl',
  'GR': 'gr',
  'CZ': 'cz',

  // Latin America
  'AR': 'ar',
  'BR': 'br',
  'CL': 'cl',
  'CR': 'cr',
  'SV': 'sv',
  'GT': 'gt',

  // Asia-Pacific
  'AU': 'au',
  'JP': 'jp',
  'KR': 'kr',
  'TW': 'tw',
  'TH': 'th',
  'VN': 'vn',
  'CN': 'cn',
  'ID': 'id',
  'PH': 'ph',
  'NZ': 'nz',

  // Middle East
  'AE': 'ae',

  // Africa
  'ZA': 'za',
  'MA': 'ma',
};

// ============================================================================
// CONTEXT
// ============================================================================

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

// ============================================================================
// DEFAULT PREFERENCES
// ============================================================================

const getDefaultPreferences = (): UserPreferences => {
  const detectedCountry = detectHomeCountry();
  const country = getCountryById(detectedCountry);

  return {
    // Existing preference weights (default values)
    prioritizeWeather: 5,
    prioritizeCost: 7,
    prioritizeSafety: 8,
    prioritizeTransit: 6,
    prioritizeOutdoors: 5,
    prioritizeEntertainment: 5,
    prioritizeEducation: 6,
    prioritizeHealthcare: 7,
    preferredClimate: ['temperate'],
    maxCommute: 45,
    minWalkScore: 50,

    // Global user context (auto-detected)
    homeCountry: detectedCountry,
    homeCurrency: country?.currency.code || 'USD',
    currencyDisplayMode: 'usd_first', // Default to USD first for consistency
    autoDetected: true,
  };
};

// ============================================================================
// AUTO-DETECTION
// ============================================================================

/**
 * Detect user's home country from device locale
 * Returns country ID or 'us' as fallback
 */
function detectHomeCountry(): string {
  try {
    // Get device locales (returns array of locale objects)
    const locales = Localization.getLocales();

    if (locales && locales.length > 0 && locales[0].regionCode) {
      // Get region code (ISO 3166-1 alpha-2, e.g., 'US', 'GB', 'DE')
      const region = locales[0].regionCode;

      // Map to our country ID format
      const countryId = REGION_TO_COUNTRY_MAP[region];

      if (countryId) {
        console.log(`[UserPreferences] Auto-detected country: ${region} → ${countryId}`);
        return countryId;
      }

      // Fallback to US if unknown region
      console.log(`[UserPreferences] Unknown region: ${region}, falling back to 'us'`);
      return 'us';
    }

    // Fallback to US if no region detected
    console.log('[UserPreferences] No region detected, falling back to \'us\'');
    return 'us';
  } catch (error) {
    console.error('[UserPreferences] Error detecting country:', error);
    return 'us';
  }
}

// ============================================================================
// PROVIDER
// ============================================================================

export const UserPreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(getDefaultPreferences());
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from AsyncStorage on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  /**
   * Load preferences from AsyncStorage
   */
  const loadPreferences = async () => {
    try {
      // Try to clear old storage (ignore errors if it doesn't exist)
      try {
        await AsyncStorage.removeItem(STORAGE_KEY);
      } catch (clearError) {
        // Ignore - storage might not exist yet
      }

      const stored = await AsyncStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored) as UserPreferences;
        console.log('[UserPreferences] Loaded from storage:', parsed.homeCountry);
        setPreferences(parsed);
      } else {
        // No stored preferences, use defaults (auto-detected)
        const defaults = getDefaultPreferences();
        console.log('[UserPreferences] No stored prefs, using defaults:', defaults.homeCountry);
        setPreferences(defaults);

        // Save defaults to storage
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      }
    } catch (error) {
      console.error('[UserPreferences] Error loading preferences:', error);
      // Fall back to defaults on error
      const fallback = getDefaultPreferences();
      setPreferences(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save preferences to AsyncStorage
   */
  const savePreferences = async (newPrefs: UserPreferences) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
      console.log('[UserPreferences] Saved to storage');
    } catch (error) {
      console.error('[UserPreferences] Error saving preferences:', error);
    }
  };

  /**
   * Update home country
   */
  const updateHomeCountry = async (countryId: string) => {
    const country = getCountryById(countryId);

    if (!country) {
      console.error(`[UserPreferences] Invalid country ID: ${countryId}`);
      return;
    }

    const newPrefs: UserPreferences = {
      ...preferences,
      homeCountry: countryId,
      homeCurrency: country.currency.code,
      autoDetected: false, // Manual change
    };

    setPreferences(newPrefs);
    await savePreferences(newPrefs);
    console.log('[UserPreferences] Updated home country:', countryId);
  };

  /**
   * Update currency display mode
   */
  const updateCurrencyDisplayMode = async (mode: 'home_first' | 'usd_first') => {
    const newPrefs: UserPreferences = {
      ...preferences,
      currencyDisplayMode: mode,
    };

    setPreferences(newPrefs);
    await savePreferences(newPrefs);
    console.log('[UserPreferences] Updated currency display mode:', mode);
  };

  /**
   * Reset to auto-detected values
   */
  const resetToAutoDetected = async () => {
    const defaults = getDefaultPreferences();
    setPreferences(defaults);
    await savePreferences(defaults);
    console.log('[UserPreferences] Reset to auto-detected:', defaults.homeCountry);
  };

  return (
    <UserPreferencesContext.Provider
      value={{
        preferences,
        updateHomeCountry,
        updateCurrencyDisplayMode,
        resetToAutoDetected,
        isLoading,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access user preferences
 */
export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);

  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }

  return context;
};
