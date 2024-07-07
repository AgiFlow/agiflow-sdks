import process from 'process';
import path from 'path';
import { readFileSync, existsSync } from 'fs';
import { parse } from 'dotenv';
import { program } from 'commander';
import { runBash, logger } from '@agiflowai/tool-cli-helper';
import inquirer from 'inquirer';
import { __dirname, sharedEnv, CURRENT_FOLDER, supportedEnvironments, environmentFiles } from './constants.mjs';

export const init = async () => {
  program
    .name('st-deploy-seed')
    .option('-en, --environment [string]', 'Environment')
    .version('0.0.1');

  program.parse(process.argv);

  let { environment } = program.opts();

  if (!environment) {
    const res = await inquirer
      .prompt([
        {
          type:'list',
          message: "Select environment",
          name: 'env',
          choices: Object.values(supportedEnvironments),
        }
      ]);
    environment = res.env;
  }
  const envFile = environmentFiles[environment];

  const envFilePath = path.resolve(CURRENT_FOLDER, envFile);

  if (!existsSync(envFilePath)) {
    throw new Error(`${envFile} does not exist`);
  }
  const env = parse(readFileSync(envFilePath));

  const opts = {
    env: {
      ...sharedEnv,
      ...env,
    },
  };

  try {
    logger.info('Build seeds script');
    await runBash(
      `rm -rf ./dist`,
      opts
    );
    await runBash(
      `pnpm build`,
      opts
    );

    logger.info('Run seed');
    await runBash(
      `pnpm seed`,
      opts
    );

    logger.info('Tear down seed');
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
