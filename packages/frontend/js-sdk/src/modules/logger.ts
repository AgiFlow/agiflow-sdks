import Config from '../config';
import { assignableWindow, window } from './globals';
import { isUndefined } from './type-utils';

const LOGGER_PREFIX = '[Agiflow.js]';
export const logger = {
  _log: (level: 'log' | 'warn' | 'error', ...args: any[]) => {
    if (window && (Config.DEBUG || assignableWindow.AGIFLOW_DEBUG) && !isUndefined(window.console) && window.console) {
      const consoleLog =
        '__rrweb_original__' in window.console[level]
          ? (window.console[level] as any)['__rrweb_original__']
          : window.console[level];

      // eslint-disable-next-line no-console
      consoleLog(LOGGER_PREFIX, ...args);
    }
  },

  info: (...args: any[]) => {
    logger._log('log', ...args);
  },

  warn: (...args: any[]) => {
    logger._log('warn', ...args);
  },

  error: (...args: any[]) => {
    logger._log('error', ...args);
  },

  critical: (...args: any[]) => {
    // Critical errors are always logged to the console
    // eslint-disable-next-line no-console
    console.error(LOGGER_PREFIX, ...args);
  },

  uninitializedWarning: (methodName: string) => {
    logger.error(`You must initialize Agiflow before calling ${methodName}`);
  },
};
