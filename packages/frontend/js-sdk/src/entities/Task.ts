import { genId } from '../modules/id';
import { TraceHeaders } from '../types';
import { Action } from './Action';

export interface TaskOptions {
  domId?: string;
  domDelay?: number;
}
/*
 * Record user interaction on specific task
 * Task is a group of related actions defined by specific domain
 * This is useful if you want to understand if user retry specific actions
 * when LLM is hallucinated, etc... and whether your project helps the user
 * solve their objectives.
 */
export class Task {
  id: string;
  name: string;
  domId?: string;
  domDelay?: number;
  startedAt: Date;
  endedAt?: Date;
  actions: Action[];

  constructor(name: string, opts?: TaskOptions) {
    this.name = name;
    this.domId = opts?.domId;
    // Rendering delay when the api responded
    // use to captured domEnd, this is passdown to task
    this.domDelay = opts?.domDelay;
    this.id = genId();
    this.startedAt = new Date();
    this.actions = [];
  }

  /**
   * Get current state of the object to stored as json
   */
  hydrate() {
    return {
      id: this.id,
      name: this.name,
      domId: this.domId,
      domDelay: this.domDelay,
      startedAt: this.startedAt.toISOString(),
      endedAt: this.endedAt?.toISOString(),
      actions: this.actions.map(action => action.hydrate()),
    };
  }

  /**
   * Restore Task and its Actions from json object
   */
  static dehydrate(data: Task) {
    const task = new Task('');
    task.id = data.id;
    task.name = data.name;
    task.domId = data.domId;
    task.domDelay = data.domDelay;
    task.startedAt = new Date(data.startedAt);
    task.endedAt = data.endedAt ? new Date(data.endedAt) : undefined;
    task.actions = task.actions.map(act => Action.dehydrate(act));
    return task;
  }

  close() {
    this.endedAt = new Date();
  }

  /**
   * For manual tracing
   * Create an Action for tracing and capture start/end state of the Action
   */
  async captureAsync<R>(fn: (id: string, headers: TraceHeaders) => Promise<R>) {
    const action = new Action(this.domId, this.domDelay);
    this.actions.push(action);
    return await action.traceAsync(fn);
  }

  /**
   * For manual tracing
   * Create an Action and return it's state and traceHeaders to developer
   */
  capture() {
    const action = new Action(this.domId, this.domDelay);
    this.actions.push(action);
    return action.trace();
  }

  getPayload() {
    return {
      taskId: this.id,
      taskName: this.name,
      taskStartedAt: this.startedAt,
    };
  }

  /**
   * Return the list of actions which feedback hasn't been provided
   */
  getMarkedActions() {
    const list = this.actions.filter(action => action.getFeedback());
    if (!list) return undefined;
    return list.map(action => ({ taskId: this.id, taskName: this.name, action }));
  }
}
