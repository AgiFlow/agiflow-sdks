export const getLocalCurrencyByCents = (usDollar?: number | null) => {
  return `$${Number(usDollar).toFixed(4)}`;
};
