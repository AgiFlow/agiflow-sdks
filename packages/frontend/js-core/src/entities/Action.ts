/*
 * Record user action per request
 * An action is associate with a backend trace when it is connected
 */
export interface IAction {
  id: string;
  startedAt?: Date;
  endedAt?: Date;
  domStart?: Node | null;
  domEnd?: Node | null;
  // Flag to check if feedback is provided for this action
  marked?: boolean;
  annotation?: string;
  domId?: string;
  domDelay?: number;
}
