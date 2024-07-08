import { VIEW_TYPES } from './constants';
import { Action } from './entities/Action';
import { Identity } from './entities/Identity';
import { Session } from './entities/Session';
import { TaskOptions } from './entities/Task';
import { IWidgetConfig, Widget } from './entities/Widget';
import { extractUrlAndHost } from './modules/request';
import { getSessionData, getUserSession, setSessionData, setUserSession } from './modules/sessionStorage';
import { encodeTracePayload } from './modules/trace';
import { TracingHeaders } from './plugins/autotrace/tracing-headers';
import { ApiClientConfig, getApiClient } from './services/api';
import { Queue } from './services/queue';
import { AutoTraceConfig, IViewType, TraceHeaders } from './types';

interface InitOptions {
  /* Dataplane endpoint */
  endpoint?: string;
  /* Render preview using screen diff or workflow visualisation  */
  feedbackPreviews?: IViewType[];
  /* Automatically send trace-id to backend on interaction */
  autoTrace?: boolean | AutoTraceConfig;
}

const DEFAULT_FLUSH_FREQUENCY = 1000;
const DEFAULT_ENDPOINT = 'https://analytics-api.agiflow.io';

export class Agiflow {
  private queue = new Queue<any>();
  private session = new Session();
  private lastPing = new Date();
  identity?: Identity;
  anonimous?: Identity;
  private flushFrequency: number = DEFAULT_FLUSH_FREQUENCY;
  private readyListners: Function[] = [];
  isReady = false;
  private widget: Widget | undefined;
  private widgetConfig: IWidgetConfig = { views: [VIEW_TYPES.SCREEN] };
  private apiClientConfig: ApiClientConfig = { key: '', endpoint: DEFAULT_ENDPOINT };
  private apiClient: ReturnType<typeof getApiClient>;
  private newIssueSubscribers: Map<(data: any) => unknown, any> = new Map();
  private actionCache: Map<string, Action> = new Map();
  private autoTrace: boolean | AutoTraceConfig = false;
  private _tracingHeader: TracingHeaders | undefined;
  private _endpoint: string = DEFAULT_ENDPOINT;

  constructor(flushFrequency?: number) {
    /* Restore analytics activities from session if browser is refreshed */
    this._dehydrate();

    this.flushFrequency = flushFrequency || DEFAULT_FLUSH_FREQUENCY;
    this.apiClient = getApiClient(this.apiClientConfig.endpoint);

    if (typeof window !== 'undefined') {
      window.setInterval(() => {
        this._drain();
      }, this.flushFrequency);
    }

    /**
     * Flush analytics and cache internal state in session
     */
    addEventListener('beforeunload', () => {
      this._drain(true);
      this._hydrate();
      this._endSession();
    });
  }

  private _hydrate() {
    const payload = {
      session: this.session.hydrate(),
      identity: this.identity,
      anonimous: this.anonimous,
    };
    setSessionData(payload);
  }

  private _dehydrate() {
    const data = getSessionData();
    if (data?.session) {
      this.session = Session.dehydrate(data.session);
    }
    if (data?.identity) {
      this.identity = Identity.dehydrate(data.identity);
    }
    if (data?.anonimous) {
      this.anonimous = Identity.dehydrate(data.anonimous);
    }
  }

  async init(key: string, opts?: InitOptions) {
    this.autoTrace = opts?.autoTrace || false;
    // If session is restored from session, use existing session
    this.session = this.session || new Session();
    this._endpoint = opts?.endpoint || DEFAULT_ENDPOINT;
    this.apiClientConfig = { key, endpoint: this._endpoint };
    this.apiClient = getApiClient(this.apiClientConfig.endpoint);
    this.widgetConfig = {
      views: opts?.feedbackPreviews || [VIEW_TYPES.SCREEN],
    };
    await this.createSession();
    this.widget = new Widget(this.session, this.apiClientConfig, this.widgetConfig);
    const newSession = getUserSession();
    try {
      const analyticsEndpoint = this.apiClientConfig.endpoint.replace('https://', 'wss://').replace('http://', 'ws://');
      const socket = new WebSocket(`${analyticsEndpoint}/v1/client/sessions/ws?token=${newSession.token}`);
      socket.addEventListener('message', event => {
        this.notifyNewIssue(event.data);
      });
    } catch (_) {
      console.error('Agiflow cannot establish websocket connection');
    }

    if (!this._tracingHeader) {
      this._tracingHeader = new TracingHeaders(this);
      this._tracingHeader.startIfEnabledOrStop();
    }
    this.readyListners.forEach(cb => cb());
    this.readyListners = [];
  }

  /**
   * Send message from websocket to listener for processing
   */
  private notifyNewIssue(data: any) {
    for (const [cb] of this.newIssueSubscribers.entries()) {
      cb(data);
    }
  }

  /*
   * Subscribe to new issue from guardrails.
   * Use this to decide whether to open widget
   */
  subscribeToNewIssue(cb: (data: any) => unknown) {
    this.newIssueSubscribers.set(cb, 1);
    return () => this.newIssueSubscribers.delete(cb);
  }

  /**
   * Create user session for analytics
   */
  private async createSession(anonimousId?: string) {
    const { data } = await this.apiClient.POST('/v1/client/sessions', {
      body: {
        clientToken: this.apiClientConfig.key,
        ...(anonimousId ? { anonimousId } : {}),
      },
    });
    if (data) {
      setUserSession(data.sessionId, data.token);
      if (!this.session.id || this.session?.id !== data?.sessionId) {
        // If hydrated session is invalid, create new session
        if (this.session.id) {
          this.session = new Session();
        }
        this.session.setId(data.sessionId);
      }
      if (!this.identity || this.identity?.id !== data?.id) {
        this.identity = new Identity(data.id);
      }
      this.isReady = true;
    }
  }

