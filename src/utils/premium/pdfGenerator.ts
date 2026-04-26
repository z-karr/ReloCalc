/**
 * PDF Report Generator
 * Premium Feature: Generate comprehensive PDF reports for relocation analysis
 */

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { City } from '../../types';
import {
  CityProjection,
  RentVsBuyAnalysis,
  BreakEvenAnalysis,
  NegotiationToolkit,
  HousingIntent,
  DEFAULT_HOUSING_INTENT,
  MovingChecklist,
} from '../../types/premium';
import { MoveClassification } from './distanceCalculator';

// ============================================================================
// TYPES
// ============================================================================

export interface CityAnalysisData {
  city: City;
  salary: number;
  movingCost: number;
  breakEven: BreakEvenAnalysis;
  projection: CityProjection;
  rentVsBuy: RentVsBuyAnalysis;
  negotiation: NegotiationToolkit;
  checklist: MovingChecklist;
  moveClassification: MoveClassification;
  isPositive: boolean;
}

export interface PDFReportData {
  // User inputs
  currentCity: City;
  currentSalary: number;
  currentProjection: CityProjection;

  // All city analyses
  allCityAnalyses: CityAnalysisData[];

  // Housing intent
  housingIntent: HousingIntent;

  // Household details
  householdSize: number;
  houseHuntingTrips: number;
  tempHousingDays: string;
  moveDate: Date;

  // Additional options
  hasPets: boolean;
  hasChildren: boolean;
  isHomeowner: boolean;

  // Saved checklists (with user progress)
  savedChecklists?: Record<string, MovingChecklist>;

  // Meta
  generatedDate: Date;
  userName?: string;
}

// ============================================================================
// HTML STYLES
// ============================================================================

const COLORS = {
  primary: '#1E3A5F',
  primaryLight: '#2D5F8B',
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  info: '#17A2B8',
  charcoal: '#212529',
  darkGray: '#495057',
  mediumGray: '#718096',
  lightGray: '#E2E8F0',
  white: '#FFFFFF',
  offWhite: '#F7FAFC',
};

