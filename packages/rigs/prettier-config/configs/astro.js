module.exports = {
  ...require('./based'),
  plugins: [
    require('@trivago/prettier-plugin-sort-imports'),
    'prettier-plugin-tailwindcss',
    'prettier-plugin-astro',
  ],
};
