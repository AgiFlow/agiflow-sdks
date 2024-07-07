import { program } from 'commander';

export const init = () => {
  program
    .name('st-build-artifact')
    .version('0.0.1')
    .command('api', 'Build api artifact')
    .command('migration', 'Build migration artifact')
    .command('client', 'Build client artifact');

  program.parse(process.argv);
};
