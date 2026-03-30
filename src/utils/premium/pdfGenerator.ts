/**
 * PDF Report Generator
 * Premium Feature: Generate professional PDF reports for relocation analysis
 */

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { City } from '../../types';
import {
  MultiCityComparison,
  CityProjection,
  RentVsBuyAnalysis,
  BreakEvenAnalysis,
  NegotiationToolkit,
  HousingIntent,
  DEFAULT_HOUSING_INTENT,
} from '../../types/premium';

// ============================================================================
// TYPES
// ============================================================================

export interface PDFReportData {
  // User info
  currentCity: City;
  currentSalary: number;

  // Analysis data
  cities: City[];
  salaries: number[];
  movingCosts: number[];  // Per-city moving costs

  // Premium calculations
  comparison?: MultiCityComparison;
  projections?: Record<string, CityProjection>;
  rentVsBuyAnalyses?: Record<string, RentVsBuyAnalysis>;
  breakEvenAnalysis?: BreakEvenAnalysis;
  negotiationToolkit?: NegotiationToolkit;

  // User preferences
  userName?: string;
  generatedDate: Date;

  // Housing intent
  housingIntent?: HousingIntent;

  // Additional options
  isInternational?: boolean;
  hasPets?: boolean;
  hasChildren?: boolean;
  isHomeowner?: boolean;
}

// ============================================================================
// HTML TEMPLATES
// ============================================================================

const COLORS = {
  primary: '#0066CC',
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  charcoal: '#2D3748',
  mediumGray: '#718096',
  lightGray: '#E2E8F0',
  white: '#FFFFFF',
  offWhite: '#F7FAFC',
};

