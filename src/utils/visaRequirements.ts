// ============================================================================
// VISA REQUIREMENTS UTILITY
// ============================================================================

/**
 * Determines if a visa is typically required when traveling from one country
 * to another. Uses a smart defaults approach with exception matrix for common
 * visa-free arrangements.
 *
 * Note: This is for informational purposes only. Visa requirements vary based
 * on purpose of visit, duration, and individual circumstances. Always verify
 * with official sources.
 */

// ============================================================================
// VISA-FREE PAIRS
// ============================================================================

/**
 * Visa-free pairs - common visa waivers and bilateral agreements
 * Format: 'homeCountry:destinationCountry'
 *
 * This covers ~80% of common international relocations without needing
 * a full 15×15 matrix for all country pairs.
 */
const VISA_FREE_PAIRS: string[] = [
  // ========== US CITIZENS ==========
  // US can visit visa-free for tourism/short stays
  'us:ca',   // Canada (up to 6 months)
  'us:mx',   // Mexico (up to 180 days)
  'us:gb',   // United Kingdom (up to 6 months)
  'us:de',   // Germany (Schengen, up to 90 days)
  'us:pt',   // Portugal (Schengen, up to 90 days)
  'us:jp',   // Japan (up to 90 days)
  'us:au',   // Australia (ETA required, but no traditional visa)
  'us:kr',   // South Korea (up to 90 days)
  'us:tw',   // Taiwan (up to 90 days)
  'us:th',   // Thailand (up to 30 days)
  'us:ae',   // UAE (visa on arrival)

  // ========== CANADA CITIZENS ==========
  'ca:us',   // United States (up to 6 months)
  'ca:mx',   // Mexico
  'ca:gb',   // United Kingdom
  'ca:de',   // Germany (Schengen)
  'ca:pt',   // Portugal (Schengen)
  'ca:jp',   // Japan
  'ca:au',   // Australia
  'ca:kr',   // South Korea
  'ca:tw',   // Taiwan
  'ca:th',   // Thailand
  'ca:ae',   // UAE

  // ========== UK CITIZENS ==========
  'gb:us',   // United States (ESTA required)
  'gb:ca',   // Canada
  'gb:mx',   // Mexico
  'gb:de',   // Germany (Schengen)
  'gb:pt',   // Portugal (Schengen)
  'gb:jp',   // Japan
  'gb:au',   // Australia
  'gb:kr',   // South Korea
  'gb:tw',   // Taiwan
  'gb:th',   // Thailand
  'gb:ae',   // UAE

  // ========== GERMANY CITIZENS (EU) ==========
  // Germany is part of EU/Schengen, so free movement within EU
  'de:us',   // United States (ESTA required)
  'de:ca',   // Canada
  'de:mx',   // Mexico
  'de:gb',   // United Kingdom
  'de:pt',   // Portugal (EU)
  'de:jp',   // Japan
  'de:au',   // Australia
  'de:kr',   // South Korea
  'de:tw',   // Taiwan
  'de:th',   // Thailand
  'de:ae',   // UAE

  // ========== PORTUGAL CITIZENS (EU) ==========
  'pt:us',   // United States (ESTA required)
  'pt:ca',   // Canada
  'pt:mx',   // Mexico
  'pt:gb',   // United Kingdom
  'pt:de',   // Germany (EU)
  'pt:jp',   // Japan
  'pt:au',   // Australia
  'pt:kr',   // South Korea
  'pt:tw',   // Taiwan
  'pt:th',   // Thailand
  'pt:ae',   // UAE

  // ========== AUSTRALIA CITIZENS ==========
  'au:us',   // United States (ESTA required)
  'au:ca',   // Canada
  'au:mx',   // Mexico
  'au:gb',   // United Kingdom
  'au:de',   // Germany (Schengen)
  'au:pt',   // Portugal (Schengen)
  'au:jp',   // Japan
  'au:kr',   // South Korea
  'au:tw',   // Taiwan
  'au:th',   // Thailand
  'au:ae',   // UAE

  // ========== JAPAN CITIZENS ==========
  'jp:us',   // United States (visa waiver)
  'jp:ca',   // Canada
  'jp:mx',   // Mexico
  'jp:gb',   // United Kingdom
  'jp:de',   // Germany (Schengen)
  'jp:pt',   // Portugal (Schengen)
  'jp:au',   // Australia
  'jp:kr',   // South Korea
  'jp:tw',   // Taiwan
  'jp:th',   // Thailand
  'jp:ae',   // UAE

  // ========== MEXICO CITIZENS ==========
  'mx:us',   // United States (visa required for most, but exemptions exist)
  'mx:ca',   // Canada (ETA required)
  'mx:gb',   // United Kingdom
  'mx:de',   // Germany (Schengen)
  'mx:pt',   // Portugal (Schengen)
  'mx:jp',   // Japan
  'mx:kr',   // South Korea
  'mx:tw',   // Taiwan
  'mx:th',   // Thailand
  'mx:ae',   // UAE

  // ========== SOUTH KOREA CITIZENS ==========
  'kr:us',   // United States (ESTA required)
  'kr:ca',   // Canada
  'kr:mx',   // Mexico
  'kr:gb',   // United Kingdom
  'kr:de',   // Germany (Schengen)
  'kr:pt',   // Portugal (Schengen)
  'kr:jp',   // Japan
  'kr:au',   // Australia
  'kr:tw',   // Taiwan
  'kr:th',   // Thailand
  'kr:ae',   // UAE

  // ========== ARGENTINA CITIZENS ==========
  'ar:us',   // United States (ESTA required)
  'ar:ca',   // Canada
  'ar:mx',   // Mexico
  'ar:gb',   // United Kingdom
  'ar:de',   // Germany (Schengen)
  'ar:pt',   // Portugal (Schengen)
  'ar:jp',   // Japan
  'ar:kr',   // South Korea
  'ar:th',   // Thailand
  'ar:ae',   // UAE

  // ========== UAE CITIZENS ==========
  'ae:us',   // United States
  'ae:ca',   // Canada
  'ae:gb',   // United Kingdom
  'ae:de',   // Germany (Schengen)
  'ae:pt',   // Portugal (Schengen)
  'ae:jp',   // Japan
  'ae:au',   // Australia
  'ae:kr',   // South Korea
  'ae:tw',   // Taiwan
  'ae:th',   // Thailand

  // ========== SOUTH AFRICA CITIZENS ==========
  'za:us',   // United States (ESTA required)
  'za:ca',   // Canada
  'za:gb',   // United Kingdom
  'za:de',   // Germany (Schengen)
  'za:pt',   // Portugal (Schengen)
  'za:jp',   // Japan
  'za:kr',   // South Korea
  'za:tw',   // Taiwan
  'za:th',   // Thailand
  'za:ae',   // UAE

  // ========== TAIWAN CITIZENS ==========
  'tw:us',   // United States (ESTA required)
  'tw:ca',   // Canada
  'tw:mx',   // Mexico
  'tw:gb',   // United Kingdom
  'tw:de',   // Germany (Schengen)
  'tw:pt',   // Portugal (Schengen)
  'tw:jp',   // Japan
  'tw:au',   // Australia
  'tw:kr',   // South Korea
  'tw:th',   // Thailand
  'tw:ae',   // UAE

  // ========== THAILAND CITIZENS ==========
  'th:us',   // United States (visa required for most)
  'th:jp',   // Japan (visa exemption)
  'th:kr',   // South Korea (visa exemption)
  'th:tw',   // Taiwan

  // ========== VIETNAM CITIZENS ==========
  'vn:th',   // Thailand
  'vn:tw',   // Taiwan

  // ========== FRANCE CITIZENS (EU/Schengen) ==========
  'fr:us',   // United States (ESTA required)
  'fr:ca',   // Canada
  'fr:mx',   // Mexico
  'fr:gb',   // United Kingdom
  'fr:de',   // Germany (EU)
  'fr:pt',   // Portugal (EU)
  'fr:es',   // Spain (EU)
  'fr:it',   // Italy (EU)
  'fr:nl',   // Netherlands (EU)
  'fr:ie',   // Ireland (EU)
  'fr:ch',   // Switzerland (Schengen)
  'fr:be',   // Belgium (EU)
  'fr:se',   // Sweden (EU)
  'fr:dk',   // Denmark (EU)
  'fr:no',   // Norway (Schengen)
  'fr:pl',   // Poland (EU)
  'fr:gr',   // Greece (EU)
  'fr:cz',   // Czechia (EU)
  'fr:jp',   // Japan
  'fr:au',   // Australia
  'fr:kr',   // South Korea
  'fr:tw',   // Taiwan
  'fr:th',   // Thailand
  'fr:ae',   // UAE
  'fr:nz',   // New Zealand
  'fr:ma',   // Morocco

  // ========== SPAIN CITIZENS (EU/Schengen) ==========
  'es:us',   // United States (ESTA required)
  'es:ca',   // Canada
  'es:mx',   // Mexico
  'es:gb',   // United Kingdom
  'es:de',   // Germany (EU)
  'es:pt',   // Portugal (EU)
  'es:fr',   // France (EU)
  'es:it',   // Italy (EU)
  'es:nl',   // Netherlands (EU)
  'es:ie',   // Ireland (EU)
  'es:ch',   // Switzerland (Schengen)
  'es:be',   // Belgium (EU)
  'es:se',   // Sweden (EU)
  'es:dk',   // Denmark (EU)
  'es:no',   // Norway (Schengen)
  'es:pl',   // Poland (EU)
  'es:gr',   // Greece (EU)
  'es:cz',   // Czechia (EU)
  'es:jp',   // Japan
  'es:au',   // Australia
  'es:kr',   // South Korea
  'es:tw',   // Taiwan
  'es:th',   // Thailand
  'es:ae',   // UAE
  'es:ar',   // Argentina
  'es:br',   // Brazil
  'es:cl',   // Chile
  'es:cr',   // Costa Rica
  'es:nz',   // New Zealand
  'es:ma',   // Morocco

  // ========== ITALY CITIZENS (EU/Schengen) ==========
  'it:us',   // United States (ESTA required)
  'it:ca',   // Canada
  'it:mx',   // Mexico
  'it:gb',   // United Kingdom
  'it:de',   // Germany (EU)
  'it:pt',   // Portugal (EU)
  'it:fr',   // France (EU)
  'it:es',   // Spain (EU)
  'it:nl',   // Netherlands (EU)
  'it:ie',   // Ireland (EU)
  'it:ch',   // Switzerland (Schengen)
  'it:be',   // Belgium (EU)
  'it:se',   // Sweden (EU)
  'it:dk',   // Denmark (EU)
  'it:no',   // Norway (Schengen)
  'it:pl',   // Poland (EU)
  'it:gr',   // Greece (EU)
  'it:cz',   // Czechia (EU)
  'it:jp',   // Japan
  'it:au',   // Australia
  'it:kr',   // South Korea
  'it:tw',   // Taiwan
  'it:th',   // Thailand
  'it:ae',   // UAE
  'it:nz',   // New Zealand
  'it:ma',   // Morocco

  // ========== NETHERLANDS CITIZENS (EU/Schengen) ==========
  'nl:us',   // United States (ESTA required)
  'nl:ca',   // Canada
  'nl:mx',   // Mexico
  'nl:gb',   // United Kingdom
  'nl:de',   // Germany (EU)
  'nl:pt',   // Portugal (EU)
  'nl:fr',   // France (EU)
  'nl:es',   // Spain (EU)
  'nl:it',   // Italy (EU)
  'nl:ie',   // Ireland (EU)
  'nl:ch',   // Switzerland (Schengen)
  'nl:be',   // Belgium (EU)
  'nl:se',   // Sweden (EU)
  'nl:dk',   // Denmark (EU)
  'nl:no',   // Norway (Schengen)
  'nl:pl',   // Poland (EU)
  'nl:gr',   // Greece (EU)
  'nl:cz',   // Czechia (EU)
  'nl:jp',   // Japan
  'nl:au',   // Australia
  'nl:kr',   // South Korea
  'nl:tw',   // Taiwan
  'nl:th',   // Thailand
  'nl:ae',   // UAE
  'nl:nz',   // New Zealand
  'nl:ma',   // Morocco

  // ========== IRELAND CITIZENS (EU, not Schengen) ==========
  'ie:us',   // United States (ESTA required)
  'ie:ca',   // Canada
  'ie:mx',   // Mexico
  'ie:gb',   // United Kingdom (Common Travel Area)
  'ie:de',   // Germany (EU)
  'ie:pt',   // Portugal (EU)
  'ie:fr',   // France (EU)
  'ie:es',   // Spain (EU)
  'ie:it',   // Italy (EU)
  'ie:nl',   // Netherlands (EU)
  'ie:be',   // Belgium (EU)
  'ie:se',   // Sweden (EU)
  'ie:dk',   // Denmark (EU)
  'ie:pl',   // Poland (EU)
  'ie:gr',   // Greece (EU)
  'ie:cz',   // Czechia (EU)
  'ie:jp',   // Japan
  'ie:au',   // Australia
  'ie:kr',   // South Korea
  'ie:tw',   // Taiwan
  'ie:th',   // Thailand
  'ie:ae',   // UAE
  'ie:nz',   // New Zealand
  'ie:ma',   // Morocco

  // ========== SWITZERLAND CITIZENS (Schengen, not EU) ==========
  'ch:us',   // United States (ESTA required)
  'ch:ca',   // Canada
  'ch:mx',   // Mexico
  'ch:gb',   // United Kingdom
  'ch:de',   // Germany (Schengen)
  'ch:pt',   // Portugal (Schengen)
  'ch:fr',   // France (Schengen)
  'ch:es',   // Spain (Schengen)
  'ch:it',   // Italy (Schengen)
  'ch:nl',   // Netherlands (Schengen)
  'ch:be',   // Belgium (Schengen)
  'ch:se',   // Sweden (Schengen)
  'ch:dk',   // Denmark (Schengen)
  'ch:no',   // Norway (Schengen)
  'ch:pl',   // Poland (Schengen)
  'ch:gr',   // Greece (Schengen)
  'ch:cz',   // Czechia (Schengen)
  'ch:jp',   // Japan
  'ch:au',   // Australia
  'ch:kr',   // South Korea
  'ch:tw',   // Taiwan
  'ch:th',   // Thailand
  'ch:ae',   // UAE
  'ch:nz',   // New Zealand
  'ch:ma',   // Morocco

  // ========== BELGIUM CITIZENS (EU/Schengen) ==========
  'be:us',   // United States (ESTA required)
  'be:ca',   // Canada
  'be:mx',   // Mexico
  'be:gb',   // United Kingdom
  'be:de',   // Germany (EU)
  'be:pt',   // Portugal (EU)
  'be:fr',   // France (EU)
  'be:es',   // Spain (EU)
  'be:it',   // Italy (EU)
  'be:nl',   // Netherlands (EU)
  'be:ie',   // Ireland (EU)
  'be:ch',   // Switzerland (Schengen)
  'be:se',   // Sweden (EU)
  'be:dk',   // Denmark (EU)
  'be:no',   // Norway (Schengen)
  'be:pl',   // Poland (EU)
  'be:gr',   // Greece (EU)
  'be:cz',   // Czechia (EU)
  'be:jp',   // Japan
  'be:au',   // Australia
  'be:kr',   // South Korea
  'be:tw',   // Taiwan
  'be:th',   // Thailand
  'be:ae',   // UAE
  'be:nz',   // New Zealand
  'be:ma',   // Morocco

  // ========== SWEDEN CITIZENS (EU/Schengen) ==========
  'se:us',   // United States (ESTA required)
  'se:ca',   // Canada
  'se:mx',   // Mexico
  'se:gb',   // United Kingdom
  'se:de',   // Germany (EU)
  'se:pt',   // Portugal (EU)
  'se:fr',   // France (EU)
  'se:es',   // Spain (EU)
  'se:it',   // Italy (EU)
  'se:nl',   // Netherlands (EU)
  'se:ie',   // Ireland (EU)
  'se:ch',   // Switzerland (Schengen)
  'se:be',   // Belgium (EU)
  'se:dk',   // Denmark (EU)
  'se:no',   // Norway (Schengen)
  'se:pl',   // Poland (EU)
  'se:gr',   // Greece (EU)
  'se:cz',   // Czechia (EU)
  'se:jp',   // Japan
  'se:au',   // Australia
  'se:kr',   // South Korea
  'se:tw',   // Taiwan
  'se:th',   // Thailand
  'se:ae',   // UAE
  'se:nz',   // New Zealand
  'se:ma',   // Morocco

  // ========== DENMARK CITIZENS (EU/Schengen) ==========
  'dk:us',   // United States (ESTA required)
  'dk:ca',   // Canada
  'dk:mx',   // Mexico
  'dk:gb',   // United Kingdom
  'dk:de',   // Germany (EU)
  'dk:pt',   // Portugal (EU)
  'dk:fr',   // France (EU)
  'dk:es',   // Spain (EU)
  'dk:it',   // Italy (EU)
  'dk:nl',   // Netherlands (EU)
  'dk:ie',   // Ireland (EU)
  'dk:ch',   // Switzerland (Schengen)
  'dk:be',   // Belgium (EU)
  'dk:se',   // Sweden (EU)
  'dk:no',   // Norway (Schengen)
  'dk:pl',   // Poland (EU)
  'dk:gr',   // Greece (EU)
  'dk:cz',   // Czechia (EU)
  'dk:jp',   // Japan
  'dk:au',   // Australia
  'dk:kr',   // South Korea
  'dk:tw',   // Taiwan
  'dk:th',   // Thailand
  'dk:ae',   // UAE
  'dk:nz',   // New Zealand
  'dk:ma',   // Morocco

  // ========== NORWAY CITIZENS (Schengen, not EU) ==========
  'no:us',   // United States (ESTA required)
  'no:ca',   // Canada
  'no:mx',   // Mexico
  'no:gb',   // United Kingdom
  'no:de',   // Germany (Schengen)
  'no:pt',   // Portugal (Schengen)
  'no:fr',   // France (Schengen)
  'no:es',   // Spain (Schengen)
  'no:it',   // Italy (Schengen)
  'no:nl',   // Netherlands (Schengen)
  'no:ch',   // Switzerland (Schengen)
  'no:be',   // Belgium (Schengen)
  'no:se',   // Sweden (Schengen)
  'no:dk',   // Denmark (Schengen)
  'no:pl',   // Poland (Schengen)
  'no:gr',   // Greece (Schengen)
  'no:cz',   // Czechia (Schengen)
  'no:jp',   // Japan
  'no:au',   // Australia
  'no:kr',   // South Korea
  'no:tw',   // Taiwan
  'no:th',   // Thailand
  'no:ae',   // UAE
  'no:nz',   // New Zealand
  'no:ma',   // Morocco

  // ========== POLAND CITIZENS (EU/Schengen) ==========
  'pl:us',   // United States (ESTA required)
  'pl:ca',   // Canada
  'pl:mx',   // Mexico
  'pl:gb',   // United Kingdom
  'pl:de',   // Germany (EU)
  'pl:pt',   // Portugal (EU)
  'pl:fr',   // France (EU)
  'pl:es',   // Spain (EU)
  'pl:it',   // Italy (EU)
  'pl:nl',   // Netherlands (EU)
  'pl:ie',   // Ireland (EU)
  'pl:ch',   // Switzerland (Schengen)
  'pl:be',   // Belgium (EU)
  'pl:se',   // Sweden (EU)
  'pl:dk',   // Denmark (EU)
  'pl:no',   // Norway (Schengen)
  'pl:gr',   // Greece (EU)
  'pl:cz',   // Czechia (EU)
  'pl:jp',   // Japan
  'pl:au',   // Australia
  'pl:kr',   // South Korea
  'pl:tw',   // Taiwan
  'pl:th',   // Thailand
  'pl:ae',   // UAE
  'pl:nz',   // New Zealand
  'pl:ma',   // Morocco

  // ========== GREECE CITIZENS (EU/Schengen) ==========
  'gr:us',   // United States (ESTA required)
  'gr:ca',   // Canada
  'gr:mx',   // Mexico
  'gr:gb',   // United Kingdom
  'gr:de',   // Germany (EU)
  'gr:pt',   // Portugal (EU)
  'gr:fr',   // France (EU)
  'gr:es',   // Spain (EU)
  'gr:it',   // Italy (EU)
  'gr:nl',   // Netherlands (EU)
  'gr:ie',   // Ireland (EU)
  'gr:ch',   // Switzerland (Schengen)
  'gr:be',   // Belgium (EU)
  'gr:se',   // Sweden (EU)
  'gr:dk',   // Denmark (EU)
  'gr:no',   // Norway (Schengen)
  'gr:pl',   // Poland (EU)
  'gr:cz',   // Czechia (EU)
  'gr:jp',   // Japan
  'gr:au',   // Australia
  'gr:kr',   // South Korea
  'gr:tw',   // Taiwan
  'gr:th',   // Thailand
  'gr:ae',   // UAE
  'gr:nz',   // New Zealand
  'gr:ma',   // Morocco

  // ========== CZECHIA CITIZENS (EU/Schengen) ==========
  'cz:us',   // United States (ESTA required)
  'cz:ca',   // Canada
  'cz:mx',   // Mexico
  'cz:gb',   // United Kingdom
  'cz:de',   // Germany (EU)
  'cz:pt',   // Portugal (EU)
  'cz:fr',   // France (EU)
  'cz:es',   // Spain (EU)
  'cz:it',   // Italy (EU)
  'cz:nl',   // Netherlands (EU)
  'cz:ie',   // Ireland (EU)
  'cz:ch',   // Switzerland (Schengen)
  'cz:be',   // Belgium (EU)
  'cz:se',   // Sweden (EU)
  'cz:dk',   // Denmark (EU)
  'cz:no',   // Norway (Schengen)
  'cz:pl',   // Poland (EU)
  'cz:gr',   // Greece (EU)
  'cz:jp',   // Japan
  'cz:au',   // Australia
  'cz:kr',   // South Korea
  'cz:tw',   // Taiwan
  'cz:th',   // Thailand
  'cz:ae',   // UAE
  'cz:nz',   // New Zealand
  'cz:ma',   // Morocco

  // ========== BRAZIL CITIZENS ==========
  'br:us',   // United States (visa required for most)
  'br:ar',   // Argentina (Mercosur)
  'br:cl',   // Chile
  'br:mx',   // Mexico
  'br:de',   // Germany (Schengen, visa-free up to 90 days)
  'br:pt',   // Portugal (Schengen)
  'br:fr',   // France (Schengen)
  'br:es',   // Spain (Schengen)
  'br:it',   // Italy (Schengen)
  'br:nl',   // Netherlands (Schengen)
  'br:gb',   // United Kingdom
  'br:jp',   // Japan
  'br:kr',   // South Korea

  // ========== CHILE CITIZENS ==========
  'cl:us',   // United States (visa waiver for tourism)
  'cl:ca',   // Canada
  'cl:mx',   // Mexico
  'cl:ar',   // Argentina
  'cl:br',   // Brazil
  'cl:gb',   // United Kingdom
  'cl:de',   // Germany (Schengen)
  'cl:pt',   // Portugal (Schengen)
  'cl:fr',   // France (Schengen)
  'cl:es',   // Spain (Schengen)
  'cl:it',   // Italy (Schengen)
  'cl:nl',   // Netherlands (Schengen)
  'cl:jp',   // Japan
  'cl:au',   // Australia
  'cl:kr',   // South Korea
  'cl:nz',   // New Zealand

  // ========== COSTA RICA CITIZENS ==========
  'cr:us',   // United States (visa required)
  'cr:mx',   // Mexico
  'cr:sv',   // El Salvador (CA-4 agreement)
  'cr:gt',   // Guatemala (CA-4 agreement)
  'cr:es',   // Spain (Schengen)
  'cr:jp',   // Japan

  // ========== EL SALVADOR CITIZENS ==========
  'sv:us',   // United States (visa required)
  'sv:mx',   // Mexico
  'sv:cr',   // Costa Rica (CA-4 agreement)
  'sv:gt',   // Guatemala (CA-4 agreement)

  // ========== GUATEMALA CITIZENS ==========
  'gt:us',   // United States (visa required)
  'gt:mx',   // Mexico
  'gt:cr',   // Costa Rica (CA-4 agreement)
  'gt:sv',   // El Salvador (CA-4 agreement)

  // ========== CHINA CITIZENS ==========
  'cn:th',   // Thailand (visa exemption for short stays)

  // ========== INDONESIA CITIZENS ==========
  'id:th',   // Thailand
  'id:ph',   // Philippines
  'id:ma',   // Morocco

  // ========== PHILIPPINES CITIZENS ==========
  'ph:th',   // Thailand
  'ph:id',   // Indonesia
  'ph:tw',   // Taiwan

  // ========== NEW ZEALAND CITIZENS ==========
  'nz:us',   // United States (ESTA required)
  'nz:ca',   // Canada
  'nz:mx',   // Mexico
  'nz:gb',   // United Kingdom
  'nz:de',   // Germany (Schengen)
  'nz:pt',   // Portugal (Schengen)
  'nz:fr',   // France (Schengen)
  'nz:es',   // Spain (Schengen)
  'nz:it',   // Italy (Schengen)
  'nz:nl',   // Netherlands (Schengen)
  'nz:ie',   // Ireland
  'nz:ch',   // Switzerland (Schengen)
  'nz:be',   // Belgium (Schengen)
  'nz:se',   // Sweden (Schengen)
  'nz:dk',   // Denmark (Schengen)
  'nz:no',   // Norway (Schengen)
  'nz:pl',   // Poland (Schengen)
  'nz:gr',   // Greece (Schengen)
  'nz:cz',   // Czechia (Schengen)
  'nz:jp',   // Japan
  'nz:au',   // Australia
  'nz:kr',   // South Korea
  'nz:tw',   // Taiwan
  'nz:th',   // Thailand
  'nz:ae',   // UAE
  'nz:cl',   // Chile

  // ========== MOROCCO CITIZENS ==========
  'ma:de',   // Germany (Schengen, 90 days)
  'ma:pt',   // Portugal (Schengen)
  'ma:fr',   // France (Schengen)
  'ma:es',   // Spain (Schengen)
  'ma:it',   // Italy (Schengen)
  'ma:nl',   // Netherlands (Schengen)
  'ma:be',   // Belgium (Schengen)
  'ma:se',   // Sweden (Schengen)
  'ma:dk',   // Denmark (Schengen)
  'ma:no',   // Norway (Schengen)
  'ma:pl',   // Poland (Schengen)
  'ma:gr',   // Greece (Schengen)
  'ma:cz',   // Czechia (Schengen)
  'ma:id',   // Indonesia

  // ========== REVERSE PAIRS FOR NEW COUNTRIES ==========
  // Add reverse pairs for US to new EU countries
  'us:fr', 'us:es', 'us:it', 'us:nl', 'us:ie', 'us:ch', 'us:be', 'us:se',
  'us:dk', 'us:no', 'us:pl', 'us:gr', 'us:cz',
  // Add reverse pairs for US to new Americas countries
  'us:br', 'us:cl', 'us:cr', 'us:sv', 'us:gt',
  // Add reverse pairs for US to new Asia/Pacific countries
  'us:cn', 'us:id', 'us:ph', 'us:nz', 'us:ma',

  // Add reverse pairs for Canada to new countries
  'ca:fr', 'ca:es', 'ca:it', 'ca:nl', 'ca:ie', 'ca:ch', 'ca:be', 'ca:se',
  'ca:dk', 'ca:no', 'ca:pl', 'ca:gr', 'ca:cz', 'ca:br', 'ca:cl', 'ca:nz', 'ca:ma',

  // Add reverse pairs for UK to new countries
  'gb:fr', 'gb:es', 'gb:it', 'gb:nl', 'gb:ie', 'gb:ch', 'gb:be', 'gb:se',
  'gb:dk', 'gb:no', 'gb:pl', 'gb:gr', 'gb:cz', 'gb:br', 'gb:cl', 'gb:nz', 'gb:ma',

  // Add reverse pairs for existing EU countries (DE, PT) to new EU countries
  'de:fr', 'de:es', 'de:it', 'de:nl', 'de:ie', 'de:ch', 'de:be', 'de:se',
  'de:dk', 'de:no', 'de:pl', 'de:gr', 'de:cz', 'de:br', 'de:cl', 'de:nz', 'de:ma',

  'pt:fr', 'pt:es', 'pt:it', 'pt:nl', 'pt:ie', 'pt:ch', 'pt:be', 'pt:se',
  'pt:dk', 'pt:no', 'pt:pl', 'pt:gr', 'pt:cz', 'pt:br', 'pt:cl', 'pt:nz', 'pt:ma',

  // Add reverse pairs for Australia to new countries
  'au:fr', 'au:es', 'au:it', 'au:nl', 'au:ie', 'au:ch', 'au:be', 'au:se',
  'au:dk', 'au:no', 'au:pl', 'au:gr', 'au:cz', 'au:cl', 'au:nz', 'au:ma',

  // Add reverse pairs for Japan to new countries
  'jp:fr', 'jp:es', 'jp:it', 'jp:nl', 'jp:ie', 'jp:ch', 'jp:be', 'jp:se',
  'jp:dk', 'jp:no', 'jp:pl', 'jp:gr', 'jp:cz', 'jp:br', 'jp:cl', 'jp:cr',
  'jp:nz', 'jp:ma',

  // Add reverse pairs for Mexico to new countries
  'mx:fr', 'mx:es', 'mx:it', 'mx:nl', 'mx:ie', 'mx:ch', 'mx:be', 'mx:se',
  'mx:dk', 'mx:no', 'mx:pl', 'mx:gr', 'mx:cz', 'mx:br', 'mx:cl', 'mx:cr',
  'mx:sv', 'mx:gt', 'mx:nz',

  // Add reverse pairs for South Korea to new countries
  'kr:fr', 'kr:es', 'kr:it', 'kr:nl', 'kr:ie', 'kr:ch', 'kr:be', 'kr:se',
  'kr:dk', 'kr:no', 'kr:pl', 'kr:gr', 'kr:cz', 'kr:br', 'kr:cl', 'kr:nz', 'kr:ma',

  // Add reverse pairs for Argentina to new countries
  'ar:fr', 'ar:es', 'ar:it', 'ar:nl', 'ar:ie', 'ar:ch', 'ar:be', 'ar:se',
  'ar:dk', 'ar:no', 'ar:pl', 'ar:gr', 'ar:cz', 'ar:br', 'ar:cl', 'ar:nz',

  // Add reverse pairs for UAE to new countries
  'ae:fr', 'ae:es', 'ae:it', 'ae:nl', 'ae:ie', 'ae:ch', 'ae:be', 'ae:se',
  'ae:dk', 'ae:no', 'ae:pl', 'ae:gr', 'ae:cz', 'ae:nz', 'ae:ma',

  // Add reverse pairs for South Africa to new countries
  'za:fr', 'za:es', 'za:it', 'za:nl', 'za:ie', 'za:ch', 'za:be', 'za:se',
  'za:dk', 'za:no', 'za:pl', 'za:gr', 'za:cz', 'za:nz', 'za:ma',

  // Add reverse pairs for Taiwan to new countries
  'tw:fr', 'tw:es', 'tw:it', 'tw:nl', 'tw:ie', 'tw:ch', 'tw:be', 'tw:se',
  'tw:dk', 'tw:no', 'tw:pl', 'tw:gr', 'tw:cz', 'tw:cl', 'tw:nz', 'tw:ph',

  // Add reverse pairs for Thailand to new countries
  'th:fr', 'th:es', 'th:it', 'th:nl', 'th:ie', 'th:ch', 'th:be', 'th:se',
  'th:dk', 'th:no', 'th:pl', 'th:gr', 'th:cz', 'th:cn', 'th:id', 'th:ph', 'th:nz',
];

