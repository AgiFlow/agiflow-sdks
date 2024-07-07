module.exports = {
  extends: ['@rushstack/eslint-config/profile/node'],
  rules: {
    '@typescript-eslint/no-floating-promises': 'off',
    '@rushstack/typedef-var': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@rushstack/no-new-null': 'off',
    '@typescript-eslint/naming-convention': 'off',
    'require-atomic-updates': 'warn',
  },
  env: {
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
};