const baseStyles = `
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: ${COLORS.charcoal};
      line-height: 1.5;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .page-break {
      page-break-after: always;
    }
    h1 {
      font-size: 28px;
      font-weight: 700;
      color: ${COLORS.primary};
      margin-bottom: 8px;
    }
    h2 {
      font-size: 20px;
      font-weight: 700;
      color: ${COLORS.charcoal};
      margin-top: 32px;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid ${COLORS.primary};
    }
    h3 {
      font-size: 16px;
      font-weight: 600;
      color: ${COLORS.charcoal};
      margin-top: 24px;
      margin-bottom: 12px;
    }
    p {
      margin-bottom: 12px;
      color: ${COLORS.charcoal};
    }
    .subtitle {
      font-size: 14px;
      color: ${COLORS.mediumGray};
      margin-bottom: 24px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .logo {
      font-size: 24px;
      font-weight: 700;
      color: ${COLORS.primary};
    }
    .date {
      font-size: 12px;
      color: ${COLORS.mediumGray};
      margin-top: 8px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin: 24px 0;
    }
    .summary-card {
      background: ${COLORS.offWhite};
      padding: 16px;
      border-radius: 8px;
      text-align: center;
    }
    .summary-card .label {
      font-size: 12px;
      color: ${COLORS.mediumGray};
      margin-bottom: 4px;
    }
    .summary-card .value {
      font-size: 20px;
      font-weight: 700;
    }
    .success { color: ${COLORS.success}; }
    .warning { color: ${COLORS.warning}; }
    .error { color: ${COLORS.error}; }
    .primary { color: ${COLORS.primary}; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid ${COLORS.lightGray};
    }
    th {
      background: ${COLORS.offWhite};
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      color: ${COLORS.mediumGray};
    }
    td {
      font-size: 14px;
    }
    .highlight-row {
      background: ${COLORS.offWhite};
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-success {
      background: #D4EDDA;
      color: ${COLORS.success};
    }
    .badge-warning {
      background: #FFF3CD;
      color: #856404;
    }
    .badge-error {
      background: #F8D7DA;
      color: ${COLORS.error};
    }
    .info-box {
      background: #E7F3FF;
      border-left: 4px solid ${COLORS.primary};
      padding: 16px;
      margin: 16px 0;
      border-radius: 0 8px 8px 0;
    }
    .warning-box {
      background: #FFF8E6;
      border-left: 4px solid ${COLORS.warning};
      padding: 16px;
      margin: 16px 0;
      border-radius: 0 8px 8px 0;
    }
    .checklist-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 8px;
    }
    .checkbox {
      width: 16px;
      height: 16px;
      border: 2px solid ${COLORS.mediumGray};
      border-radius: 3px;
      margin-right: 12px;
      flex-shrink: 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid ${COLORS.lightGray};
      text-align: center;
      font-size: 11px;
      color: ${COLORS.mediumGray};
    }
    .two-column {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .script-box {
      background: ${COLORS.offWhite};
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-style: italic;
      font-size: 13px;
      line-height: 1.6;
    }
    .script-title {
      font-weight: 600;
      font-style: normal;
      margin-bottom: 8px;
      color: ${COLORS.primary};
    }
  </style>
`;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatCurrency = (amount: number): string => {
  if (Math.abs(amount) >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1000) return `$${Math.round(amount / 1000).toLocaleString()}K`;
  return `$${Math.round(amount).toLocaleString()}`;
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatPercent = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

// ============================================================================
// SECTION GENERATORS
// ============================================================================

const generateHeader = (data: PDFReportData): string => {
  const housingIntent = data.housingIntent || DEFAULT_HOUSING_INTENT;
  const isBuying = housingIntent.plansToBuy;

  return `
    <div class="header">
      <div class="logo">ReloCalc</div>
      <h1>Relocation Analysis Report</h1>
      <p class="subtitle">${data.currentCity.name} → ${data.cities.map(c => c.name).join(', ')}</p>
      <div style="margin-top: 8px;">
        <span class="badge ${isBuying ? 'badge-success' : 'badge-warning'}">${isBuying ? 'Buying' : 'Renting'} Strategy</span>
      </div>
      <div class="date">Generated on ${formatDate(data.generatedDate)}</div>
    </div>
  `;
};

const generateExecutiveSummary = (data: PDFReportData): string => {
  const topCity = data.comparison?.cities[0];
  const breakEven = data.breakEvenAnalysis;
  const housingIntent = data.housingIntent || DEFAULT_HOUSING_INTENT;
  const isBuying = housingIntent.plansToBuy;

  // Build additional options list
  const additionalOptions: string[] = [];
  if (isBuying) additionalOptions.push('Planning to buy home');
  if (data.isInternational) additionalOptions.push('International move');
  if (data.hasPets) additionalOptions.push('Relocating with pets');
  if (data.hasChildren) additionalOptions.push('Moving with children');
  if (data.isHomeowner) additionalOptions.push('Current homeowner');

  return `
    <h2>Executive Summary</h2>

    <div class="summary-grid">
      <div class="summary-card">
        <div class="label">Current Salary</div>
        <div class="value">${formatCurrency(data.currentSalary)}</div>
      </div>
      <div class="summary-card">
        <div class="label">Moving Costs</div>
        <div class="value error">${formatCurrency(data.movingCosts.reduce((sum, cost) => sum + cost, 0))}</div>
      </div>
      <div class="summary-card">
        <div class="label">Housing Strategy</div>
        <div class="value ${isBuying ? 'primary' : ''}">${isBuying ? 'Buying' : 'Renting'}</div>
      </div>
    </div>

    ${isBuying ? `
      <div class="info-box">
        <strong>Home Purchase Details</strong>
        <p style="margin-top: 8px; margin-bottom: 0;">
          Down payment: ${formatPercent(housingIntent.downPaymentPercent)}
          ${housingIntent.targetHomePrice ? ` • Target price: ${formatCurrency(housingIntent.targetHomePrice)}` : ''}
          ${housingIntent.mortgageRate ? ` • Mortgage rate: ${formatPercent(housingIntent.mortgageRate)}` : ''}
        </p>
      </div>
    ` : ''}

    ${additionalOptions.length > 0 ? `
      <p style="margin-bottom: 16px;"><strong>Move characteristics:</strong> ${additionalOptions.join(' • ')}</p>
    ` : ''}

    ${topCity ? `
      <div class="info-box">
        <strong>Top Recommendation: ${topCity.city.name}</strong>
        <p style="margin-top: 8px; margin-bottom: 0;">
          Overall score of ${topCity.overallScore}/100 based on financial opportunity,
          quality of life, and career growth potential.
        </p>
      </div>
    ` : ''}

    ${breakEven ? `
      <h3>Financial Outlook</h3>
      <p>
        ${breakEven.isFinanciallyBeneficial
          ? `This move is financially beneficial. You'll break even in <strong>${breakEven.breakEvenFormatted}</strong>
             and be ahead by <strong>${formatCurrency(breakEven.cumulativeAdvantage.year5)}</strong> after 5 years.`
          : `This move may not be financially optimal. Consider negotiating additional compensation
             to offset the ${formatCurrency(Math.abs(breakEven.cumulativeAdvantage.year5))} gap over 5 years.`
        }
      </p>
    ` : ''}
  `;
};

const generateComparisonTable = (data: PDFReportData): string => {
  if (!data.comparison) return '';

  const housingIntent = data.housingIntent || DEFAULT_HOUSING_INTENT;
  const isBuying = housingIntent.plansToBuy;

  const rows = data.comparison.cities.map((cityScore, index) => {
    const salary = data.salaries[index] || data.currentSalary;
    const housingValue = isBuying
      ? formatCurrency(cityScore.city.medianHomePrice || 0)
      : `${formatCurrency(cityScore.city.medianRent)}/mo`;

    return `
      <tr ${index === 0 ? 'class="highlight-row"' : ''}>
        <td>
          <strong>${cityScore.city.name}</strong>
          ${index === 0 ? '<span class="badge badge-success">Best Match</span>' : ''}
        </td>
        <td class="text-right">${formatCurrency(salary)}</td>
        <td class="text-right">${housingValue}</td>
        <td class="text-right">${cityScore.city.costOfLivingIndex}</td>
        <td class="text-center"><strong>${cityScore.overallScore}</strong></td>
      </tr>
    `;
  }).join('');

  return `
    <h2>City Comparison</h2>

    <table>
      <thead>
        <tr>
          <th>City</th>
          <th class="text-right">Salary</th>
          <th class="text-right">${isBuying ? 'Median Home Price' : 'Median Rent'}</th>
          <th class="text-right">COL Index</th>
          <th class="text-center">Score</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <h3>Category Breakdown</h3>
    <div class="two-column">
      ${data.comparison.cities.map(cityScore => `
        <div>
          <strong>${cityScore.city.name}</strong>
          <table>
            <tr><td>Financial</td><td class="text-right">${cityScore.financialScore}/100</td></tr>
            <tr><td>Quality of Life</td><td class="text-right">${cityScore.qualityOfLifeScore}/100</td></tr>
            <tr><td>Mobility</td><td class="text-right">${cityScore.mobilityScore}/100</td></tr>
            <tr><td>Career</td><td class="text-right">${cityScore.careerScore}/100</td></tr>
          </table>
        </div>
      `).join('')}
    </div>
  `;
};

const generateProjections = (data: PDFReportData): string => {
  if (!data.projections) return '';

  const projectionEntries = Object.entries(data.projections);
  if (projectionEntries.length === 0) return '';

  const housingIntent = data.housingIntent || DEFAULT_HOUSING_INTENT;
  const isBuying = housingIntent.plansToBuy;

  // Check if any projection has home equity data
  const hasHomeEquity = projectionEntries.some(([, projection]) =>
    projection.projections.some(p => p.homeEquity !== undefined && p.homeEquity > 0)
  );

  return `
    <div class="page-break"></div>
    <h2>5-Year Financial Projections</h2>

    <p>These projections assume standard salary growth, inflation rates, and savings behavior.
    ${isBuying ? '<strong>Housing strategy: Buying a home.</strong> Net worth includes accumulated home equity.' : 'Housing strategy: Renting.'}
    Adjust assumptions based on your specific circumstances.</p>

    ${projectionEntries.map(([cityName, projection]) => {
      const cityHasEquity = projection.projections.some(p => p.homeEquity !== undefined && p.homeEquity > 0);
      const year5Projection = projection.projections[projection.projections.length - 1];
      const finalHomeEquity = year5Projection?.homeEquity || 0;

      return `
      <h3>${cityName}</h3>
      <table>
        <thead>
          <tr>
            <th>Year</th>
            <th class="text-right">Net Salary</th>
            <th class="text-right">Annual Savings</th>
            ${cityHasEquity ? '<th class="text-right">Home Equity</th>' : ''}
            <th class="text-right">Net Worth</th>
          </tr>
        </thead>
        <tbody>
          ${projection.projections.map(p => `
            <tr>
              <td>Year ${p.year}</td>
              <td class="text-right">${formatCurrency(p.netSalary)}</td>
              <td class="text-right success">${formatCurrency(p.annualSavings)}</td>
              ${cityHasEquity ? `<td class="text-right primary">${formatCurrency(p.homeEquity || 0)}</td>` : ''}
              <td class="text-right"><strong>${formatCurrency(p.netWorth)}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="summary-grid">
        <div class="summary-card">
          <div class="label">5-Year Net Worth${cityHasEquity ? '*' : ''}</div>
          <div class="value success">${formatCurrency(projection.totalNetWorthYear5)}</div>
        </div>
        <div class="summary-card">
          <div class="label">Total Savings</div>
          <div class="value">${formatCurrency(projection.totalSavingsYear5)}</div>
        </div>
        ${cityHasEquity ? `
        <div class="summary-card">
          <div class="label">Home Equity (Year 5)</div>
          <div class="value primary">${formatCurrency(finalHomeEquity)}</div>
        </div>
        ` : ''}
      </div>
      ${cityHasEquity ? '<p style="font-size: 11px; color: #718096; margin-top: 4px;">*Net worth includes home equity</p>' : ''}
    `;
    }).join('')}
  `;
};

const generateRentVsBuy = (data: PDFReportData): string => {
  if (!data.rentVsBuyAnalyses) return '';

  const analyses = Object.entries(data.rentVsBuyAnalyses);
  if (analyses.length === 0) return '';

  const housingIntent = data.housingIntent || DEFAULT_HOUSING_INTENT;
  const isBuying = housingIntent.plansToBuy;

  return `
    <div class="page-break"></div>
    <h2>Rent vs. Buy Analysis</h2>

    ${isBuying ? `
      <div class="info-box">
        <strong>Your chosen strategy: Buying</strong>
        <p style="margin: 8px 0 0 0;">
          Based on your selection, the 5-year projections above factor in home equity accumulation.
          Below is a comparison of how buying stacks up against renting in each city.
        </p>
      </div>
    ` : `
      <p>Compare the financial implications of renting vs. buying in each target city to inform your housing decision.</p>
    `}

    ${analyses.map(([cityName, analysis]) => {
      // Get 5-year values from the arrays (index 4 for year 5)
      const rentTotal5Year = analysis.rentScenario.totalCost[4] || 0;
      const rentNetWorth5Year = analysis.comparison5Year.rentNetWorth;
      const buyNetWorth5Year = analysis.comparison5Year.buyNetWorth;
      const monthlyTotal = analysis.buyScenario.monthlyMortgage +
        (analysis.buyScenario.propertyTax / 12) +
        (analysis.buyScenario.homeInsurance / 12) +
        (analysis.buyScenario.maintenance / 12);

      // Highlight if user's choice matches the recommendation
      const userChoiceMatchesRec = (isBuying && analysis.recommendation === 'buy') ||
                                    (!isBuying && analysis.recommendation === 'rent');

      return `
        <h3>${cityName}</h3>

        <div class="${analysis.recommendation === 'buy' ? 'info-box' : 'warning-box'}">
          <strong>Recommendation: ${analysis.recommendation.toUpperCase()}</strong>
          ${userChoiceMatchesRec ? ' <span class="badge badge-success">Matches your choice</span>' : ''}
          <p style="margin: 8px 0 0 0;">${analysis.reasoning}</p>
        </div>

        <div class="two-column">
          <div>
            <h4>Renting ${!isBuying ? '<span class="badge badge-success">Your Choice</span>' : ''}</h4>
            <table>
              <tr><td>Monthly Rent</td><td class="text-right">${formatCurrency(analysis.rentScenario.monthlyRent)}</td></tr>
              <tr><td>5-Year Total Cost</td><td class="text-right">${formatCurrency(rentTotal5Year)}</td></tr>
              <tr><td>Net Worth (5yr)</td><td class="text-right">${formatCurrency(rentNetWorth5Year)}</td></tr>
            </table>
          </div>
          <div>
            <h4>Buying ${isBuying ? '<span class="badge badge-success">Your Choice</span>' : ''}</h4>
            <table>
              <tr><td>Home Price</td><td class="text-right">${formatCurrency(analysis.buyScenario.purchasePrice)}</td></tr>
              <tr><td>Down Payment (${formatPercent(analysis.buyScenario.downPaymentPercent)})</td><td class="text-right">${formatCurrency(analysis.buyScenario.downPayment)}</td></tr>
              <tr><td>Monthly Payment</td><td class="text-right">${formatCurrency(monthlyTotal)}</td></tr>
              <tr><td>Net Worth (5yr)</td><td class="text-right">${formatCurrency(buyNetWorth5Year)}</td></tr>
            </table>
          </div>
        </div>

        <p style="margin-top: 16px;">
          <strong>Break-Even Point:</strong> ${analysis.breakEvenYear ? analysis.breakEvenYear.toFixed(1) + ' years' : 'Not within analysis period'}
          <br/>
          <strong>5-Year Difference:</strong> ${buyNetWorth5Year > rentNetWorth5Year
            ? `Buying ahead by ${formatCurrency(buyNetWorth5Year - rentNetWorth5Year)}`
            : rentNetWorth5Year > buyNetWorth5Year
              ? `Renting ahead by ${formatCurrency(rentNetWorth5Year - buyNetWorth5Year)}`
              : 'Essentially equal'}
        </p>
      `;
    }).join('')}
  `;
};

const generateNegotiationBrief = (data: PDFReportData): string => {
  if (!data.negotiationToolkit) return '';

  const toolkit = data.negotiationToolkit;

  return `
    <div class="page-break"></div>
    <h2>Employer Negotiation Brief</h2>

    <p>Use this information to negotiate a comprehensive relocation package with your employer.</p>

    <div class="summary-grid">
      <div class="summary-card">
        <div class="label">Your Actual Costs</div>
        <div class="value error">${formatCurrency(toolkit.actualCosts)}</div>
      </div>
      <div class="summary-card">
        <div class="label">Typical Company Coverage</div>
        <div class="value">${formatCurrency(toolkit.typicalPackageValue)}</div>
      </div>
      <div class="summary-card">
        <div class="label">Recommended Ask</div>
        <div class="value success">${formatCurrency(toolkit.recommendedAsk)}</div>
      </div>
    </div>

    ${toolkit.gap > 0 ? `
      <div class="warning-box">
        <strong>Coverage Gap: ${formatCurrency(toolkit.gap)}</strong>
        <p style="margin: 8px 0 0 0;">
          Standard company packages typically don't cover all relocation costs.
          Use the negotiation points below to request additional support.
        </p>
      </div>
    ` : ''}

    <h3>Cost Breakdown</h3>
    <table>
      <tr><td>Moving Expenses</td><td class="text-right">${formatCurrency(toolkit.costBreakdown.movingExpenses)}</td></tr>
      <tr><td>Temporary Housing</td><td class="text-right">${formatCurrency(toolkit.costBreakdown.temporaryHousing)}</td></tr>
      <tr><td>House Hunting Trips</td><td class="text-right">${formatCurrency(toolkit.costBreakdown.houseHuntingTrips)}</td></tr>
      <tr><td>Duplicate Housing</td><td class="text-right">${formatCurrency(toolkit.costBreakdown.duplicateHousing)}</td></tr>
      <tr><td>Travel Costs</td><td class="text-right">${formatCurrency(toolkit.costBreakdown.travelCosts)}</td></tr>
      <tr><td>Tax Gross-Up</td><td class="text-right">${formatCurrency(toolkit.costBreakdown.grossUpAmount)}</td></tr>
      <tr class="highlight-row">
        <td><strong>Total</strong></td>
        <td class="text-right"><strong>${formatCurrency(toolkit.costBreakdown.totalRelocationCost)}</strong></td>
      </tr>
    </table>

    <h3>Key Talking Points</h3>
    <ol>
      ${toolkit.negotiationPoints.map(point => `<li style="margin-bottom: 12px;">${point}</li>`).join('')}
    </ol>

    <h3>Negotiation Scripts</h3>

    <div class="script-box">
      <div class="script-title">Requesting COL Adjustment</div>
      ${toolkit.scripts.colAdjustment}
    </div>

    <div class="script-box">
      <div class="script-title">Requesting Tax Gross-Up</div>
      ${toolkit.scripts.grossUp}
    </div>

    <div class="script-box">
      <div class="script-title">Requesting Temporary Housing</div>
      ${toolkit.scripts.temporaryHousing}
    </div>

    <div class="script-box">
      <div class="script-title">Requesting Home Sale Assistance</div>
      ${toolkit.scripts.homeSaleAssistance}
    </div>

    <h3>Industry Benchmarks</h3>
    <table>
      <thead>
        <tr>
          <th>Component</th>
          <th>Typical Coverage</th>
          <th class="text-right">Range</th>
        </tr>
      </thead>
      <tbody>
        ${toolkit.benchmarks.map(b => `
          <tr>
            <td>${b.component}</td>
            <td>${b.typicalCoverage}</td>
            <td class="text-right">$${b.dollarRange.low.toLocaleString()} - $${b.dollarRange.high.toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
};

const generateMovingChecklist = (): string => {
  return `
    <div class="page-break"></div>
    <h2>90-Day Moving Checklist</h2>

    <h3>Days 90-60: Planning Phase</h3>
    <div class="checklist-item"><div class="checkbox"></div>Research neighborhoods in target city</div>
    <div class="checklist-item"><div class="checkbox"></div>Get moving quotes (3+ companies)</div>
    <div class="checklist-item"><div class="checkbox"></div>Notify landlord / list home for sale</div>
    <div class="checklist-item"><div class="checkbox"></div>Research schools (if applicable)</div>
    <div class="checklist-item"><div class="checkbox"></div>Start decluttering</div>

    <h3>Days 60-30: Preparation Phase</h3>
    <div class="checklist-item"><div class="checkbox"></div>Book movers</div>
    <div class="checklist-item"><div class="checkbox"></div>Arrange temporary housing</div>
    <div class="checklist-item"><div class="checkbox"></div>Transfer medical records</div>
    <div class="checklist-item"><div class="checkbox"></div>Update subscriptions/memberships</div>
    <div class="checklist-item"><div class="checkbox"></div>Notify employer of start date</div>

    <h3>Days 30-14: Execution Phase</h3>
    <div class="checklist-item"><div class="checkbox"></div>Confirm moving details</div>
    <div class="checklist-item"><div class="checkbox"></div>Pack non-essentials</div>
    <div class="checklist-item"><div class="checkbox"></div>Set up utilities at new address</div>
    <div class="checklist-item"><div class="checkbox"></div>Change address with USPS</div>
    <div class="checklist-item"><div class="checkbox"></div>Arrange pet travel (if applicable)</div>

    <h3>Days 14-1: Final Countdown</h3>
    <div class="checklist-item"><div class="checkbox"></div>Final packing</div>
    <div class="checklist-item"><div class="checkbox"></div>Clean current residence</div>
    <div class="checklist-item"><div class="checkbox"></div>Collect keys for new place</div>
    <div class="checklist-item"><div class="checkbox"></div>Confirm arrival logistics</div>

    <h3>Day 1+: Settling In</h3>
    <div class="checklist-item"><div class="checkbox"></div>Unpack essentials</div>
    <div class="checklist-item"><div class="checkbox"></div>Register vehicles</div>
    <div class="checklist-item"><div class="checkbox"></div>Update driver's license</div>
    <div class="checklist-item"><div class="checkbox"></div>Find new healthcare providers</div>
    <div class="checklist-item"><div class="checkbox"></div>Explore neighborhood</div>
  `;
};

const generateFooter = (): string => {
  return `
    <div class="footer">
      <p>Generated by ReloCalc Premium</p>
      <p>This report is for informational purposes only. Actual costs and outcomes may vary.</p>
      <p>© ${new Date().getFullYear()} ReloCalc. All rights reserved.</p>
    </div>
  `;
};

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

/**
 * Generate a complete PDF report
 */
export async function generatePDFReport(data: PDFReportData): Promise<string> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>ReloCalc Report - ${data.currentCity.name} to ${data.cities[0]?.name || 'New City'}</title>
        ${baseStyles}
      </head>
      <body>
        ${generateHeader(data)}
        ${generateExecutiveSummary(data)}
        ${generateComparisonTable(data)}
        ${generateProjections(data)}
        ${generateRentVsBuy(data)}
        ${generateNegotiationBrief(data)}
        ${generateMovingChecklist()}
        ${generateFooter()}
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({
    html,
    margins: {
      top: 20,
      bottom: 20,
      left: 20,
      right: 20,
    },
  });

  return uri;
}

/**
 * Generate and share the PDF report
 */
export async function generateAndSharePDF(data: PDFReportData): Promise<void> {
  try {
    const uri = await generatePDFReport(data);

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Relocation Report',
        UTI: 'com.adobe.pdf',
      });
    }
  } catch (error) {
    console.error('Error generating/sharing PDF:', error);
    throw error;
  }
}

/**
 * Generate PDF and print directly
 */
export async function printPDFReport(data: PDFReportData): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>ReloCalc Report</title>
        ${baseStyles}
      </head>
      <body>
        ${generateHeader(data)}
        ${generateExecutiveSummary(data)}
        ${generateComparisonTable(data)}
        ${generateProjections(data)}
        ${generateRentVsBuy(data)}
        ${generateNegotiationBrief(data)}
        ${generateMovingChecklist()}
        ${generateFooter()}
      </body>
    </html>
  `;

  await Print.printAsync({ html });
}
