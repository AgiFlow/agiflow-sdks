import { program } from 'commander';
import path from 'path';
import process from 'process';
import fs from 'fs';

import { logger } from '@agiflowai/tool-cli-helper';

const DEFAULT_TEMPLATE = `import { type Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
}

export async function down(db: Kysely<any>): Promise<void> {
}
`;

export const init = async () => {
  const resolveLocalModule = name => path.join(process.cwd(), name);
  program
    .name('st-gen-db-migration')
    .requiredOption('-n, --name <string>', 'Script name')
    .option('-d, --dir <string>', 'Migration dir <string>', 'migrations');

  program.parse(process.argv);

  const { name, dir } = program.opts();

  const migrationPath = resolveLocalModule(dir);
  const dateStr = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
  const fileName = `${migrationPath}/${dateStr}_${name}.ts`;

  if (!fs.existsSync(migrationPath)) {
    fs.mkdirSync(migrationPath);
  }
  if (fs.existsSync(fileName)) {
    return;
  }
  logger.info(`Generating migration file ${fileName}`);
  fs.writeFileSync(fileName, DEFAULT_TEMPLATE, 'utf8');
  logger.info(`Migration file created`);
};
