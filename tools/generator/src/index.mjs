import { program } from 'commander';

export const init = () => {
  program
    .name('st-gen')
    .version('0.0.1')
    .command('db', 'Gen db');

  program.parse(process.argv);
};
