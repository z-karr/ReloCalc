/**
 * Checklist Generator
 * Premium Feature: Generate personalized 90-day moving checklists
 */

import { City } from '../../types';
import { ChecklistItem, MovingChecklist } from '../../types/premium';

// ============================================================================
// TYPES
// ============================================================================

export interface ChecklistOptions {
  moveDate: Date;
  fromCity: City;
  toCity: City;
  isInternational: boolean;
  hasPets: boolean;
  hasChildren: boolean;
  isCurrentlyHomeowner: boolean;
  isCurrentlyRenter: boolean;
}

// ============================================================================
// CHECKLIST TEMPLATES
// ============================================================================

const PLANNING_PHASE_TASKS: Omit<ChecklistItem, 'id' | 'completed' | 'completedDate'>[] = [
  {
    task: 'Research neighborhoods in target city',
    category: 'planning',
    daysBeforeMove: 90,
  },
  {
    task: 'Create a moving budget',
    category: 'planning',
    daysBeforeMove: 90,
  },
  {
    task: 'Get quotes from at least 3 moving companies',
    category: 'planning',
    daysBeforeMove: 85,
  },
  {
    task: 'Research international shipping requirements',
    category: 'planning',
    daysBeforeMove: 85,
    showIf: { isInternational: true },
  },
  {
    task: 'Start visa/work permit application process',
    category: 'planning',
    daysBeforeMove: 85,
    showIf: { isInternational: true },
  },
  {
    task: 'Research schools and childcare options',
    category: 'planning',
    daysBeforeMove: 80,
    showIf: { hasChildren: true },
  },
  {
    task: 'Begin school enrollment process',
    category: 'planning',
    daysBeforeMove: 75,
    showIf: { hasChildren: true },
  },
  {
    task: 'Notify landlord of move-out date',
    category: 'planning',
    daysBeforeMove: 75,
    showIf: { isRenter: true },
  },
  {
    task: 'List home for sale or contact real estate agent',
    category: 'planning',
    daysBeforeMove: 75,
    showIf: { isHomeowner: true },
  },
  {
    task: 'Research pet relocation requirements',
    category: 'planning',
    daysBeforeMove: 75,
    showIf: { hasPets: true },
  },
  {
    task: 'Schedule vet visit for health certificate',
    category: 'planning',
    daysBeforeMove: 70,
    showIf: { hasPets: true },
  },
  {
    task: 'Start decluttering - decide what to keep, sell, donate',
    category: 'planning',
    daysBeforeMove: 70,
  },
  {
    task: 'Research temporary housing options',
    category: 'planning',
    daysBeforeMove: 65,
  },
  {
    task: 'Schedule house hunting trip(s)',
    category: 'planning',
    daysBeforeMove: 65,
  },
  {
    task: 'Gather important documents (birth certificates, passports, etc.)',
    category: 'planning',
    daysBeforeMove: 60,
  },
];

const PREPARATION_PHASE_TASKS: Omit<ChecklistItem, 'id' | 'completed' | 'completedDate'>[] = [
  {
    task: 'Book moving company',
    category: 'preparation',
    daysBeforeMove: 55,
  },
  {
    task: 'Arrange temporary housing if needed',
    category: 'preparation',
    daysBeforeMove: 55,
  },
  {
    task: 'Start packing non-essential items',
    category: 'preparation',
    daysBeforeMove: 50,
  },
  {
    task: 'Request medical records transfer',
    category: 'preparation',
    daysBeforeMove: 50,
  },
  {
    task: 'Request school records for children',
    category: 'preparation',
    daysBeforeMove: 50,
    showIf: { hasChildren: true },
  },
  {
    task: 'Request veterinary records',
    category: 'preparation',
    daysBeforeMove: 50,
    showIf: { hasPets: true },
  },
  {
    task: 'Notify employer of official start date',
    category: 'preparation',
    daysBeforeMove: 45,
  },
  {
    task: 'Cancel or transfer gym memberships',
    category: 'preparation',
    daysBeforeMove: 45,
  },
  {
    task: 'Update subscriptions with new address',
    category: 'preparation',
    daysBeforeMove: 40,
  },
  {
    task: 'Schedule home inspection (if selling)',
    category: 'preparation',
    daysBeforeMove: 40,
    showIf: { isHomeowner: true },
  },
  {
    task: 'Research and select new healthcare providers',
    category: 'preparation',
    daysBeforeMove: 40,
  },
  {
    task: 'Research new veterinarian',
    category: 'preparation',
    daysBeforeMove: 40,
    showIf: { hasPets: true },
  },
  {
    task: 'Sell or donate unwanted items',
    category: 'preparation',
    daysBeforeMove: 35,
  },
  {
    task: 'Book pet travel arrangements',
    category: 'preparation',
    daysBeforeMove: 35,
    showIf: { hasPets: true },
  },
  {
    task: 'Arrange international bank accounts if needed',
    category: 'preparation',
    daysBeforeMove: 35,
    showIf: { isInternational: true },
  },
  {
    task: 'Continue packing room by room',
    category: 'preparation',
    daysBeforeMove: 30,
  },
];

