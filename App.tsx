import React, { useEffect } from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { COLORS, FONTS, LAYOUT } from './src/theme';

// Inject global styles for web
if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    html, body, #root {
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
    body {
      background-color: #E5E8ED;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    /* Custom scrollbar for webkit browsers */
    ::-webkit-scrollbar {
      width: 8px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: #ADB5BD;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #6C757D;
    }
    /* Hide scrollbar for IE, Edge and Firefox */
    * {
      -ms-overflow-style: thin;
      scrollbar-width: thin;
      scrollbar-color: #ADB5BD transparent;
    }
  `;
  document.head.appendChild(style);
}
import {
  HomeScreen,
  SalaryCalculatorScreen,
  MovingEstimatorScreen,
  RecommendationsScreen,
  CityComparisonScreen,
  FullAnalysisScreen,
  SettingsScreen,
} from './src/screens';
import { UserPreferencesProvider } from './src/context/UserPreferencesContext';
import { PremiumProvider } from './src/context/PremiumContext';

// Base styles that work on all platforms
const webLayoutStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E8ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appContainer: {
    width: '100%',
    maxWidth: 750, // Comfortable width for desktop - not too narrow, not too wide
    height: '100%',
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    borderRadius: 12,
  },
});

// Web-specific style overrides (applied as inline styles)
const webSpecificStyles = Platform.OS === 'web' ? {
  appContainer: {
    maxHeight: '95vh',
    boxShadow: '0 0 60px rgba(0,0,0,0.15)',
  } as any,
} : {};

// Web layout wrapper for desktop browsers
const WebLayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  if (!isDesktop) {
    return <>{children}</>;
  }

  return (
    <View style={webLayoutStyles.container}>
      <View style={[webLayoutStyles.appContainer, webSpecificStyles.appContainer]}>
        {children}
      </View>
    </View>
  );
};

const Stack = createNativeStackNavigator();

// Explicitly typed navigation options to prevent boolean/string conversion issues
const screenOptions: NativeStackNavigationOptions = {
  headerStyle: {
    backgroundColor: COLORS.primary,
  },
  headerTintColor: COLORS.white,
  headerTitleStyle: {
    fontWeight: '600' as const,
    fontSize: FONTS.sizes.md,
  },
  // Removed headerBackTitleVisible and headerShadowVisible to avoid boolean/string conversion issues
};

export default function App() {
  return (
    <UserPreferencesProvider>
      <PremiumProvider>
        <WebLayoutWrapper>
          <NavigationContainer>
            <StatusBar style="light" />
            <Stack.Navigator screenOptions={screenOptions}>
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="SalaryCalculator"
                component={SalaryCalculatorScreen}
                options={{ title: 'Salary Calculator' }}
              />
              <Stack.Screen
                name="MovingEstimator"
                component={MovingEstimatorScreen}
                options={{ title: 'Moving Costs' }}
              />
              <Stack.Screen
                name="Recommendations"
                component={RecommendationsScreen}
                options={{ title: 'City Recommendations' }}
              />
              <Stack.Screen
                name="CityComparison"
                component={CityComparisonScreen}
                options={{ title: 'Compare Cities' }}
              />
              <Stack.Screen
                name="FullAnalysis"
                component={FullAnalysisScreen}
                options={{ title: 'Full Analysis' }}
              />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: 'Settings' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </WebLayoutWrapper>
      </PremiumProvider>
    </UserPreferencesProvider>
  );
}
