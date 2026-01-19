import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { COLORS, FONTS } from './src/theme';
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
    </UserPreferencesProvider>
  );
}
