export const getLetter = (name = ''): string => {
  const arr = name.split(' ');
  if (arr.length < 2) {
    return name.substring(0, 2);
  }
  return arr
    .map(str => str.substring(0, 1))
    .filter(x => x)
    .join('')
    .substring(0, 2);
};

export const abbr = (name: string): string => {
  let abbr = getLetter(name);
  if (name.startsWith('+')) {
    abbr = `+${abbr}`;
  }
  if (!abbr) {
    console.warn('Could not get abbr from name');
    abbr = name;
  }
  return abbr;
};
