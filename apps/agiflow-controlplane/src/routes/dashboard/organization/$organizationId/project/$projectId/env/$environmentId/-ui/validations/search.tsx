import z from 'zod';
import dayjs from 'dayjs';

export const SearchSchema = z.object({
  fromDate: z.string().default(dayjs().subtract(1, 'month').toISOString()),
  toDate: z.string().default(dayjs().toISOString()),
  appVersion: z.string().nullish(),
});

export type ISearch = Partial<z.infer<typeof SearchSchema>>;
