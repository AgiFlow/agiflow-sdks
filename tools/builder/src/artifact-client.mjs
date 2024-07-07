import { program } from 'commander';
import process from 'process';
import path from 'path';
import fs from 'fs';

import { runBash, logger, ROOT_FOLDER, CURRENT_FOLDER } from '@agiflowai/tool-cli-helper';

export const init = async () => {
  program
    .name('st-build-artifact-client')
    .option('-dir, --directory <string>', 'Directory')
    .option('-s, --stage <string>', 'Stage')
    .option('-e, --environment <string>', 'Environment');

  program.parse(process.argv);

  const options = program.opts();
  const { directory, stage, environment } = options;

  const artifactDirectory = path.resolve(ROOT_FOLDER, 'artifacts', stage, 'dist', directory);
  const buildDirectory = path.resolve(CURRENT_FOLDER, './dist');

  logger.info('Building artifacts...');
  await runBash(
    `vite build --mode ${environment}`,
  );
  logger.info('Copy artifacts...');
  if (!fs.existsSync(artifactDirectory)) {
    fs.mkdirSync(artifactDirectory, { recursive: true });
  }
  fs.cpSync(buildDirectory, artifactDirectory, { recursive: true });
};
