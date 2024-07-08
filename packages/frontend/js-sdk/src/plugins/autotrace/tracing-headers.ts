import { Agiflow } from '../../Agiflow';
import { window } from '../../modules/globals';
import { logger } from '../../modules/logger';
import { patch } from './patch';

export class TracingHeaders {
  private _restoreXHRPatch: (() => void) | undefined = undefined;
  private _restoreFetchPatch: (() => void) | undefined = undefined;

  constructor(private readonly instance: Agiflow) {}

  public startIfEnabledOrStop() {
    if (this.instance.hasAutotrace() && this._canPatch()) {
      // we can assert this is present because we've checked previously
      this._patchXHR(this.instance);
      this._patchFetch(this.instance);
    } else {
      this._restoreXHRPatch?.();
      this._restoreFetchPatch?.();
      this._restoreXHRPatch = undefined;
      this._restoreFetchPatch = undefined;
    }
  }

  private _patchFetch(instance: Agiflow) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this._restoreFetchPatch = patch(window, 'fetch', (originalFetch: typeof fetch) => {
      return async function (url: URL | RequestInfo, init?: RequestInit | undefined) {
        // check IE earlier than this, we only initialize if Request is present
        const req = new Request(url, init);

        const traceEnabled = instance.shouldAutoTrace(url);
        if (traceEnabled) {
          const { traceId } = instance.track(traceEnabled.name, { domId: traceEnabled.domId }, true);
          TracingHeaders._addTracingHeaders(traceId, req);
        }

        return originalFetch(req);
      };
    });
  }

  private _patchXHR(instance: Agiflow) {
    this._restoreXHRPatch = patch(
      // we can assert this is present because we've checked previously
      window!.XMLHttpRequest.prototype,
      'open',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      (originalOpen: typeof XMLHttpRequest.prototype.open) => {
        return function (
          method: string,
          url: string | URL,
          async = true,
          username?: string | null,
          password?: string | null,
        ) {
          // because this function is returned in its actual context `this` _is_ an XMLHttpRequest
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const xhr = this as XMLHttpRequest;

          // check IE earlier than this, we only initialize if Request is present
          const req = new Request(url);

          const traceEnabled = instance.shouldAutoTrace(url);
          if (traceEnabled) {
            const { traceId } = instance.track(traceEnabled.name, { domId: traceEnabled.domId }, true);
            TracingHeaders._addTracingHeaders(traceId, req);
          }

          return originalOpen.call(xhr, method, req.url, async, username, password);
        };
      },
    );
  }

  private static _addTracingHeaders(traceId: string, req: Request) {
    req.headers.set('x-agiflow-auto-trace', 'true');
    req.headers.set('x-agiflow-trace-id', traceId);
  }

  private _canPatch() {
    const skipping = 'skipping fetch patching';
    const prefix = '[TRACING-HEADERS]';

    if (!window) {
      logger.warn(prefix + ' window is not available, ' + skipping);
      return false;
    }
    if (!window.fetch) {
      logger.warn(prefix + ' window.fetch is not available, ' + skipping);
      return false;
    }
    if (this._restoreFetchPatch || this._restoreXHRPatch) {
      logger.warn(prefix + ' already patched, ' + skipping);
      return false;
    }

    return true;
  }
}