const EXECUTION_PHASE_TASKS: Omit<ChecklistItem, 'id' | 'completed' | 'completedDate'>[] = [
  {
    task: 'Confirm moving company details and timeline',
    category: 'execution',
    daysBeforeMove: 25,
  },
  {
    task: 'Set up utilities at new address',
    category: 'execution',
    daysBeforeMove: 25,
  },
  {
    task: 'File change of address with USPS',
    category: 'execution',
    daysBeforeMove: 20,
  },
  {
    task: 'Update address with banks and financial institutions',
    category: 'execution',
    daysBeforeMove: 20,
  },
  {
    task: 'Transfer or close local bank accounts',
    category: 'execution',
    daysBeforeMove: 20,
    showIf: { isInternational: true },
  },
  {
    task: 'Update address with insurance companies',
    category: 'execution',
    daysBeforeMove: 18,
  },
  {
    task: 'Cancel utilities at current address (schedule for move day)',
    category: 'execution',
    daysBeforeMove: 15,
  },
  {
    task: 'Schedule final walkthrough (if selling home)',
    category: 'execution',
    daysBeforeMove: 15,
    showIf: { isHomeowner: true },
  },
  {
    task: 'Confirm children\'s school enrollment',
    category: 'execution',
    daysBeforeMove: 15,
    showIf: { hasChildren: true },
  },
  {
    task: 'Pack remaining items, leaving essentials',
    category: 'execution',
    daysBeforeMove: 14,
  },
  {
    task: 'Prepare essentials box (toiletries, clothes, documents)',
    category: 'execution',
    daysBeforeMove: 10,
  },
  {
    task: 'Defrost freezer and prepare appliances',
    category: 'execution',
    daysBeforeMove: 7,
  },
  {
    task: 'Return borrowed items, collect loaned items',
    category: 'execution',
    daysBeforeMove: 7,
  },
];

const COUNTDOWN_PHASE_TASKS: Omit<ChecklistItem, 'id' | 'completed' | 'completedDate'>[] = [
  {
    task: 'Final packing of remaining items',
    category: 'countdown',
    daysBeforeMove: 5,
  },
  {
    task: 'Disassemble furniture as needed',
    category: 'countdown',
    daysBeforeMove: 3,
  },
  {
    task: 'Confirm pet travel arrangements',
    category: 'countdown',
    daysBeforeMove: 3,
    showIf: { hasPets: true },
  },
  {
    task: 'Clean current residence',
    category: 'countdown',
    daysBeforeMove: 2,
  },
  {
    task: 'Schedule final walkthrough with landlord',
    category: 'countdown',
    daysBeforeMove: 2,
    showIf: { isRenter: true },
  },
  {
    task: 'Pack overnight bags for family',
    category: 'countdown',
    daysBeforeMove: 1,
  },
  {
    task: 'Charge devices, download offline entertainment',
    category: 'countdown',
    daysBeforeMove: 1,
  },
  {
    task: 'Final walkthrough of current home',
    category: 'countdown',
    daysBeforeMove: 0,
  },
  {
    task: 'Supervise movers loading',
    category: 'countdown',
    daysBeforeMove: 0,
  },
  {
    task: 'Hand over keys to landlord/new owners',
    category: 'countdown',
    daysBeforeMove: 0,
  },
  {
    task: 'Read utility meters and take photos',
    category: 'countdown',
    daysBeforeMove: 0,
  },
];

