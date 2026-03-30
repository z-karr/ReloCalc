import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../theme';

interface ScrollIndicatorProps {
  visible: boolean;
}

/**
 * ScrollIndicator - A subtle animated indicator that shows users there's more content below
 *
 * Shows a bouncing chevron arrow that fades out once the user starts scrolling.
 * Works on both mobile and web.
 */
export const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({ visible }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // Bounce animation loop
  useEffect(() => {
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 8,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    if (visible) {
      bounceAnimation.start();
    }

    return () => bounceAnimation.stop();
  }, [visible, bounceAnim]);

  // Fade out animation when visible changes to false
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim]);

  if (!visible && fadeAnim._value === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: bounceAnim }],
        },
      ]}
      pointerEvents="none"
    >
      <View style={styles.indicator}>
        <Ionicons name="chevron-down" size={24} color={COLORS.white} />
      </View>
      <View style={styles.gradientOverlay} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  indicator: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    }),
    // Mobile shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    height: 60,
    // This creates a subtle fade effect at the bottom
  },
});
