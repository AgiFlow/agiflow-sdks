import { program } from 'commander';

export const init = () => {
  program
    .name('st-test')
    .version('0.0.1')
    .command('node', 'Test node api')
    .command('migration', 'Test migration');

  program.parse(process.argv);
};
