/**
 * Data Disclaimer Component
 * Displays when data was last updated
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../theme';

interface DataDisclaimerProps {
  variant?: 'inline' | 'footer' | 'compact';
  showIcon?: boolean;
}

export const DATA_LAST_UPDATED = 'January 2026';

export function DataDisclaimer({ variant = 'inline', showIcon = true }: DataDisclaimerProps) {
  if (variant === 'compact') {
    return (
      <Text style={styles.compactText}>
        Data as of {DATA_LAST_UPDATED}
      </Text>
    );
  }

  if (variant === 'footer') {
    return (
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          {showIcon && 'i  '}Data as of {DATA_LAST_UPDATED}. Cost of living, tax rates, and housing data are periodically updated.
        </Text>
      </View>
    );
  }

  // Default inline variant
  return (
    <View style={styles.inlineContainer}>
      <Text style={styles.inlineText}>
        {showIcon && 'i  '}Data as of {DATA_LAST_UPDATED}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  inlineContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
  },
  inlineText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    fontStyle: 'italic',
  },
  footerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  footerText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    textAlign: 'center',
    lineHeight: 18,
  },
  compactText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    fontStyle: 'italic',
  },
});

export default DataDisclaimer;
