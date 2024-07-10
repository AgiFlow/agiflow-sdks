import z from 'zod';

export const SearchSchema = z.object({
  versionId: z.string().nullish(),
});