  /*
   * Subscribe to ready state
   */
  onReady(cb) {
    this.readyListners.push(cb);
  }

  /*
   * Identify anonimous user to application user to support cross platform analytics
   */
  async identify(id: string, opts: any) {
    const { data } = await this.apiClient.POST('/v1/client/sessions/users/identify', {
      body: {
        id,
        meta: opts,
      },
    });
    if (data) {
      this.identity = new Identity(data?.id, data?.meta as any);
    }
  }

  /*
   * Merge current user with another user
   */
  async alias(id: string, aliasId: any) {
    const { data } = await this.apiClient.POST('/v1/client/sessions/users/alias', {
      body: {
        id,
        alias_id: aliasId,
      },
    });
    if (data) {
      this.identity = new Identity(data?.id, data?.meta as any);
    }
  }

  async setAnonymousId(id: string) {
    await this.createSession(id);
  }

  /*
   * Wrap an API call or network request within a callback
   * Provide callback with trace header to pass to backend
   * Automatically capture start and end DOM state of the request for review
   */
  async trackAsync<R>(taskName: string, fn: (id: string, headers: TraceHeaders) => Promise<R>, opts?: TaskOptions) {
    const task = this.session?.getTask(taskName, opts);
    const { action: actionPayload, res } = await task?.captureAsync<R>(fn);
    const taskPayload = task.getPayload();
    const sessionPayload = this.session.getPayload();
    this.queue.enqueue({
      ...actionPayload,
      ...taskPayload,
      ...sessionPayload,
    });
    this.flush();
    return res;
  }

  /*
   * Manually capture the analytics event with taskName
   * Return trace header and actionId to pass to backend
   * Automatically capture start DOM state of the request for review
   */
  track(taskName: string, opts?: Omit<TaskOptions, 'domDelay'>, autoTrace?: boolean) {
    const task = this.session?.getTask(taskName, opts);
    const { action: actionPayload, headers } = task?.capture();
    const taskPayload = task.getPayload();
    const sessionPayload = this.session.getPayload();
    const payload = {
      ...actionPayload,
      ...taskPayload,
      ...sessionPayload,
    };
    if (!autoTrace) {
      this.queue.enqueue(payload);
      this.flush();
    }
    this.actionCache.set(actionPayload.id, actionPayload);
    return {
      actionId: actionPayload.id,
      headers,
      traceId: encodeTracePayload(payload),
    };
  }

  /*
   * Capture dom when action finished using actionId from track method
   */
  completeAction(actionId: string) {
    const action = this.actionCache.get(actionId);
    if (action) {
      action.end();
      this.actionCache.delete(actionId);
    }
  }

  /*
   * Complete user task by name
   */
  async completeTask(taskName: string) {
    const taskId = this.session?.endTask(taskName);
    if (!taskId) return;
    await this.apiClient.POST('/v1/client/sessions/tasks/{taskId}', {
      params: {
        path: {
          taskId,
        },
      },
      body: {
        endedAt: new Date().toISOString(),
      },
    });
  }

  /*
   * Report score by action
   */
  async reportScore(id: string, score: number) {
    await this.apiClient.PATCH(`/v1/client/sessions/actions/{actionId}/score`, {
      params: {
        path: {
          actionId: id,
        },
      },
      body: {
        score,
      },
    });
  }

  /*
   * End session
   */
  private async _endSession() {
    await this.apiClient.PATCH(`/v1/client/sessions/sessions`, {
      keepalive: true,
    });
  }

  /**
   * Flush events from queue periodically
   */
  flush() {
    if (!this.queue.canFlush()) {
      return;
    }
    if (new Date().getTime() - this.lastPing.getTime() <= this.flushFrequency) return;
    this._drain();
  }

  private _drain(all?: boolean) {
    if (!this.isReady) return;
    // Send one request to batch endpoint
    const batch = this.queue.shift(all);
    this.lastPing = new Date();
    if (batch.length === 0) {
      return;
    }
    if (!this.widget?.loaded) {
      // Lazy load widget from CDN once events started streaming
      this.widget?.load();
    }
    return this.apiClient.POST('/v1/client/sessions/actions/bulk', {
      body: batch,
    });
  }

  /*
   * Open feedback widget based on current session
   */
  async openWidget() {
    await this._drain(true);
    this.session.tasks;
    if (!this.widget) {
      this.widget = new Widget(this.session, this.apiClientConfig, this.widgetConfig);
    }
    this.widget.init();
  }

  hasAutotrace() {
    return !!this.autoTrace;
  }

  shouldAutoTrace(url: URL | RequestInfo) {
    const { host, urlString } = extractUrlAndHost(url);
    if (!urlString) return false;
    if (!this.autoTrace) return false;
    // Avoid request go to Agiflow server
    if (host && host.includes(this._endpoint)) {
      return false;
    }
    if (this.autoTrace === true) {
      return {
        name: urlString,
      };
    }
    if (this.autoTrace.hosts && host) {
      // Filter by hosts for multiple api hosts websites
      if (!this.autoTrace.hosts.includes(host)) {
        return false;
      }
    }
    const idx = this.autoTrace.matches.findIndex(x => {
      if (x.pattern instanceof RegExp) {
        return url.toString().match(x.pattern);
      } else {
        return url.toString().includes(x.pattern);
      }
    });
    if (idx === -1) return false;
    return {
      name: this.autoTrace.matches[idx].name || url.toString(),
      domId: this.autoTrace.matches[idx].domId,
    };
  }
}
