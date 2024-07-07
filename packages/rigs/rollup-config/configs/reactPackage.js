const multiInput = require('rollup-plugin-multi-input').default;
const esbuild = require('rollup-plugin-esbuild').default;
const useClient = require('rollup-plugin-use-client').default;
const alias = require('../plugins/alias');

const formatExts = {
  iife: 'browser.js',
  cjs: 'cjs',
  esm: 'js',
};

/**
 * Rollup config for frontend.
 * @param {Boolean} babel - use babel.
 * @param {Object} override - override configuration.
 * @param {string[]} override.input - Input list.
 * @param {string[]} override.output - Output.
 * @param {Boolean} override.preserveModules - Output to single file or using module
 * @param {string} override.tsconfig - typescript config path.
 * @param {Object[]} override.plugins - extra plugins.
 * @param {string[]} override.extraFormats - extra output formats.
 * @param {string} override.format - extra output formats.
 * @param {string[]} override.include - extra output formats.
 * @param {Object} override.esbuild - Output to single file or using module
 * @param {Object} override.rollup - Output to single file or using module
 */
const getConfig = (override) => {
  const tsconfig = override.tsconfig;
  const plugins = override.plugins || [];
  const include = override.include || [];
  const formats = [...(override.extraFormats || []), override.format || 'esm'];
  const input = override.input || [
    'src/index.ts',
    'src/**/*.tsx',
    'src/**/*.ts',
    '!src/**/*.stories.*',
  ];
  const withMultiInput = !!override.input || Array.isArray(input);
  const baseConfig = {
    input,
    plugins: [
      ...(withMultiInput ? [multiInput({ relative: 'src/' })] : []),
      ...(override.babel
        ? []
        : [
            esbuild({
              include: /\.[jt]sx?$/,
              exclude: /node_modules/,
              sourceMap: true,
              minify: process.env.NODE_ENV === 'production',
              target: 'esnext',
              jsx: 'transform',
              jsxFactory: 'React.createElement',
              jsxFragment: 'React.Fragment',
              define: {
                __VERSION__: '"1.0.0"',
              },
              tsconfig,
              loaders: {
                '.json': 'json',
                '.js': 'jsx',
                '.svg': 'svg',
              },
              optimizeDeps: {
                include,
              },
              ...(override.esbuild || {}),
            }),
          ]),
      alias({
        entries: [
          {
            find: /@\//,
            replacement: 'src/',
          },
        ],
        resolve: ['.ts', '.tsx'],
      }),
      useClient(),
      ...plugins,
    ],
  };
  return formats.map((format) => ({
    ...baseConfig,
    output: {
      dir: './dist',
      format,
      sourcemap: true,
      preserveModules: override.preserveModules ?? true,
      entryFileNames: `[name].${formatExts[format]}`,
      ...(override.output || {}),
    },
    onwarn: (message) => {
      if (/directives/g.test(message)) {
        return;
      }
    },
    ...(override.rollup || {}),
  }));
};

module.exports = {
  getConfig,
};
