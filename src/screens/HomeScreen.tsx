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
import { Card } from '../components';

interface HomeScreenProps {
  navigation: any;
}

interface FeatureCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
  color: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  onPress,
  color,
}) => (
  <TouchableOpacity style={styles.featureCard} onPress={onPress} activeOpacity={0.9}>
    <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={28} color={color} />
    </View>
    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
  </TouchableOpacity>
);

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerGradient}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.appName}>ReloCalc</Text>
                <Text style={styles.tagline}>
                  Make smarter relocation decisions
                </Text>
              </View>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => navigation.navigate('Settings')}
              >
                <Ionicons name="settings-outline" size={24} color={COLORS.white} />
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
          <Text style={styles.sectionTitle}>Calculate</Text>
          
          <FeatureCard
            icon="calculator-outline"
            title="Salary Calculator"
            description="Compare take-home pay across cities with real tax rates"
            onPress={() => navigation.navigate('SalaryCalculator')}
            color={COLORS.primary}
          />

          <FeatureCard
            icon="git-compare-outline"
            title="City Comparison"
            description="Compare two cities side by side with detailed metrics"
            onPress={() => navigation.navigate('CityComparison')}
            color={COLORS.secondary}
          />

          <FeatureCard
            icon="car-outline"
            title="Moving Cost Estimator"
            description="Estimate your total relocation expenses"
            onPress={() => navigation.navigate('MovingEstimator')}
            color={COLORS.accent}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discover</Text>

          <FeatureCard
            icon="compass-outline"
            title="City Recommendations"
            description="Find your ideal city based on your preferences"
            onPress={() => navigation.navigate('Recommendations')}
            color="#9B59B6"
          />

          <FeatureCard
            icon="bar-chart-outline"
            title="Full Analysis"
            description="Complete relocation analysis with break-even timeline"
            onPress={() => navigation.navigate('FullAnalysis')}
            color="#3498DB"
          />
        </View>

        {/* Info Card */}
        <Card style={styles.infoCard} variant="outlined">
          <View style={styles.infoContent}>
            <Ionicons name="information-circle" size={24} color={COLORS.info} />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Data Sources</Text>
              <Text style={styles.infoDescription}>
                Tax calculations use current official rates for 40 countries. Cost of living data from Numbeo and C2ER. City metrics from official government sources.
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingBottom: SPACING.xl,
  },
  headerGradient: {
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
  appName: {
    fontSize: FONTS.sizes.hero,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    opacity: 0.85,
    marginTop: SPACING.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.base,
    marginTop: -SPACING.lg,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.base,
    ...SHADOWS.lg,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: SPACING.xs,
  },
  statNumber: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: SPACING.base,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: COLORS.mediumGray,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: SPACING.md,
    marginLeft: SPACING.xs,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
    // Web-specific: cursor pointer and hover transition
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'transform 0.15s, box-shadow 0.15s',
    }),
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  featureTitle: {
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
    color: COLORS.charcoal,
  },
  featureDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    marginTop: 2,
  },
  infoCard: {
    marginHorizontal: SPACING.base,
    marginTop: SPACING.lg,
    backgroundColor: COLORS.infoLight,
    borderColor: COLORS.info + '30',
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.info,
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    lineHeight: 18,
  },
  footer: {
    height: SPACING.xxxl,
  },
});
