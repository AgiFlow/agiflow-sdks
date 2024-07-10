import posthog from 'posthog-js';
import { useFeatureFlagEnabled } from 'posthog-js/react';
import { config } from './config';

export const FLAGS = {};

const DefaultFeatureFlags = {};

posthog.init(config.VITE_POSTHOG_KEY || '', {
  api_host: 'https://us.i.posthog.com',
  bootstrap: {
    featureFlags: {},
  },
});

export const useFeaturedFlag = (flag: string) => {
  const isEnabled = useFeatureFlagEnabled(flag);
  return config.VITE_POSTHOG_KEY ? isEnabled : DefaultFeatureFlags[flag];
};

export default posthog;
