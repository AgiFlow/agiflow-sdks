export const TASK_STATUSES = {
  STARTED: 1,
  COMPLETED: 2,
  CHURNED: 3,
  PROBLEMATIC: 4,
  REVIEW: 5,
  FIXED: 6,
} as const;

export const TASK_COLOURS = {
  [TASK_STATUSES.STARTED]: 'blue',
  [TASK_STATUSES.COMPLETED]: 'green',
  [TASK_STATUSES.CHURNED]: 'black',
  [TASK_STATUSES.PROBLEMATIC]: 'red',
  [TASK_STATUSES.REVIEW]: 'purple',
  [TASK_STATUSES.FIXED]: 'green',
} as const;

export const TASK_STATUS_NAMES = {
  1: 'Started',
  2: 'Completed',
  3: 'Churn',
  4: 'Problematic',
  5: 'Review',
  6: 'Fixed',
} as const;

export const TASK_VARIANTS = {
  1: 'outline',
  2: 'default',
  3: 'inverted',
  4: 'destructive',
  5: 'secondary',
  6: 'default',
} as const;
