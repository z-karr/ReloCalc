import { Country, Currency } from '../types';

// ============================================================================
// CURRENCY DEFINITIONS
// ============================================================================

export const USD: Currency = {
  code: 'USD',
  symbol: '$',
  name: 'US Dollar',
  exchangeRate: 1.0,
  lastUpdated: new Date().toISOString(),
};

export const CAD: Currency = {
  code: 'CAD',
  symbol: 'C$',
  name: 'Canadian Dollar',
  exchangeRate: 1.35, // 1 USD = 1.35 CAD (approximate)
  lastUpdated: new Date().toISOString(),
};

export const ARS: Currency = {
  code: 'ARS',
  symbol: '$',
  name: 'Argentine Peso',
  exchangeRate: 850, // 1 USD = 850 ARS (approximate, highly volatile)
  lastUpdated: new Date().toISOString(),
};

export const AUD: Currency = {
  code: 'AUD',
  symbol: 'A$',
  name: 'Australian Dollar',
  exchangeRate: 1.52, // 1 USD = 1.52 AUD (approximate)
  lastUpdated: new Date().toISOString(),
};

export const EUR: Currency = {
  code: 'EUR',
  symbol: '€',
  name: 'Euro',
  exchangeRate: 0.92, // 1 USD = 0.92 EUR (approximate)
  lastUpdated: new Date().toISOString(),
};

export const JPY: Currency = {
  code: 'JPY',
  symbol: '¥',
  name: 'Japanese Yen',
  exchangeRate: 149.50, // 1 USD = 149.50 JPY (approximate)
  lastUpdated: new Date().toISOString(),
};

export const MXN: Currency = {
  code: 'MXN',
  symbol: '$',
  name: 'Mexican Peso',
  exchangeRate: 17.20, // 1 USD = 17.20 MXN (approximate)
  lastUpdated: new Date().toISOString(),
};

export const ZAR: Currency = {
  code: 'ZAR',
  symbol: 'R',
  name: 'South African Rand',
  exchangeRate: 18.50, // 1 USD = 18.50 ZAR (approximate)
  lastUpdated: new Date().toISOString(),
};

export const KRW: Currency = {
  code: 'KRW',
  symbol: '₩',
  name: 'South Korean Won',
  exchangeRate: 1320, // 1 USD = 1320 KRW (approximate)
  lastUpdated: new Date().toISOString(),
};

export const TWD: Currency = {
  code: 'TWD',
  symbol: 'NT$',
  name: 'Taiwan Dollar',
  exchangeRate: 31.50, // 1 USD = 31.50 TWD (approximate)
  lastUpdated: new Date().toISOString(),
};

export const THB: Currency = {
  code: 'THB',
  symbol: '฿',
  name: 'Thai Baht',
  exchangeRate: 35.20, // 1 USD = 35.20 THB (approximate)
  lastUpdated: new Date().toISOString(),
};

export const SGD: Currency = {
  code: 'SGD',
  symbol: 'S$',
  name: 'Singapore Dollar',
  exchangeRate: 1.34, // 1 USD = 1.34 SGD (approximate)
  lastUpdated: new Date().toISOString(),
};

export const INR: Currency = {
  code: 'INR',
  symbol: '₹',
  name: 'Indian Rupee',
  exchangeRate: 83.20, // 1 USD = 83.20 INR (approximate)
  lastUpdated: new Date().toISOString(),
};

export const AED: Currency = {
  code: 'AED',
  symbol: 'د.إ',
  name: 'UAE Dirham',
  exchangeRate: 3.67, // 1 USD = 3.67 AED (approximate)
  lastUpdated: new Date().toISOString(),
};

export const GBP: Currency = {
  code: 'GBP',
  symbol: '£',
  name: 'British Pound',
  exchangeRate: 0.79, // 1 USD = 0.79 GBP (approximate)
  lastUpdated: new Date().toISOString(),
};

export const VND: Currency = {
  code: 'VND',
  symbol: '₫',
  name: 'Vietnamese Dong',
  exchangeRate: 24500, // 1 USD = 24500 VND (approximate)
  lastUpdated: new Date().toISOString(),
};

export const CHF: Currency = {
  code: 'CHF',
  symbol: 'CHF',
  name: 'Swiss Franc',
  exchangeRate: 0.88, // 1 USD = 0.88 CHF (approximate)
  lastUpdated: new Date().toISOString(),
};

