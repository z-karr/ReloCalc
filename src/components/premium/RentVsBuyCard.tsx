import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import Svg, { Path, Line, Circle, G, Text as SvgText, Rect } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme';
import { RentVsBuyAnalysis } from '../../types/premium';

// ============================================================================
// TYPES
// ============================================================================

interface RentVsBuyCardProps {
  analysis: RentVsBuyAnalysis;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const RentVsBuyCard: React.FC<RentVsBuyCardProps> = ({
  analysis,
  expanded = false,
  onToggleExpand,
}) => {
  const [showChart, setShowChart] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const formatCurrency = (amount: number): string => {
    const sign = amount < 0 ? '-' : '';
    const absAmount = Math.abs(amount);
    if (absAmount >= 1000000) return `${sign}$${(absAmount / 1000000).toFixed(1)}M`;
    if (absAmount >= 1000) return `${sign}$${(absAmount / 1000).toFixed(1)}K`;
    return `${sign}$${Math.round(absAmount)}`;
  };

  const getRecommendationColor = () => {
    switch (analysis.recommendation) {
      case 'buy': return COLORS.success;
      case 'rent': return COLORS.info;
      default: return COLORS.warning;
    }
  };

  const getConfidenceLabel = () => {
    switch (analysis.confidenceLevel) {
      case 'high': return 'High Confidence';
      case 'medium': return 'Medium Confidence';
      case 'low': return 'Consider Carefully';
    }
  };

  // Calculate monthly costs
  const monthlyRent = analysis.rentScenario.monthlyRent + analysis.rentScenario.rentersInsurance;
  const monthlyBuy = analysis.buyScenario.monthlyMortgage +
    (analysis.buyScenario.propertyTax / 12) +
    (analysis.buyScenario.homeInsurance / 12) +
    (analysis.buyScenario.maintenance / 12) +
    analysis.buyScenario.hoaFees;

  const monthlyDiff = monthlyBuy - monthlyRent;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.cityBadge}>
            <Ionicons name="home" size={16} color={COLORS.white} />
          </View>
          <View>
            <Text style={styles.cityName}>{analysis.city.name}</Text>
            <Text style={styles.cityLocation}>
              {analysis.city.state || analysis.city.country.toUpperCase()}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setShowInfoModal(true)}
          style={styles.infoButton}
        >
          <Ionicons name="information-circle-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Info Modal */}
      <Modal
        visible={showInfoModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={styles.infoModalOverlay}>
          <View style={styles.infoModalContent}>
            <View style={styles.infoModalHeader}>
              <Text style={styles.infoModalTitle}>How Rent vs Buy Works</Text>
              <TouchableOpacity
                onPress={() => setShowInfoModal(false)}
                style={styles.infoModalClose}
              >
                <Ionicons name="close" size={24} color={COLORS.darkGray} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.infoModalBody}>
              {/* Buy Beats Rent */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <Ionicons name="timer-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.infoSectionTitle}>Buy Beats Rent</Text>
                </View>
                <Text style={styles.infoSectionText}>
                  This shows when buying becomes financially better than renting in your target city. We compare:
                </Text>
                <View style={styles.infoList}>
                  <Text style={styles.infoListItem}>• Renting: Investing your down payment at ~7% annual return while paying rent</Text>
                  <Text style={styles.infoListItem}>• Buying: Building home equity through ~4% appreciation plus monthly principal payments</Text>
                </View>
                <Text style={[styles.infoSectionText, { marginTop: 8, fontStyle: 'italic' }]}>
                  Year 1 means home equity growth immediately outpaces what you'd earn by investing the down payment instead.
                </Text>
              </View>

              {/* Monthly Costs */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <Ionicons name="cash-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.infoSectionTitle}>Monthly Costs Compared</Text>
                </View>
                <Text style={styles.infoSectionText}>
                  While buying often has higher monthly costs, you're building equity with each payment:
                </Text>
                <View style={styles.infoList}>
                  <Text style={styles.infoListItem}>• Renting: Monthly rent + renter's insurance</Text>
                  <Text style={styles.infoListItem}>• Buying: Mortgage + property tax + insurance + maintenance + HOA</Text>
                </View>
              </View>

              {/* Net Worth Comparison */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <Ionicons name="trending-up" size={20} color={COLORS.primary} />
                  <Text style={styles.infoSectionTitle}>5-Year & 10-Year Winners</Text>
                </View>
                <Text style={styles.infoSectionText}>
                  We compare your projected net worth under each scenario:
                </Text>
                <View style={styles.infoList}>
                  <Text style={styles.infoListItem}>• Rent Net Worth: Down payment invested + savings from lower monthly costs</Text>
                  <Text style={styles.infoListItem}>• Buy Net Worth: Home equity (value minus mortgage) + additional savings</Text>
                </View>
              </View>

              {/* Key Assumptions */}
              <View style={styles.infoSection}>
                <View style={styles.infoSectionHeader}>
                  <Ionicons name="settings-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.infoSectionTitle}>Key Assumptions</Text>
                </View>
                <View style={styles.infoList}>
                  <Text style={styles.infoListItem}>• Home appreciation: ~4% annually</Text>
                  <Text style={styles.infoListItem}>• Rent increases: ~3% annually</Text>
                  <Text style={styles.infoListItem}>• Investment returns: ~7% annually</Text>
                  <Text style={styles.infoListItem}>• Property tax: ~1.1% of home value</Text>
                  <Text style={styles.infoListItem}>• Maintenance: ~1% of home value annually</Text>
                </View>
              </View>

              {/* Note */}
              <View style={styles.infoNote}>
                <Ionicons name="information-circle" size={18} color={COLORS.info} />
                <Text style={styles.infoNoteText}>
                  This analysis helps you understand the financial trade-offs between renting and buying in your target city. Results vary based on your specific situation and market conditions.
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowInfoModal(false)}
              style={styles.infoModalButton}
            >
              <Text style={styles.infoModalButtonText}>Got It</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Quick Summary */}
      <View style={styles.quickSummary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Buy Beats Rent</Text>
          <Text style={styles.summaryValue}>
            {analysis.breakEvenYear ? `Year ${analysis.breakEvenYear}` : 'N/A'}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>5-Year Winner</Text>
          <Text style={[styles.summaryValue, { color: getRecommendationColor() }]}>
            {analysis.comparison5Year.winner.toUpperCase()}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Difference</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(analysis.comparison5Year.difference)}
          </Text>
        </View>
      </View>

      {/* Expanded Content */}
      {expanded && (
        <View style={styles.expandedContent}>
          {/* Monthly Cost Comparison */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monthly Costs</Text>
            <View style={styles.costComparison}>
              <View style={styles.costItem}>
                <Text style={styles.costLabel}>Renting</Text>
                <Text style={styles.costValue}>{formatCurrency(monthlyRent)}/mo</Text>
                <View style={styles.costBreakdown}>
                  <Text style={styles.breakdownItem}>
                    Rent: {formatCurrency(analysis.rentScenario.monthlyRent)}
                  </Text>
                  <Text style={styles.breakdownItem}>
                    Insurance: ${analysis.rentScenario.rentersInsurance}
                  </Text>
                </View>
              </View>

              <View style={styles.vsContainer}>
                <Text style={styles.vsText}>vs</Text>
              </View>

              <View style={styles.costItem}>
                <Text style={styles.costLabel}>Buying</Text>
                <Text style={styles.costValue}>{formatCurrency(monthlyBuy)}/mo</Text>
                <View style={styles.costBreakdown}>
                  <Text style={styles.breakdownItem}>
                    Mortgage: {formatCurrency(analysis.buyScenario.monthlyMortgage)}
                  </Text>
                  <Text style={styles.breakdownItem}>
                    Taxes: {formatCurrency(analysis.buyScenario.propertyTax / 12)}
                  </Text>
                  <Text style={styles.breakdownItem}>
                    Ins+Maint: {formatCurrency((analysis.buyScenario.homeInsurance + analysis.buyScenario.maintenance) / 12)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.diffBanner}>
              <Ionicons
                name={monthlyDiff > 0 ? 'trending-up' : 'trending-down'}
                size={16}
                color={monthlyDiff > 0 ? COLORS.error : COLORS.success}
              />
              <Text style={styles.diffText}>
                Buying costs {formatCurrency(Math.abs(monthlyDiff))} {monthlyDiff > 0 ? 'more' : 'less'} per month
              </Text>
            </View>
          </View>

          {/* Purchase Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Purchase Details</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Home Price</Text>
                <Text style={styles.detailValue}>
                  {formatCurrency(analysis.buyScenario.purchasePrice)}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Down Payment</Text>
                <Text style={styles.detailValue}>
                  {formatCurrency(analysis.buyScenario.downPayment)} ({(analysis.buyScenario.downPaymentPercent * 100).toFixed(0)}%)
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Loan Amount</Text>
                <Text style={styles.detailValue}>
                  {formatCurrency(analysis.buyScenario.loanAmount)}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Interest Rate</Text>
                <Text style={styles.detailValue}>
                  {(analysis.buyScenario.mortgageRate * 100).toFixed(2)}%
                </Text>
              </View>
            </View>
          </View>

          {/* Net Worth Comparison */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Net Worth Comparison</Text>
            <View style={styles.netWorthGrid}>
              <View style={styles.netWorthColumn}>
                <Text style={styles.netWorthHeader}>5 Years</Text>
                <View style={styles.netWorthRow}>
                  <Text style={styles.netWorthLabel}>Rent</Text>
                  <Text style={styles.netWorthValue}>
                    {formatCurrency(analysis.comparison5Year.rentNetWorth)}
                  </Text>
                </View>
                <View style={styles.netWorthRow}>
                  <Text style={styles.netWorthLabel}>Buy</Text>
                  <Text style={styles.netWorthValue}>
                    {formatCurrency(analysis.comparison5Year.buyNetWorth)}
                  </Text>
                </View>
                <View style={[styles.winnerBadge, {
                  backgroundColor: analysis.comparison5Year.winner === 'buy' ? COLORS.successLight : COLORS.infoLight
                }]}>
                  <Text style={[styles.winnerText, {
                    color: analysis.comparison5Year.winner === 'buy' ? COLORS.success : COLORS.info
                  }]}>
                    {analysis.comparison5Year.winner === 'buy' ? 'Buy wins' : 'Rent wins'} by {formatCurrency(analysis.comparison5Year.difference)}
                  </Text>
                </View>
              </View>

              <View style={styles.netWorthColumn}>
                <Text style={styles.netWorthHeader}>10 Years</Text>
                <View style={styles.netWorthRow}>
                  <Text style={styles.netWorthLabel}>Rent</Text>
                  <Text style={styles.netWorthValue}>
                    {formatCurrency(analysis.comparison10Year.rentNetWorth)}
                  </Text>
                </View>
                <View style={styles.netWorthRow}>
                  <Text style={styles.netWorthLabel}>Buy</Text>
                  <Text style={styles.netWorthValue}>
                    {formatCurrency(analysis.comparison10Year.buyNetWorth)}
                  </Text>
                </View>
                <View style={[styles.winnerBadge, {
                  backgroundColor: analysis.comparison10Year.winner === 'buy' ? COLORS.successLight : COLORS.infoLight
                }]}>
                  <Text style={[styles.winnerText, {
                    color: analysis.comparison10Year.winner === 'buy' ? COLORS.success : COLORS.info
                  }]}>
                    {analysis.comparison10Year.winner === 'buy' ? 'Buy wins' : 'Rent wins'} by {formatCurrency(analysis.comparison10Year.difference)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Reasoning */}
          <View style={styles.reasoningSection}>
            <View style={styles.reasoningHeader}>
              <View style={[styles.confidenceBadge, {
                backgroundColor: analysis.confidenceLevel === 'high' ? COLORS.successLight :
                  analysis.confidenceLevel === 'medium' ? COLORS.warningLight : COLORS.errorLight
              }]}>
                <Text style={[styles.confidenceText, {
                  color: analysis.confidenceLevel === 'high' ? COLORS.success :
                    analysis.confidenceLevel === 'medium' ? COLORS.warning : COLORS.error
                }]}>
                  {getConfidenceLabel()}
                </Text>
              </View>
            </View>
            <Text style={styles.reasoningText}>{analysis.reasoning}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.offWhite,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  cityBadge: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.charcoal,
  },
  cityLocation: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  recommendationBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  recommendationText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
  quickSummary: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
    color: COLORS.charcoal,
  },
  expandedContent: {
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  costComparison: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  costItem: {
    flex: 1,
    alignItems: 'center',
  },
  costLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: SPACING.xs,
  },
  costValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.charcoal,
  },
  costBreakdown: {
    marginTop: SPACING.xs,
  },
  breakdownItem: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    textAlign: 'center',
  },
  vsContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
  },
  vsText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    fontWeight: '500',
  },
  diffBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.offWhite,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  diffText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  detailItem: {
    width: '48%',
    backgroundColor: COLORS.offWhite,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  detailLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
  },
  detailValue: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.charcoal,
    marginTop: 2,
  },
  netWorthGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  netWorthColumn: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  netWorthHeader: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.charcoal,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  netWorthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  netWorthLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
  },
  netWorthValue: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.charcoal,
  },
  winnerBadge: {
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.sm,
    alignItems: 'center',
  },
  winnerText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
  reasoningSection: {
    backgroundColor: COLORS.offWhite,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  reasoningHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  confidenceBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  confidenceText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
  reasoningText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  infoButton: {
    padding: SPACING.xs,
  },
  // Info Modal Styles (matching Overview page format)
  infoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  infoModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  infoModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  infoModalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.charcoal,
  },
  infoModalClose: {
    padding: SPACING.xs,
  },
  infoModalBody: {
    padding: SPACING.md,
  },
  infoSection: {
    marginBottom: SPACING.lg,
  },
  infoSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  infoSectionTitle: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.charcoal,
  },
  infoSectionText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  infoList: {
    paddingLeft: SPACING.sm,
  },
  infoListItem: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    lineHeight: 22,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.infoLight,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
    gap: SPACING.sm,
  },
  infoNoteText: {
    flex: 1,
    fontSize: FONTS.sizes.xs,
    color: COLORS.darkGray,
    lineHeight: 18,
  },
  infoModalButton: {
    backgroundColor: COLORS.primary,
    margin: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  infoModalButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default RentVsBuyCard;
