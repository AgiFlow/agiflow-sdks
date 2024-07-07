const lodashTransformer = require('esbuild-plugin-lodash');
const { polyfillNode } = require('esbuild-plugin-polyfill-node');

module.exports = ({
  entry,
  outfile,
  outdir,
  debug,
  external,
  edge,
  plugins,
  polyfillOptions,
  lodashIncluded,
  ...rest
} = {}) => {
  return {
    entryPoints: [entry],
    outfile,
    outdir,
    conditions: edge ? ['worker', 'browser'] : [],
    bundle: true,
    sourcemap: true,
    minify: !debug,
    target: 'es2020',
    format: 'esm',
    keepNames: true,
    legalComments: 'none',
    treeShaking: true,
    logLevel: 'error',
    external,
    ...(edge ? {} : { platform: 'node' }),
    plugins: [
      ...(edge ? [polyfillNode(polyfillOptions || {})] : []),
      ...(plugins || []),
      ...(lodashIncluded ? [] : [lodashTransformer()]),
    ],
    ...rest,
  };
};
