import { extendTailwindMerge } from 'tailwind-merge';

import { tailwindTheme } from '../css/theme';

export const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: Object.keys(tailwindTheme?.fontSize || {}),
        },
      ],
    },
  },
});
