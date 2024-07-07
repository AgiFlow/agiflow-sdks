import { program } from 'commander';
import process from 'process';
import path from 'path';
import fs from 'fs';

import { runBash, logger, ROOT_FOLDER, CURRENT_FOLDER } from '@agiflowai/tool-cli-helper';

export const init = async () => {
  program
    .name('st-build-artifact-api')
    .option('-dir, --directory <string>', 'Directory')
    .option('-s, --stage <string>', 'Stage')

  program.parse(process.argv);

  const options = program.opts();
  const { directory, stage } = options;

  const artifactDirectory = path.resolve(ROOT_FOLDER, 'artifacts', stage, 'dist', directory);
  const buildDirectory = path.resolve(CURRENT_FOLDER, './dist/docker');

  logger.info('Coppy environment...');
  fs.cpSync(path.resolve(CURRENT_FOLDER, `./.env.artifact-${stage}`), path.resolve(CURRENT_FOLDER, './.env'), { recursive: true });

  logger.info('Building artifacts...');
  await runBash(
    `pnpm build`,
  );
  logger.info('Copy artifacts...');
  if (!fs.existsSync(artifactDirectory)) {
    fs.mkdirSync(artifactDirectory, { recursive: true });
  }
  fs.cpSync(buildDirectory, artifactDirectory, { recursive: true });
};
