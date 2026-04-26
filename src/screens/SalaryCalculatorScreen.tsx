import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../theme';
import { Button, Card, CardHeader, CardContent, Input, CityPicker, CurrencyDisplay } from '../components';
import { City } from '../types';
import { calculateSalary, formatCurrency, formatPercent, calculateEquivalentSalary } from '../utils/taxCalculator';
import { getTaxBreakdownLabels } from '../utils/taxLabels';
import { useUserPreferences } from '../context/UserPreferencesContext';

interface SalaryCalculatorScreenProps {
  navigation: any;
}

export const SalaryCalculatorScreen: React.FC<SalaryCalculatorScreenProps> = ({ navigation }) => {
  const { preferences } = useUserPreferences();
  const [salary, setSalary] = useState('');
  const [currentCity, setCurrentCity] = useState<City | null>(null);
  const [targetCity, setTargetCity] = useState<City | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Get home currency info
  const homeCurrency = useMemo(() => {
    const { getCurrencyByCode } = require('../utils/currency/exchangeRates');
    return getCurrencyByCode(preferences.homeCurrency);
  }, [preferences.homeCurrency]);

  const parsedSalary = useMemo(() => {
    const cleaned = salary.replace(/[^0-9]/g, '');
    const amount = parseInt(cleaned, 10) || 0;

    // Convert from home currency to USD for calculations
    if (preferences.homeCurrency !== 'USD') {
      const { convertToUSD } = require('../utils/currency/exchangeRates');
      return convertToUSD(amount, preferences.homeCurrency);
    }

    return amount;
  }, [salary, preferences.homeCurrency]);

  const currentCalculation = useMemo(() => {
    if (!currentCity || parsedSalary === 0) return null;
    return calculateSalary(parsedSalary, currentCity);
  }, [parsedSalary, currentCity]);

  const targetCalculation = useMemo(() => {
    if (!targetCity || parsedSalary === 0) return null;
    return calculateSalary(parsedSalary, targetCity, currentCity?.costOfLivingIndex);
  }, [parsedSalary, targetCity, currentCity]);

  const equivalentSalary = useMemo(() => {
    if (!currentCity || !targetCity || parsedSalary === 0) return null;
    return calculateEquivalentSalary(parsedSalary, currentCity, targetCity);
  }, [parsedSalary, currentCity, targetCity]);

  const handleCalculate = () => {
    if (parsedSalary > 0 && currentCity) {
      setShowResults(true);
    }
  };

  const formatSalaryInput = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned === '') return '';
    const num = parseInt(cleaned, 10);
    return num.toLocaleString('en-US');
  };

  const canCalculate = parsedSalary > 0 && currentCity !== null;

  // Helper function to format currency in user's home currency
  const formatInHomeCurrency = (amountUSD: number): string => {
    if (preferences.homeCurrency === 'USD') {
      return formatCurrency(amountUSD);
    }
    const { convertFromUSD } = require('../utils/currency/exchangeRates');
    const converted = convertFromUSD(amountUSD, preferences.homeCurrency);
    return `${homeCurrency.symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Card style={styles.inputCard}>
            <CardHeader title="Your Information" subtitle="Enter your salary and locations" />
            <CardContent>
              <Input
                label="Annual Gross Salary"
                value={salary}
                onChangeText={(text) => setSalary(formatSalaryInput(text))}
                keyboardType="numeric"
                placeholder="100,000"
                prefix={homeCurrency.symbol}
                helper={`Enter your pre-tax annual salary in ${homeCurrency.code}`}
              />

              <CityPicker
                label="Current City"
                value={currentCity}
                onChange={setCurrentCity}
                placeholder="Where do you live now?"
              />

              <CityPicker
                label="Target City (Optional)"
                value={targetCity}
                onChange={setTargetCity}
                placeholder="Where are you considering?"
              />

              <Button
                title="Calculate Take-Home Pay"
                onPress={handleCalculate}
                disabled={!canCalculate}
                fullWidth
                style={styles.calculateButton}
              />
            </CardContent>
          </Card>

          {showResults && currentCalculation && (
            <View style={styles.resultsSection}>
              <Card style={styles.resultCard}>
                <CardHeader
                  title={currentCity?.name || 'Current City'}
                  subtitle={`${currentCity?.state || (currentCity?.countryCode !== 'US' ? currentCity?.countryCode : '')} • COL Index: ${currentCity?.costOfLivingIndex}`}
                  rightElement={
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>Current</Text>
                    </View>
                  }
                />
                <CardContent>
                  <View style={styles.mainStat}>
                    <Text style={styles.mainStatLabel}>Monthly Take-Home</Text>
                    <CurrencyDisplay
                      amountUSD={currentCalculation.monthlyTakeHome}
                      targetCurrency={currentCalculation.currency.code !== 'USD' ? currentCalculation.currency : undefined}
                      emphasize="auto"
                      showBoth={currentCalculation.currency.code !== 'USD'}
                      style={styles.mainStatValue}
                    />
                  </View>

                  <View style={styles.taxBreakdown}>
                    {currentCity && (() => {
                      const labels = getTaxBreakdownLabels(currentCity.taxRates, currentCity.country || 'us');
                      return (
                        <>
                          <View style={styles.taxRow}>
                            <Text style={styles.taxLabel}>Gross Salary</Text>
                            <Text style={styles.taxValue}>{formatInHomeCurrency(parsedSalary)}</Text>
                          </View>
                          <View style={styles.taxRow}>
                            <Text style={styles.taxLabel}>{labels.national}</Text>
                            <Text style={styles.taxValueNegative}>
                              -{formatInHomeCurrency(currentCalculation.federalTax)}
                            </Text>
                          </View>
                          {labels.regional && currentCalculation.stateTax > 0 && (
                            <View style={styles.taxRow}>
                              <Text style={styles.taxLabel}>
                                {labels.regional}{currentCity?.state ? ` (${currentCity.state})` : ''}
                              </Text>
                              <Text style={styles.taxValueNegative}>
                                -{formatInHomeCurrency(currentCalculation.stateTax)}
                              </Text>
                            </View>
                          )}
                          {currentCalculation.localTax > 0 && (
                            <View style={styles.taxRow}>
                              <Text style={styles.taxLabel}>Local Tax</Text>
                              <Text style={styles.taxValueNegative}>
                                -{formatInHomeCurrency(currentCalculation.localTax)}
                              </Text>
                            </View>
                          )}
                          <View style={styles.taxRow}>
                            <Text style={styles.taxLabel}>{labels.social}</Text>
                            <Text style={styles.taxValueNegative}>
                              -{formatInHomeCurrency(currentCalculation.fica)}
                            </Text>
                          </View>
                        </>
                      );
                    })()}
                    <View style={[styles.taxRow, styles.taxRowTotal]}>
                      <Text style={styles.taxLabelTotal}>Annual Take-Home</Text>
                      <CurrencyDisplay
                        amountUSD={currentCalculation.netSalary}
                        targetCurrency={currentCalculation.currency.code !== 'USD' ? currentCalculation.currency : undefined}
                        emphasize="auto"
                        showBoth={currentCalculation.currency.code !== 'USD'}
                        style={styles.taxValueTotal}
                      />
                    </View>
                  </View>

                  <View style={styles.effectiveRate}>
                    <Text style={styles.effectiveRateLabel}>Effective Tax Rate</Text>
                    <Text style={styles.effectiveRateValue}>
                      {formatPercent(currentCalculation.effectiveTaxRate)}
                    </Text>
                  </View>
                </CardContent>
              </Card>

              {targetCity && targetCalculation && (
                <Card style={styles.resultCard}>
                  <CardHeader
                    title={targetCity.name}
                    subtitle={`${targetCity.state || (targetCity.countryCode !== 'US' ? targetCity.countryCode : '')} • COL Index: ${targetCity.costOfLivingIndex}`}
                    rightElement={
                      <View style={[styles.badge, styles.badgeTarget]}>
                        <Text style={[styles.badgeText, styles.badgeTextTarget]}>Target</Text>
                      </View>
                    }
                  />
                  <CardContent>
                    <View style={styles.mainStat}>
                      <Text style={styles.mainStatLabel}>Monthly Take-Home</Text>
                      <CurrencyDisplay
                        amountUSD={targetCalculation.monthlyTakeHome}
                        targetCurrency={targetCalculation.currency.code !== 'USD' ? targetCalculation.currency : undefined}
                        emphasize="auto"
                        showBoth={targetCalculation.currency.code !== 'USD'}
                        style={styles.mainStatValue}
                      />
                    </View>

                    <View style={styles.taxBreakdown}>
                      {(() => {
                        const labels = getTaxBreakdownLabels(targetCity.taxRates, targetCity.country || 'us');
                        return (
                          <>
                            <View style={styles.taxRow}>
                              <Text style={styles.taxLabel}>Gross Salary</Text>
                              <Text style={styles.taxValue}>{formatInHomeCurrency(parsedSalary)}</Text>
                            </View>
                            <View style={styles.taxRow}>
                              <Text style={styles.taxLabel}>{labels.national}</Text>
                              <Text style={styles.taxValueNegative}>
                                -{formatInHomeCurrency(targetCalculation.federalTax)}
                              </Text>
                            </View>
                            {labels.regional && targetCalculation.stateTax > 0 && (
                              <View style={styles.taxRow}>
                                <Text style={styles.taxLabel}>
                                  {labels.regional}{targetCity.state ? ` (${targetCity.state})` : ''}
                                </Text>
                                <Text style={styles.taxValueNegative}>
                                  -{formatInHomeCurrency(targetCalculation.stateTax)}
                                </Text>
                              </View>
                            )}
                            {targetCalculation.localTax > 0 && (
                              <View style={styles.taxRow}>
                                <Text style={styles.taxLabel}>Local Tax</Text>
                                <Text style={styles.taxValueNegative}>
                                  -{formatInHomeCurrency(targetCalculation.localTax)}
                                </Text>
                              </View>
                            )}
                            <View style={styles.taxRow}>
                              <Text style={styles.taxLabel}>{labels.social}</Text>
                              <Text style={styles.taxValueNegative}>
                                -{formatInHomeCurrency(targetCalculation.fica)}
                              </Text>
                            </View>
                          </>
                        );
                      })()}
                      <View style={[styles.taxRow, styles.taxRowTotal]}>
                        <Text style={styles.taxLabelTotal}>Annual Take-Home</Text>
                        <CurrencyDisplay
                          amountUSD={targetCalculation.netSalary}
                          targetCurrency={targetCalculation.currency.code !== 'USD' ? targetCalculation.currency : undefined}
                          emphasize="auto"
                          showBoth={targetCalculation.currency.code !== 'USD'}
                          style={styles.taxValueTotal}
                        />
                      </View>
                    </View>

                    <View style={styles.effectiveRate}>
                      <Text style={styles.effectiveRateLabel}>Effective Tax Rate</Text>
                      <Text style={styles.effectiveRateValue}>
                        {formatPercent(targetCalculation.effectiveTaxRate)}
                      </Text>
                    </View>

                    <View style={styles.comparison}>
                      <View style={styles.comparisonItem}>
                        <Text style={styles.comparisonLabel}>COL-Adjusted Value</Text>
                        <CurrencyDisplay
                          amountUSD={targetCalculation.adjustedNetSalary}
                          targetCurrency={targetCalculation.currency.code !== 'USD' ? targetCalculation.currency : undefined}
                          emphasize="auto"
                          showBoth={targetCalculation.currency.code !== 'USD'}
                          style={styles.comparisonValue}
                        />
                        <Text style={styles.comparisonNote}>
                          {targetCalculation.adjustedNetSalary > currentCalculation.netSalary
                            ? `+${formatInHomeCurrency(targetCalculation.adjustedNetSalary - currentCalculation.netSalary)} better purchasing power`
                            : `${formatInHomeCurrency(targetCalculation.adjustedNetSalary - currentCalculation.netSalary)} less purchasing power`}
                        </Text>
                      </View>
                    </View>

                    {equivalentSalary && (
                      <View style={styles.equivalent}>
                        <Ionicons name="swap-horizontal" size={20} color={COLORS.info} />
                        <View style={styles.equivalentText}>
                          <Text style={styles.equivalentLabel}>
                            To maintain your current lifestyle in {targetCity.name}:
                          </Text>
                          <CurrencyDisplay
                            amountUSD={equivalentSalary}
                            targetCurrency={targetCalculation.currency.code !== 'USD' ? targetCalculation.currency : undefined}
                            emphasize="auto"
                            showBoth={targetCalculation.currency.code !== 'USD'}
                            style={styles.equivalentValue}
                          />
                        </View>
                      </View>
                    )}
                  </CardContent>
                </Card>
              )}
            </View>
          )}

          <View style={styles.footer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.base,
  },
  inputCard: {
    marginBottom: SPACING.base,
  },
  calculateButton: {
    marginTop: SPACING.md,
  },
  resultsSection: {
    gap: SPACING.base,
  },
  resultCard: {
    marginBottom: SPACING.base,
  },
  badge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.info,
  },
  badgeTarget: {
    backgroundColor: COLORS.accent + '15',
  },
  badgeTextTarget: {
    color: COLORS.accent,
  },
  mainStat: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.md,
  },
  mainStatLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    marginBottom: 4,
  },
  mainStatValue: {
    fontSize: FONTS.sizes.hero,
    fontWeight: '700',
    color: COLORS.accent,
    letterSpacing: -1,
  },
  mainStatValueLocal: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.mediumGray,
    marginTop: 4,
  },
  taxBreakdown: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: SPACING.md,
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  taxRowTotal: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    marginTop: SPACING.sm,
    paddingTop: SPACING.md,
  },
  taxLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
  },
  taxValue: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  taxValueNegative: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.error,
  },
  taxLabelTotal: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.white,
  },
  taxLabelLocal: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
    marginTop: 2,
  },
  taxValueTotal: {
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
    color: COLORS.success,
  },
  effectiveRate: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.warning + '15',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.warning + '25',
  },
  effectiveRateLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
  },
  effectiveRateValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.warning,
  },
  comparison: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  comparisonItem: {
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '700',
    color: COLORS.white,
  },
  comparisonNote: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    marginTop: 4,
    textAlign: 'center',
  },
  equivalent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.info + '15',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.info + '25',
    gap: SPACING.md,
  },
  equivalentText: {
    flex: 1,
    alignItems: 'center',
  },
  equivalentLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    textAlign: 'center',
  },
  equivalentValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.info,
    marginTop: 4,
  },
  equivalentValueLocal: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.mediumGray,
    marginTop: 2,
  },
  footer: {
    height: SPACING.xxl,
  },
});
