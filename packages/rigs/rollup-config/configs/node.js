const esbuild = require('rollup-plugin-esbuild').default;
const alias = require('../plugins/alias');

/**
 * Rollup config for frontend.
 * @param {Boolean} babel - use babel.
 * @param {string[]} override.input - Input list.
 * @param {Object} override - override configuration.
 * @param {string[]} override.input - Input list.
 * @param {Boolean} override.preserveModules - Output to single file or using module
 * @param {string} override.tsconfig - typescript config path.
 * @param {Object[]} override.plugins - extra plugins.
 * @param {string[]} override.output - extra output formats.
 * @param {string[]} override.include - extra output formats.
 */
const getConfig = (override) => {
  const { tsconfig, plugins = [], output = {}, include = [], input } = override;
  return {
    input,
    output: {
      dir: './dist',
      format: 'es',
      sourcemap: true,
      preserveModules: override.preserveModules ?? true,
      ...output,
    },
    preserveEntrySignatures: 'strict',
    plugins: [
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
        bundle: true,
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
