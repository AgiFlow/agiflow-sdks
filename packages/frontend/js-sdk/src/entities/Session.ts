import { Action } from './Action';
import { Task, TaskOptions } from './Task';

/*
 * Capture the whole user journey within a session
 * This includes multiple tasks where user can provides feedback on
 */
export class Session {
  id: string;
  startedAt: Date;
  endedAt?: Date;
  tasks: Record<string, Task>;
  // Tasks which ended but hasn't been provided with feedback
  taskRegistry: Array<Task> = [];
  // Tasks with feedbacks
  taskHistory: Array<Task> = [];

  constructor() {
    this.id = '';
    this.startedAt = new Date();
    this.tasks = {};
    // Listen to websocket to register feedback
  }

  /**
   * Get current state of the object to stored as json
   */
  hydrate() {
    return {
      id: this.id,
      startedAt: this.startedAt.toISOString(),
      endedAt: this.endedAt?.toISOString(),
      tasks: Object.entries(this.tasks)
        .map(([id, task]) => ({
          [id]: task.hydrate(),
        }))
        .reduce((prev, cur) => ({ ...prev, ...cur }), {}),
      taskRegistry: this.taskRegistry.map(task => task.hydrate()),
      taskHistory: this.taskHistory.map(task => task.hydrate()),
    };
  }

  /**
   * Restore Session from json
   */
  static dehydrate(data: Session) {
    const session = new Session();
    session.id = data.id;
    session.startedAt = new Date(data.startedAt);
    session.endedAt = data.endedAt ? new Date(data.endedAt) : undefined;
    session.tasks = Object.entries(data.tasks)
      .map(([id, task]) => ({
        [id]: Task.dehydrate(task),
      }))
      .reduce((prev, cur) => ({ ...prev, ...cur }), {});
    session.taskRegistry = data.taskRegistry.map(task => Task.dehydrate(task));
    session.taskHistory = data.taskHistory.map(task => Task.dehydrate(task));
    return session;
  }

  close() {
    this.endedAt = new Date();
  }

  setId(id: string) {
    this.id = id;
  }

  /**
   * Get current task by name
   * User can perform multiple task at once, but only one task with the same name
   */
  getTask(name: string, opts?: TaskOptions) {
    if (this.tasks[name]) return this.tasks[name];
    const task = new Task(name, opts);
    this.tasks[name] = task;
    return task;
  }

  /**
   * End the current task by name
   */
  endTask(name: string) {
    const existingTask = this.tasks[name];
    if (existingTask) {
      this.taskRegistry.push(existingTask);
      delete this.tasks[name];
      return existingTask.id;
    }
    return;
  }

  getPayload() {
    return {
      sessionId: this.id,
    };
  }

  /**
   * Get the list of tasks and actions for feedback
   */
  getTaskActionsWithFeedback(taskNames?: string[]) {
    let list = [...Object.values(this.tasks), ...this.taskRegistry]
      .map(task => {
        return task.getMarkedActions() as Array<{ taskId: string; taskName: string; action: Action }>;
      })
      .filter(Boolean)
      .reduce((prev, cur) => [...prev, ...cur], [])
      .sort((a, b) => ((a.action.startedAt || new Date()) < (b.action.startedAt || new Date()) ? -1 : 1));
    if (taskNames) {
      list = list.filter(item => taskNames.includes(item.taskName));
    }
    return list;
  }

  reset() {
    this.taskHistory = [...Object.values(this.tasks), ...this.taskRegistry];
    this.tasks = {};
    this.taskRegistry = [];
  }
}
