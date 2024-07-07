import * as url from 'url';
import { program } from 'commander';
import path from 'path';
import process from 'process';

import { runBash, logger } from '@agiflowai/tool-cli-helper';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export const init = async () => {
  const apisPath = path.join(__dirname, '../../../backend/apis');

  program
    .name('st-build-api-client')
    .option('-f, --file <string>', 'File')
    .option('-fr, --from <string>', 'From package');

  program.parse(process.argv);


  const options = program.opts();
  const apiDir = path.join(apisPath, options.from);
  const openapiFile = path.join(apiDir, options.file || 'dist/openapi.json');

  logger.info('Generating open api doc...');
  await runBash(
    `pnpm api:gen`,
    {
      cwd: apiDir,
    }
  );
  logger.info('Generating api client doc...');
  await runBash(
    `pnpm openapi-typescript ${openapiFile} -o src/openapi.ts`,
  );
};
