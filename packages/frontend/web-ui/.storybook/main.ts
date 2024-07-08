const path = require('path');

const getStories = async (patterns: string[]) => {
  const globby = await import('globby');
  const paths = await globby.globby(patterns, {
    cwd: path.resolve(__dirname),
  });
  return paths;
};

module.exports = {
  stories: getStories(['../node_modules/@agiflowai/frontend-web-atoms/src/**/*.stories.@(tsx|ts)']),
  logLevel: 'debug',
  core: {
    builder: 'webpack5',
  },
  addons: [
    {
      name: 'storybook-addon-sass-postcss',
      options: {
        rule: {
          test: /\.(scss|sass)$/i,
        },
        loadSassAfterPostCSS: true,
      },
    },
    '@storybook/addon-essentials',
    '@storybook/addon-storysource',
    {
      name: '@storybook/addon-docs',
      options: { configureJSX: false },
    },
    '@storybook/addon-controls',
    '@storybook/addon-storyshots',
    'storybook-addon-turbo-build',
  ],

  typescript: {
    check: true,
    checkOptions: {},
    reactDocgen: 'none',
    reactDocgenTypescriptOptions: {},
  },

  webpackFinal: async config => {
    const fileLoaderRule = config.module.rules.find(
      rule => rule.test && !Array.isArray(rule.test) && rule.test.test('.svg'),
    );
    fileLoaderRule.exclude = /\.svg$/;
    config.module.rules.push({
      test: /\.svg$/,
      use: 'svg-inline-loader?classPrefix',
    });
    //styleRule.exclude = /node_modules\/(?!@agiflowai\/frontend-shared-theme)/;

    // Prefer Gatsby ES6 entrypoint (module) over commonjs (main) entrypoint
    config.resolve.mainFields = ['browser', 'module', 'main'];
    return config;
  },
};
