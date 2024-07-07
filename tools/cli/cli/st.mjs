#!/usr/bin/env node
import { program } from 'commander';

export const init = () => {
  program
    .name('st')
    .version('0.0.1')
    .command('dev', 'Development commands')
    .command('build', 'Build commands')
    .command('deploy', 'Deploy commands')
    .command('gen', 'Generator commands')
    .command('test', 'Test commands');

  program.parse(process.argv);
};

init();
