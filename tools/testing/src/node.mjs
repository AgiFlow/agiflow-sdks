import process from 'process';
import path from 'path';
import { program } from 'commander';
import { runBash, sharedEnv, getProjectEnvironment, getSharedEnvironment, supportedEnvironments, getProjectPkg } from '@agiflowai/tool-cli-helper';
import { __dirname } from './constants.mjs';

export const init = async () => {
  program
    .name('st-test-node')
    .version('0.0.1')
    .option('-w, --watch', 'Watch tests')
    .option('-f, --force-stop', 'Force container to close');

  program.parse(process.argv);

  const { watch, forceStop } = program.opts();

  const { env } = getSharedEnvironment(supportedEnvironments.TEST);
  const { env: testEnv } = getProjectEnvironment(supportedEnvironments.TEST);
  const opts = {
    env: {
      ...sharedEnv,
      ...env,
      ...testEnv,
    },
  };

  const pkg = await getProjectPkg();

  const filePrefix = path.resolve(__dirname, '../../dockers');
  const composes = [`-f ${filePrefix}/docker-compose-db-test.yml`];
  const composeCmd = `docker compose ${composes.join(' ')}`;

  try {
    try {
      await runBash(`${composeCmd} up --detach`, opts);
    } catch (_) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      await runBash(`${composeCmd} up --detach`, opts);
    }
    /*
     * Run migration for db before testing
     */
    await runBash(
      `pnpm -r --if-present --stream=true migrate`,
      opts
    );
    await runBash(
      `pnpm -r --if-present --stream=true ${pkg?.name ? '--filter ' + pkg.name : '' } seed`,
      opts
    );
    await runBash(
      `vitest ${watch ? '--watch' : '--run '} --exclude ./test/apigen.test.ts`,
      opts
    );
    if (forceStop) {
      await runBash(`docker stop $(docker ps -a -q)`, opts).catch(console.log);
    }
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
