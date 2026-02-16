import { City, UserPreferences, CityRecommendation } from '../types';
import { cities } from '../data/cities';
import { calculateEquivalentSalary } from './taxCalculator';
import { getCountryById } from '../data/countries';

const DEFAULT_PREFERENCES: UserPreferences = {
  prioritizeWeather: 5,
  prioritizeCost: 5,
  prioritizeSafety: 5,
  prioritizeTransit: 5,
  prioritizeOutdoors: 5,
  prioritizeEntertainment: 5,
  prioritizeEducation: 5,
  prioritizeHealthcare: 5,
  preferredClimate: ['temperate', 'dry', 'tropical', 'continental'],
  maxCommute: 45,
  minWalkScore: 0,

  // Global user context (defaults)
  homeCountry: 'us',
  homeCurrency: 'USD',
  currencyDisplayMode: 'usd_first',
  autoDetected: false,

  // Regional and country filtering (default: all)
  regionFilter: 'all',
  countryFilter: 'all',
};

export const calculateCityScore = (
  city: City,
  preferences: Partial<UserPreferences> = {}
): number => {
  const prefs = { ...DEFAULT_PREFERENCES, ...preferences };
  
  // Normalize all scores to 0-100 range
  const scores = {
    // Cost score: lower COL = higher score
    // Use aggressive scaling: US average (73.5) = 80 points, very cheap (50) = 100, very expensive (120) = 10
    cost: Math.max(0, Math.min(100, 200 - (city.costOfLivingIndex * 1.5))),
    
    // Safety score: lower crime = higher score
    safety: Math.max(0, 100 - city.crimeIndex),
    
    // Transit score (already 0-100)
    transit: city.transitScore,
    
    // Walk score (already 0-100)
    walkability: city.walkScore,
    
    // Outdoor score (already 0-100)
    outdoors: city.outdoorIndex,
    
    // Entertainment (already 0-100)
    entertainment: city.entertainmentIndex,
    
    // Education (already 0-100)
    education: city.educationIndex,
    
    // Healthcare (already 0-100)
    healthcare: city.healthcareIndex,
    
    // Job growth (stored as percentage: 3.0 = 3% growth)
    jobs: Math.min(100, city.jobGrowthRate * 25),
    
    // Commute score (lower = better)
    commute: Math.max(0, 100 - (city.averageCommute - 15) * 2),
  };

  // Climate bonus
  let climateBonus = 0;
  if (prefs.preferredClimate.includes(city.climate)) {
    climateBonus = 10;
  }

  // Penalty for exceeding max commute
  let commutePenalty = 0;
  if (city.averageCommute > prefs.maxCommute) {
    commutePenalty = (city.averageCommute - prefs.maxCommute) * 2;
  }

  // Penalty for low walk score if required
  let walkPenalty = 0;
  if (city.walkScore < prefs.minWalkScore) {
    walkPenalty = (prefs.minWalkScore - city.walkScore) * 0.5;
  }

  // Weight each score by user preference (1-10 scale)
  // Square the weights to make high priorities MUCH more impactful
  // Priority 10 = 100x weight, Priority 5 = 25x weight, Priority 1 = 1x weight
  const costWeight = prefs.prioritizeCost * prefs.prioritizeCost;
  const safetyWeight = prefs.prioritizeSafety * prefs.prioritizeSafety;
  const transitWeight = prefs.prioritizeTransit * prefs.prioritizeTransit;
  const outdoorsWeight = prefs.prioritizeOutdoors * prefs.prioritizeOutdoors;
  const entertainmentWeight = prefs.prioritizeEntertainment * prefs.prioritizeEntertainment;
  const educationWeight = prefs.prioritizeEducation * prefs.prioritizeEducation;
  const healthcareWeight = prefs.prioritizeHealthcare * prefs.prioritizeHealthcare;

  const totalWeight =
    costWeight +
    safetyWeight +
    transitWeight +
    outdoorsWeight +
    entertainmentWeight +
    educationWeight +
    healthcareWeight;

  const weightedScore =
    (scores.cost * costWeight +
     scores.safety * safetyWeight +
     scores.transit * transitWeight +
     scores.outdoors * outdoorsWeight +
     scores.entertainment * entertainmentWeight +
     scores.education * educationWeight +
     scores.healthcare * healthcareWeight) / totalWeight;

  return Math.max(0, Math.min(100, weightedScore + climateBonus - commutePenalty - walkPenalty));
};

