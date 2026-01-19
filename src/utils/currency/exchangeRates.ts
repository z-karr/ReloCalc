import { Currency } from '../../types';

// ============================================================================
// EXCHANGE RATE DATA
// ============================================================================

// Static exchange rates (relative to USD = 1.0)
// Last updated: January 2026
// Future enhancement: Integrate with API for real-time rates

const EXCHANGE_RATES: Record<string, number> = {
  'USD': 1.0,
  'CAD': 1.35, // Canadian Dollar
  'ARS': 850, // Argentine Peso (highly volatile)
  'AUD': 1.52, // Australian Dollar
  'EUR': 0.92, // Euro
  'JPY': 149.50, // Japanese Yen
  'MXN': 17.20, // Mexican Peso
  'ZAR': 18.50, // South African Rand
  'KRW': 1320, // South Korean Won
  'TWD': 31.50, // Taiwan Dollar
  'THB': 35.20, // Thai Baht
  'AED': 3.67, // UAE Dirham
  'GBP': 0.79, // British Pound
  'VND': 24500, // Vietnamese Dong
  // Phase 3 & 4 additions
  'CHF': 0.88, // Swiss Franc
  'SEK': 10.35, // Swedish Krona
  'NOK': 10.60, // Norwegian Krone
  'DKK': 6.87, // Danish Krone
  'PLN': 4.02, // Polish Zloty
  'CZK': 22.80, // Czech Koruna
  'BRL': 4.97, // Brazilian Real
  'CLP': 920, // Chilean Peso
  'CRC': 520, // Costa Rican Colón
  'CNY': 7.24, // Chinese Yuan
  'IDR': 15650, // Indonesian Rupiah
  'PHP': 55.80, // Philippine Peso
  'NZD': 1.67, // New Zealand Dollar
  'MAD': 9.98, // Moroccan Dirham
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  'USD': '$',
  'CAD': 'C$',
  'ARS': '$',
  'AUD': 'A$',
  'EUR': '€',
  'JPY': '¥',
  'MXN': '$',
  'ZAR': 'R',
  'KRW': '₩',
  'TWD': 'NT$',
  'THB': '฿',
  'AED': 'د.إ',
  'GBP': '£',
  'VND': '₫',
  // Phase 3 & 4 additions
  'CHF': 'CHF',
  'SEK': 'kr',
  'NOK': 'kr',
  'DKK': 'kr',
  'PLN': 'zł',
  'CZK': 'Kč',
  'BRL': 'R$',
  'CLP': '$',
  'CRC': '₡',
  'CNY': '¥',
  'IDR': 'Rp',
  'PHP': '₱',
  'NZD': 'NZ$',
  'MAD': 'د.م.',
};

const CURRENCY_NAMES: Record<string, string> = {
  'USD': 'US Dollar',
  'CAD': 'Canadian Dollar',
  'ARS': 'Argentine Peso',
  'AUD': 'Australian Dollar',
  'EUR': 'Euro',
  'JPY': 'Japanese Yen',
  'MXN': 'Mexican Peso',
  'ZAR': 'South African Rand',
  'KRW': 'South Korean Won',
  'TWD': 'Taiwan Dollar',
  'THB': 'Thai Baht',
  'AED': 'UAE Dirham',
  'GBP': 'British Pound',
  'VND': 'Vietnamese Dong',
  // Phase 3 & 4 additions
  'CHF': 'Swiss Franc',
  'SEK': 'Swedish Krona',
  'NOK': 'Norwegian Krone',
  'DKK': 'Danish Krone',
  'PLN': 'Polish Zloty',
  'CZK': 'Czech Koruna',
  'BRL': 'Brazilian Real',
  'CLP': 'Chilean Peso',
  'CRC': 'Costa Rican Colón',
  'CNY': 'Chinese Yuan',
  'IDR': 'Indonesian Rupiah',
  'PHP': 'Philippine Peso',
  'NZD': 'New Zealand Dollar',
  'MAD': 'Moroccan Dirham',
};

const LAST_UPDATED = new Date().toISOString();

// ============================================================================
// CURRENCY SERVICE
// ============================================================================

export class CurrencyService {
  /**
   * Get exchange rate for a currency (relative to USD)
   */
  static getRate(currencyCode: string): number {
    return EXCHANGE_RATES[currencyCode] || 1.0;
  }

  /**
   * Get currency object by code
   */
  static getCurrency(currencyCode: string): Currency {
    return {
      code: currencyCode,
      symbol: CURRENCY_SYMBOLS[currencyCode] || '$',
      name: CURRENCY_NAMES[currencyCode] || currencyCode,
      exchangeRate: this.getRate(currencyCode),
      lastUpdated: LAST_UPDATED,
    };
  }

  /**
   * Convert amount from one currency to another
   */
  static convert(amount: number, fromCurrency: string, toCurrency: string): number {
    const fromRate = this.getRate(fromCurrency);
    const toRate = this.getRate(toCurrency);

    // Convert to USD first, then to target currency
    const amountInUSD = amount / fromRate;
    return amountInUSD * toRate;
  }

  /**
   * Convert amount to USD
   */
  static convertToUSD(amount: number, fromCurrency: string): number {
    return amount / this.getRate(fromCurrency);
  }

  /**
   * Convert amount from USD to target currency
   */
  static convertFromUSD(amountUSD: number, toCurrency: string): number {
    return amountUSD * this.getRate(toCurrency);
  }

  /**
   * Format currency with symbol
   */
  static format(amount: number, currencyCode: string, showCode: boolean = false): string {
    const symbol = CURRENCY_SYMBOLS[currencyCode] || '$';
    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    if (showCode) {
      return `${symbol}${formatted} ${currencyCode}`;
    }
    return `${symbol}${formatted}`;
  }

  /**
   * Get all available currencies
   */
  static getAllCurrencies(): Currency[] {
    return Object.keys(EXCHANGE_RATES).map(code => this.getCurrency(code));
  }

  /**
   * Get last updated timestamp
   */
  static getLastUpdated(): string {
    return LAST_UPDATED;
  }

  /**
   * Future: Refresh rates from API
   */
  static async refreshRates(): Promise<void> {
    // TODO: Implement API integration in future phase
    // For now, this is a no-op
    console.log('Exchange rate refresh not yet implemented - using static rates');
  }
}

// Export convenience functions
export const getExchangeRate = CurrencyService.getRate.bind(CurrencyService);
export const convertCurrency = CurrencyService.convert.bind(CurrencyService);
export const convertToUSD = CurrencyService.convertToUSD.bind(CurrencyService);
export const convertFromUSD = CurrencyService.convertFromUSD.bind(CurrencyService);
export const formatCurrency = CurrencyService.format.bind(CurrencyService);
export const getCurrency = CurrencyService.getCurrency.bind(CurrencyService);
export const getCurrencyByCode = CurrencyService.getCurrency.bind(CurrencyService);  // Alias