const baseStyles = `
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: ${COLORS.charcoal};
      line-height: 1.5;
      padding: 32px;
      max-width: 800px;
      margin: 0 auto;
      font-size: 13px;
    }
    .page-break { page-break-after: always; }
    h1 { font-size: 26px; font-weight: 700; color: ${COLORS.primary}; margin-bottom: 4px; }
    h2 {
      font-size: 18px; font-weight: 700; color: ${COLORS.primary};
      margin-top: 28px; margin-bottom: 12px;
      padding-bottom: 6px; border-bottom: 2px solid ${COLORS.primary};
    }
    h3 { font-size: 15px; font-weight: 600; color: ${COLORS.charcoal}; margin-top: 20px; margin-bottom: 8px; }
    h4 { font-size: 13px; font-weight: 600; color: ${COLORS.darkGray}; margin-top: 12px; margin-bottom: 6px; }
    p { margin-bottom: 8px; color: ${COLORS.darkGray}; font-size: 13px; }
    .subtitle { font-size: 13px; color: ${COLORS.mediumGray}; margin-bottom: 20px; }
    .header { text-align: center; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 1px solid ${COLORS.lightGray}; }
    .logo { font-size: 22px; font-weight: 700; color: ${COLORS.primary}; }
    .date { font-size: 11px; color: ${COLORS.mediumGray}; margin-top: 6px; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0; }
    .summary-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 16px 0; }
    .summary-card {
      background: ${COLORS.offWhite}; padding: 12px; border-radius: 6px; text-align: center;
      border: 1px solid ${COLORS.lightGray};
    }
    .summary-card .label { font-size: 10px; color: ${COLORS.mediumGray}; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.5px; }
    .summary-card .value { font-size: 18px; font-weight: 700; }
    .success { color: ${COLORS.success}; }
    .warning { color: #856404; }
    .error { color: ${COLORS.error}; }
    .primary { color: ${COLORS.primary}; }
    .info { color: ${COLORS.info}; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid ${COLORS.lightGray}; font-size: 12px; }
    th { background: ${COLORS.offWhite}; font-weight: 600; font-size: 10px; text-transform: uppercase; color: ${COLORS.mediumGray}; letter-spacing: 0.5px; }
    .highlight-row { background: ${COLORS.offWhite}; }
    .best-value { color: ${COLORS.success}; font-weight: 700; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .badge {
      display: inline-block; padding: 3px 8px; border-radius: 4px;
      font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .badge-success { background: #D4EDDA; color: ${COLORS.success}; }
    .badge-warning { background: #FFF3CD; color: #856404; }
    .badge-error { background: #F8D7DA; color: ${COLORS.error}; }
    .badge-info { background: #D1ECF1; color: ${COLORS.info}; }
    .badge-primary { background: #D6E4F0; color: ${COLORS.primary}; }
    .info-box {
      background: #E7F3FF; border-left: 4px solid ${COLORS.primary};
      padding: 12px 16px; margin: 12px 0; border-radius: 0 6px 6px 0; font-size: 12px;
    }
    .info-box strong { color: ${COLORS.primary}; }
    .warning-box {
      background: #FFF8E6; border-left: 4px solid ${COLORS.warning};
      padding: 12px 16px; margin: 12px 0; border-radius: 0 6px 6px 0; font-size: 12px;
    }
    .success-box {
      background: #D4EDDA; border-left: 4px solid ${COLORS.success};
      padding: 12px 16px; margin: 12px 0; border-radius: 0 6px 6px 0; font-size: 12px;
    }
    .explainer {
      background: ${COLORS.offWhite}; border: 1px solid ${COLORS.lightGray};
      padding: 12px 16px; margin: 12px 0; border-radius: 6px; font-size: 11px; color: ${COLORS.darkGray};
    }
    .explainer strong { color: ${COLORS.charcoal}; }
    .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .script-box {
      background: ${COLORS.offWhite}; padding: 14px; border-radius: 6px;
      margin-bottom: 12px; font-style: italic; font-size: 12px; line-height: 1.6;
      border: 1px solid ${COLORS.lightGray};
    }
    .script-title { font-weight: 600; font-style: normal; margin-bottom: 6px; color: ${COLORS.primary}; font-size: 13px; }
    .checklist-phase { margin-bottom: 16px; }
    .checklist-item { display: flex; align-items: flex-start; margin-bottom: 4px; font-size: 12px; }
    .checkbox {
      width: 14px; height: 14px; border: 2px solid ${COLORS.mediumGray};
      border-radius: 3px; margin-right: 8px; flex-shrink: 0; margin-top: 2px;
    }
    .checkbox-checked {
      background: ${COLORS.success}; border-color: ${COLORS.success};
    }
    .task-completed { text-decoration: line-through; color: ${COLORS.mediumGray}; }
    .task-due { font-size: 10px; color: ${COLORS.mediumGray}; margin-left: 4px; }
    .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 12px 0; }
    .input-item { background: ${COLORS.offWhite}; padding: 8px 12px; border-radius: 4px; border: 1px solid ${COLORS.lightGray}; }
    .input-label { font-size: 10px; color: ${COLORS.mediumGray}; text-transform: uppercase; letter-spacing: 0.5px; }
    .input-value { font-size: 14px; font-weight: 600; color: ${COLORS.charcoal}; margin-top: 2px; }
    .footer {
      margin-top: 32px; padding-top: 12px; border-top: 1px solid ${COLORS.lightGray};
      text-align: center; font-size: 10px; color: ${COLORS.mediumGray};
    }
    .section-intro { font-size: 12px; color: ${COLORS.darkGray}; margin-bottom: 12px; line-height: 1.6; }
    ul, ol { margin: 8px 0; padding-left: 20px; }
    li { margin-bottom: 6px; font-size: 12px; line-height: 1.5; }
  </style>
`;

// ============================================================================
// HELPERS
// ============================================================================

