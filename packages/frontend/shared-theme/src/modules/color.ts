import { colord, extend } from 'colord';
import a11y from 'colord/plugins/a11y';

extend([a11y]);

export const getTextColor = (c: string): string => {
  const mainColor = colord(c);
  const textBlack = colord('#353535');
  const textWhite = colord('#fcfcfc');
  if (mainColor.contrast(textBlack) - mainColor.contrast(textWhite) > 0.75) {
    return '#353535';
  }
  return '#fcfcfc';
};

export const hexToRgb = (color: string) => {
  const { r, g, b } = colord(color).toRgb();
  return `${r} ${g} ${b}`;
};

export const convertTwColor = (str: string) => `rgb(var(${str}) / <alpha-value>)`;
export const convertHexToTwColor = (hex: string) => `rgb(${hexToRgb(hex)} / <alpha-value>)`;
