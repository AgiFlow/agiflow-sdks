/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('./dist/tailwind.cjs').preset],
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
};