const fmt = (amount: number): string => {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  if (abs >= 1000000) return `${sign}$${(abs / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `${sign}$${Math.round(abs).toLocaleString()}`;
  return `${sign}$${Math.round(abs)}`;
};

const fmtK = (amount: number): string => {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  if (abs >= 1000000) return `${sign}$${(abs / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(1)}K`;
  return `${sign}$${Math.round(abs)}`;
};

const fmtDate = (date: Date): string =>
  date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const fmtPct = (value: number): string => `${(value * 100).toFixed(1)}%`;

const getMoveTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    local: 'Local Move', regional: 'Regional Move',
    'long-distance': 'Long-Distance Move', 'cross-country': 'Cross-Country Move',
    international: 'International Move',
  };
  return labels[type] || 'Relocation';
};

// ============================================================================
// SECTION 1: HEADER
// ============================================================================

const generateHeader = (data: PDFReportData): string => {
  const cityNames = data.allCityAnalyses.map(a => a.city.name).join(', ');
  return `
    <div class="header">
      <div class="logo">Relo<span style="color: ${COLORS.accent}">Fi</span></div>
      <h1>Comprehensive Relocation Analysis</h1>
      <p class="subtitle">${data.currentCity.name}, ${data.currentCity.state} → ${cityNames}</p>
      <div class="date">Generated on ${fmtDate(data.generatedDate)}</div>
    </div>
  `;
};

// ============================================================================
// SECTION 2: USER INPUTS
// ============================================================================

const generateUserInputs = (data: PDFReportData): string => {
  const hi = data.housingIntent || DEFAULT_HOUSING_INTENT;
  const options: string[] = [];
  if (hi.plansToBuy) options.push('Planning to buy');
  if (data.isHomeowner) options.push('Current homeowner');
  if (data.hasPets) options.push('Has pets');
  if (data.hasChildren) options.push('Has children');

  return `
    <h2>Your Inputs</h2>
    <p class="section-intro">The following inputs were used to generate this analysis.</p>

    <h3>Current Situation</h3>
    <div class="input-grid">
      <div class="input-item">
        <div class="input-label">Current City</div>
        <div class="input-value">${data.currentCity.name}, ${data.currentCity.state}</div>
      </div>
      <div class="input-item">
        <div class="input-label">Current Salary</div>
        <div class="input-value">${fmt(data.currentSalary)}</div>
      </div>
    </div>

    <h3>Target Cities</h3>
    ${data.allCityAnalyses.map(a => `
      <div class="input-grid">
        <div class="input-item">
          <div class="input-label">City</div>
          <div class="input-value">${a.city.name}, ${a.city.state}</div>
        </div>
        <div class="input-item">
          <div class="input-label">Target Salary</div>
          <div class="input-value">${fmt(a.salary)}</div>
        </div>
        <div class="input-item">
          <div class="input-label">Moving Cost</div>
          <div class="input-value">${fmt(a.movingCost)}</div>
        </div>
        <div class="input-item">
          <div class="input-label">Move Type</div>
          <div class="input-value">${getMoveTypeLabel(a.moveClassification.type)} (${Math.round(a.moveClassification.distanceMiles)} mi)</div>
        </div>
      </div>
    `).join('')}

    <h3>Additional Options</h3>
    <div class="input-grid">
      <div class="input-item">
        <div class="input-label">Housing Strategy</div>
        <div class="input-value">${hi.plansToBuy ? 'Buying' : 'Renting'}</div>
      </div>
      <div class="input-item">
        <div class="input-label">Household Size</div>
        <div class="input-value">${data.householdSize} ${data.householdSize === 1 ? 'person' : 'people'}</div>
      </div>
      <div class="input-item">
        <div class="input-label">House Hunting Trips</div>
        <div class="input-value">${data.houseHuntingTrips}</div>
      </div>
      <div class="input-item">
        <div class="input-label">Move Date</div>
        <div class="input-value">${fmtDate(data.moveDate)}</div>
      </div>
      ${hi.plansToBuy ? `
        <div class="input-item">
          <div class="input-label">Down Payment</div>
          <div class="input-value">${fmtPct(hi.downPaymentPercent)}</div>
        </div>
        ${hi.targetHomePrice ? `
          <div class="input-item">
            <div class="input-label">Target Home Price</div>
            <div class="input-value">${fmt(hi.targetHomePrice)}</div>
          </div>
        ` : ''}
        ${hi.mortgageRate ? `
          <div class="input-item">
            <div class="input-label">Mortgage Rate</div>
            <div class="input-value">${fmtPct(hi.mortgageRate)}</div>
          </div>
        ` : ''}
      ` : ''}
    </div>
    ${options.length > 0 ? `<p><strong>Circumstances:</strong> ${options.join(' • ')}</p>` : ''}
  `;
};

// ============================================================================
// SECTION 3: OVERVIEW
// ============================================================================

const generateOverview = (data: PDFReportData): string => {
  const hi = data.housingIntent || DEFAULT_HOUSING_INTENT;

  // Comparison table across all cities
  const allCities = [
    { name: `${data.currentCity.name} (Current)`, city: data.currentCity, salary: data.currentSalary, isCurrent: true, analysis: null as CityAnalysisData | null },
    ...data.allCityAnalyses.map(a => ({ name: a.city.name, city: a.city, salary: a.salary, isCurrent: false, analysis: a })),
  ];

  return `
    <div class="page-break"></div>
    <h2>Overview — Compare All Cities</h2>

    <div class="explainer">
      <strong>ℹ How to read this section:</strong> This grid shows key financial metrics side by side for your current city and all target cities.
      Green highlighted values indicate the best option for each metric.
      <br/><br/>
      <strong>Break-Even</strong> = How long until the move pays for itself. <strong>Net Salary</strong> = Take-home pay after taxes.
      <strong>COL Index</strong> = Cost of living relative to national average (100 = average). <strong>Median Rent</strong> = Typical monthly rent.
    </div>

    <table>
      <thead>
        <tr>
          <th>Metric</th>
          ${allCities.map(c => `<th class="text-center">${c.name}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Break-Even</strong></td>
          ${allCities.map(c => {
            if (c.isCurrent) return '<td class="text-center">—</td>';
            const months = c.analysis!.breakEven.breakEvenMonths;
            const val = months === -1 || months === Infinity ? 'Never' : c.analysis!.breakEven.breakEvenFormatted;
            return `<td class="text-center">${val}</td>`;
          }).join('')}
        </tr>
        <tr>
          <td><strong>5yr Net Worth</strong></td>
          ${allCities.map(c => {
            const nw = c.isCurrent ? data.currentProjection.totalNetWorthYear5 : c.analysis!.projection.totalNetWorthYear5;
            return `<td class="text-center">${fmtK(nw)}</td>`;
          }).join('')}
        </tr>
        <tr>
          <td><strong>Net Salary</strong></td>
          ${allCities.map(c => `<td class="text-center">${fmt(c.salary)}</td>`).join('')}
        </tr>
        <tr>
          <td><strong>COL Index</strong></td>
          ${allCities.map(c => `<td class="text-center">${c.city.costOfLivingIndex}</td>`).join('')}
        </tr>
        <tr>
          <td><strong>Median Rent</strong></td>
          ${allCities.map(c => `<td class="text-center">${fmt(c.city.medianRent)}/mo</td>`).join('')}
        </tr>
        ${hi.plansToBuy ? `
        <tr>
          <td><strong>Median Home</strong></td>
          ${allCities.map(c => `<td class="text-center">${fmtK(c.city.medianHomePrice)}</td>`).join('')}
        </tr>
        ` : ''}
      </tbody>
    </table>

    ${data.allCityAnalyses.map(a => `
      <h3>${a.city.name} — Summary</h3>
      <div class="${a.isPositive ? 'success-box' : 'warning-box'}">
        <strong>${a.isPositive ? 'This Move Makes Financial Sense' : 'Consider Negotiating Additional Compensation'}</strong>
        <p style="margin: 6px 0 0 0;">
          ${a.isPositive
            ? `Break-even in <strong>${a.breakEven.breakEvenFormatted}</strong>. You'll be ahead by <strong>${fmtK(a.breakEven.cumulativeAdvantage.year5)}</strong> after 5 years.`
            : `Break-even: ${a.breakEven.breakEvenMonths === -1 ? 'Not within analysis period' : a.breakEven.breakEvenFormatted}. ${a.breakEven.recommendation}`
          }
        </p>
      </div>
      <div class="summary-grid">
        <div class="summary-card">
          <div class="label">Monthly Advantage</div>
          <div class="value ${a.breakEven.monthlyNetAdvantage >= 0 ? 'success' : 'error'}">${fmt(a.breakEven.monthlyNetAdvantage)}/mo</div>
        </div>
        <div class="summary-card">
          <div class="label">COL Difference</div>
          <div class="value">${fmt(a.breakEven.monthlyColDifference)}/mo</div>
        </div>
        <div class="summary-card">
          <div class="label">Rent Difference</div>
          <div class="value">${a.breakEven.monthlyRentDifference >= 0 ? '+' : ''}${fmt(a.breakEven.monthlyRentDifference)}/mo</div>
        </div>
      </div>
    `).join('')}
  `;
};

// ============================================================================
// SECTION 4: PROJECTIONS
// ============================================================================

const generateProjections = (data: PDFReportData): string => {
  const hi = data.housingIntent || DEFAULT_HOUSING_INTENT;

  const allProjections = [
    { name: `${data.currentCity.name} (Current)`, projection: data.currentProjection, isCurrent: true },
    ...data.allCityAnalyses.map(a => ({ name: a.city.name, projection: a.projection, isCurrent: false })),
  ];

  return `
    <div class="page-break"></div>
    <h2>5-Year Financial Projections</h2>

    <div class="explainer">
      <strong>ℹ How to read this section:</strong> These projections model your financial trajectory over 5 years in each city.
      They account for salary growth (3%/yr), cost of living inflation (2.5%/yr), rent increases (3%/yr), and investment returns (7%/yr) on savings.
      ${hi.plansToBuy ? 'Since you selected <strong>buying</strong>, net worth includes accumulated home equity and accounts for the down payment, mortgage, property taxes, insurance, and maintenance.' : 'Since you selected <strong>renting</strong>, projections show cash savings and investment growth.'}
      <br/><br/>
      <strong>Net Salary</strong> = After-tax income. <strong>Annual Savings</strong> = Income minus all expenses.
      <strong>Net Worth</strong> = Cumulative savings + investment returns${hi.plansToBuy ? ' + home equity' : ''}.
    </div>

    ${allProjections.map(({ name, projection, isCurrent }) => {
      const hasEquity = projection.projections.some(p => p.homeEquity !== undefined && p.homeEquity > 0);
      return `
        <h3>${name}</h3>
        <table>
          <thead>
            <tr>
              <th>Year</th>
              <th class="text-right">Net Salary</th>
              <th class="text-right">Living Expenses</th>
              <th class="text-right">Annual Savings</th>
              ${hasEquity ? '<th class="text-right">Home Equity</th>' : ''}
              <th class="text-right">Net Worth</th>
            </tr>
          </thead>
          <tbody>
            ${projection.projections.map(p => `
              <tr>
                <td>Year ${p.year}</td>
                <td class="text-right">${fmt(p.netSalary)}</td>
                <td class="text-right">${fmt(p.annualLivingExpenses)}</td>
                <td class="text-right ${p.annualSavings >= 0 ? 'success' : 'error'}">${fmt(p.annualSavings)}</td>
                ${hasEquity ? `<td class="text-right primary">${fmt(p.homeEquity || 0)}</td>` : ''}
                <td class="text-right"><strong>${fmt(p.netWorth)}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="summary-grid">
          <div class="summary-card">
            <div class="label">5-Year Net Worth</div>
            <div class="value ${projection.totalNetWorthYear5 >= 0 ? 'success' : 'error'}">${fmtK(projection.totalNetWorthYear5)}</div>
          </div>
          <div class="summary-card">
            <div class="label">Total Savings</div>
            <div class="value">${fmtK(projection.totalSavingsYear5)}</div>
          </div>
          ${hasEquity && projection.projections[4]?.homeEquity ? `
            <div class="summary-card">
              <div class="label">Home Equity (Year 5)</div>
              <div class="value primary">${fmtK(projection.projections[4].homeEquity)}</div>
            </div>
          ` : ''}
        </div>
      `;
    }).join('')}

    ${data.allCityAnalyses.length > 0 ? `
      <h3>Net Worth Comparison at Year 5</h3>
      <table>
        <thead>
          <tr>
            <th>City</th>
            <th class="text-right">5yr Net Worth</th>
            <th class="text-right">vs. Current City</th>
          </tr>
        </thead>
        <tbody>
          <tr class="highlight-row">
            <td>${data.currentCity.name} (Current)</td>
            <td class="text-right">${fmtK(data.currentProjection.totalNetWorthYear5)}</td>
            <td class="text-right">—</td>
          </tr>
          ${data.allCityAnalyses.map(a => {
            const diff = a.projection.totalNetWorthYear5 - data.currentProjection.totalNetWorthYear5;
            return `
              <tr>
                <td>${a.city.name}</td>
                <td class="text-right"><strong>${fmtK(a.projection.totalNetWorthYear5)}</strong></td>
                <td class="text-right ${diff >= 0 ? 'success' : 'error'}">${diff >= 0 ? '+' : ''}${fmtK(diff)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    ` : ''}
  `;
};

// ============================================================================
// SECTION 5: HOUSING (RENT VS BUY)
// ============================================================================

const generateHousing = (data: PDFReportData): string => {
  const hi = data.housingIntent || DEFAULT_HOUSING_INTENT;

  return `
    <div class="page-break"></div>
    <h2>Housing Analysis — Rent vs. Buy</h2>

    <div class="explainer">
      <strong>ℹ How to read this section:</strong> This analysis compares the financial outcomes of renting vs. buying in each target city over 10 years.
      It factors in home appreciation (4%/yr), mortgage payments, property taxes, insurance, maintenance, rent inflation (3%/yr), and the opportunity cost of the down payment if invested instead (7%/yr return).
      <br/><br/>
      <strong>Break-Even Year</strong> = When buying becomes cheaper than renting. <strong>Confidence</strong> = How strongly the data supports the recommendation.
      The renter scenario assumes investing the down payment and monthly savings in the stock market.
    </div>

    ${data.allCityAnalyses.map(a => {
      const analysis = a.rentVsBuy;
      const monthlyBuyCost = analysis.buyScenario.monthlyMortgage +
        (analysis.buyScenario.propertyTax / 12) +
        (analysis.buyScenario.homeInsurance / 12) +
        (analysis.buyScenario.maintenance / 12);

      const recBadge = analysis.recommendation === 'buy' ? 'badge-success'
        : analysis.recommendation === 'rent' ? 'badge-info' : 'badge-warning';

      return `
        <h3>${a.city.name}</h3>

        <div class="${analysis.recommendation === 'buy' ? 'success-box' : analysis.recommendation === 'rent' ? 'info-box' : 'warning-box'}">
          <strong>Recommendation: <span class="badge ${recBadge}">${analysis.recommendation.toUpperCase()}</span></strong>
          <span class="badge badge-${analysis.confidenceLevel === 'high' ? 'success' : analysis.confidenceLevel === 'medium' ? 'warning' : 'error'}">${analysis.confidenceLevel} confidence</span>
          <p style="margin: 8px 0 0 0;">${analysis.reasoning}</p>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="label">Break-Even</div>
            <div class="value">${analysis.breakEvenYear ? `Year ${analysis.breakEvenYear}` : 'Never'}</div>
          </div>
          <div class="summary-card">
            <div class="label">5yr Winner</div>
            <div class="value">${analysis.comparison5Year.winner === 'buy' ? 'Buying' : 'Renting'}</div>
          </div>
          <div class="summary-card">
            <div class="label">5yr Difference</div>
            <div class="value">${fmtK(analysis.comparison5Year.difference)}</div>
          </div>
        </div>

        <div class="two-column">
          <div>
            <h4>Renting ${!hi.plansToBuy ? '<span class="badge badge-primary">Your Choice</span>' : ''}</h4>
            <table>
              <tr><td>Monthly Rent</td><td class="text-right">${fmt(analysis.rentScenario.monthlyRent)}</td></tr>
              <tr><td>Renter's Insurance</td><td class="text-right">$${analysis.rentScenario.rentersInsurance}/mo</td></tr>
              <tr><td>Net Worth (5yr)</td><td class="text-right"><strong>${fmtK(analysis.comparison5Year.rentNetWorth)}</strong></td></tr>
              <tr><td>Net Worth (10yr)</td><td class="text-right"><strong>${fmtK(analysis.comparison10Year.rentNetWorth)}</strong></td></tr>
            </table>
          </div>
          <div>
            <h4>Buying ${hi.plansToBuy ? '<span class="badge badge-primary">Your Choice</span>' : ''}</h4>
            <table>
              <tr><td>Home Price</td><td class="text-right">${fmt(analysis.buyScenario.purchasePrice)}</td></tr>
              <tr><td>Down Payment (${fmtPct(analysis.buyScenario.downPaymentPercent)})</td><td class="text-right">${fmt(analysis.buyScenario.downPayment)}</td></tr>
              <tr><td>Monthly Payment</td><td class="text-right">${fmt(monthlyBuyCost)}</td></tr>
              <tr><td>Net Worth (5yr)</td><td class="text-right"><strong>${fmtK(analysis.comparison5Year.buyNetWorth)}</strong></td></tr>
              <tr><td>Net Worth (10yr)</td><td class="text-right"><strong>${fmtK(analysis.comparison10Year.buyNetWorth)}</strong></td></tr>
            </table>
          </div>
        </div>
      `;
    }).join('')}
  `;
};

// ============================================================================
// SECTION 6: NEGOTIATION TOOLKIT
// ============================================================================

const generateNegotiation = (data: PDFReportData): string => {
  return `
    <div class="page-break"></div>
    <h2>Employer Negotiation Toolkit</h2>

    <div class="explainer">
      <strong>ℹ How to use this section:</strong> This toolkit provides data-driven talking points and professional scripts for negotiating your relocation package.
      <br/><br/>
      <strong>Your Costs</strong> = Estimated total relocation expenses. <strong>Typical Package</strong> = What companies usually cover (based on industry surveys).
      <strong>Recommended Ask</strong> = Your costs + 10% buffer for unexpected expenses.
      <br/><br/>
      The green bars in the benchmarks show the percentage of companies that cover each component. The scripts are pre-filled with your specific figures — use them in emails or adapt for conversations.
    </div>

    ${data.allCityAnalyses.map(a => {
      const tk = a.negotiation;
      return `
        <h3>${data.currentCity.name} → ${a.city.name}</h3>
        <p><span class="badge badge-${a.moveClassification.type === 'local' ? 'success' : a.moveClassification.type === 'regional' ? 'info' : a.moveClassification.type === 'cross-country' ? 'error' : 'warning'}">${getMoveTypeLabel(a.moveClassification.type)}</span> ${Math.round(a.moveClassification.distanceMiles)} miles</p>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="label">Your Costs</div>
            <div class="value error">${fmtK(tk.actualCosts)}</div>
          </div>
          <div class="summary-card">
            <div class="label">Typical Package</div>
            <div class="value">${fmtK(tk.typicalPackageValue)}</div>
          </div>
          <div class="summary-card">
            <div class="label">Recommended Ask</div>
            <div class="value success">${fmtK(tk.recommendedAsk)}</div>
          </div>
        </div>

        ${tk.gap > 0 ? `
          <div class="warning-box">
            <strong>Coverage Gap: ${fmtK(tk.gap)}</strong>
            <p style="margin: 6px 0 0 0;">Standard company packages typically don't cover all relocation costs. Use the talking points and scripts below to negotiate additional support.</p>
          </div>
        ` : ''}

        <h4>Cost Breakdown</h4>
        <table>
          <tr><td>Moving Expenses</td><td class="text-right">${fmt(tk.costBreakdown.movingExpenses)}</td></tr>
          <tr><td>Temporary Housing</td><td class="text-right">${fmt(tk.costBreakdown.temporaryHousing)}</td></tr>
          <tr><td>House Hunting Trips</td><td class="text-right">${fmt(tk.costBreakdown.houseHuntingTrips)}</td></tr>
          <tr><td>Duplicate Housing</td><td class="text-right">${fmt(tk.costBreakdown.duplicateHousing)}</td></tr>
          <tr><td>Travel Costs</td><td class="text-right">${fmt(tk.costBreakdown.travelCosts)}</td></tr>
          <tr><td>Storage</td><td class="text-right">${fmt(tk.costBreakdown.storageIfNeeded)}</td></tr>
          <tr><td>Tax Gross-Up</td><td class="text-right">${fmt(tk.costBreakdown.grossUpAmount)}</td></tr>
          <tr class="highlight-row"><td><strong>Total</strong></td><td class="text-right"><strong>${fmt(tk.costBreakdown.totalRelocationCost)}</strong></td></tr>
        </table>

        ${tk.costBreakdown.colAdjustmentNeeded > 0 || tk.costBreakdown.taxBurdenDifference !== 0 ? `
          <h4>Annual Impact Considerations</h4>
          <table>
            ${tk.costBreakdown.colAdjustmentNeeded > 0 ? `<tr><td>COL Adjustment Needed</td><td class="text-right warning">${fmt(tk.costBreakdown.colAdjustmentNeeded)}/year</td></tr>` : ''}
            ${tk.costBreakdown.taxBurdenDifference !== 0 ? `<tr><td>Tax Burden Change</td><td class="text-right ${tk.costBreakdown.taxBurdenDifference > 0 ? 'error' : 'success'}">${tk.costBreakdown.taxBurdenDifference > 0 ? '+' : ''}${fmt(tk.costBreakdown.taxBurdenDifference)}/year</td></tr>` : ''}
          </table>
        ` : ''}

        <h4>Key Talking Points</h4>
        <ol>
          ${tk.negotiationPoints.map(point => `<li>${point}</li>`).join('')}
        </ol>

        <h4>Negotiation Scripts</h4>
        <div class="script-box">
          <div class="script-title">${tk.costBreakdown.colAdjustmentNeeded > 0 ? 'Requesting COL Adjustment' : 'Requesting Relocation Bonus'}</div>
          ${tk.scripts.colAdjustment}
        </div>
        <div class="script-box">
          <div class="script-title">Requesting Tax Gross-Up</div>
          ${tk.scripts.grossUp}
        </div>
        <div class="script-box">
          <div class="script-title">Requesting Temporary Housing</div>
          ${tk.scripts.temporaryHousing}
        </div>
        <div class="script-box">
          <div class="script-title">Requesting Housing Assistance</div>
          ${tk.scripts.homeSaleAssistance}
        </div>

        <h4>Industry Benchmarks</h4>
        <p style="font-size: 11px; color: ${COLORS.mediumGray};">Percentage indicates how many companies typically cover this component.</p>
        <table>
          <thead>
            <tr><th>Component</th><th>Typical Coverage</th><th class="text-center">% of Companies</th><th class="text-right">Range</th></tr>
          </thead>
          <tbody>
            ${tk.benchmarks.map(b => `
              <tr>
                <td>${b.component}</td>
                <td>${b.typicalCoverage}</td>
                <td class="text-center">${b.percentCovered}%</td>
                <td class="text-right">$${b.dollarRange.low.toLocaleString()} – $${b.dollarRange.high.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }).join('')}
  `;
};

// ============================================================================
// SECTION 7: CHECKLIST
// ============================================================================

const generateChecklist = (data: PDFReportData): string => {
  const phaseLabels: Record<string, string> = {
    planning: 'Planning Phase (90–60 days before)',
    preparation: 'Preparation Phase (60–30 days before)',
    execution: 'Execution Phase (30–7 days before)',
    countdown: 'Final Countdown (7–0 days)',
    settling: 'Settling In (After move)',
  };
  const phases = ['planning', 'preparation', 'execution', 'countdown', 'settling'];

  return `
    <div class="page-break"></div>
    <h2>90-Day Moving Checklist</h2>

    <div class="explainer">
      <strong>ℹ How to use this checklist:</strong> This is a personalized moving checklist tailored to your specific circumstances — filtered based on whether you have pets, children, are renting or own a home, and whether this is a domestic or international move.
      <br/><br/>
      Tasks are organized into 5 phases from 90 days before your move through settling in. The timing is a guideline — adjust based on your specific situation. Items marked with ✓ have been completed.
    </div>

    ${data.allCityAnalyses.map(a => {
      // Use saved checklist with user progress if available, otherwise use generated
      const checklist = data.savedChecklists?.[a.city.id] || a.checklist;
      const completedCount = checklist.items.filter((i: any) => i.completed).length;
      const totalCount = checklist.items.length;
      const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      return `
        <h3>${data.currentCity.name} → ${a.city.name}</h3>
        <p>Progress: <strong>${completedCount}/${totalCount} tasks completed (${pct}%)</strong> • Move date: ${fmtDate(checklist.moveDate instanceof Date ? checklist.moveDate : new Date(checklist.moveDate))}</p>

        ${phases.map(phase => {
          const phaseTasks = checklist.items.filter((item: any) => item.category === phase);
          if (phaseTasks.length === 0) return '';
          const phaseCompleted = phaseTasks.filter((i: any) => i.completed).length;

          return `
            <h4>${phaseLabels[phase]} — ${phaseCompleted}/${phaseTasks.length}</h4>
            <div class="checklist-phase">
              ${phaseTasks.map((task: any) => `
                <div class="checklist-item">
                  <div class="checkbox ${task.completed ? 'checkbox-checked' : ''}"></div>
                  <span class="${task.completed ? 'task-completed' : ''}">${task.task}</span>
                </div>
              `).join('')}
            </div>
          `;
        }).join('')}
      `;
    }).join('')}
  `;
};

// ============================================================================
// FOOTER
// ============================================================================

const generateFooter = (): string => `
  <div class="footer">
    <p>Generated by ReloFi Premium</p>
    <p>This report is for informational purposes only. Actual costs, taxes, and financial outcomes may vary based on individual circumstances, market conditions, and timing.</p>
    <p>© ${new Date().getFullYear()} ReloFi. All rights reserved.</p>
  </div>
`;

// ============================================================================
// HTML BUILDER
// ============================================================================

function buildFullHTML(data: PDFReportData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>ReloFi Report — ${data.currentCity.name} to ${data.allCityAnalyses.map(a => a.city.name).join(', ')}</title>
        ${baseStyles}
      </head>
      <body>
        ${generateHeader(data)}
        ${generateUserInputs(data)}
        ${generateOverview(data)}
        ${generateProjections(data)}
        ${generateHousing(data)}
        ${generateNegotiation(data)}
        ${generateChecklist(data)}
        ${generateFooter()}
      </body>
    </html>
  `;
}

// ============================================================================
// MAIN EXPORT FUNCTIONS
// ============================================================================

import { Platform } from 'react-native';

/**
 * Open report in a new tab for viewing/saving (web) or generate PDF file (native)
 */
export async function generatePDFReport(data: PDFReportData): Promise<string> {
  const html = buildFullHTML(data);

  if (Platform.OS === 'web') {
    const reportWindow = window.open('', '_blank');
    if (reportWindow) {
      reportWindow.document.write(html);
      reportWindow.document.close();
    }
    return '';
  }

  const { uri } = await Print.printToFileAsync({
    html,
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
  });

  return uri;
}

/**
 * Generate and share/view the PDF report
 */
export async function generateAndSharePDF(data: PDFReportData): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      await generatePDFReport(data);
      return;
    }

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
 * Open report and trigger print dialog
 */
export async function printPDFReport(data: PDFReportData): Promise<void> {
  const html = buildFullHTML(data);

  if (Platform.OS === 'web') {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
    return;
  }

  await Print.printAsync({ html });
}
