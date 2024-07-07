import { program } from 'commander';

export const init = () => {
  program
    .name('st-gen-db')
    .version('0.0.1')
    .command('migration', 'Gen migration script');

  program.parse(process.argv);
};
