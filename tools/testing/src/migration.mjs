import process from 'process';
import path from 'path';
import { program } from 'commander';
import { runBash, logger, sharedEnv, getSharedEnvironment, supportedEnvironments } from '@agiflowai/tool-cli-helper';
import { __dirname } from './constants.mjs';

export const init = async () => {
  program
    .name('st-test-migration')
    .version('0.0.1');

  program.parse(process.argv);

  const { env } = getSharedEnvironment(supportedEnvironments.TEST);
  const opts = {
    env: {
      ...sharedEnv,
      ...env,
    },
  };

  const filePrefix = path.resolve(__dirname, '../../dockers');
  const composes = [`-f ${filePrefix}/docker-compose-db-test.yml`];
  const composeCmd = `docker compose ${composes.join(' ')}`;

  try {
    logger.info('Prune volumes');
    await runBash(`docker system prune --volumes`, opts);

    logger.info('Detach running docker compose');
    try {
      await runBash(`${composeCmd} up --detach`, opts);
    } catch (_) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      await runBash(`${composeCmd} up --detach`, opts);
    }

    logger.info('Build migrations script');
    await runBash(
      `rm -rf ./dist`,
      opts
    );
    await runBash(
      `pnpm build`,
      opts
    );

    logger.info('Run migration');
    await runBash(
      `pnpm migrate`,
      opts
    );

    logger.info('Run seed');
    await runBash(
      `pnpm --if-present seed`,
      opts
    );

    logger.info('Tear down migration');
    await runBash(`docker stop $(docker ps -a -q)`, opts).catch(console.log);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
