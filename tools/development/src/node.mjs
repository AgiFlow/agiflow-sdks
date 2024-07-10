import process from 'process';
import path from 'path';
import { program } from 'commander';
import { sharedEnv, requestEnvironment, runBash, ROOT_FOLDER, getSharedEnvironment, getProjectEnvironment, getProjectPkg } from '@agiflowai/tool-cli-helper';
import ip from 'ip';

export const init = async () => {
  program
    .name('st-dev-node')
    .version('0.0.1')
    .option('-f, --force-stop', 'Force container to close')
    .option('-en, --environment [string]', 'Environment');

  program.parse(process.argv);

  let { forceStop, environment } = program.opts();

  if (!environment) {
    environment = await requestEnvironment();
  }

  const { env } = getSharedEnvironment(environment);
  const { env: projectEnv } = getProjectEnvironment(environment);

  const opts = {
    env: {
      ...sharedEnv,
      ...env,
      ...projectEnv,
      HOST_IP: ip.address(),
    },
  };

  const pkg = await getProjectPkg();

  const filePrefix = path.resolve(ROOT_FOLDER, 'tools/dockers');
  const composes = [`-f ${filePrefix}/docker-compose-db.yml`];
  const composeCmd = `docker compose ${composes.join(' ')}`;

  try {
    try {
      await runBash(`${composeCmd} up --detach`, opts);
    } catch (_) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      await runBash(`${composeCmd} up --detach`, opts);
    }
    /*
     * Run migration for db before deving
     */
    await runBash(
      `pnpm -r --if-present migrate`,
      opts
    );
    await runBash(
      `pnpm -r --if-present --stream=true --filter backend-migrations-* seed`,
      opts
    );
    await runBash(
      `pnpm -r --if-present --stream=true ${pkg?.name ? '--filter ' + pkg.name : '' } seed`,
      opts
    );
    await Promise.all([
      runBash(
        `pnpm run dev`,
        opts
      ),
      await runBash(
        `pnpm -r --if-present --stream=true ${pkg?.name ? '--filter ' + pkg.name : '' } /dev:worker:.*/`,
        opts
      ),
    ]);
    if (forceStop) {
      await runBash(`docker stop $(docker ps -a -q)`, opts).catch(console.log);
    }
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
