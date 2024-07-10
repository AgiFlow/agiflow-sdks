import z from 'zod';

export const SearchSchema = z.object({
  limit: z.number().default(10),
  page: z.number().default(1),
  name: z.string().nullish(),
});

export type ISearchQuery = z.infer<typeof SearchSchema>;