export const SEK: Currency = {
  code: 'SEK',
  symbol: 'kr',
  name: 'Swedish Krona',
  exchangeRate: 10.35, // 1 USD = 10.35 SEK (approximate)
  lastUpdated: new Date().toISOString(),
};

export const NOK: Currency = {
  code: 'NOK',
  symbol: 'kr',
  name: 'Norwegian Krone',
  exchangeRate: 10.60, // 1 USD = 10.60 NOK (approximate)
  lastUpdated: new Date().toISOString(),
};

export const DKK: Currency = {
  code: 'DKK',
  symbol: 'kr',
  name: 'Danish Krone',
  exchangeRate: 6.87, // 1 USD = 6.87 DKK (approximate)
  lastUpdated: new Date().toISOString(),
};

export const PLN: Currency = {
  code: 'PLN',
  symbol: 'zł',
  name: 'Polish Zloty',
  exchangeRate: 4.02, // 1 USD = 4.02 PLN (approximate)
  lastUpdated: new Date().toISOString(),
};

export const CZK: Currency = {
  code: 'CZK',
  symbol: 'Kč',
  name: 'Czech Koruna',
  exchangeRate: 22.80, // 1 USD = 22.80 CZK (approximate)
  lastUpdated: new Date().toISOString(),
};

export const BRL: Currency = {
  code: 'BRL',
  symbol: 'R$',
  name: 'Brazilian Real',
  exchangeRate: 4.97, // 1 USD = 4.97 BRL (approximate)
  lastUpdated: new Date().toISOString(),
};

export const CLP: Currency = {
  code: 'CLP',
  symbol: '$',
  name: 'Chilean Peso',
  exchangeRate: 920, // 1 USD = 920 CLP (approximate)
  lastUpdated: new Date().toISOString(),
};

export const CRC: Currency = {
  code: 'CRC',
  symbol: '₡',
  name: 'Costa Rican Colón',
  exchangeRate: 520, // 1 USD = 520 CRC (approximate)
  lastUpdated: new Date().toISOString(),
};

export const CNY: Currency = {
  code: 'CNY',
  symbol: '¥',
  name: 'Chinese Yuan',
  exchangeRate: 7.24, // 1 USD = 7.24 CNY (approximate)
  lastUpdated: new Date().toISOString(),
};

export const IDR: Currency = {
  code: 'IDR',
  symbol: 'Rp',
  name: 'Indonesian Rupiah',
  exchangeRate: 15650, // 1 USD = 15650 IDR (approximate)
  lastUpdated: new Date().toISOString(),
};

export const PHP: Currency = {
  code: 'PHP',
  symbol: '₱',
  name: 'Philippine Peso',
  exchangeRate: 55.80, // 1 USD = 55.80 PHP (approximate)
  lastUpdated: new Date().toISOString(),
};

export const NZD: Currency = {
  code: 'NZD',
  symbol: 'NZ$',
  name: 'New Zealand Dollar',
  exchangeRate: 1.67, // 1 USD = 1.67 NZD (approximate)
  lastUpdated: new Date().toISOString(),
};

export const MAD: Currency = {
  code: 'MAD',
  symbol: 'د.م.',
  name: 'Moroccan Dirham',
  exchangeRate: 9.98, // 1 USD = 9.98 MAD (approximate)
  lastUpdated: new Date().toISOString(),
};

// Note: EUR is already defined above and used by multiple countries

// ============================================================================
// COUNTRY DEFINITIONS
// ============================================================================

export const UNITED_STATES: Country = {
  id: 'us',
  name: 'United States',
  code: 'US',
  region: 'north_america',
  currency: USD,
  taxSystem: 'us_federal_state',
  requiresVisa: false,
  languageBarrier: 'none',
};

export const CANADA: Country = {
  id: 'ca',
  name: 'Canada',
  code: 'CA',
  region: 'north_america',
  currency: CAD,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'none', // English + French, but English widely spoken
};

export const ARGENTINA: Country = {
  id: 'ar',
  name: 'Argentina',
  code: 'AR',
  region: 'latin_america',
  currency: ARS,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'medium', // Spanish primary language
};

export const AUSTRALIA: Country = {
  id: 'au',
  name: 'Australia',
  code: 'AU',
  region: 'oceania',
  currency: AUD,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'none', // English speaking
};

