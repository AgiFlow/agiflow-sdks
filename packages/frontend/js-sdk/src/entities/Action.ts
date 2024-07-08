import { genId } from '../modules/id';
import { encodeTracePayload } from '../modules/trace';
import { TraceHeaders } from '../types';

/*
 * Record user action per request
 * An action is associate with a backend trace when it is connected
 */
export class Action {
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

  constructor(domId?: string, domDelay?: number) {
    this.id = genId();
    this.domId = domId;
    // Rendering delay when the api responded
    // use to captured domEnd
    this.domDelay = domDelay;
  }

  /**
   * Get current state of the object to stored as json
   */
  hydrate() {
    return {
      id: this.id,
      startedAt: this.startedAt?.toISOString(),
      endedAt: this.endedAt?.toISOString(),
      marked: this.marked,
      annotation: this.annotation,
      domId: this.domId,
      domDelay: this.domDelay,
    };
  }

  /**
   * Restore Action from json object
   */
  static dehydrate(data: Action) {
    const action = new Action();
    action.id = data.id;
    action.startedAt = data.startedAt ? new Date(data.startedAt) : undefined;
    action.endedAt = data.endedAt ? new Date(data.endedAt) : undefined;
    action.marked = data.marked;
    action.annotation = data.annotation;
    action.domId = data.domId;
    action.domDelay = data.domDelay;
    return action;
  }

  getDom() {
    if (this.domId) {
      return document.getElementById(this.domId)?.cloneNode(true);
    }
    return document.body.getElementsByTagName('div')?.[0]?.cloneNode(true);
  }

  start() {
    this.startedAt = new Date();
    this.domStart = this.getDom();
  }

  end() {
    this.endedAt = new Date();
    if (this.domDelay) {
      setTimeout(() => {
        this.domEnd = this.getDom();
      }, this.domDelay);
    } else {
      this.domEnd = this.getDom();
    }
  }

  /**
   * For manual tracing
   * Wrap the promise function (etc: API request) and execute it
   * Capture dom node at the start and end of request
   * for rendering visual diff
   */
  public async traceAsync<R>(
    fn: (id: string, headers: TraceHeaders) => Promise<R>,
  ): Promise<{ action: Action; res: R }> {
    this.start();
    const headers: TraceHeaders = {
      ['x-agiflow-trace-id']: encodeTracePayload({ id: this.id }),
    };
    const res = await fn(this.id, headers);
    this.end();
    return {
      action: this,
      res,
    };
  }

  /**
   * For manual tracing
   * Return headers to developer which can be used to pass to API call (http request, ...)
   * The developer need to manually capture then end of request
   */
  public trace(): { action: Action; headers: TraceHeaders } {
    this.start();
    const headers: TraceHeaders = {
      ['x-agiflow-trace-id']: encodeTracePayload({ id: this.id }),
    };
    return {
      action: this,
      headers,
    };
  }

  getPayload() {
    return {
      actionId: this.id,
      startAt: this.startedAt,
      endAt: this.endedAt,
    };
  }

  /**
   * Return only when feedback hasn't been provided
   */
  getFeedback() {
    if (!this.marked) return undefined;
    return {
      actionId: this.id,
      dom: this.domEnd,
      annotation: this.annotation,
    };
  }
}