export const generateHighlights = (city: City, preferences: Partial<UserPreferences> = {}): string[] => {
  const highlights: string[] = [];
  const prefs = { ...DEFAULT_PREFERENCES, ...preferences };

  // OBJECTIVE HIGHLIGHTS (always show if exceptional)

  // Check for no/low income tax (works for both US and international)
  if (city.taxRates.type === 'vat_based') {
    highlights.push('No income tax');
  } else if (city.stateTaxRate === 0 && city.taxRates.type === 'us_federal_state') {
    highlights.push('No state income tax');
  } else if (city.taxRates.type === 'us_federal_state') {
    // Calculate total state + local tax rate
    const totalTaxRate = (city.stateTaxRate || 0) + (city.localTaxRate || 0);

    // Low tax: under 4% combined state+local (excluding 0% which is already highlighted)
    if (totalTaxRate > 0 && totalTaxRate < 0.04) {
      highlights.push('Low state income tax');
    }
    // Note: High tax is handled in considerations, not highlights
  }

  // US average COL index is approximately 73.5 (calculated from all cities)
  const US_AVERAGE_COL = 73.5;
  if (city.costOfLivingIndex < US_AVERAGE_COL) {
    highlights.push('Below-average cost of living');
  }
  // Note: We don't highlight high COL as a positive - only low COL is a benefit

  if (city.walkScore >= 80) {
    highlights.push('Excellent walkability');
  } else if (city.walkScore >= 65) {
    highlights.push('Good walkability');
  }

  if (city.transitScore >= 70) {
    highlights.push('Strong public transit');
  } else if (city.transitScore >= 50) {
    highlights.push('Decent public transit');
  }

  // Job growth rate is stored as percentage (3.0 = 3% annual growth)
  if (city.jobGrowthRate >= 3.0) {
    highlights.push('High job growth');
  } else if (city.jobGrowthRate >= 2.0) {
    highlights.push('Growing job market');
  }

  if (city.crimeIndex < 45) {
    highlights.push('Low crime rate');
  }

  if (city.outdoorIndex >= 90) {
    highlights.push('Exceptional outdoor recreation');
  } else if (city.outdoorIndex >= 80) {
    highlights.push('Great outdoor recreation');
  }

  if (city.educationIndex >= 88) {
    highlights.push('Top-tier education');
  } else if (city.educationIndex >= 75) {
    highlights.push('Strong education system');
  }

  if (city.healthcareIndex >= 88) {
    highlights.push('Excellent healthcare');
  } else if (city.healthcareIndex >= 75) {
    highlights.push('Quality healthcare');
  }

  if (city.entertainmentIndex >= 88) {
    highlights.push('Vibrant entertainment scene');
  } else if (city.entertainmentIndex >= 75) {
    highlights.push('Strong entertainment options');
  }

  if (city.averageCommute < 25) {
    highlights.push('Short average commute');
  } else if (city.averageCommute <= 27) {
    highlights.push('Reasonable commute times');
  }

  // International-specific highlights (only for non-US cities)
  const isUSCity = city.country === 'us';

  if (!isUSCity && !city.visaRequired) {
    highlights.push('No visa required');
  }

  if (!isUSCity && (city.languageBarrier === 'none' || city.languageBarrier === 'low')) {
    highlights.push('English widely spoken');
  }

  if (!isUSCity && city.expatCommunitySize === 'large') {
    highlights.push('Large expat community');
  }

  // PREFERENCE-BASED HIGHLIGHTS (show if user rated 8-10 importance AND city is good in that area)

  // Cost of Living (user cares AND city is affordable but not exceptional)
  if (prefs.prioritizeCost >= 8 && city.costOfLivingIndex >= 100 && city.costOfLivingIndex < 120) {
    if (!highlights.some(h => h.includes('cost of living'))) {
      highlights.push('Reasonable cost of living');
    }
  }

  // Safety (user cares AND city is safe but not exceptional)
  if (prefs.prioritizeSafety >= 8 && city.crimeIndex >= 45 && city.crimeIndex < 55) {
    if (!highlights.some(h => h.includes('crime'))) {
      highlights.push('Good safety rating');
    }
  }

  // Transit (user cares AND city has decent transit)
  if (prefs.prioritizeTransit >= 8 && city.transitScore >= 50 && city.transitScore < 70) {
    if (!highlights.some(h => h.includes('transit'))) {
      highlights.push('Good public transit');
    }
  }

  // Walkability (user cares AND city is walkable)
  if (prefs.prioritizeTransit >= 8 && city.walkScore >= 60 && city.walkScore < 80) {
    if (!highlights.some(h => h.includes('walkab'))) {
      highlights.push('Good walkability');
    }
  }

  // Outdoors (user cares AND city has good outdoor access)
  if (prefs.prioritizeOutdoors >= 8 && city.outdoorIndex >= 70 && city.outdoorIndex < 85) {
    if (!highlights.some(h => h.includes('outdoor'))) {
      highlights.push('Good outdoor recreation');
    }
  }

  // Entertainment (user cares AND city has good entertainment)
  if (prefs.prioritizeEntertainment >= 8 && city.entertainmentIndex >= 70 && city.entertainmentIndex < 88) {
    if (!highlights.some(h => h.includes('entertainment'))) {
      highlights.push('Good entertainment options');
    }
  }

  // Education (user cares AND city has good education)
  if (prefs.prioritizeEducation >= 8 && city.educationIndex >= 70 && city.educationIndex < 85) {
    if (!highlights.some(h => h.includes('education'))) {
      highlights.push('Good education system');
    }
  }

  // Healthcare (user cares AND city has good healthcare)
  if (prefs.prioritizeHealthcare >= 8 && city.healthcareIndex >= 75 && city.healthcareIndex < 88) {
    if (!highlights.some(h => h.includes('healthcare'))) {
      highlights.push('Good healthcare quality');
    }
  }

  return highlights.slice(0, 6); // Show up to 6 highlights for better city profiles
};

