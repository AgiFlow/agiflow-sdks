/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('@agiflowai/frontend-web-theme/tailwind').preset],
  content: ['./src/**/*.{js,ts,jsx,tsx}', './node_modules/@agiflowai/frontend-web-atoms/dist/**/*/*.{js,ts,jsx,tsx}'],
};
