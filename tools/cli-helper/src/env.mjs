import process from 'process';
import path from 'path';
import { readFileSync, writeFileSync, existsSync, cpSync } from 'fs';
import inquirer from 'inquirer';
import * as url from 'url';
import { parse } from 'dotenv';

export const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
export const ROOT_FOLDER = path.resolve(__dirname, '../../..');
export const CURRENT_FOLDER = process.cwd();
export const SERVICE = CURRENT_FOLDER.replace(`${ROOT_FOLDER}/`, '');
export const NETWORK = SERVICE.replaceAll('/', '-');

export const sharedEnv = {
  ROOT_FOLDER,
  SERVICE,
  TZ: 'UTC',
  CAP_SYS_NICE: true,
  PATH: process.env.PATH,
};

export const supportedEnvironments = {
  'DEVELOPMENT': 'development',
  'TEST': 'test',
  'STAGING': 'staging',
  'PROD': 'production',
};

export const environmentFiles = {
  [supportedEnvironments.DEVELOPMENT]: '.env.local',
  [supportedEnvironments.TEST]: '.env.test',
  [supportedEnvironments.STAGING]: '.env.staging',
  [supportedEnvironments.PROD]: '.env.production',
};

export const getDefaultEnv = async () => {
  try {
    const env = {
      ...process.env,
    };
    return env;
  } catch (_) {
    return {
      ...process.env,
    };
  }
};

export const getProjectEnvironment = (environ, write = false) => {
  let envFile = environmentFiles[environ];
  let envFilePath = path.resolve(CURRENT_FOLDER, envFile);
  const secretFile = path.resolve(CURRENT_FOLDER, `${envFile}.json`);
  if (!existsSync(envFilePath) && environ === supportedEnvironments.DEVELOPMENT) {
    envFile = '.dev.vars';
    envFilePath = path.resolve(CURRENT_FOLDER, envFile);
  }
  if (!existsSync(envFilePath)) {
    throw new Error(`${envFile} does not exist`);
  }
  const env = parse(readFileSync(envFilePath));
  if (write) {
    writeFileSync(secretFile, JSON.stringify(env))
    cpSync(envFilePath, path.resolve(CURRENT_FOLDER, '.env'), { force: true });
  }
  return {
    env,
    envFile,
    secretFile,
  };
}

export const getSharedEnvironment = (environ) => {
  let envFile = environmentFiles[environ];
  let envFilePath = path.resolve(ROOT_FOLDER, 'configs', envFile);
  if (!existsSync(envFilePath)) {
    throw new Error(`${envFile} does not exist`);
  }
  const env = parse(readFileSync(envFilePath));
  return {
    env,
    envFile,
    envFilePath,
  };
}

export const requestEnvironment = async () => {
  const res = await inquirer
    .prompt([
      {
        type:'list',
        message: "Select environment",
        name: 'env',
        choices: Object.values(supportedEnvironments),
      }
    ]);
  return res.env;
}

export const getProjectPkg = async () => {
  const pkgFile = path.resolve(CURRENT_FOLDER, 'package.json');
  try {
    const pkg = JSON.parse(readFileSync(pkgFile));
    return {
      pkg,
      name: pkg?.name,
    }
  } catch (_) {
    return null;
  }
}
