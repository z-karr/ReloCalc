import React from 'react';
import { View, StyleSheet, Platform, useWindowDimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { COLORS, SPACING, LAYOUT } from '../theme';

interface ScreenWrapperProps {
  children: React.ReactNode;
  backgroundColor?: string;
  scrollable?: boolean;
  noPadding?: boolean;
}

/**
 * ScreenWrapper - A responsive container component for web compatibility
 *
 * On mobile: Full-width layout
 * On desktop web: Centered content with max-width constraint for app-like experience
 */
export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  backgroundColor = COLORS.offWhite,
  scrollable = true,
  noPadding = false,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  // On web desktop, center content in a constrained container
  const containerStyle = isDesktop
    ? [styles.desktopContainer, { backgroundColor }]
    : [styles.mobileContainer, { backgroundColor }];

  const contentStyle = isDesktop
    ? [styles.desktopContent, !noPadding && styles.contentPadding]
    : [styles.mobileContent, !noPadding && styles.contentPadding];

  const ContentWrapper = scrollable ? ScrollView : View;

  return (
    <SafeAreaView style={containerStyle}>
      {isDesktop && <View style={styles.desktopBackground} />}
      <ContentWrapper
        style={contentStyle}
        showsVerticalScrollIndicator={false}
        {...(scrollable && { contentContainerStyle: styles.scrollContent })}
      >
        {children}
      </ContentWrapper>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mobileContainer: {
    flex: 1,
  },
  mobileContent: {
    flex: 1,
  },
  desktopContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
  },
  desktopBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.lightGray,
  },
  desktopContent: {
    flex: 1,
    width: '100%',
    maxWidth: LAYOUT.web.maxAppWidth,
    backgroundColor: COLORS.offWhite,
    // Web-specific shadow for the "phone frame" effect
    ...(Platform.OS === 'web' && {
      boxShadow: '0 0 40px rgba(0,0,0,0.1)',
    }),
  },
  contentPadding: {
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.base,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
