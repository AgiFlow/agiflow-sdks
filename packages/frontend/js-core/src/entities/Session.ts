import { IAction } from './Action';
import { ITask } from './Task';

/*
 * Capture the whole user journey within a session
 * This includes multiple tasks where user can provides feedback on
 */
export interface ISession {
  id: string;
  startedAt: Date;
  endedAt?: Date;
  tasks: Record<string, ITask>;
  // Tasks which ended but hasn't been provided with feedback
  taskRegistry: Array<ITask>;
  // Tasks with feedbacks
  taskHistory: Array<ITask>;
  getTaskActionsWithFeedback: (taskNames?: string[]) => Array<{ taskName: string; taskId: string; action: IAction }>;
}
