import dayjs from 'dayjs';

export const getDateTime = (isoTime?: string) => {
  return dayjs(isoTime).format('HH:mm:ss DD/MM');
};

export const formatMillis = (millis?: number) => {
  return `${Number(millis).toFixed(3)}ms`;
};
