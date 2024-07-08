export const getTimestamp = (date?: Date | string) => {
  if (!date) return '';
  let d: Date;
  if (typeof date === 'string') {
    d = new Date(date);
  } else {
    d = date;
  }
  return `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
};
