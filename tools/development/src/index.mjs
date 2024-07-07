import { program } from 'commander';

export const init = () => {
  program
    .name('st-dev')
    .version('0.0.1')
    .command('node', 'Dev node api');

  program.parse(process.argv);
};
