import { program } from 'commander';

export const init = () => {
  program
    .name('st-build-api')
    .version('0.0.1')
    .command('client', 'Build api client');

  program.parse(process.argv);
};
