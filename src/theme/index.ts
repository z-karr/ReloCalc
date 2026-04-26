import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Web-specific: Check if we're on a large screen (desktop/tablet)
const isLargeScreen = Platform.OS === 'web' && width > 768;

export const COLORS = {
  // Primary palette - refined deep navy
  primary: '#1A2E4A',
  primaryLight: '#2B4C7E',
  primaryDark: '#0D1B2A',

  // Accent - warm coral/salmon for CTAs and emphasis
  accent: '#E06B50',
  accentLight: '#F09080',
  accentDark: '#C45A44',

  // Secondary - refined teal for positive indicators
  secondary: '#2EBCB3',
  secondaryLight: '#7EDDD6',
  secondaryDark: '#1E9A92',

  // Neutrals - optimized for dark backgrounds
  white: '#FFFFFF',
  offWhite: '#F5F7FA',
  lightGray: '#E4E8EE',
  mediumGray: '#B8C4D0',
  gray: '#8899AA',
  darkGray: '#6B7D8F',
  charcoal: '#1E293B',
  black: '#0F172A',

  // Semantic colors - refined for premium feel
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#EAB308',
  warningLight: '#FEF9C3',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  info: '#0EA5E9',
  infoLight: '#E0F2FE',

  // Gradients (as arrays for LinearGradient)
  gradientPrimary: ['#1A2E4A', '#2B4C7E'],
  gradientAccent: ['#E06B50', '#F09080'],
  gradientDark: ['#0D1B2A', '#1A2E4A'],
  gradientCard: ['#FFFFFF', '#F5F7FA'],
};

export const FONTS = {
  // System fonts with premium weight hierarchy
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',

  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 32,
    hero: 40,
  },

  lineHeights: {
    tight: 1.2,
    base: 1.5,
    relaxed: 1.75,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  // Premium card shadow - subtle and elegant
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  // Inner glow for active states
  glow: {
    shadowColor: '#2B4C7E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
};

export const LAYOUT = {
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375,
  isLargeScreen,
  containerPadding: SPACING.base,
  maxContentWidth: 480,
  // Web-specific responsive breakpoints
  web: {
    maxAppWidth: 480, // Mobile app-like width on desktop
    containerMaxWidth: 600, // Max width for content containers
    sidebarWidth: 280, // If we add a sidebar later
  },
};

// Web-specific shadow styles (box-shadow instead of elevation)
export const WEB_SHADOWS = {
  sm: Platform.OS === 'web' ? { boxShadow: '0 1px 3px rgba(15,23,42,0.04)' } : {},
  md: Platform.OS === 'web' ? { boxShadow: '0 2px 8px rgba(15,23,42,0.06)' } : {},
  lg: Platform.OS === 'web' ? { boxShadow: '0 4px 16px rgba(15,23,42,0.08)' } : {},
  xl: Platform.OS === 'web' ? { boxShadow: '0 8px 24px rgba(15,23,42,0.12)' } : {},
  card: Platform.OS === 'web' ? { boxShadow: '0 1px 6px rgba(15,23,42,0.05)' } : {},
};
