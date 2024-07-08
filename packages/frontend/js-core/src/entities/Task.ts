import { IAction } from './Action';

export interface TaskOptions {
  domId?: string;
}
/*
 * Record user interaction on specific task
 * Task is a group of related actions defined by specific domain
 * This is useful if you want to understand if user retry specific actions
 * when LLM is hallucinated, etc... and whether your project helps the user
 * solve their objectives.
 */
export interface ITask {
  id: string;
  name: string;
  domId?: string;
  domDelay?: number;
  startedAt: Date;
  endedAt?: Date;
  actions: IAction[];
}
