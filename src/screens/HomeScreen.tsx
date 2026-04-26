import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS, LAYOUT } from '../theme';

interface HomeScreenProps {
  navigation: any;
}

interface FeatureCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
  color: string;
  badge?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  onPress,
  color,
  badge,
}) => (
  <TouchableOpacity style={[styles.featureCard, { borderLeftColor: color + '50' }]} onPress={onPress} activeOpacity={0.88}>
    <View style={[styles.iconContainer, { backgroundColor: color + '30' }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <View style={styles.featureContent}>
      <View style={styles.featureTitleRow}>
        <Text style={styles.featureTitle}>{title}</Text>
        {badge && (
          <View style={styles.featureBadge}>
            <Text style={styles.featureBadgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </TouchableOpacity>
);

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View>
                <View style={styles.appNameRow}>
                  <Text style={styles.appName}>Relo</Text>
                  <Text
                    style={styles.appNameAccent}
                    {...(Platform.OS === 'web' ? { dataSet: { shimmer: '' } } : {})}
                  >Fi</Text>
                </View>
                <Text style={styles.tagline}>
                  Smart relocation decisions,{'\n'}backed by real data
                </Text>
              </View>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => navigation.navigate('Settings')}
              >
                <Ionicons name="settings-outline" size={22} color={COLORS.mediumGray} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>100+</Text>
            <Text style={styles.statLabel}>Cities</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>40</Text>
            <Text style={styles.statLabel}>Countries</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>Real</Text>
            <Text style={styles.statLabel}>Tax Data</Text>
          </View>
        </View>

        {/* Main Features */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionDot, { backgroundColor: COLORS.secondary }]} />
            <Text style={styles.sectionTitle}>Calculate</Text>
          </View>

          <FeatureCard
            icon="calculator-outline"
            title="Salary Calculator"
            description="Compare take-home pay with real tax rates"
            onPress={() => navigation.navigate('SalaryCalculator')}
            color={COLORS.info}
          />

          <FeatureCard
            icon="git-compare-outline"
            title="City Comparison"
            description="Side-by-side metrics for two cities"
            onPress={() => navigation.navigate('CityComparison')}
            color={COLORS.secondary}
          />

          <FeatureCard
            icon="cube-outline"
            title="Moving Cost Estimator"
            description="Estimate your total relocation expenses"
            onPress={() => navigation.navigate('MovingEstimator')}
            color={COLORS.accent}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionDot, { backgroundColor: COLORS.accent }]} />
            <Text style={styles.sectionTitle}>Analyze</Text>
          </View>

          <FeatureCard
            icon="compass-outline"
            title="City Recommendations"
            description="Find your ideal city based on preferences"
            onPress={() => navigation.navigate('Recommendations')}
            color="#7C3AED"
          />

          <FeatureCard
            icon="analytics-outline"
            title="Full Analysis"
            description="Complete financial analysis with projections"
            onPress={() => navigation.navigate('FullAnalysis')}
            color={COLORS.info}
            badge="PRO"
          />
        </View>

        {/* Data Sources */}
        <View style={styles.dataSourceCard}>
          <View style={styles.dataSourceHeader}>
            <Ionicons name="shield-checkmark" size={18} color={COLORS.secondary} />
            <Text style={styles.dataSourceTitle}>Trusted Data Sources</Text>
          </View>
          <Text style={styles.dataSourceText}>
            Tax calculations use current official rates for 40 countries. Cost of living data from Numbeo and C2ER. City metrics from official government sources.
          </Text>
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingBottom: SPACING.xl,
  },
  headerContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.base,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  settingsButton: {
    padding: SPACING.sm,
    marginTop: -SPACING.xs,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  appNameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  appName: {
    fontSize: FONTS.sizes.hero,
    fontWeight: '800',
    color: COLORS.charcoal,
    letterSpacing: -1.5,
  },
  appNameAccent: {
    fontSize: FONTS.sizes.hero,
    fontWeight: '800',
    letterSpacing: -1.5,
    color: COLORS.accent,
  },
  tagline: {
    fontSize: FONTS.sizes.base,
    color: COLORS.gray,
    marginTop: SPACING.sm,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: SPACING.base,
    marginTop: SPACING.md,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.primaryLight,
    marginVertical: SPACING.xs,
  },
  statNumber: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    marginTop: 2,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    paddingHorizontal: SPACING.base,
    marginTop: SPACING.xl,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginLeft: SPACING.xs,
    gap: SPACING.sm,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: COLORS.mediumGray,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(255,255,255,0.15)',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      backdropFilter: 'blur(8px)',
    } as any),
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  featureTitle: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.white,
    letterSpacing: -0.1,
  },
  featureBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  featureBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.8,
  },
  featureDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    marginTop: 2,
    lineHeight: 17,
  },
  dataSourceCard: {
    marginHorizontal: SPACING.base,
    marginTop: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  dataSourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  dataSourceTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  dataSourceText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    lineHeight: 19,
  },
  footer: {
    height: SPACING.xxxl,
  },
});
