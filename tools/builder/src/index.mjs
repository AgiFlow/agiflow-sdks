import { program } from 'commander';

export const init = () => {
  program
    .name('st-build')
    .version('0.0.1')
    .command('ts', 'Build typescript')
    .command('api', 'Build api client')
    .command('artifact', 'Build artifact');

  program.parse(process.argv);
};
