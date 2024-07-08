// This is a workaround for https://github.com/eslint/eslint/issues/3458
require('@rushstack/eslint-config/patch/modern-module-resolution');

module.exports = {
  parserOptions: {
    tsconfigRootDir: __dirname,
  },
  extends: ['./node_modules/@agiflowai/rig-eslint-config/configs/react.js'],
};
