/**
 * Premium Calculators
 * Export all premium calculation utilities
 */

export {
  calculateCityProjection,
  compareProjections,
  calculateScenarios,
  prepareChartData,
} from './projectionCalculator';

export {
  calculateBreakEven,
  prepareBreakEvenChartData,
  quickBreakEvenEstimate,
} from './breakEvenCalculator';

export {
  calculateRentVsBuy,
  prepareRentVsBuyChartData,
  getMonthlyCostComparison,
} from './rentVsBuyCalculator';

export {
  compareMultipleCities,
  prepareRadarChartData,
  prepareBarChartData,
  getComparisonSummary,
  DEFAULT_WEIGHTS,
} from './multiCityComparator';

export type { ComparisonWeights } from './multiCityComparator';

export {
  calculateNegotiationToolkit,
  comparePackageToNeeds,
  getNegotiationSummary,
  INDUSTRY_BENCHMARKS,
} from './negotiationCalculator';

export {
  generatePDFReport,
  generateAndSharePDF,
  printPDFReport,
} from './pdfGenerator';

export type { PDFReportData } from './pdfGenerator';

export {
  generateChecklist,
  toggleTaskCompletion,
  addCustomTask,
  removeTask,
  addTaskNotes,
  refreshChecklistStatus,
  getTasksByPhase,
  getOverdueTasks,
  getUpcomingTasks,
  getProgressByPhase,
  estimateRemainingTime,
} from './checklistGenerator';

export type { ChecklistOptions } from './checklistGenerator';
