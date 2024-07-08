import { VIEW_TYPES } from '../constants';

export interface TraceHeaders {
  ['x-agiflow-trace-id']: string;
  ['x-agiflow-auto-trace']?: string;
}

export type IViewType = (typeof VIEW_TYPES)[keyof typeof VIEW_TYPES];

export type AutoTraceConfig = {
  /**
   * Limit the trace requests by host names
   * If leave empty, we'll create trace request for everyhost
   */
  hosts?: string[];
  /**
   * Limit trace requests by hrefs
   */
  matches: Array<{
    name?: string;
    pattern: RegExp | string;
    domId?: string;
  }>;
};
