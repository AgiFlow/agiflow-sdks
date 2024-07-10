import z from 'zod';

export const SearchSchema = z.object({
  name: z.string().nullish(),
  page: z.number().nullish().default(1),
  comparisonIds: z.array(z.string()).nullish(),
});
