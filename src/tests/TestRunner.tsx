/**
 * Interactive Test Runner Component
 * Can be added to the app to run tests in the browser
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { runAllTests } from './premiumFeatures.test';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: string;
}

export function TestRunner() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState<{ passed: number; failed: number } | null>(null);
  const [running, setRunning] = useState(false);

  const executeTests = () => {
    setRunning(true);
    setResults([]);
    setSummary(null);

    // Run tests in a timeout to allow UI to update
    setTimeout(() => {
      try {
        const testOutput = runAllTests();
        setResults(testOutput.results);
        setSummary({ passed: testOutput.passed, failed: testOutput.failed });
      } catch (e) {
        console.error('Test execution error:', e);
        setResults([{
          name: 'Test Execution',
          passed: false,
          error: (e as Error).message,
        }]);
      }
      setRunning(false);
    }, 100);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Premium Features Test Suite</Text>
        <TouchableOpacity
          style={[styles.runButton, running && styles.runButtonDisabled]}
          onPress={executeTests}
          disabled={running}
        >
          <Text style={styles.runButtonText}>
            {running ? 'Running...' : 'Run Tests'}
          </Text>
        </TouchableOpacity>
      </View>

      {summary && (
        <View style={[styles.summary, summary.failed > 0 ? styles.summaryFailed : styles.summaryPassed]}>
          <Text style={styles.summaryText}>
            Passed: {summary.passed} | Failed: {summary.failed} |
            Success Rate: {((summary.passed / (summary.passed + summary.failed)) * 100).toFixed(1)}%
          </Text>
        </View>
      )}

      <ScrollView style={styles.results}>
        {results.map((result, index) => (
          <View key={index} style={[styles.result, result.passed ? styles.resultPassed : styles.resultFailed]}>
            <Text style={styles.resultName}>
              {result.passed ? '✓' : '✗'} {result.name}
            </Text>
            {result.error && (
              <Text style={styles.resultError}>{result.error}</Text>
            )}
            {result.details && (
              <Text style={styles.resultDetails}>{result.details}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  runButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  runButtonDisabled: {
    backgroundColor: '#666',
  },
  runButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  summary: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  summaryPassed: {
    backgroundColor: '#1b5e20',
  },
  summaryFailed: {
    backgroundColor: '#b71c1c',
  },
  summaryText: {
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  results: {
    flex: 1,
  },
  result: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  resultPassed: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  resultFailed: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  resultName: {
    color: '#ffffff',
    fontWeight: '600',
  },
  resultError: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 4,
  },
  resultDetails: {
    color: '#90CAF9',
    fontSize: 12,
    marginTop: 4,
  },
});

export default TestRunner;
