import { spawn } from 'child_process';
import { cwd } from 'process';
import pRetry from 'p-retry';
import { getDefaultEnv } from './env.mjs';

/*
 * Execute script using child process with stdio
 * @params {string} cmd - Command String
 * @params {string[]} args - Command arguments
 * @params { retries?: number; env?: Object, ...rest: SpawnOptionsWithoutStdio } [opts] - Optional options
 */
export const executeStdio = async (cmd, args, opts) => {
  const env = await getDefaultEnv();
  const { env: overwriteEnv, retries, ...rest } = opts || {};
  const options = {
    stdio: 'inherit',
    env: {
      ...env,
      ...(overwriteEnv || {}),
    },
    cwd: cwd(),
    ...rest,
  };
  const exec = () => new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, options);
    proc.on('exit', exitCode => {
      if (exitCode === 0) {
        resolve();
      } else {
        reject(new Error(`Exit code is ${exitCode}`));
      }
    });
    proc.on('error', reject);
    proc.on('close', resolve);
    proc.on('SIGINT', reject);
  });
  return await pRetry(exec, { retries: retries || 0 });
};

/*
 * Execute script using bash inside child process
 * @params {string} cmd - Command String
 * @params { retries?: number; env?: Object, ...rest: SpawnOptionsWithoutStdio } [opts] - Optional options
 */
export const runBash = (cmd, opts) => {
  return executeStdio('bash', ['-c', cmd], {
    retries: 5,
    ...(opts || {}),
  });
};
