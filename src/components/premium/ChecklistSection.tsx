import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../theme';
import { MovingChecklist, ChecklistItem } from '../../types/premium';
import {
  toggleTaskCompletion,
  getProgressByPhase,
  getOverdueTasks,
  getUpcomingTasks,
  addCustomTask,
} from '../../utils/premium/checklistGenerator';

// ============================================================================
// TYPES
// ============================================================================

interface ChecklistSectionProps {
  checklist: MovingChecklist;
  onChecklistUpdate: (checklist: MovingChecklist) => void;
}

interface TaskItemProps {
  task: ChecklistItem;
  daysUntilMove: number;
  onToggle: () => void;
  isOverdue: boolean;
}

interface PhaseProgressProps {
  phase: string;
  label: string;
  total: number;
  completed: number;
  percent: number;
  isCurrentPhase: boolean;
}

// ============================================================================
// PHASE CONFIG
// ============================================================================

const PHASE_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  planning: { icon: 'bulb-outline', color: COLORS.info },
  preparation: { icon: 'construct-outline', color: COLORS.warning },
  execution: { icon: 'rocket-outline', color: COLORS.primary },
  countdown: { icon: 'timer-outline', color: COLORS.error },
  settling: { icon: 'home-outline', color: COLORS.success },
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  daysUntilMove,
  onToggle,
  isOverdue,
}) => {
  const daysUntilDue = task.daysBeforeMove - daysUntilMove;
  const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 3 && !task.completed;

  const getDueText = (): string => {
    if (task.daysBeforeMove < 0) {
      return `Day ${Math.abs(task.daysBeforeMove)} after move`;
    }
    if (task.daysBeforeMove === 0) {
      return 'Moving day';
    }
    return `${task.daysBeforeMove} days before`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.taskItem,
        task.completed && styles.taskItemCompleted,
        isOverdue && styles.taskItemOverdue,
        isDueSoon && styles.taskItemDueSoon,
      ]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={[
        styles.checkbox,
        task.completed && styles.checkboxChecked,
      ]}>
        {task.completed && (
          <Ionicons name="checkmark" size={14} color={COLORS.white} />
        )}
      </View>

      <View style={styles.taskContent}>
        <Text style={[
          styles.taskText,
          task.completed && styles.taskTextCompleted,
        ]}>
          {task.task}
        </Text>
        <View style={styles.taskMeta}>
          <Text style={[
            styles.taskDue,
            isOverdue && styles.taskDueOverdue,
            isDueSoon && styles.taskDueSoon,
          ]}>
            {getDueText()}
          </Text>
          {isOverdue && !task.completed && (
            <View style={styles.overdueTag}>
              <Text style={styles.overdueTagText}>Overdue</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const PhaseProgress: React.FC<PhaseProgressProps> = ({
  phase,
  label,
  total,
  completed,
  percent,
  isCurrentPhase,
}) => {
  const config = PHASE_CONFIG[phase] || { icon: 'ellipse-outline', color: COLORS.mediumGray };

  return (
    <View style={[
      styles.phaseProgress,
      isCurrentPhase && styles.phaseProgressCurrent,
    ]}>
      <View style={[styles.phaseIcon, { backgroundColor: config.color + '20' }]}>
        <Ionicons name={config.icon} size={18} color={config.color} />
      </View>
      <View style={styles.phaseInfo}>
        <View style={styles.phaseHeader}>
          <Text style={styles.phaseLabel}>{label}</Text>
          <Text style={styles.phaseCount}>{completed}/{total}</Text>
        </View>
        <View style={styles.phaseBar}>
          <View style={[styles.phaseFill, { width: `${percent}%`, backgroundColor: config.color }]} />
        </View>
      </View>
      {isCurrentPhase && (
        <View style={[styles.currentBadge, { backgroundColor: config.color }]}>
          <Text style={styles.currentBadgeText}>Current</Text>
        </View>
      )}
    </View>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ChecklistSection: React.FC<ChecklistSectionProps> = ({
  checklist,
  onChecklistUpdate,
}) => {
  const [activePhase, setActivePhase] = useState<string | 'all' | 'overdue' | 'upcoming'>(
    checklist.currentPhase
  );
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set([checklist.currentPhase]));

  const progressByPhase = getProgressByPhase(checklist);
  const overdueTasks = getOverdueTasks(checklist);
  const upcomingTasks = getUpcomingTasks(checklist, 7);

  const handleToggleTask = useCallback((taskId: string) => {
    const updated = toggleTaskCompletion(checklist, taskId);
    onChecklistUpdate(updated);
  }, [checklist, onChecklistUpdate]);

  const handleAddTask = useCallback(() => {
    if (!newTaskText.trim()) return;

    const updated = addCustomTask(
      checklist,
      newTaskText.trim(),
      checklist.currentPhase as ChecklistItem['category'],
      checklist.daysUntilMove
    );
    onChecklistUpdate(updated);
    setNewTaskText('');
    setShowAddTask(false);
  }, [checklist, newTaskText, onChecklistUpdate]);

  const togglePhaseExpanded = (phase: string) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phase)) {
      newExpanded.delete(phase);
    } else {
      newExpanded.add(phase);
    }
    setExpandedPhases(newExpanded);
  };

  const getFilteredTasks = (): ChecklistItem[] => {
    if (activePhase === 'all') {
      return checklist.items;
    }
    if (activePhase === 'overdue') {
      return overdueTasks;
    }
    if (activePhase === 'upcoming') {
      return upcomingTasks;
    }
    return checklist.items.filter(item => item.category === activePhase);
  };

  const filteredTasks = getFilteredTasks();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Ionicons name="checkbox-outline" size={22} color={COLORS.primary} />
            <Text style={styles.headerTitle}>Moving Checklist</Text>
          </View>
          <View style={styles.daysCounter}>
            <Text style={styles.daysNumber}>
              {checklist.daysUntilMove >= 0 ? checklist.daysUntilMove : Math.abs(checklist.daysUntilMove)}
            </Text>
            <Text style={styles.daysLabel}>
              {checklist.daysUntilMove >= 0 ? 'days to go' : 'days since'}
            </Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          {checklist.fromCity.name} → {checklist.toCity.name}
        </Text>
      </View>

      {/* Overall Progress */}
      <View style={styles.overallProgress}>
        <View style={styles.progressCircle}>
          <Text style={styles.progressPercent}>{checklist.percentComplete}%</Text>
          <Text style={styles.progressLabel}>Complete</Text>
        </View>
        <View style={styles.progressStats}>
          <View style={styles.progressStat}>
            <Text style={styles.statValue}>{checklist.completedItems}</Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
          <View style={styles.progressStatDivider} />
          <View style={styles.progressStat}>
            <Text style={styles.statValue}>{checklist.totalItems - checklist.completedItems}</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
          <View style={styles.progressStatDivider} />
          <View style={styles.progressStat}>
            <Text style={[styles.statValue, overdueTasks.length > 0 && { color: COLORS.error }]}>
              {overdueTasks.length}
            </Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </View>
        </View>
      </View>

      {/* Phase Progress */}
      <View style={styles.phaseSection}>
        <Text style={styles.sectionTitle}>Progress by Phase</Text>
        {progressByPhase.map((phase) => (
          <PhaseProgress
            key={phase.phase}
            phase={phase.phase}
            label={phase.label}
            total={phase.total}
            completed={phase.completed}
            percent={phase.percent}
            isCurrentPhase={phase.phase === checklist.currentPhase}
          />
        ))}
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterTabs}
        contentContainerStyle={styles.filterTabsContent}
      >
        <TouchableOpacity
          style={[styles.filterTab, activePhase === 'all' && styles.filterTabActive]}
          onPress={() => setActivePhase('all')}
        >
          <Text style={[styles.filterTabText, activePhase === 'all' && styles.filterTabTextActive]}>
            All ({checklist.totalItems})
          </Text>
        </TouchableOpacity>

        {overdueTasks.length > 0 && (
          <TouchableOpacity
            style={[styles.filterTab, styles.filterTabOverdue, activePhase === 'overdue' && styles.filterTabActive]}
            onPress={() => setActivePhase('overdue')}
          >
            <Text style={[styles.filterTabText, { color: COLORS.error }, activePhase === 'overdue' && styles.filterTabTextActive]}>
              Overdue ({overdueTasks.length})
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.filterTab, activePhase === 'upcoming' && styles.filterTabActive]}
          onPress={() => setActivePhase('upcoming')}
        >
          <Text style={[styles.filterTabText, activePhase === 'upcoming' && styles.filterTabTextActive]}>
            This Week ({upcomingTasks.length})
          </Text>
        </TouchableOpacity>

        {Object.keys(PHASE_CONFIG).map((phase) => (
          <TouchableOpacity
            key={phase}
            style={[styles.filterTab, activePhase === phase && styles.filterTabActive]}
            onPress={() => setActivePhase(phase)}
          >
            <Text style={[styles.filterTabText, activePhase === phase && styles.filterTabTextActive]}>
              {phase.charAt(0).toUpperCase() + phase.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Task List */}
      <View style={styles.taskList}>
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={48} color={COLORS.success} />
            <Text style={styles.emptyStateText}>
              {activePhase === 'overdue'
                ? 'No overdue tasks!'
                : activePhase === 'upcoming'
                ? 'No tasks due this week!'
                : 'All tasks in this phase are complete!'}
            </Text>
          </View>
        ) : (
          filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              daysUntilMove={checklist.daysUntilMove}
              onToggle={() => handleToggleTask(task.id)}
              isOverdue={overdueTasks.some(t => t.id === task.id)}
            />
          ))
        )}
      </View>

      {/* Add Task */}
      {showAddTask ? (
        <View style={styles.addTaskForm}>
          <TextInput
            style={styles.addTaskInput}
            value={newTaskText}
            onChangeText={setNewTaskText}
            placeholder="Enter new task..."
            placeholderTextColor={COLORS.mediumGray}
            autoFocus
          />
          <View style={styles.addTaskActions}>
            <TouchableOpacity
              style={styles.addTaskCancel}
              onPress={() => {
                setShowAddTask(false);
                setNewTaskText('');
              }}
            >
              <Text style={styles.addTaskCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addTaskSubmit, !newTaskText.trim() && styles.addTaskSubmitDisabled]}
              onPress={handleAddTask}
              disabled={!newTaskText.trim()}
            >
              <Ionicons name="add" size={18} color={COLORS.white} />
              <Text style={styles.addTaskSubmitText}>Add Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addTaskButton}
          onPress={() => setShowAddTask(true)}
        >
          <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.addTaskButtonText}>Add Custom Task</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  header: {
    padding: SPACING.md,
    backgroundColor: COLORS.charcoal,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.lightGray,
    marginTop: SPACING.xs,
  },
  daysCounter: {
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  daysNumber: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.white,
  },
  daysLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.lightGray,
  },
  overallProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.offWhite,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.success,
    ...SHADOWS.sm,
  },
  progressPercent: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.charcoal,
  },
  progressLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
  },
  progressStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: SPACING.md,
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatDivider: {
    width: 1,
    height: '60%',
    backgroundColor: COLORS.lightGray,
  },
  statValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.charcoal,
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
  },
  phaseSection: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: SPACING.md,
  },
  phaseProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.offWhite,
    borderRadius: RADIUS.sm,
  },
  phaseProgressCurrent: {
    backgroundColor: COLORS.primaryLight + '20',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  phaseIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  phaseLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.charcoal,
  },
  phaseCount: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  phaseBar: {
    height: 4,
    backgroundColor: COLORS.lightGray,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  phaseFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  currentBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginLeft: SPACING.sm,
  },
  currentBadgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.white,
  },
  filterTabs: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  filterTabsContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  filterTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.offWhite,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterTabOverdue: {
    backgroundColor: COLORS.errorLight,
  },
  filterTabText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: COLORS.white,
  },
  taskList: {
    padding: SPACING.md,
    minHeight: 200,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    backgroundColor: COLORS.offWhite,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  taskItemCompleted: {
    backgroundColor: COLORS.successLight,
    opacity: 0.8,
  },
  taskItemOverdue: {
    backgroundColor: COLORS.errorLight,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
  },
  taskItemDueSoon: {
    backgroundColor: COLORS.warningLight,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.mediumGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  checkboxChecked: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  taskContent: {
    flex: 1,
  },
  taskText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.charcoal,
    marginBottom: 4,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.mediumGray,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  taskDue: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.mediumGray,
  },
  taskDueOverdue: {
    color: COLORS.error,
    fontWeight: '600',
  },
  taskDueSoon: {
    color: COLORS.warning,
    fontWeight: '600',
  },
  overdueTag: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  overdueTagText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyStateText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    gap: SPACING.sm,
  },
  addTaskButtonText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  addTaskForm: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    backgroundColor: COLORS.offWhite,
  },
  addTaskInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    fontSize: FONTS.sizes.base,
    color: COLORS.charcoal,
    marginBottom: SPACING.md,
  },
  addTaskActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  addTaskCancel: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  addTaskCancelText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.mediumGray,
  },
  addTaskSubmit: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    gap: SPACING.xs,
  },
  addTaskSubmitDisabled: {
    opacity: 0.5,
  },
  addTaskSubmitText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default ChecklistSection;
