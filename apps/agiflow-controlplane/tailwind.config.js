/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('@agiflowai/frontend-web-theme/tailwind').preset],
  content: [
    './node_modules/@agiflowai/frontend-web-atoms/dist/**/*.{js,ts}',
    './node_modules/@agiflowai/frontend-web-molecules/dist/**/*.{js,ts}',
    './node_modules/@agiflowai/frontend-web-theme/dist/**/*.{js,ts}',
    './node_modules/@agiflowai/frontend-web-form/dist/**/*.{js,ts}',
    './node_modules/@agiflowai/frontend-web-sankey/dist/**/*.{js,ts}',
    './node_modules/@agiflowai/frontend-web-ui/dist/**/*.{js,ts}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
};
