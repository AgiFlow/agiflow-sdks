import z from 'zod';

export const SearchSchema = z.object({
  stepId: z.string().nullish(),
});
