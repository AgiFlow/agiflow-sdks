module.exports = {
  plugins: ['tailwindcss', 'jsx-a11y'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  extends: [
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:tailwindcss/recommended',
    '@rushstack/eslint-config/profile/web-app',
    '@rushstack/eslint-config/mixins/react',
  ],
  settings: {
    react: {
      version: '18.2.0',
    },
    tailwindcss: {
      callees: ['classnames', 'clsx', 'ctl', 'variant-classnames', 'cva'],
      whitelist: ['sq-(.*)', 'tooltip-(.*)'],
    },
  },
  rules: {
    '@typescript-eslint/no-floating-promises': 'off',
    '@rushstack/typedef-var': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@rushstack/no-new-null': 'off',
    'react/prop-types': 'off',
    'react/jsx-no-bind': 'off',
    '@typescript-eslint/typedef': 'off',
    'react/no-unescaped-entities': 'off',
  },
  env: {
    es6: true,
  },
};
