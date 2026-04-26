import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme';
import { NegotiationToolkit as NegotiationToolkitType, IndustryBenchmark } from '../../types/premium';
import { MoveClassification, MoveType, getMoveTypeLabel, formatDistance } from '../../utils/premium/distanceCalculator';

// ============================================================================
// TYPES
// ============================================================================

interface NegotiationToolkitProps {
  toolkit: NegotiationToolkitType;
  currentCityName: string;
  targetCityName: string;
  moveClassification?: MoveClassification;
  householdSize?: number;
  moveTravelMode?: 'driving' | 'flying';
  plansToBuy?: boolean;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface CostBreakdownItemProps {
  label: string;
  amount: number;
  percentage?: number;
  isTotal?: boolean;
}

const CostBreakdownItem: React.FC<CostBreakdownItemProps> = ({
  label,
  amount,
  percentage,
  isTotal,
}) => {
  const formatCurrency = (val: number): string => {
    const sign = val < 0 ? '-' : '';
    const absVal = Math.abs(val);
    if (absVal >= 1000000) return `${sign}$${(absVal / 1000000).toFixed(1)}M`;
    if (absVal >= 1000) return `${sign}$${(absVal / 1000).toFixed(1)}K`;
    return `${sign}$${Math.round(absVal)}`;
  };

  return (
    <View style={[styles.costItem, isTotal && styles.costItemTotal]}>
      <View style={styles.costLabelContainer}>
        <Text style={[styles.costLabel, isTotal && styles.costLabelTotal]}>
          {label}
        </Text>
        {percentage !== undefined && (
          <Text style={styles.costPercentage}>
            {percentage.toFixed(0)}%
          </Text>
        )}
      </View>
      <Text style={[styles.costAmount, isTotal && styles.costAmountTotal]}>
        {formatCurrency(amount)}
      </Text>
    </View>
  );
};

interface BenchmarkRowProps {
  benchmark: IndustryBenchmark;
}

const BenchmarkRow: React.FC<BenchmarkRowProps> = ({ benchmark }) => {
  return (
    <View style={styles.benchmarkRow}>
      <View style={styles.benchmarkLeft}>
        <Text style={styles.benchmarkComponent}>{benchmark.component}</Text>
        <Text style={styles.benchmarkCoverage}>{benchmark.typicalCoverage}</Text>
      </View>
      <View style={styles.benchmarkRight}>
        <View style={styles.coverageBar}>
          <View
            style={[
              styles.coverageFill,
              { width: `${benchmark.percentCovered}%` }
            ]}
          />
        </View>
        <Text style={styles.benchmarkRange}>
          ${benchmark.dollarRange.low.toLocaleString()} - ${benchmark.dollarRange.high.toLocaleString()}
        </Text>
      </View>
    </View>
  );
};

interface ScriptCardProps {
  title: string;
  script: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const ScriptCard: React.FC<ScriptCardProps> = ({ title, script, icon, color }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.scriptCard}>
      <TouchableOpacity
        style={styles.scriptHeader}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={[styles.scriptIconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={styles.scriptTitle}>{title}</Text>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={COLORS.mediumGray}
        />
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.scriptContent}>
          <Text style={styles.scriptText}>{script}</Text>
          <TouchableOpacity style={styles.copyButton}>
            <Ionicons name="copy-outline" size={16} color={COLORS.primary} />
            <Text style={styles.copyButtonText}>Copy to Clipboard</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getMoveTypeBadgeStyle = (moveType: MoveType) => {
  switch (moveType) {
    case 'local':
      return { backgroundColor: COLORS.success };
    case 'regional':
      return { backgroundColor: COLORS.info };
    case 'long-distance':
      return { backgroundColor: COLORS.warning };
    case 'cross-country':
      return { backgroundColor: COLORS.error };
    case 'international':
      return { backgroundColor: COLORS.primary };
    default:
      return { backgroundColor: COLORS.mediumGray };
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const NegotiationToolkit: React.FC<NegotiationToolkitProps> = ({
  toolkit,
  currentCityName,
  targetCityName,
  moveClassification,
  householdSize = 1,
  moveTravelMode = 'driving',
  plansToBuy = false,
}) => {
  const [activeSection, setActiveSection] = useState<'costs' | 'benchmarks' | 'scripts'>('costs');
  const [showCostInfo, setShowCostInfo] = useState(false);
  const [showBenchmarkInfo, setShowBenchmarkInfo] = useState(false);
  const [showScriptInfo, setShowScriptInfo] = useState(false);

  // Get move type info for display
  const moveTypeLabel = moveClassification ? getMoveTypeLabel(moveClassification.type) : 'Relocation';
  const distanceText = moveClassification ? formatDistance(moveClassification.distanceMiles) : null;
  const travelModeLabel = moveTravelMode === 'driving' ? 'Driving' : 'Flying';
  const housingIntentLabel = plansToBuy ? 'Buying' : 'Renting';

  const formatCurrency = (amount: number): string => {
    const sign = amount < 0 ? '-' : '';
    const absAmount = Math.abs(amount);
    if (absAmount >= 1000000) return `${sign}$${(absAmount / 1000000).toFixed(1)}M`;
    if (absAmount >= 1000) return `${sign}$${(absAmount / 1000).toFixed(1)}K`;
    return `${sign}$${Math.round(absAmount)}`;
  };

  const { costBreakdown, benchmarks, typicalPackageValue, actualCosts, gap, recommendedAsk, negotiationPoints, scripts } = toolkit;

  // Calculate percentages for cost breakdown
  const total = costBreakdown.totalRelocationCost;
  const getPercentage = (amount: number) => (amount / total) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Ionicons name="briefcase-outline" size={22} color={COLORS.primary} />
            <Text style={styles.headerTitle}>Negotiation Toolkit</Text>
          </View>
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>PRO</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          {currentCityName} → {targetCityName}
        </Text>
        {/* Move Type Badge */}
        {moveClassification && (
          <View style={styles.moveTypeBadgeContainer}>
            <View style={[styles.moveTypeBadge, getMoveTypeBadgeStyle(moveClassification.type)]}>
              <Ionicons
                name={moveClassification.requiresFlight ? 'airplane' : 'car'}
                size={12}
                color={COLORS.white}
              />
              <Text style={styles.moveTypeBadgeText}>{moveTypeLabel}</Text>
            </View>
            {distanceText && (
              <Text style={styles.distanceText}>{distanceText}</Text>
            )}
            {householdSize > 1 && (
              <View style={styles.householdBadge}>
                <Ionicons name="people" size={12} color={COLORS.lightGray} />
                <Text style={styles.householdText}>{householdSize} people</Text>
              </View>
            )}
            <View style={styles.householdBadge}>
              <Ionicons
                name={moveTravelMode === 'driving' ? 'car' : 'airplane'}
                size={12}
                color={COLORS.lightGray}
              />
              <Text style={styles.householdText}>{travelModeLabel}</Text>
            </View>
            <View style={styles.householdBadge}>
              <Ionicons
                name={plansToBuy ? 'home' : 'key'}
                size={12}
                color={COLORS.lightGray}
              />
              <Text style={styles.householdText}>{housingIntentLabel}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Your Costs</Text>
          <Text style={[styles.summaryValue, { color: COLORS.error }]}>
            {formatCurrency(actualCosts)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Typical Package</Text>
          <Text style={[styles.summaryValue, { color: COLORS.info }]}>
            {formatCurrency(typicalPackageValue)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Recommended Ask</Text>
          <Text style={[styles.summaryValue, { color: COLORS.success }]}>
            {formatCurrency(recommendedAsk)}
          </Text>
        </View>
      </View>

      {/* Gap Alert */}
      {gap > 0 && (
        <View style={styles.gapAlert}>
          <Ionicons name="alert-circle" size={20} color={COLORS.warning} />
          <View style={styles.gapAlertContent}>
            <Text style={styles.gapAlertTitle}>Coverage Gap</Text>
            <Text style={styles.gapAlertText}>
              Typical company coverage leaves a {formatCurrency(gap)} gap. Use this toolkit to negotiate additional support.
            </Text>
          </View>
        </View>
      )}

      {/* Section Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeSection === 'costs' && styles.tabActive]}
          onPress={() => setActiveSection('costs')}
        >
          <Ionicons
            name="calculator-outline"
            size={18}
            color={activeSection === 'costs' ? COLORS.primary : COLORS.mediumGray}
          />
          <Text style={[styles.tabText, activeSection === 'costs' && styles.tabTextActive]}>
            Costs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeSection === 'benchmarks' && styles.tabActive]}
          onPress={() => setActiveSection('benchmarks')}
        >
          <Ionicons
            name="stats-chart-outline"
            size={18}
            color={activeSection === 'benchmarks' ? COLORS.primary : COLORS.mediumGray}
          />
          <Text style={[styles.tabText, activeSection === 'benchmarks' && styles.tabTextActive]}>
            Benchmarks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeSection === 'scripts' && styles.tabActive]}
          onPress={() => setActiveSection('scripts')}
        >
          <Ionicons
            name="chatbubbles-outline"
            size={18}
            color={activeSection === 'scripts' ? COLORS.primary : COLORS.mediumGray}
          />
          <Text style={[styles.tabText, activeSection === 'scripts' && styles.tabTextActive]}>
            Scripts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Sections */}
      <View style={styles.content}>
        {/* Costs Section */}
        {activeSection === 'costs' && (
          <View style={styles.costsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Relocation Cost Breakdown</Text>
              <TouchableOpacity
                onPress={() => setShowCostInfo(true)}
                style={styles.sectionInfoButton}
              >
                <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionDescription}>
              Itemized costs to justify your relocation package request
            </Text>

            {/* Cost Breakdown Info Modal */}
            <Modal
              visible={showCostInfo}
              animationType="fade"
              transparent={true}
              onRequestClose={() => setShowCostInfo(false)}
            >
              <View style={styles.infoModalOverlay}>
                <View style={styles.infoModalContent}>
                  <View style={styles.infoModalHeader}>
                    <Text style={styles.infoModalTitle}>Cost Breakdown Explained</Text>
                    <TouchableOpacity
                      onPress={() => setShowCostInfo(false)}
                      style={styles.infoModalClose}
                    >
                      <Ionicons name="close" size={24} color={COLORS.mediumGray} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.infoModalBody}>
                    {/* Overview */}
                    <View style={styles.infoSection}>
                      <View style={styles.infoSectionHeader}>
                        <Ionicons name="receipt-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.infoSectionTitle}>What This Shows</Text>
                      </View>
                      <Text style={styles.infoSectionText}>
                        A comprehensive estimate of all costs associated with your relocation, designed to help you negotiate a fair package with your employer.
                      </Text>
                    </View>

                    {/* Your Analysis Summary */}
                    <View style={styles.infoSection}>
                      <View style={styles.infoSectionHeader}>
                        <Ionicons name="analytics-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.infoSectionTitle}>Your Analysis</Text>
                      </View>
                      <View style={styles.infoList}>
                        {moveClassification && (
                          <Text style={styles.infoListItem}>• <Text style={styles.infoListBold}>Move Type:</Text> {moveTypeLabel} ({distanceText})</Text>
                        )}
                        <Text style={styles.infoListItem}>• <Text style={styles.infoListBold}>Household:</Text> {householdSize} {householdSize === 1 ? 'person' : 'people'}</Text>
                        <Text style={styles.infoListItem}>• <Text style={styles.infoListBold}>Travel Mode:</Text> {travelModeLabel}</Text>
                        <Text style={styles.infoListItem}>• <Text style={styles.infoListBold}>Housing Plan:</Text> {housingIntentLabel}</Text>
                      </View>
                      <Text style={[styles.infoSectionText, { marginTop: 8 }]}>
                        {plansToBuy
                          ? 'Since you plan to buy, estimates include longer temporary housing (for the closing process) and additional house hunting trips.'
                          : 'Since you plan to rent, estimates reflect a quicker housing search timeline.'}
                      </Text>
                    </View>

                    {/* Cost Items */}
                    <View style={styles.infoSection}>
                      <View style={styles.infoSectionHeader}>
                        <Ionicons name="list-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.infoSectionTitle}>Cost Items Explained</Text>
                      </View>
                      <View style={styles.infoList}>
                        <Text style={styles.infoListItem}>• <Text style={styles.infoListBold}>Moving Expenses:</Text> The estimated moving cost you entered in the Full Analysis input fields</Text>
                        <Text style={styles.infoListItem}>• <Text style={styles.infoListBold}>Temporary Housing:</Text> Target city rent × 1.5 (hotel/Airbnb premium) × days needed. {plansToBuy ? 'Extended for home buying process (closing typically takes 30-45 days).' : 'Based on typical rental search timeline.'}</Text>
                        <Text style={styles.infoListItem}>• <Text style={styles.infoListBold}>House Hunting Trips:</Text> Cost per trip based on distance ({moveClassification?.type === 'local' || moveClassification?.type === 'regional' ? 'day trips/overnight' : 'flights + hotel + car rental'}). {plansToBuy ? 'Buyers typically need 3+ trips for viewings, inspections, and closing.' : 'Renters typically need 2 trips.'}</Text>
                        <Text style={styles.infoListItem}>• <Text style={styles.infoListBold}>Duplicate Housing:</Text> One month of current city rent for overlap period</Text>
                        <Text style={styles.infoListItem}>• <Text style={styles.infoListBold}>Travel Costs ({travelModeLabel}):</Text> {moveTravelMode === 'driving' ? `Gas, food, and hotels for the drive (${householdSize} ${householdSize === 1 ? 'person' : 'people'})` : `One-way flights (${householdSize} ${householdSize === 1 ? 'person' : 'people'}) + car shipping estimate`}</Text>
                        <Text style={styles.infoListItem}>• <Text style={styles.infoListBold}>Storage:</Text> Adjusted for move type (longer moves may need extended storage)</Text>
                        <Text style={styles.infoListItem}>• <Text style={styles.infoListBold}>Tax Gross-Up:</Text> 35% of taxable relocation benefits (moving, temp housing, trips) since these are taxable income</Text>
                      </View>
                    </View>

                    {/* Coverage Gap */}
                    <View style={styles.infoSection}>
                      <View style={styles.infoSectionHeader}>
                        <Ionicons name="alert-circle-outline" size={20} color={COLORS.warning} />
                        <Text style={styles.infoSectionTitle}>Coverage Gap</Text>
                      </View>
                      <Text style={styles.infoSectionText}>
                        The yellow "Coverage Gap" shows the difference between your actual costs and what companies typically cover. This is your potential out-of-pocket expense without additional negotiation.
                      </Text>
                    </View>

                    {/* Tax Burden */}
                    <View style={styles.infoSection}>
                      <View style={styles.infoSectionHeader}>
                        <Ionicons name="calculator-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.infoSectionTitle}>Tax Burden Change</Text>
                      </View>
                      <Text style={styles.infoSectionText}>
                        Compares your effective tax rate between cities. This annual impact can be used to justify a COL adjustment or signing bonus.
                      </Text>
                    </View>

                    {/* Note */}
                    <View style={styles.infoNote}>
                      <Ionicons name="information-circle" size={18} color={COLORS.info} />
                      <Text style={styles.infoNoteText}>
                        These estimates provide a starting point for negotiation. Actual costs may vary based on your specific circumstances, timing, and choices.
                      </Text>
                    </View>
                  </ScrollView>

                  <TouchableOpacity
                    onPress={() => setShowCostInfo(false)}
                    style={styles.infoModalButton}
                  >
                    <Text style={styles.infoModalButtonText}>Got It</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <View style={styles.costsList}>
              <CostBreakdownItem
                label="Moving Expenses"
                amount={costBreakdown.movingExpenses}
                percentage={getPercentage(costBreakdown.movingExpenses)}
              />
              <CostBreakdownItem
                label="Temporary Housing"
                amount={costBreakdown.temporaryHousing}
                percentage={getPercentage(costBreakdown.temporaryHousing)}
              />
              <CostBreakdownItem
                label="House Hunting Trips"
                amount={costBreakdown.houseHuntingTrips}
                percentage={getPercentage(costBreakdown.houseHuntingTrips)}
              />
              <CostBreakdownItem
                label="Duplicate Housing"
                amount={costBreakdown.duplicateHousing}
                percentage={getPercentage(costBreakdown.duplicateHousing)}
              />
              <CostBreakdownItem
                label={`Travel Costs (${travelModeLabel})`}
                amount={costBreakdown.travelCosts}
                percentage={getPercentage(costBreakdown.travelCosts)}
              />
              <CostBreakdownItem
                label="Storage (if needed)"
                amount={costBreakdown.storageIfNeeded}
                percentage={getPercentage(costBreakdown.storageIfNeeded)}
              />
              <CostBreakdownItem
                label="Tax Gross-Up"
                amount={costBreakdown.grossUpAmount}
                percentage={getPercentage(costBreakdown.grossUpAmount)}
              />
              <View style={styles.divider} />
              <CostBreakdownItem
                label="Total Relocation Cost"
                amount={costBreakdown.totalRelocationCost}
                isTotal
              />
            </View>

            {/* COL & Tax Impact */}
            {(costBreakdown.colAdjustmentNeeded > 0 || costBreakdown.taxBurdenDifference !== 0) && (
              <View style={styles.additionalCosts}>
                <Text style={styles.additionalCostsTitle}>Annual Impact Considerations</Text>
                {costBreakdown.colAdjustmentNeeded > 0 && (
                  <View style={styles.additionalCostItem}>
                    <Ionicons name="trending-up" size={16} color={COLORS.warning} />
                    <Text style={styles.additionalCostText}>
                      COL Adjustment Needed: {formatCurrency(costBreakdown.colAdjustmentNeeded)}/year
                    </Text>
                  </View>
                )}
                {costBreakdown.taxBurdenDifference !== 0 && (
                  <View style={styles.additionalCostItem}>
                    <Ionicons
                      name={costBreakdown.taxBurdenDifference > 0 ? 'arrow-up' : 'arrow-down'}
                      size={16}
                      color={costBreakdown.taxBurdenDifference > 0 ? COLORS.error : COLORS.success}
                    />
                    <Text style={styles.additionalCostText}>
                      Tax Burden Change: {costBreakdown.taxBurdenDifference > 0 ? '+' : ''}{formatCurrency(costBreakdown.taxBurdenDifference)}/year
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Benchmarks Section */}
        {activeSection === 'benchmarks' && (
          <View style={styles.benchmarksSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Industry Benchmarks</Text>
              <TouchableOpacity
                onPress={() => setShowBenchmarkInfo(true)}
                style={styles.sectionInfoButton}
              >
                <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionDescription}>
              What companies typically cover for relocations
            </Text>

            {/* Benchmark Info Modal */}
            <Modal
              visible={showBenchmarkInfo}
              animationType="fade"
              transparent={true}
              onRequestClose={() => setShowBenchmarkInfo(false)}
            >
              <View style={styles.infoModalOverlay}>
                <View style={styles.infoModalContent}>
                  <View style={styles.infoModalHeader}>
                    <Text style={styles.infoModalTitle}>Understanding Benchmarks</Text>
                    <TouchableOpacity
                      onPress={() => setShowBenchmarkInfo(false)}
                      style={styles.infoModalClose}
                    >
                      <Ionicons name="close" size={24} color={COLORS.mediumGray} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.infoModalBody}>
                    <View style={styles.infoSection}>
                      <View style={styles.infoSectionHeader}>
                        <Ionicons name="stats-chart-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.infoSectionTitle}>What This Shows</Text>
                      </View>
                      <Text style={styles.infoSectionText}>
                        Industry benchmarks represent what companies typically include in relocation packages, based on corporate relocation survey data.
                      </Text>
                    </View>

                    <View style={styles.infoSection}>
                      <View style={styles.infoSectionHeader}>
                        <Ionicons name="bar-chart-outline" size={20} color={COLORS.success} />
                        <Text style={styles.infoSectionTitle}>The Green Bars</Text>
                      </View>
                      <Text style={styles.infoSectionText}>
                        The green bars show the percentage of companies that typically cover each component. A full bar (100%) means nearly all companies include it. A half bar (50%) means only about half of companies offer that benefit.
                      </Text>
                    </View>

                    <View style={styles.infoSection}>
                      <View style={styles.infoSectionHeader}>
                        <Ionicons name="cash-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.infoSectionTitle}>Dollar Ranges</Text>
                      </View>
                      <Text style={styles.infoSectionText}>
                        The dollar ranges show the typical low-to-high amounts companies provide for each component. Your actual package may vary based on seniority, company size, and industry.
                      </Text>
                    </View>

                    <View style={styles.infoSection}>
                      <View style={styles.infoSectionHeader}>
                        <Ionicons name="bulb-outline" size={20} color={COLORS.warning} />
                        <Text style={styles.infoSectionTitle}>How to Use This</Text>
                      </View>
                      <Text style={styles.infoSectionText}>
                        Use these benchmarks as leverage in your negotiation. Items with high coverage rates (like moving expenses) are easy asks. Items with lower rates (like COL adjustments) may require stronger justification — use the Scripts tab for professional language.
                      </Text>
                    </View>

                    <View style={styles.infoNote}>
                      <Ionicons name="information-circle" size={18} color={COLORS.info} />
                      <Text style={styles.infoNoteText}>
                        Tech companies and senior roles often exceed these ranges. Use these as a baseline, not a ceiling.
                      </Text>
                    </View>
                  </ScrollView>

                  <TouchableOpacity
                    onPress={() => setShowBenchmarkInfo(false)}
                    style={styles.infoModalButton}
                  >
                    <Text style={styles.infoModalButtonText}>Got It</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <View style={styles.benchmarksList}>
              {benchmarks.map((benchmark, index) => (
                <BenchmarkRow key={index} benchmark={benchmark} />
              ))}
            </View>

            <View style={styles.benchmarkNote}>
              <Ionicons name="information-circle" size={16} color={COLORS.info} />
              <Text style={styles.benchmarkNoteText}>
                These ranges represent typical corporate relocation packages. Tech companies and senior roles often exceed these amounts.
              </Text>
            </View>
          </View>
        )}

        {/* Scripts Section */}
        {activeSection === 'scripts' && (
          <View style={styles.scriptsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Negotiation Scripts</Text>
              <TouchableOpacity
                onPress={() => setShowScriptInfo(true)}
                style={styles.sectionInfoButton}
              >
                <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionDescription}>
              Professional language to use in your negotiation
            </Text>

            {/* Script Info Modal */}
            <Modal
              visible={showScriptInfo}
              animationType="fade"
              transparent={true}
              onRequestClose={() => setShowScriptInfo(false)}
            >
              <View style={styles.infoModalOverlay}>
                <View style={styles.infoModalContent}>
                  <View style={styles.infoModalHeader}>
                    <Text style={styles.infoModalTitle}>Using Negotiation Scripts</Text>
                    <TouchableOpacity
                      onPress={() => setShowScriptInfo(false)}
                      style={styles.infoModalClose}
                    >
                      <Ionicons name="close" size={24} color={COLORS.mediumGray} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.infoModalBody}>
                    <View style={styles.infoSection}>
                      <View style={styles.infoSectionHeader}>
                        <Ionicons name="chatbubbles-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.infoSectionTitle}>What These Are</Text>
                      </View>
                      <Text style={styles.infoSectionText}>
                        These are ready-to-use talking points tailored to your specific move. Each script is pre-filled with your calculated figures and city-specific data so you can speak confidently with numbers to back up your requests.
                      </Text>
                    </View>

                    <View style={styles.infoSection}>
                      <View style={styles.infoSectionHeader}>
                        <Ionicons name="clipboard-outline" size={20} color={COLORS.success} />
                        <Text style={styles.infoSectionTitle}>How to Use Them</Text>
                      </View>
                      <Text style={styles.infoSectionText}>
                        Tap a script to expand it, then use the copy button to save it. You can use these word-for-word in emails, or adapt them as talking points for phone and in-person conversations. The professional tone is intentional — it frames your requests as reasonable and data-driven.
                      </Text>
                    </View>

                    <View style={styles.infoSection}>
                      <View style={styles.infoSectionHeader}>
                        <Ionicons name="timer-outline" size={20} color={COLORS.warning} />
                        <Text style={styles.infoSectionTitle}>When to Use Each Script</Text>
                      </View>
                      <View style={styles.infoList}>
                        <Text style={styles.infoListItem}>• <Text style={styles.infoListBold}>COL Adjustment / Relocation Bonus:</Text> During salary negotiation, after receiving the initial offer</Text>
                        <Text style={styles.infoListItem}>• <Text style={styles.infoListBold}>Tax Gross-Up:</Text> When discussing the relocation package details with HR</Text>
                        <Text style={styles.infoListItem}>• <Text style={styles.infoListBold}>Temporary Housing:</Text> When finalizing relocation terms and start date</Text>
                        <Text style={styles.infoListItem}>• <Text style={styles.infoListBold}>Housing Assistance:</Text> When discussing the full scope of relocation support</Text>
                      </View>
                    </View>

                    <View style={styles.infoNote}>
                      <Ionicons name="information-circle" size={18} color={COLORS.info} />
                      <Text style={styles.infoNoteText}>
                        Customize these scripts to match your communication style. The key is keeping the data-driven framing while making it sound natural to you.
                      </Text>
                    </View>
                  </ScrollView>

                  <TouchableOpacity
                    onPress={() => setShowScriptInfo(false)}
                    style={styles.infoModalButton}
                  >
                    <Text style={styles.infoModalButtonText}>Got It</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <ScriptCard
              title={costBreakdown.colAdjustmentNeeded > 0 ? "Request COL Adjustment" : "Request Relocation Bonus"}
              script={scripts.colAdjustment}
              icon="cash-outline"
              color={COLORS.success}
            />
            <ScriptCard
              title="Request Tax Gross-Up"
              script={scripts.grossUp}
              icon="receipt-outline"
              color={COLORS.info}
            />
            <ScriptCard
              title="Request Temporary Housing"
              script={scripts.temporaryHousing}
              icon="home-outline"
              color={COLORS.warning}
            />
            <ScriptCard
              title={plansToBuy ? "Request Closing Cost Assistance" : "Request Housing Transition Support"}
              script={scripts.homeSaleAssistance}
              icon={plansToBuy ? "home-outline" : "key-outline"}
              color={COLORS.primary}
            />
          </View>
        )}
      </View>

      {/* Negotiation Points */}
      <View style={styles.pointsSection}>
        <Text style={styles.pointsTitle}>Key Talking Points</Text>
        {negotiationPoints.map((point, index) => (
          <View key={index} style={styles.pointItem}>
            <View style={styles.pointBullet}>
              <Text style={styles.pointBulletText}>{index + 1}</Text>
            </View>
            <Text style={styles.pointText}>{point}</Text>
          </View>
        ))}
      </View>

      {/* Bottom CTA */}
      <View style={styles.ctaSection}>
        <TouchableOpacity style={styles.exportButton}>
          <Ionicons name="document-text-outline" size={20} color={COLORS.white} />
          <Text style={styles.exportButtonText}>Export Negotiation Brief</Text>
        </TouchableOpacity>
      </View>
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
    ...SHADOWS.md,
  },
  header: {
    padding: SPACING.md,
    backgroundColor: COLORS.charcoal,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.lightGray,
    marginTop: SPACING.xs,
  },
  moveTypeBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  moveTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  moveTypeBadgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.white,
  },
  distanceText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.lightGray,
  },
  householdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADIUS.sm,
  },
  householdText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.lightGray,
  },
  premiumBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  premiumBadgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
  summaryRow: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
    backgroundColor: COLORS.offWhite,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
  },
  gapAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.warningLight,
    padding: SPACING.md,
    gap: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  gapAlertContent: {
    flex: 1,
  },
  gapAlertTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.warning,
    marginBottom: 2,
  },
  gapAlertText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    lineHeight: 18,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    fontWeight: '500',
  },
  tabTextActive: {
    color: COLORS.info,
    fontWeight: '600',
  },
  content: {
    padding: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionInfoButton: {
    padding: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  sectionDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    marginBottom: SPACING.md,
  },
  // Costs Section
  costsSection: {},
  costsList: {
    backgroundColor: COLORS.offWhite,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
  },
  costItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  costItemTotal: {
    paddingTop: SPACING.md,
  },
  costLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  costLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
  },
  costLabelTotal: {
    fontWeight: '700',
    fontSize: FONTS.sizes.base,
  },
  costPercentage: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  costAmount: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  costAmountTotal: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.info,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: SPACING.sm,
  },
  additionalCosts: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.offWhite,
    borderRadius: RADIUS.sm,
  },
  additionalCostsTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.mediumGray,
    marginBottom: SPACING.sm,
  },
  additionalCostItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  additionalCostText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
  },
  // Benchmarks Section
  benchmarksSection: {},
  benchmarksList: {
    gap: SPACING.sm,
  },
  benchmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.offWhite,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  benchmarkLeft: {
    flex: 1,
  },
  benchmarkComponent: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  benchmarkCoverage: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    marginTop: 2,
  },
  benchmarkRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  coverageBar: {
    width: 80,
    height: 6,
    backgroundColor: COLORS.lightGray,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginBottom: 4,
  },
  coverageFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.full,
  },
  benchmarkRange: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
  },
  benchmarkNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.infoLight,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  benchmarkNoteText: {
    flex: 1,
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    lineHeight: 16,
  },
  // Scripts Section
  scriptsSection: {
    gap: SPACING.sm,
  },
  scriptCard: {
    backgroundColor: COLORS.offWhite,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  scriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  scriptIconContainer: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scriptTitle: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  scriptContent: {
    padding: SPACING.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  scriptText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: SPACING.md,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    gap: SPACING.xs,
  },
  copyButtonText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.info,
    fontWeight: '600',
  },
  // Points Section
  pointsSection: {
    padding: SPACING.md,
    backgroundColor: COLORS.offWhite,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  pointsTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.mediumGray,
    marginBottom: SPACING.md,
  },
  pointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  pointBullet: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointBulletText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
  pointText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    lineHeight: 18,
  },
  // CTA Section
  ctaSection: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
    gap: SPACING.sm,
  },
  exportButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.white,
  },
  // Info Modal Styles
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
    color: COLORS.white,
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
    color: COLORS.white,
  },
  infoSectionText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  infoList: {
    paddingLeft: SPACING.sm,
  },
  infoListItem: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    lineHeight: 22,
    marginBottom: SPACING.xs,
  },
  infoListBold: {
    fontWeight: '600',
    color: COLORS.white,
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
    color: COLORS.mediumGray,
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

export default NegotiationToolkit;
