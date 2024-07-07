import process from 'process';
import path from 'path';
import * as url from 'url';

export const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export const ROOT_FOLDER = path.resolve(__dirname, '../../..');
export const CURRENT_FOLDER = process.cwd();
export const SERVICE = CURRENT_FOLDER.replace(`${ROOT_FOLDER}/`, '');
export const NETWORK = SERVICE.replaceAll('/', '-');
