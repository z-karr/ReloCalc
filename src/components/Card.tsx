import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  onPress,
}) => {
  const cardStyles = [
    styles.card,
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyles} onPress={onPress} activeOpacity={0.9}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
};

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  rightElement,
}) => (
  <View style={styles.header}>
    <View style={styles.headerText}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
    {rightElement && <View style={styles.headerRight}>{rightElement}</View>}
  </View>
);

interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardContent: React.FC<CardContentProps> = ({ children, style }) => (
  <View style={[styles.content, style]}>{children}</View>
);

interface StatProps {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Stat: React.FC<StatProps> = ({
  label,
  value,
  trend,
  trendValue,
  size = 'md',
}) => (
  <View style={styles.stat}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, styles[`${size}Value`]]}>{value}</Text>
    {trend && trendValue && (
      <View
        style={[
          styles.trend,
          trend === 'up' && styles.trendUp,
          trend === 'down' && styles.trendDown,
        ]}
      >
        <Text
          style={[
            styles.trendText,
            trend === 'up' && styles.trendTextUp,
            trend === 'down' && styles.trendTextDown,
          ]}
        >
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
        </Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    ...SHADOWS.md,
  },
  elevated: {
    ...SHADOWS.lg,
  },
  outlined: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    shadowColor: 'transparent',
    elevation: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  headerText: {
    flex: 1,
  },
  headerRight: {
    marginLeft: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.charcoal,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
  },
  content: {
    // Default content styling
  },
  stat: {
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontWeight: '700',
    color: COLORS.charcoal,
  },
  smValue: {
    fontSize: FONTS.sizes.md,
  },
  mdValue: {
    fontSize: FONTS.sizes.xl,
  },
  lgValue: {
    fontSize: FONTS.sizes.xxl,
  },
  trend: {
    marginTop: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.lightGray,
  },
  trendUp: {
    backgroundColor: COLORS.successLight,
  },
  trendDown: {
    backgroundColor: COLORS.errorLight,
  },
  trendText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  trendTextUp: {
    color: COLORS.success,
  },
  trendTextDown: {
    color: COLORS.error,
  },
});
