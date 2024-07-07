import chalk from 'chalk';

export const logger = {
  info: (message) => {
    console.log(chalk.green(message));
  },
  error: (message) => {
    console.log(chalk.red(message));
  },
};
