import process from 'process';
import path from 'path';
import * as url from 'url';

export const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export const ROOT_FOLDER = path.resolve(__dirname, '../../..');
export const CURRENT_FOLDER = process.cwd();
export const SERVICE = CURRENT_FOLDER.replace(`${ROOT_FOLDER}/`, '');
export const NETWORK = SERVICE.replaceAll('/', '-');

export const sharedEnv = {
  ROOT_FOLDER,
  SERVICE,
  LANDING_DB_URL: 'http://localhost:9081',
  LANDING_DB_TOKEN: '',
  ANALYTICS_DB: 'postgres://admin:password@localhost:5432/analytics',
  SAAS_DB: 'postgres://admin:password@localhost:5433/saas',
  TZ: 'UTC',
  CAP_SYS_NICE: true,
  NODE_ENV: 'test',
  AWS_XRAY_CONTEXT_MISSING: 'LOG_ERROR',
  AWS_XRAY_LOG_LEVEL: 'silent',
  PATH: process.env.PATH,
  API_KEY: '123',
};
