import { program } from 'commander';

export const init = () => {
  program
    .name('st-build-ts').version('0.0.1').command('package', 'Build typescript');

  program.parse(process.argv);
};
