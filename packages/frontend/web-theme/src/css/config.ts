import plugin from 'tailwindcss/plugin';

import { tailwindTheme } from './theme';

export const preset = {
  theme: tailwindTheme,
  plugins: [
    require('@mertasan/tailwindcss-variables'),
    require('@tailwindcss/container-queries'),
    require('tailwind-scrollbar'),
    require('tailwind-gradient-mask-image'),
    require('tailwindcss-animate'),
    plugin(({ addUtilities, theme, e }) => {
      const values: Record<string, number> = theme('iconSize');
      const utilities = Object.entries(values).map(([key, value]) => {
        return {
          [`.${e(`icon-${key}`)}`]: {
            width: `${value}`,
            height: `${value}`,
          },
        };
      });
      addUtilities(utilities);
    }),
  ],
};
