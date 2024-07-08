export const remCalc = (px: string | number, base = 16) => {
  let basePx: number;
  if (typeof px === 'string') {
    const tempPx = px.replace('px', '');
    basePx = parseInt(tempPx);
  } else {
    basePx = px;
  }

  return (1 / base) * basePx + 'rem';
};