// ============================================================================
// VISA REQUIREMENT CHECK
// ============================================================================

/**
 * Check if a visa is typically required
 *
 * @param homeCountry - Country ID of the user's home country ('us', 'gb', etc.)
 * @param destinationCountry - Country ID of the destination ('ca', 'de', etc.)
 * @returns true if visa is typically required, false if visa-free
 */
export const isVisaRequired = (
  homeCountry: string,
  destinationCountry: string
): boolean => {
  // Same country = no visa needed
  if (homeCountry === destinationCountry) {
    return false;
  }

  // Check if this pair is in the visa-free list
  const pairKey = `${homeCountry}:${destinationCountry}`;
  if (VISA_FREE_PAIRS.includes(pairKey)) {
    return false;
  }

  // Conservative default: assume visa required
  // This ensures we don't mislead users about visa-free travel
  return true;
};

/**
 * Get a user-friendly explanation of visa requirements
 *
 * @param homeCountry - Country ID of the user's home country
 * @param destinationCountry - Country ID of the destination
 * @returns Explanation string
 */
export const getVisaExplanation = (
  homeCountry: string,
  destinationCountry: string
): string => {
  if (homeCountry === destinationCountry) {
    return 'No visa required (domestic relocation)';
  }

  if (!isVisaRequired(homeCountry, destinationCountry)) {
    return 'Typically visa-free for tourism/short stays';
  }

  return 'Visa typically required';
};
