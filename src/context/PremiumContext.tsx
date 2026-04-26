import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PremiumState } from '../types/premium';

// ============================================================================
// TYPES
// ============================================================================

interface PremiumContextType {
  // State
  isPremium: boolean;
  isLoading: boolean;
  purchaseDate: Date | null;

  // Feature access checks
  canAccessMultiCity: boolean;
  canExportPDF: boolean;
  canAccessProjections: boolean;
  canAccessNegotiationTools: boolean;
  canAccessChecklist: boolean;

  // Actions
  purchasePremium: () => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;

  // For development/testing
  __devSetPremium: (isPremium: boolean) => Promise<void>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = '@relocate_premium_status';

// DEV MODE: Set to true to preview premium features (set back to false before shipping!)
const DEV_FORCE_PREMIUM = false;

// Premium product identifier (for App Store)
export const PREMIUM_PRODUCT_ID = 'com.relocalc.premium.full_analysis';

// ============================================================================
// DEFAULT STATE
// ============================================================================

const getDefaultPremiumState = (): PremiumState => ({
  isPremium: DEV_FORCE_PREMIUM,
  purchaseDate: DEV_FORCE_PREMIUM ? new Date() : null,
  canAccessMultiCity: DEV_FORCE_PREMIUM,
  canExportPDF: DEV_FORCE_PREMIUM,
  canAccessProjections: DEV_FORCE_PREMIUM,
  canAccessNegotiationTools: DEV_FORCE_PREMIUM,
  canAccessChecklist: DEV_FORCE_PREMIUM,
});

// ============================================================================
// CONTEXT
// ============================================================================

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export const PremiumProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [premiumState, setPremiumState] = useState<PremiumState>(getDefaultPremiumState());
  const [isLoading, setIsLoading] = useState(true);

  // Load premium status on mount
  useEffect(() => {
    loadPremiumStatus();
  }, []);

  /**
   * Load premium status from AsyncStorage
   */
  const loadPremiumStatus = async () => {
    try {
      // If DEV_FORCE_PREMIUM is explicitly false, clear any cached premium and use free state
      if (!DEV_FORCE_PREMIUM) {
        await AsyncStorage.removeItem(STORAGE_KEY);
        console.log('[Premium] DEV_FORCE_PREMIUM is false - using free state');
        setPremiumState(getDefaultPremiumState());
        setIsLoading(false);
        return;
      }

      const stored = await AsyncStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date string back to Date object
        const state: PremiumState = {
          ...parsed,
          purchaseDate: parsed.purchaseDate ? new Date(parsed.purchaseDate) : null,
        };
        console.log('[Premium] Loaded status:', state.isPremium ? 'Premium' : 'Free');
        setPremiumState(state);
      } else {
        console.log('[Premium] No stored status, using defaults (Free)');
      }
    } catch (error) {
      console.error('[Premium] Error loading status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save premium status to AsyncStorage
   */
  const savePremiumStatus = async (state: PremiumState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      console.log('[Premium] Saved status');
    } catch (error) {
      console.error('[Premium] Error saving status:', error);
    }
  };

  /**
   * Activate premium features
   */
  const activatePremium = useCallback(async (purchaseDate: Date = new Date()) => {
    const newState: PremiumState = {
      isPremium: true,
      purchaseDate,
      canAccessMultiCity: true,
      canExportPDF: true,
      canAccessProjections: true,
      canAccessNegotiationTools: true,
      canAccessChecklist: true,
    };

    setPremiumState(newState);
    await savePremiumStatus(newState);
    console.log('[Premium] Activated premium features');
  }, []);

  /**
   * Purchase premium (will be connected to RevenueCat later)
   * Currently returns false as a placeholder - actual IAP integration pending
   */
  const purchasePremium = useCallback(async (): Promise<boolean> => {
    console.log('[Premium] Purchase requested');

    // TODO: Replace with RevenueCat integration
    // try {
    //   const offerings = await Purchases.getOfferings();
    //   const premiumPackage = offerings.current?.availablePackages[0];
    //   if (premiumPackage) {
    //     const { customerInfo } = await Purchases.purchasePackage(premiumPackage);
    //     if (customerInfo.entitlements.active['premium']) {
    //       await activatePremium();
    //       return true;
    //     }
    //   }
    //   return false;
    // } catch (error) {
    //   console.error('[Premium] Purchase failed:', error);
    //   return false;
    // }

    // Placeholder: return false until IAP is integrated
    // In development, use __devSetPremium to test premium features
    console.log('[Premium] IAP not yet integrated - use __devSetPremium for testing');
    return false;
  }, [activatePremium]);

  /**
   * Restore purchases (will be connected to RevenueCat later)
   */
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    console.log('[Premium] Restore requested');

    // TODO: Replace with RevenueCat integration
    // try {
    //   const customerInfo = await Purchases.restorePurchases();
    //   if (customerInfo.entitlements.active['premium']) {
    //     await activatePremium();
    //     return true;
    //   }
    //   return false;
    // } catch (error) {
    //   console.error('[Premium] Restore failed:', error);
    //   return false;
    // }

    // Check if we have a stored premium status
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.isPremium) {
          await activatePremium(new Date(parsed.purchaseDate));
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('[Premium] Restore failed:', error);
      return false;
    }
  }, [activatePremium]);

  /**
   * Development helper to manually set premium status
   * This should only be used for testing
   */
  const __devSetPremium = useCallback(async (isPremium: boolean) => {
    if (isPremium) {
      await activatePremium();
    } else {
      const defaultState = getDefaultPremiumState();
      setPremiumState(defaultState);
      await savePremiumStatus(defaultState);
      console.log('[Premium] Dev: Reset to free');
    }
  }, [activatePremium]);

  return (
    <PremiumContext.Provider
      value={{
        // State
        isPremium: premiumState.isPremium,
        isLoading,
        purchaseDate: premiumState.purchaseDate,

        // Feature access
        canAccessMultiCity: premiumState.canAccessMultiCity,
        canExportPDF: premiumState.canExportPDF,
        canAccessProjections: premiumState.canAccessProjections,
        canAccessNegotiationTools: premiumState.canAccessNegotiationTools,
        canAccessChecklist: premiumState.canAccessChecklist,

        // Actions
        purchasePremium,
        restorePurchases,
        __devSetPremium,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access premium features and status
 *
 * @example
 * const { isPremium, canAccessMultiCity, purchasePremium } = usePremium();
 *
 * if (!isPremium) {
 *   return <PaywallModal onPurchase={purchasePremium} />;
 * }
 */
export const usePremium = () => {
  const context = useContext(PremiumContext);

  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }

  return context;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a specific premium feature is accessible
 * Useful for conditional rendering
 */
export const isPremiumFeature = (
  feature: 'multiCity' | 'pdf' | 'projections' | 'negotiation' | 'checklist',
  state: PremiumState
): boolean => {
  switch (feature) {
    case 'multiCity':
      return state.canAccessMultiCity;
    case 'pdf':
      return state.canExportPDF;
    case 'projections':
      return state.canAccessProjections;
    case 'negotiation':
      return state.canAccessNegotiationTools;
    case 'checklist':
      return state.canAccessChecklist;
    default:
      return false;
  }
};
