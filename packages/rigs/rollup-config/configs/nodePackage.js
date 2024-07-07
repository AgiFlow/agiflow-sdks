const multiInput = require('rollup-plugin-multi-input').default;
const esbuild = require('rollup-plugin-esbuild').default;
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
 * @param {Boolean} override.preserveModules - Output to single file or using module
 * @param {string} override.tsconfig - typescript config path.
 * @param {Object[]} override.plugins - extra plugins.
 * @param {string} override.format - file format.
 * @param {string[]} override.output - extra output formats.
 * @param {string[]} override.include - extra output formats.
 */
const getConfig = (override) => {
  const { tsconfig, plugins = [], output = {}, include = [] } = override;
  return {
    input: override.input || [
      'src/index.ts',
      'src/**/*.ts',
      '!src/**/*.test.ts',
      '!src/**/*.test.d.ts',
    ],
    output: {
      dir: './dist',
      format: override.format || 'esm',
      sourcemap: true,
      preserveModules: override.preserveModules ?? true,
      entryFileNames: `[name].${formatExts[override.format || 'esm']}`,
      ...output,
    },
    preserveEntrySignatures: 'strict',
    plugins: [
      multiInput({ relative: 'src/' }),
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
        },
        optimizeDeps: {
          include,
        },
      }),
      alias({
        entries: [
          {
            find: /@\//,
            replacement: 'src/',
          },
        ],
        resolve: ['.ts', '.tsx'],
      }),
      ...plugins,
    ],
  };
};

module.exports = {
  getConfig,
};