export const GERMANY: Country = {
  id: 'de',
  name: 'Germany',
  code: 'DE',
  region: 'europe',
  currency: EUR,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'medium', // German primary language
};

export const JAPAN: Country = {
  id: 'jp',
  name: 'Japan',
  code: 'JP',
  region: 'asia_pacific',
  currency: JPY,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'high', // Japanese primary language
};

export const MEXICO: Country = {
  id: 'mx',
  name: 'Mexico',
  code: 'MX',
  region: 'latin_america',
  currency: MXN,
  taxSystem: 'progressive_national',
  requiresVisa: false,
  languageBarrier: 'medium', // Spanish primary language
};

export const PORTUGAL: Country = {
  id: 'pt',
  name: 'Portugal',
  code: 'PT',
  region: 'europe',
  currency: EUR,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'low',
};

export const SOUTH_AFRICA: Country = {
  id: 'za',
  name: 'South Africa',
  code: 'ZA',
  region: 'africa',
  currency: ZAR,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'none',
};

export const SOUTH_KOREA: Country = {
  id: 'kr',
  name: 'South Korea',
  code: 'KR',
  region: 'asia_pacific',
  currency: KRW,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'high',
};

export const TAIWAN: Country = {
  id: 'tw',
  name: 'Taiwan',
  code: 'TW',
  region: 'asia_pacific',
  currency: TWD,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'high',
};

export const THAILAND: Country = {
  id: 'th',
  name: 'Thailand',
  code: 'TH',
  region: 'asia_pacific',
  currency: THB,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'medium',
};

export const SINGAPORE: Country = {
  id: 'sg',
  name: 'Singapore',
  code: 'SG',
  region: 'asia_pacific',
  currency: SGD,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'none',
};

export const INDIA: Country = {
  id: 'in',
  name: 'India',
  code: 'IN',
  region: 'asia_pacific',
  currency: INR,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'low',
};

export const UAE: Country = {
  id: 'ae',
  name: 'United Arab Emirates',
  code: 'AE',
  region: 'middle_east',
  currency: AED,
  taxSystem: 'flat_national',
  requiresVisa: true,
  languageBarrier: 'none',
};

export const UNITED_KINGDOM: Country = {
  id: 'gb',
  name: 'United Kingdom',
  code: 'GB',
  region: 'europe',
  currency: GBP,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'none',
};

export const VIETNAM: Country = {
  id: 'vn',
  name: 'Vietnam',
  code: 'VN',
  region: 'asia_pacific',
  currency: VND,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'high',
};

// ============================================================================
// ADDITIONAL COUNTRIES (Phase 3 & 4)
// ============================================================================

export const BELGIUM: Country = {
  id: 'be',
  name: 'Belgium',
  code: 'BE',
  region: 'europe',
  currency: EUR,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'low',
};

export const BRAZIL: Country = {
  id: 'br',
  name: 'Brazil',
  code: 'BR',
  region: 'latin_america',
  currency: BRL,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'medium',
};

export const CHILE: Country = {
  id: 'cl',
  name: 'Chile',
  code: 'CL',
  region: 'latin_america',
  currency: CLP,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'medium',
};

export const CHINA: Country = {
  id: 'cn',
  name: 'China',
  code: 'CN',
  region: 'asia_pacific',
  currency: CNY,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'high',
};

export const COSTA_RICA: Country = {
  id: 'cr',
  name: 'Costa Rica',
  code: 'CR',
  region: 'latin_america',
  currency: CRC,
  taxSystem: 'progressive_national',
  requiresVisa: false,
  languageBarrier: 'medium',
};

export const CZECHIA: Country = {
  id: 'cz',
  name: 'Czechia',
  code: 'CZ',
  region: 'europe',
  currency: CZK,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'medium',
};

export const DENMARK: Country = {
  id: 'dk',
  name: 'Denmark',
  code: 'DK',
  region: 'europe',
  currency: DKK,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'none',
};

export const EL_SALVADOR: Country = {
  id: 'sv',
  name: 'El Salvador',
  code: 'SV',
  region: 'latin_america',
  currency: USD, // El Salvador uses USD
  taxSystem: 'progressive_national',
  requiresVisa: false,
  languageBarrier: 'medium',
};

export const FRANCE: Country = {
  id: 'fr',
  name: 'France',
  code: 'FR',
  region: 'europe',
  currency: EUR,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'medium',
};

