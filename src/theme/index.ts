import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Web-specific: Check if we're on a large screen (desktop/tablet)
const isLargeScreen = Platform.OS === 'web' && width > 768;

export const COLORS = {
  // Primary palette - deep midnight to dawn gradient feel
  primary: '#1E3A5F',
  primaryLight: '#2D5F8B',
  primaryDark: '#0F1F33',
  
  // Accent - warm coral/salmon for CTAs
  accent: '#E8735A',
  accentLight: '#F09080',
  accentDark: '#C45A44',
  
  // Secondary - soft teal
  secondary: '#4ECDC4',
  secondaryLight: '#7EDDD6',
  secondaryDark: '#35A89F',
  
  // Neutrals
  white: '#FFFFFF',
  offWhite: '#F8F9FA',
  lightGray: '#E9ECEF',
  mediumGray: '#ADB5BD',
  darkGray: '#495057',
  charcoal: '#212529',
  black: '#0D0D0D',
  
  // Semantic colors
  success: '#28A745',
  successLight: '#D4EDDA',
  warning: '#FFC107',
  warningLight: '#FFF3CD',
  error: '#DC3545',
  errorLight: '#F8D7DA',
  info: '#17A2B8',
  infoLight: '#D1ECF1',
  
  // Gradients (as arrays for LinearGradient)
  gradientPrimary: ['#1E3A5F', '#2D5F8B'],
  gradientAccent: ['#E8735A', '#F09080'],
  gradientDark: ['#0F1F33', '#1E3A5F'],
  gradientCard: ['#FFFFFF', '#F8F9FA'],
};

export const FONTS = {
  // Primary: DM Sans for clean readability
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
    hero: 42,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
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
  sm: Platform.OS === 'web' ? { boxShadow: '0 1px 2px rgba(0,0,0,0.05)' } : {},
  md: Platform.OS === 'web' ? { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' } : {},
  lg: Platform.OS === 'web' ? { boxShadow: '0 4px 16px rgba(0,0,0,0.12)' } : {},
  xl: Platform.OS === 'web' ? { boxShadow: '0 8px 24px rgba(0,0,0,0.15)' } : {},
};
