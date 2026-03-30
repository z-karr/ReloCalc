import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme';
import { usePremium } from '../../context/PremiumContext';

// ============================================================================
// TYPES
// ============================================================================

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  feature?: string; // Optional: which feature triggered the paywall
}

interface FeatureItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

// ============================================================================
// FEATURE LIST
// ============================================================================

const PREMIUM_FEATURES: FeatureItem[] = [
  {
    icon: 'git-compare-outline',
    title: 'Multi-City Comparison',
    description: 'Compare up to 5 cities side-by-side with detailed metrics',
  },
  {
    icon: 'trending-up-outline',
    title: '5-Year Projections',
    description: 'See your wealth trajectory with customizable assumptions',
  },
  {
    icon: 'home-outline',
    title: 'Rent vs Buy Analysis',
    description: 'Detailed housing decision analysis for each city',
  },
  {
    icon: 'timer-outline',
    title: 'Break-Even Timeline',
    description: 'Know exactly when your move pays for itself',
  },
  {
    icon: 'briefcase-outline',
    title: 'Negotiation Toolkit',
    description: 'Cost justifications and scripts for your employer',
  },
  {
    icon: 'document-text-outline',
    title: 'PDF Export',
    description: 'Professional reports to share with family or employers',
  },
  {
    icon: 'checkbox-outline',
    title: '90-Day Checklist',
    description: 'Personalized moving checklist based on your situation',
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export const PaywallModal: React.FC<PaywallModalProps> = ({
  visible,
  onClose,
  feature,
}) => {
  const { purchasePremium, restorePurchases, __devSetPremium } = usePremium();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await purchasePremium();
      if (success) {
        onClose();
      } else {
        // In development, show option to enable for testing
        if (__DEV__) {
          setError('IAP not configured. Use dev toggle below for testing.');
        } else {
          setError('Purchase could not be completed. Please try again.');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await restorePurchases();
      if (success) {
        onClose();
      } else {
        setError('No previous purchase found.');
      }
    } catch (err) {
      setError('Could not restore purchases. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Development helper
  const handleDevEnable = async () => {
    await __devSetPremium(true);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      transparent={Platform.OS === 'web'}
      onRequestClose={onClose}
    >
      <View style={[styles.container, Platform.OS === 'web' && styles.webOverlay]}>
        <View style={[styles.content, Platform.OS === 'web' && styles.webContent]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.darkGray} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Hero Section */}
            <View style={styles.hero}>
              <View style={styles.iconContainer}>
                <Ionicons name="analytics" size={48} color={COLORS.white} />
              </View>
              <Text style={styles.title}>ReloCalc Premium</Text>
              <Text style={styles.subtitle}>Full Analysis Suite</Text>
              {feature && (
                <View style={styles.featureBadge}>
                  <Ionicons name="lock-closed" size={12} color={COLORS.accent} />
                  <Text style={styles.featureBadgeText}>
                    Unlock {feature}
                  </Text>
                </View>
              )}
            </View>

            {/* Price */}
            <View style={styles.priceContainer}>
              <Text style={styles.price}>$3.99</Text>
              <Text style={styles.priceSubtext}>One-time purchase</Text>
            </View>

            {/* Features List */}
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>Everything you need:</Text>
              {PREMIUM_FEATURES.map((item, index) => (
                <View key={index} style={styles.featureRow}>
                  <View style={styles.featureIcon}>
                    <Ionicons name={item.icon} size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.featureText}>
                    <Text style={styles.featureTitle}>{item.title}</Text>
                    <Text style={styles.featureDescription}>{item.description}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Value Proposition */}
            <View style={styles.valueContainer}>
              <Ionicons name="shield-checkmark" size={20} color={COLORS.success} />
              <Text style={styles.valueText}>
                Analysis worth $200+ from a relocation consultant
              </Text>
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="warning" size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Development Toggle */}
            {__DEV__ && (
              <TouchableOpacity
                style={styles.devButton}
                onPress={handleDevEnable}
              >
                <Ionicons name="code-working" size={16} color={COLORS.mediumGray} />
                <Text style={styles.devButtonText}>Dev: Enable Premium</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Bottom Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.purchaseButton, isLoading && styles.buttonDisabled]}
              onPress={handlePurchase}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="star" size={20} color={COLORS.white} />
                  <Text style={styles.purchaseButtonText}>Unlock Premium</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestore}
              disabled={isLoading}
            >
              <Text style={styles.restoreButtonText}>Restore Purchase</Text>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              Payment will be charged to your Apple ID account.
              {'\n'}No subscription - pay once, use forever.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  webOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  webContent: {
    flex: 0,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.lg,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.base,
    backgroundColor: COLORS.offWhite,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.lg,
  },
  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.charcoal,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  featureBadgeText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.accent,
    fontWeight: '600',
  },
  priceContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  price: {
    fontSize: FONTS.sizes.hero,
    fontWeight: '700',
    color: COLORS.primary,
  },
  priceSubtext: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    marginTop: SPACING.xs,
  },
  featuresContainer: {
    padding: SPACING.base,
  },
  featuresTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.charcoal,
    marginBottom: SPACING.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.infoLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.charcoal,
  },
  featureDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    marginTop: 2,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    marginHorizontal: SPACING.base,
    marginTop: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  valueText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.success,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorLight,
    marginHorizontal: SPACING.base,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  errorText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.error,
  },
  devButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.base,
    marginTop: SPACING.md,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderStyle: 'dashed',
    gap: SPACING.xs,
  },
  devButtonText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
  },
  actions: {
    padding: SPACING.base,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.base,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  purchaseButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  restoreButtonText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  disclaimer: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: 16,
  },
});

export default PaywallModal;