const SETTLING_PHASE_TASKS: Omit<ChecklistItem, 'id' | 'completed' | 'completedDate'>[] = [
  {
    task: 'Supervise movers unloading',
    category: 'settling',
    daysBeforeMove: -1,
  },
  {
    task: 'Check inventory and note any damage',
    category: 'settling',
    daysBeforeMove: -1,
  },
  {
    task: 'Set up beds and essential furniture',
    category: 'settling',
    daysBeforeMove: -1,
  },
  {
    task: 'Unpack essentials box',
    category: 'settling',
    daysBeforeMove: -1,
  },
  {
    task: 'Test all utilities and report issues',
    category: 'settling',
    daysBeforeMove: -2,
  },
  {
    task: 'Unpack kitchen essentials',
    category: 'settling',
    daysBeforeMove: -3,
  },
  {
    task: 'Set up internet and cable',
    category: 'settling',
    daysBeforeMove: -3,
  },
  {
    task: 'Register children at new school',
    category: 'settling',
    daysBeforeMove: -5,
    showIf: { hasChildren: true },
  },
  {
    task: 'Schedule first vet visit in new location',
    category: 'settling',
    daysBeforeMove: -5,
    showIf: { hasPets: true },
  },
  {
    task: 'Update driver\'s license with new address',
    category: 'settling',
    daysBeforeMove: -7,
  },
  {
    task: 'Register vehicles in new state',
    category: 'settling',
    daysBeforeMove: -7,
  },
  {
    task: 'Update voter registration',
    category: 'settling',
    daysBeforeMove: -14,
  },
  {
    task: 'Find and visit new healthcare providers',
    category: 'settling',
    daysBeforeMove: -14,
  },
  {
    task: 'Explore neighborhood - grocery stores, pharmacies, etc.',
    category: 'settling',
    daysBeforeMove: -7,
  },
  {
    task: 'Meet neighbors and introduce yourself',
    category: 'settling',
    daysBeforeMove: -14,
  },
  {
    task: 'Join local community groups or activities',
    category: 'settling',
    daysBeforeMove: -30,
  },
  {
    task: 'Complete all unpacking',
    category: 'settling',
    daysBeforeMove: -30,
  },
  {
    task: 'File moving expense receipts for tax/reimbursement',
    category: 'settling',
    daysBeforeMove: -30,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a unique ID for a checklist item
 */
function generateId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if a task should be shown based on conditions
 */
function shouldShowTask(
  task: Omit<ChecklistItem, 'id' | 'completed' | 'completedDate'>,
  options: ChecklistOptions
): boolean {
  if (!task.showIf) return true;

  const { showIf } = task;

  if (showIf.isInternational !== undefined && showIf.isInternational !== options.isInternational) {
    return false;
  }
  if (showIf.hasPets !== undefined && showIf.hasPets !== options.hasPets) {
    return false;
  }
  if (showIf.hasChildren !== undefined && showIf.hasChildren !== options.hasChildren) {
    return false;
  }
  if (showIf.isHomeowner !== undefined && showIf.isHomeowner !== options.isCurrentlyHomeowner) {
    return false;
  }
  if (showIf.isRenter !== undefined && showIf.isRenter !== options.isCurrentlyRenter) {
    return false;
  }

  return true;
}

/**
 * Calculate current phase based on days until move
 */
function calculateCurrentPhase(daysUntilMove: number): MovingChecklist['currentPhase'] {
  if (daysUntilMove > 60) return 'planning';
  if (daysUntilMove > 30) return 'preparation';
  if (daysUntilMove > 7) return 'execution';
  if (daysUntilMove >= 0) return 'countdown';
  return 'settling';
}

/**
 * Calculate days until move from move date
 */
function calculateDaysUntilMove(moveDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const move = new Date(moveDate);
  move.setHours(0, 0, 0, 0);
  const diffTime = move.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Generate a personalized moving checklist
 */
export function generateChecklist(options: ChecklistOptions): MovingChecklist {
  const allTaskTemplates = [
    ...PLANNING_PHASE_TASKS,
    ...PREPARATION_PHASE_TASKS,
    ...EXECUTION_PHASE_TASKS,
    ...COUNTDOWN_PHASE_TASKS,
    ...SETTLING_PHASE_TASKS,
  ];

  // Filter tasks based on user's circumstances
  const filteredTasks = allTaskTemplates.filter(task => shouldShowTask(task, options));

  // Convert to full ChecklistItem with IDs
  const items: ChecklistItem[] = filteredTasks.map(task => ({
    ...task,
    id: generateId(),
    completed: false,
  }));

  // Sort by days before move (descending - furthest out first)
  items.sort((a, b) => b.daysBeforeMove - a.daysBeforeMove);

  const daysUntilMove = calculateDaysUntilMove(options.moveDate);
  const currentPhase = calculateCurrentPhase(daysUntilMove);

  return {
    moveDate: options.moveDate,
    fromCity: options.fromCity,
    toCity: options.toCity,
    isInternational: options.isInternational,
    hasPets: options.hasPets,
    hasChildren: options.hasChildren,
    isCurrentlyHomeowner: options.isCurrentlyHomeowner,
    items,
    totalItems: items.length,
    completedItems: 0,
    percentComplete: 0,
    currentPhase,
    daysUntilMove,
  };
}

/**
 * Update a checklist item's completion status
 */
export function toggleTaskCompletion(
  checklist: MovingChecklist,
  taskId: string
): MovingChecklist {
  const updatedItems = checklist.items.map(item => {
    if (item.id === taskId) {
      return {
        ...item,
        completed: !item.completed,
        completedDate: !item.completed ? new Date() : undefined,
      };
    }
    return item;
  });

  const completedItems = updatedItems.filter(item => item.completed).length;
  const percentComplete = Math.round((completedItems / updatedItems.length) * 100);

  return {
    ...checklist,
    items: updatedItems,
    completedItems,
    percentComplete,
  };
}

/**
 * Add a custom task to the checklist
 */
export function addCustomTask(
  checklist: MovingChecklist,
  task: string,
  category: ChecklistItem['category'],
  daysBeforeMove: number
): MovingChecklist {
  const newTask: ChecklistItem = {
    id: generateId(),
    task,
    category,
    daysBeforeMove,
    completed: false,
  };

  const updatedItems = [...checklist.items, newTask];
  updatedItems.sort((a, b) => b.daysBeforeMove - a.daysBeforeMove);

  return {
    ...checklist,
    items: updatedItems,
    totalItems: updatedItems.length,
  };
}

/**
 * Remove a task from the checklist
 */
export function removeTask(
  checklist: MovingChecklist,
  taskId: string
): MovingChecklist {
  const updatedItems = checklist.items.filter(item => item.id !== taskId);
  const completedItems = updatedItems.filter(item => item.completed).length;
  const percentComplete = updatedItems.length > 0
    ? Math.round((completedItems / updatedItems.length) * 100)
    : 0;

  return {
    ...checklist,
    items: updatedItems,
    totalItems: updatedItems.length,
    completedItems,
    percentComplete,
  };
}

/**
 * Add notes to a task
 */
export function addTaskNotes(
  checklist: MovingChecklist,
  taskId: string,
  notes: string
): MovingChecklist {
  const updatedItems = checklist.items.map(item => {
    if (item.id === taskId) {
      return { ...item, notes };
    }
    return item;
  });

  return {
    ...checklist,
    items: updatedItems,
  };
}

/**
 * Update the checklist's current phase and days until move
 */
export function refreshChecklistStatus(checklist: MovingChecklist): MovingChecklist {
  const daysUntilMove = calculateDaysUntilMove(checklist.moveDate);
  const currentPhase = calculateCurrentPhase(daysUntilMove);

  return {
    ...checklist,
    daysUntilMove,
    currentPhase,
  };
}

/**
 * Get tasks for a specific phase
 */
export function getTasksByPhase(
  checklist: MovingChecklist,
  phase: ChecklistItem['category']
): ChecklistItem[] {
  return checklist.items.filter(item => item.category === phase);
}

/**
 * Get overdue tasks (not completed and past their due date)
 */
export function getOverdueTasks(checklist: MovingChecklist): ChecklistItem[] {
  const daysUntilMove = checklist.daysUntilMove;

  return checklist.items.filter(item => {
    if (item.completed) return false;
    // Task is overdue if current days until move is less than task's days before move
    return daysUntilMove < item.daysBeforeMove;
  });
}

/**
 * Get upcoming tasks (due within the next N days)
 */
export function getUpcomingTasks(
  checklist: MovingChecklist,
  withinDays: number = 7
): ChecklistItem[] {
  const daysUntilMove = checklist.daysUntilMove;

  return checklist.items.filter(item => {
    if (item.completed) return false;
    const daysUntilTaskDue = item.daysBeforeMove - daysUntilMove;
    return daysUntilTaskDue >= 0 && daysUntilTaskDue <= withinDays;
  });
}

/**
 * Get progress summary by phase
 */
export function getProgressByPhase(checklist: MovingChecklist): {
  phase: ChecklistItem['category'];
  label: string;
  total: number;
  completed: number;
  percent: number;
}[] {
  const phases: { phase: ChecklistItem['category']; label: string }[] = [
    { phase: 'planning', label: 'Planning (90-60 days)' },
    { phase: 'preparation', label: 'Preparation (60-30 days)' },
    { phase: 'execution', label: 'Execution (30-7 days)' },
    { phase: 'countdown', label: 'Final Countdown (7-0 days)' },
    { phase: 'settling', label: 'Settling In (After move)' },
  ];

  return phases.map(({ phase, label }) => {
    const phaseTasks = checklist.items.filter(item => item.category === phase);
    const completed = phaseTasks.filter(item => item.completed).length;
    const total = phaseTasks.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { phase, label, total, completed, percent };
  });
}

/**
 * Calculate estimated time to complete remaining tasks (in hours)
 */
export function estimateRemainingTime(checklist: MovingChecklist): number {
  const incompleteTasks = checklist.items.filter(item => !item.completed);

  // Rough estimates: planning tasks take longer, countdown tasks are quick
  const timePerTask: Record<ChecklistItem['category'], number> = {
    planning: 2, // hours
    preparation: 1.5,
    execution: 1,
    countdown: 0.5,
    settling: 1,
  };

  return incompleteTasks.reduce((total, task) => {
    return total + (timePerTask[task.category] || 1);
  }, 0);
}
