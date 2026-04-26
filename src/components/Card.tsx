import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity, Platform } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined' | 'solid';
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
    variant === 'solid' && styles.solid,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyles} onPress={onPress} activeOpacity={0.92}>
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
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderTopWidth: 2,
    borderTopColor: COLORS.accent + '60',
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(8px)',
    } as any),
  },
  elevated: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.16)',
    borderTopColor: COLORS.accent + '80',
  },
  outlined: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  // Solid white variant for when you need white cards (e.g., inside modals)
  solid: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.lightGray + '80',
    ...SHADOWS.card,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 1px 4px rgba(15,23,42,0.04), 0 1px 2px rgba(15,23,42,0.03)',
    }),
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
    color: COLORS.white,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
  },
  content: {
    // Default content styling
  },
  stat: {
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  statValue: {
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: -0.3,
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
    marginTop: 6,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  trendUp: {
    backgroundColor: COLORS.success + '25',
  },
  trendDown: {
    backgroundColor: COLORS.error + '25',
  },
  trendText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.mediumGray,
  },
  trendTextUp: {
    color: COLORS.success,
  },
  trendTextDown: {
    color: COLORS.error,
  },
});
