import { program } from 'commander';

export const init = () => {
  program
    .name('st-deploy')
    .version('0.0.1')
    .command('node', 'Deploy node api')
    .command('migration', 'Deploy migration')
    .command('seed', 'Deploy seed');

  program.parse(process.argv);
};
