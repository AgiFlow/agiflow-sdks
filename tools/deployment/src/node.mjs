import process from 'process';
import { program } from 'commander';
import { runBash, getProjectEnvironment } from '@agiflowai/tool-cli-helper';
import inquirer from 'inquirer';
import { __dirname, sharedEnv, supportedEnvironments, environmentTypes } from './constants.mjs';

export const init = async () => {
  program
    .name('st-deploy-node')
    .version('0.0.1')
    .option('-en, --environment [string]', 'Environment')
    .option('-slg, --sls-group [string]', 'Serverless Group')
    .option('-c, --config <char>', 'Wrangle file');

  program.parse(process.argv);

  let { environment, slsGroup, config } = program.opts();

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

  const envType = environmentTypes[environment];
  if (!envType) {
    throw new Error('Environment is not supported for deployment');
  }

  const {
    secretFile,
  } = getProjectEnvironment(environment, true);

  const opts = {
    env: {
      ...sharedEnv,
      NODE_ENV: environment,
    },
  };

  try {
    await runBash(
      `pnpm build`,
      opts
    );
    await runBash(
      `wrangler secret:bulk ${secretFile} -c ${config} --env ${environment}`,
      opts
    );
    await runBash(
      `wrangler deploy -c ${config} --env ${environment}`,
      opts
    );
    if (slsGroup) {
      await runBash(
        `SERVICE_GROUP=${slsGroup} sls deploy --stage ${envType}`,
        opts
      );
    }
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