export const GREECE: Country = {
  id: 'gr',
  name: 'Greece',
  code: 'GR',
  region: 'europe',
  currency: EUR,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'medium',
};

export const GUATEMALA: Country = {
  id: 'gt',
  name: 'Guatemala',
  code: 'GT',
  region: 'latin_america',
  currency: USD, // Guatemala uses Quetzal but USD widely accepted
  taxSystem: 'progressive_national',
  requiresVisa: false,
  languageBarrier: 'medium',
};

export const INDONESIA: Country = {
  id: 'id',
  name: 'Indonesia',
  code: 'ID',
  region: 'asia_pacific',
  currency: IDR,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'medium',
};

export const IRELAND: Country = {
  id: 'ie',
  name: 'Ireland',
  code: 'IE',
  region: 'europe',
  currency: EUR,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'none',
};

export const ITALY: Country = {
  id: 'it',
  name: 'Italy',
  code: 'IT',
  region: 'europe',
  currency: EUR,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'medium',
};

export const MOROCCO: Country = {
  id: 'ma',
  name: 'Morocco',
  code: 'MA',
  region: 'africa',
  currency: MAD,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'medium',
};

export const NETHERLANDS: Country = {
  id: 'nl',
  name: 'Netherlands',
  code: 'NL',
  region: 'europe',
  currency: EUR,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'none',
};

export const NEW_ZEALAND: Country = {
  id: 'nz',
  name: 'New Zealand',
  code: 'NZ',
  region: 'oceania',
  currency: NZD,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'none',
};

export const NORWAY: Country = {
  id: 'no',
  name: 'Norway',
  code: 'NO',
  region: 'europe',
  currency: NOK,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'none',
};

export const PHILIPPINES: Country = {
  id: 'ph',
  name: 'Philippines',
  code: 'PH',
  region: 'asia_pacific',
  currency: PHP,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'none',
};

export const POLAND: Country = {
  id: 'pl',
  name: 'Poland',
  code: 'PL',
  region: 'europe',
  currency: PLN,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'medium',
};

export const SPAIN: Country = {
  id: 'es',
  name: 'Spain',
  code: 'ES',
  region: 'europe',
  currency: EUR,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'low',
};

export const SWEDEN: Country = {
  id: 'se',
  name: 'Sweden',
  code: 'SE',
  region: 'europe',
  currency: SEK,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'none',
};

export const SWITZERLAND: Country = {
  id: 'ch',
  name: 'Switzerland',
  code: 'CH',
  region: 'europe',
  currency: CHF,
  taxSystem: 'progressive_national',
  requiresVisa: true,
  languageBarrier: 'low',
};

// ============================================================================
// COUNTRY REGISTRY
// ============================================================================

export const COUNTRIES: Record<string, Country> = {
  us: UNITED_STATES,
  ca: CANADA,
  ar: ARGENTINA,
  au: AUSTRALIA,
  de: GERMANY,
  jp: JAPAN,
  mx: MEXICO,
  pt: PORTUGAL,
  za: SOUTH_AFRICA,
  kr: SOUTH_KOREA,
  tw: TAIWAN,
  th: THAILAND,
  sg: SINGAPORE,
  in: INDIA,
  ae: UAE,
  gb: UNITED_KINGDOM,
  vn: VIETNAM,
  // Phase 3 & 4 additions (23 new countries)
  be: BELGIUM,
  br: BRAZIL,
  cl: CHILE,
  cn: CHINA,
  cr: COSTA_RICA,
  cz: CZECHIA,
  dk: DENMARK,
  sv: EL_SALVADOR,
  fr: FRANCE,
  gr: GREECE,
  gt: GUATEMALA,
  id: INDONESIA,
  ie: IRELAND,
  it: ITALY,
  ma: MOROCCO,
  nl: NETHERLANDS,
  nz: NEW_ZEALAND,
  no: NORWAY,
  ph: PHILIPPINES,
  pl: POLAND,
  es: SPAIN,
  se: SWEDEN,
  ch: SWITZERLAND,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getCountryById = (id: string): Country | undefined => {
  return COUNTRIES[id];
};

export const getCountriesByRegion = (region: string): Country[] => {
  return Object.values(COUNTRIES).filter(country => country.region === region);
};

export const getAllCountries = (): Country[] => {
  return Object.values(COUNTRIES);
};
