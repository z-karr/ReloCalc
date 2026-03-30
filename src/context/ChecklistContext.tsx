/**
 * Checklist Context
 * Manages moving checklist state with persistence
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { City } from '../types';
import { MovingChecklist, ChecklistItem } from '../types/premium';
import {
  generateChecklist,
  toggleTaskCompletion,
  addCustomTask,
  removeTask,
  addTaskNotes,
  refreshChecklistStatus,
  ChecklistOptions,
} from '../utils/premium/checklistGenerator';

// ============================================================================
// TYPES
// ============================================================================

interface ChecklistContextValue {
  // State
  checklist: MovingChecklist | null;
  isLoading: boolean;
  hasChecklist: boolean;

  // Actions
  createChecklist: (options: ChecklistOptions) => Promise<void>;
  updateChecklist: (checklist: MovingChecklist) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  addTask: (task: string, category: ChecklistItem['category'], daysBeforeMove: number) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  updateTaskNotes: (taskId: string, notes: string) => Promise<void>;
  refreshStatus: () => Promise<void>;
  clearChecklist: () => Promise<void>;
}

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  CHECKLIST: '@relocalc:checklist',
  CHECKLIST_OPTIONS: '@relocalc:checklist_options',
};

// ============================================================================
// CONTEXT
// ============================================================================

const ChecklistContext = createContext<ChecklistContextValue | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

interface ChecklistProviderProps {
  children: ReactNode;
}

export const ChecklistProvider: React.FC<ChecklistProviderProps> = ({ children }) => {
  const [checklist, setChecklist] = useState<MovingChecklist | null>(null);
  const [checklistOptions, setChecklistOptions] = useState<ChecklistOptions | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load checklist from storage on mount
  useEffect(() => {
    loadChecklist();
  }, []);

  // Auto-refresh status periodically (every hour)
  useEffect(() => {
    if (!checklist) return;

    const interval = setInterval(() => {
      refreshStatus();
    }, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  }, [checklist]);

  /**
   * Load checklist from AsyncStorage
   */
  const loadChecklist = async (): Promise<void> => {
    try {
      setIsLoading(true);

      const [storedChecklist, storedOptions] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.CHECKLIST),
        AsyncStorage.getItem(STORAGE_KEYS.CHECKLIST_OPTIONS),
      ]);

      if (storedChecklist && storedOptions) {
        const parsedChecklist = JSON.parse(storedChecklist) as MovingChecklist;
        const parsedOptions = JSON.parse(storedOptions) as ChecklistOptions;

        // Convert date strings back to Date objects
        parsedChecklist.moveDate = new Date(parsedChecklist.moveDate);
        parsedChecklist.items = parsedChecklist.items.map(item => ({
          ...item,
          completedDate: item.completedDate ? new Date(item.completedDate) : undefined,
        }));
        parsedOptions.moveDate = new Date(parsedOptions.moveDate);

        // Refresh the status (days until move, current phase)
        const refreshed = refreshChecklistStatus(parsedChecklist);

        setChecklist(refreshed);
        setChecklistOptions(parsedOptions);
      }
    } catch (error) {
      console.error('Error loading checklist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save checklist to AsyncStorage
   */
  const saveChecklist = async (newChecklist: MovingChecklist): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(newChecklist));
    } catch (error) {
      console.error('Error saving checklist:', error);
      throw error;
    }
  };

  /**
   * Save checklist options to AsyncStorage
   */
  const saveChecklistOptions = async (options: ChecklistOptions): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CHECKLIST_OPTIONS, JSON.stringify(options));
    } catch (error) {
      console.error('Error saving checklist options:', error);
      throw error;
    }
  };

  /**
   * Create a new checklist
   */
  const createChecklist = useCallback(async (options: ChecklistOptions): Promise<void> => {
    const newChecklist = generateChecklist(options);
    setChecklist(newChecklist);
    setChecklistOptions(options);
    await Promise.all([
      saveChecklist(newChecklist),
      saveChecklistOptions(options),
    ]);
  }, []);

  /**
   * Update the entire checklist
   */
  const updateChecklist = useCallback(async (newChecklist: MovingChecklist): Promise<void> => {
    setChecklist(newChecklist);
    await saveChecklist(newChecklist);
  }, []);

  /**
   * Toggle a task's completion status
   */
  const toggleTask = useCallback(async (taskId: string): Promise<void> => {
    if (!checklist) return;

    const updated = toggleTaskCompletion(checklist, taskId);
    setChecklist(updated);
    await saveChecklist(updated);
  }, [checklist]);

  /**
   * Add a custom task
   */
  const addTask = useCallback(async (
    task: string,
    category: ChecklistItem['category'],
    daysBeforeMove: number
  ): Promise<void> => {
    if (!checklist) return;

    const updated = addCustomTask(checklist, task, category, daysBeforeMove);
    setChecklist(updated);
    await saveChecklist(updated);
  }, [checklist]);

  /**
   * Delete a task
   */
  const deleteTask = useCallback(async (taskId: string): Promise<void> => {
    if (!checklist) return;

    const updated = removeTask(checklist, taskId);
    setChecklist(updated);
    await saveChecklist(updated);
  }, [checklist]);

  /**
   * Update task notes
   */
  const updateTaskNotes = useCallback(async (taskId: string, notes: string): Promise<void> => {
    if (!checklist) return;

    const updated = addTaskNotes(checklist, taskId, notes);
    setChecklist(updated);
    await saveChecklist(updated);
  }, [checklist]);

  /**
   * Refresh checklist status (days until move, current phase)
   */
  const refreshStatus = useCallback(async (): Promise<void> => {
    if (!checklist) return;

    const updated = refreshChecklistStatus(checklist);
    setChecklist(updated);
    await saveChecklist(updated);
  }, [checklist]);

  /**
   * Clear the checklist completely
   */
  const clearChecklist = useCallback(async (): Promise<void> => {
    setChecklist(null);
    setChecklistOptions(null);
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.CHECKLIST),
      AsyncStorage.removeItem(STORAGE_KEYS.CHECKLIST_OPTIONS),
    ]);
  }, []);

  const value: ChecklistContextValue = {
    checklist,
    isLoading,
    hasChecklist: checklist !== null,
    createChecklist,
    updateChecklist,
    toggleTask,
    addTask,
    deleteTask,
    updateTaskNotes,
    refreshStatus,
    clearChecklist,
  };

  return (
    <ChecklistContext.Provider value={value}>
      {children}
    </ChecklistContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useChecklist = (): ChecklistContextValue => {
  const context = useContext(ChecklistContext);
  if (context === undefined) {
    throw new Error('useChecklist must be used within a ChecklistProvider');
  }
  return context;
};

// ============================================================================
// STANDALONE CHECKLIST COMPONENT HOOK
// ============================================================================

/**
 * Hook for using checklist functionality without the context provider
 * Useful for standalone components that manage their own state
 */
export const useStandaloneChecklist = () => {
  const [checklist, setChecklist] = useState<MovingChecklist | null>(null);

  const createChecklist = useCallback((options: ChecklistOptions): MovingChecklist => {
    const newChecklist = generateChecklist(options);
    setChecklist(newChecklist);
    return newChecklist;
  }, []);

  const handleChecklistUpdate = useCallback((updated: MovingChecklist) => {
    setChecklist(updated);
  }, []);

  return {
    checklist,
    createChecklist,
    onChecklistUpdate: handleChecklistUpdate,
  };
};

export default ChecklistContext;
