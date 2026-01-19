import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Currency } from '../types';
import { COLORS, FONTS } from '../theme';
import { convertFromUSD, formatCurrency as formatCurrencyUtil, getCurrencyByCode } from '../utils/currency/exchangeRates';
import { useUserPreferences } from '../context/UserPreferencesContext';

interface CurrencyDisplayProps {
  amountUSD: number;
  targetCurrency?: Currency;
  emphasize?: 'usd' | 'local' | 'auto';  // 'auto' uses user preferences
  showBoth?: boolean;
  style?: any;
}

/**
 * CurrencyDisplay component shows monetary amounts in dual currency format
 *
 * Behavior:
 * - emphasize='usd': Always show $75,000 (€69,000)
 * - emphasize='local': Always show €69,000 ($75,000)
 * - emphasize='auto': Use user preferences (home currency first if enabled)
 *
 * With user preferences (currencyDisplayMode='home_first'):
 * - German user viewing Toronto: €55,000 (C$93,000)
 * - US user viewing London: $75,000 (£59,000)
 */
export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amountUSD,
  targetCurrency,
  emphasize = 'auto',
  showBoth = true,
  style,
}) => {
  const { preferences } = useUserPreferences();

  // Determine which currency to emphasize
  let shouldEmphasizeUSD = true;

  if (emphasize === 'auto') {
    // Use user preferences
    if (preferences.currencyDisplayMode === 'home_first') {
      // Prioritize home currency
      shouldEmphasizeUSD = (preferences.homeCurrency === 'USD');
    } else {
      // Default: USD first
      shouldEmphasizeUSD = true;
    }
  } else {
    // Manual override
    shouldEmphasizeUSD = (emphasize === 'usd');
  }

  // Get home currency object
  const homeCurrency = getCurrencyByCode(preferences.homeCurrency);

  // If no target currency, show single currency
  if (!targetCurrency || !showBoth) {
    const displayCurrency = shouldEmphasizeUSD ? 'USD' : preferences.homeCurrency;
    const amount = shouldEmphasizeUSD ? amountUSD : convertFromUSD(amountUSD, displayCurrency);
    const symbol = shouldEmphasizeUSD ? '$' : (homeCurrency?.symbol || '$');

    return (
      <Text style={[styles.primaryAmount, style]}>
        {symbol}{amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
      </Text>
    );
  }

  // Dual currency display
  if (shouldEmphasizeUSD) {
    // USD primary, local secondary
    const amountLocal = convertFromUSD(amountUSD, targetCurrency.code);
    const formattedUSD = `$${amountUSD.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    const formattedLocal = `${targetCurrency.symbol}${amountLocal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

    return (
      <View style={styles.container}>
        <Text style={[styles.primaryAmount, style]}>
          {formattedUSD}
        </Text>
        <Text style={[styles.secondaryAmount, style]}>
          {' '}({formattedLocal})
        </Text>
      </View>
    );
  } else {
    // Home currency primary, destination currency secondary
    const amountHome = convertFromUSD(amountUSD, preferences.homeCurrency);
    const amountDest = convertFromUSD(amountUSD, targetCurrency.code);

    const homeSymbol = homeCurrency?.symbol || '$';
    const formattedHome = `${homeSymbol}${amountHome.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    const formattedDest = `${targetCurrency.symbol}${amountDest.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

    return (
      <View style={styles.container}>
        <Text style={[styles.primaryAmount, style]}>
          {formattedHome}
        </Text>
        <Text style={[styles.secondaryAmount, style]}>
          {' '}({formattedDest})
        </Text>
      </View>
    );
  }
};

/**
 * Helper function to format currency for display
 * Can be used directly or through the component
 */
export const formatCurrency = (
  amountUSD: number,
  targetCurrency?: Currency,
  emphasize: 'usd' | 'local' = 'usd'
): string => {
  if (!targetCurrency || targetCurrency.code === 'USD') {
    return `$${amountUSD.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  const amountLocal = convertFromUSD(amountUSD, targetCurrency.code);
  const formattedUSD = `$${amountUSD.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  const formattedLocal = `${targetCurrency.symbol}${amountLocal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  if (emphasize === 'usd') {
    return `${formattedUSD} (${formattedLocal})`;
  } else {
    return `${formattedLocal} (${formattedUSD})`;
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  primaryAmount: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.charcoal,
  },
  secondaryAmount: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '400',
    color: COLORS.mediumGray,
  },
});
