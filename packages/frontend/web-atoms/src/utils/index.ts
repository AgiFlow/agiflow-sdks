import { type ClassValue, clsx } from 'clsx';

import { twMerge } from '@agiflowai/frontend-web-theme';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
