import z from 'zod';

const ConfigValidator = z.object({
  VITE_CONTROLPLANE_API_ENDPOINT: z.string(),
  VITE_DATAPLANE_API_ENDPOINT: z.string(),
  VITE_CONTROLPLANE_DASHBOARD_URL: z.string(),
  VITE_AGIFLOW_DOCS_WEBSITE: z.string().default('https://docs.agiflow.io'),
  VITE_SUPABASE_ENDPOINT: z.string(),
  VITE_SUPABASE_ANON_KEY: z.string(),
  VITE_DEV_MODE: z.coerce.boolean().nullish(),
  VITE_POSTHOG_KEY: z.string().nullish(),
});

export type IConfig = z.infer<typeof ConfigValidator>;
export const config = ConfigValidator.parse(import.meta.env);