export const generateConsiderations = (city: City): string[] => {
  const considerations: string[] = [];

  // US average COL is 73.5
  const US_AVERAGE_COL = 73.5;

  if (city.costOfLivingIndex >= US_AVERAGE_COL * 2) {
    considerations.push('Very high cost of living');
  } else if (city.costOfLivingIndex >= US_AVERAGE_COL * 1.3) {
    considerations.push('Above-average cost of living');
  }

  if (city.crimeIndex >= 55) {
    considerations.push('Higher crime rate');
  }

  if (city.walkScore < 50) {
    considerations.push('Car-dependent area');
  }

  if (city.transitScore < 40) {
    considerations.push('Limited public transit');
  }

  if (city.averageCommute > 35) {
    considerations.push('Long average commute');
  }

  // Tax warnings for both US and international cities
  if (city.taxRates.type === 'us_federal_state') {
    // US cities: check state + local tax
    const totalTaxRate = (city.stateTaxRate || 0) + (city.localTaxRate || 0);
    if (totalTaxRate >= 0.08) {
      considerations.push('High state/local income tax');
    }
  } else if (city.taxRates.type === 'progressive_national') {
    // International cities (Canada, UK, etc.): check regional + social contributions
    const totalTaxRate = city.taxRates.regionalRate + (city.taxRates.socialContributions || 0);
    if (totalTaxRate >= 0.12) {
      considerations.push('High income tax');
    }
  }

  if (city.climate === 'continental') {
    considerations.push('Cold winters');
  }

  if (city.climate === 'tropical') {
    considerations.push('High humidity / hurricane risk');
  }

  if (city.medianHomePrice >= 700000) {
    considerations.push('Very expensive housing market');
  }

  // International-specific considerations
  if (city.visaRequired) {
    considerations.push('Visa required');
  }

  if (city.languageBarrier === 'high') {
    considerations.push('Significant language barrier');
  } else if (city.languageBarrier === 'medium') {
    considerations.push('Moderate language barrier');
  }

  if (city.expatCommunitySize === 'small') {
    considerations.push('Small expat community');
  }

  return considerations.slice(0, 3);
};

export const getRecommendations = (
  currentCity: City | null,
  currentSalary: number,
  preferences: Partial<UserPreferences> = {},
  excludeCityIds: string[] = []
): CityRecommendation[] => {
  // First, filter by region if specified
  let eligibleCities = cities.filter(c => !excludeCityIds.includes(c.id));

  // Apply regional filter if specified
  const regionFilter = preferences.regionFilter;
  if (regionFilter && regionFilter !== 'all' && Array.isArray(regionFilter) && regionFilter.length > 0) {
    eligibleCities = eligibleCities.filter(city => {
      const country = getCountryById(city.country || 'us');
      return country && regionFilter.includes(country.region);
    });
  }

  // Apply country filter if specified
  const countryFilter = preferences.countryFilter;
  if (countryFilter && countryFilter !== 'all' && Array.isArray(countryFilter) && countryFilter.length > 0) {
    eligibleCities = eligibleCities.filter(city => {
      return countryFilter.includes(city.country || 'us');
    });
  }

  const recommendations = eligibleCities.map(city => {
    const matchScore = calculateCityScore(city, preferences);

    // Calculate equivalent salary needed
    let salaryNeeded: number;
    if (currentCity && currentSalary > 0) {
      // Use proper tax calculation if we have current city
      try {
        salaryNeeded = calculateEquivalentSalary(currentSalary, currentCity, city);
      } catch (error) {
        console.warn(`Failed to calculate equivalent salary for ${city.name}:`, error);
        // Fallback to simple COL adjustment
        salaryNeeded = currentSalary * (city.costOfLivingIndex / 100);
      }
    } else if (currentSalary > 0) {
      // Simple COL adjustment if no current city
      salaryNeeded = currentSalary * (city.costOfLivingIndex / 100);
    } else {
      // No salary provided
      salaryNeeded = 0;
    }

    return {
      city,
      matchScore,
      highlights: generateHighlights(city, preferences),
      considerations: generateConsiderations(city),
      salaryNeeded,
    };
  });

  // Sort by match score descending
  return recommendations.sort((a, b) => b.matchScore - a.matchScore);
};

export const getTopRecommendations = (
  currentCity: City | null,
  currentSalary: number,
  preferences: Partial<UserPreferences> = {},
  count: number = 5
): CityRecommendation[] => {
  const excludeIds = currentCity ? [currentCity.id] : [];
  return getRecommendations(currentCity, currentSalary, preferences, excludeIds).slice(0, count);
};
